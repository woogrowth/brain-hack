// ═══ STATE ═══
let state = {
  problems: ls.get('cp_problems', PROBLEMS_DEFAULT),
  currentUser: null,
  screen: 'home',
  modal: null,
  showPwLogin: false,
  showPwSignup: false,
  showPwSignup2: false,
  currentProblem: null,
  session: {correct:0,wrong:0,score:0,streak:0},
  lang: ls.get('cp_lang','ko'),
  toast: null,
  attended: false,
  quizTimer: null,
  quizTimeLeft: 0,
  quizAns: '',
  quizDone: false,
  quizCorrect: null,
  quizHint: false,
  // signup
  signupStep: 0,
  signupData: {job:'',country:'KR',username:'',password:'',pwConfirm:'',nickname:'',agreePrivacy:false,agreeThird:false,agreePush:false,gender:'M',race:'prefer_not_to_say'},
  signupErrors: {},
  // login
  loginForm: {username:'',password:''},
  loginError: '',
  // chat
  chatMessages: ls.get('cp_chat',[{id:1,user:'system',text:'BRAIN HACK 채팅방에 오신 것을 환영합니다! 🧠',time:'00:00',isSystem:true}]),
  chatInput: '',
  reportTarget: null,
  reportReason: '',
  // shop
  shopTab: 'all',
  // profile pw visibility
  showPwOld: false, showPwNew: false, showPwConfirm: false,
  // profile
  profileEditing: false,
  profileForm: {nickname:''},
  pwForm: {old:'',new_:'',confirm:''},
  pwError: '',
  // leaderboard
  lbTab: 'score',
  // submit problem
  submitForm: {category:'수학',difficulty:3,question:'',hint:'',answer:'',explanation:'',timeLimit:60},
  submitLoading: false,
  submitResult: null,
  // admin
  adminTab: 'problems',
  adminProblemEditingId: null,
  adminProblemDraft: null,
  adminProblemError: '',
  emergency: ls.get('cp_emergency',false),
  emergencyPw: '',
  emergencyConfirm: false,
  showEmergencyModal: false,
  // REPAIR MODE (shows 수리 중 to all non-admins)
  repair: ls.get('cp_repair', false),
  showRepairModal: false,
  repairPw: '',
  // CLUBS
  clubs: ls.get('cp_clubs', []),
  clubScreen: 'list',   // 'list' | 'create' | 'detail'
  selectedClubId: null,
  clubCreateForm: {name:'', minTrophy:0, description:''},
  clubCreateErrors: {},
  clubReportForm: {target:'', reason:''},
  clubWarnForm: {memberId:'', reason:''},
  clubWarnTarget: null,
  clubKickTarget: null,
  clubViceTarget: null,
  clubLeaderTarget: null,
  // APPEALS LOG
  appealLogs: ls.get('cp_appeal_logs', []),
  appealForm: {username:'', action:'unban', details:'', amount:0},
  // Sys stats refresh ticker
  sysStatsTick: 0,
  // ── 퀴즈 모드 ──
  quizMode: 'random',      // 'random'|'infinite'|'popular'|'wrongNote'
  quizIndex: 0,
  quizPool: [],
  quizAppeal: false,
  quizAppealText: '',
  heartVoted: {},          // {problemId: true}
  // ── 다크모드 / 글씨크기 ──
  darkMode: ls.get('bh_darkMode', true),
  fontSize: ls.get('bh_fontSize', 'md'),  // 'sm'|'md'|'lg'
  fontSizePercent: ls.get('bh_fontSizePercent', 100),
  // ── 프로모코드 ──
  promoInput: '',
  // ── 채팅 서버 ──
  chatServer: 'global',   // 'global'|'kr'|'jp'|'en'
  // ── 소셜 ──
  socialSearch: '',
  socialTab: 'friends',   // 'friends'|'search'|'requests'
  // ── 상점 탭 ──
  shopMainTab: 'items',
  // ── 설정 모달 ──
  settingsOpen: false,
  settingsTab: 'music',
  settingsNickname: '',
  settingsPwForm: {old:'',new_:'',confirm:''},
  // ── 이용 시간 체크 ──
  usageStart: Date.now(),
  usageAlerted: false,
};

function setState(patch) {
  Object.assign(state, typeof patch==='function' ? patch(state) : patch);
  render();
}

// For text input changes: update state WITHOUT re-rendering (prevents keyboard dismiss)
function setQ(patch) {
  Object.assign(state, typeof patch==='function' ? patch(state) : patch);
}

let toastTimer = null;
function showToast(msg, type='info') {
  if(toastTimer) clearTimeout(toastTimer);
  setState({toast:{msg,type}});
  toastTimer = setTimeout(()=>setState({toast:null}), 3000);
}

function saveProblems(p) { setState({problems:p}); ls.set('cp_problems',p); }

function updateUser(updated) {
  setState({currentUser: updated});
  const users = ls.get('cp_users', []);
  ls.set('cp_users', users.map(u => u.username === updated.username ? updated : u));
  // 로그인 상태 유지 (새로고침 후에도)
  ls.set('cp_currentUser', {username: updated.username});
  // 업적 체크
  const newAchs = checkAchs(updated);
  if(newAchs.length > 0) {
    const withAchs = {...updated, achievements: [...(updated.achievements||[]), ...newAchs]};
    setState({currentUser: withAchs});
    ls.set('cp_users', ls.get('cp_users',[]).map(u => u.username === withAchs.username ? withAchs : u));
    ls.set('cp_currentUser', {username: withAchs.username});
    const achObj = ACHIEVEMENTS.find(a => a.id === newAchs[0]);
    if(achObj) showToast(`🏆 업적 달성: ${achObj.name}!`, 'warning');
  }
}

function saveClubs(c) { setState({clubs:c}); ls.set('cp_clubs',c); }
function addAppealLog(entry) {
  const logs = ls.get('cp_appeal_logs',[]);
  const newLogs = [...logs, entry];
  ls.set('cp_appeal_logs', newLogs);
  setState({appealLogs: newLogs});
}


// ── 활동 로그 ──
function addActivityLog(type, data={}) {
  const entry = {
    id: Date.now(),
    type,
    user: state.currentUser?.username || 'anonymous',
    data,
    time: new Date().toISOString()
  };
  const logs = JSON.parse(localStorage.getItem('cp_Log') || '[]');
  logs.push(entry);
  if(logs.length > 2000) logs.splice(0, logs.length - 2000);
  localStorage.setItem('cp_Log', JSON.stringify(logs));
}

// ── 장시간 이용 알림 (60분마다) ──
setInterval(() => {
  if(!state.currentUser || state.usageAlerted) return;
  const mins = (Date.now() - state.usageStart) / 60000;
  if(mins >= 60) {
    setState({ usageAlerted: true });
    showToast('⏰ 60분 이상 이용 중입니다. 잠깐 휴식을 취해보세요! 🌿', 'warning');
  }
}, 300000); // 5분마다 체크

// ── 휴면 복귀 보상 체크 ──
function checkDormantReward(user) {
  if(!user || !user.lastLogin) return user;
  const days = (Date.now() - new Date(user.lastLogin).getTime()) / 86400000;
  if(days < 7 || user.dormantClaimedDate === new Date().toDateString()) return user;
  let bonus = 0;
  let msg = '';
  if(days >= 30)      { bonus = 500; msg = `${Math.floor(days)}일 만에 복귀! +500 코인 🎁`; }
  else if(days >= 14) { bonus = 200; msg = `${Math.floor(days)}일 만에 복귀! +200 코인 🎁`; }
  else if(days >= 7)  { bonus = 50;  msg = `${Math.floor(days)}일 만에 복귀! +50 코인 🎁`; }
  if(bonus > 0) {
    showToast(msg, 'success');
    return { ...user, coins: (user.coins||0) + bonus, dormantClaimedDate: new Date().toDateString() };
  }
  return user;
}

// ── 다크모드 / 글씨크기 적용 ──
function applyTheme() {
  const sizes = { sm: 90, md: 100, lg: 110 };
  const pct = Number(state.fontSizePercent || sizes[state.fontSize] || 100);
  document.documentElement.style.setProperty('--body-size', pct + '%');
  document.documentElement.style.zoom = pct / 100;
  if(state.darkMode) {
    document.documentElement.style.setProperty('--bg', '#020408');
    document.documentElement.style.setProperty('--bg2', '#030c14');
    document.documentElement.style.setProperty('--panel', '#060e18');
    document.documentElement.style.setProperty('--border', '#0ff2');
    document.documentElement.style.setProperty('--text', '#c8e6f0');
    document.documentElement.style.setProperty('--dim', '#3a6070');
    document.documentElement.style.setProperty('--input-bg', '#030c14');
  } else {
    document.documentElement.style.setProperty('--bg', '#f5f9fc');
    document.documentElement.style.setProperty('--bg2', '#ffffff');
    document.documentElement.style.setProperty('--panel', '#eef6fb');
    document.documentElement.style.setProperty('--border', '#0088aa33');
    document.documentElement.style.setProperty('--text', '#102532');
    document.documentElement.style.setProperty('--dim', '#5b7584');
    document.documentElement.style.setProperty('--input-bg', '#ffffff');
  }
}
