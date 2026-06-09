function renderLoginModal() {
  const handle = ()=>{
    const uname = state.loginForm.username.trim();
    const pw = state.loginForm.password;
    if(uname==='admin'&&pw==='admin1234!') {
      const adminUser={username:'admin',nickname:'관리자',isAdmin:true,xp:999999,coins:999999,score:0,solved:[],achievements:[],job:'etc',country:'KR',flag:'🇰🇷',char:'👾',createdAt:new Date().toISOString(),inventory:[],equipped:{frame:'',hat:'',bg:'',acc:'',title:'admin_title'}};
      Object.assign(state,{currentUser:adminUser,modal:null,loginForm:{username:'',password:''},loginError:'',toast:{msg:'👾 관리자 접속!',type:'success'}});
      if(toastTimer)clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>setState({toast:null}),3000);
      render(); return;
    }
    const users = ls.get('cp_users',[]);
    const user = users.find(u=>u.username===uname&&u.password===pw);
    if(!user){setState({loginError:'아이디 또는 비밀번호가 틀렸습니다'});return;}
    if(user.banned){setState({loginError:'계정이 정지되었습니다'});return;}
    const rewarded = checkDormantReward(user);
    const withLogin = {...(rewarded||user), lastLogin:new Date().toISOString()};
    const allU = ls.get('cp_users',[]);
    ls.set('cp_users', allU.map(u2=>u2.username===withLogin.username?withLogin:u2));
    ls.set('cp_currentUser', {username:withLogin.username});
    addActivityLog('login',{username:withLogin.username});
    Object.assign(state,{currentUser:withLogin,modal:null,loginForm:{username:'',password:''},loginError:'',attended:false,toast:{msg:'👾 '+(withLogin.nickname||withLogin.username)+' 접속!',type:'success'}});
    if(toastTimer)clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>setState({toast:null}),3000);
    render();
  };
  return h('div',{className:'overlay',onClick:()=>setState({modal:null})},
    h('div',{className:'modal-box',style:{maxWidth:'400px',width:'100%'},onClick:e=>e.stopPropagation()},
      h('div',{className:'mhdr'},
        h('span',{className:'mtag'},'// 로그인'),
        h('button',{className:'xbtn',onClick:()=>setState({modal:null})},'✕')
      ),
      h('div',{style:{padding:'24px'}},
        field('아이디','',h('input',{className:'inp',placeholder:'아이디',value:state.loginForm.username,onInput:e=>setQ({loginForm:{...state.loginForm,username:e.target.value}})})),
        field('비밀번호','',h('div',{style:{position:'relative'}},
          h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwLogin?'text':'password',placeholder:'비밀번호',value:state.loginForm.password,
            onInput:e=>setQ({loginForm:{...state.loginForm,password:e.target.value}}),
            onKeydown:e=>{if(e.key==='Enter')handle();}}),
          h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},
            onClick:()=>setState({showPwLogin:!state.showPwLogin})},state.showPwLogin?'🙈':'👁️')
        )),
        state.loginError?h('div',{className:'errmsg',style:{marginBottom:'12px'}},'⚠ '+state.loginError):null,
        h('button',{className:'cpbtn primary',style:{width:'100%',padding:'12px'},onClick:handle},'로그인 →'),
        h('button',{className:'cpbtn ghost',style:{width:'100%',padding:'10px',marginTop:'8px'},onClick:()=>setState({modal:'signup',signupStep:0,signupData:{job:'',country:'KR',gender:'M',race:'prefer_not_to_say',username:'',password:'',pwConfirm:'',nickname:'',agreePrivacy:false,agreeThird:false,agreePush:false},signupErrors:{}})},'계정 없음 → 회원가입'),
        null
      )
    )
  );
}

const SIGNUP_STEPS = ['직업 선택','국가 선택','계정 설정','개인정보','제3자 동의','알림 설정'];
function renderSignupModal() {
  const s = state.signupStep;
  const d = state.signupData;
  const errs = state.signupErrors || {};

  // 인종 변경 시 선택된 직업 이모지도 즉시 갱신을 위해 state로 관리
  const up = (k,v) => setState({signupData:{...state.signupData,[k]:v}});

  const validateStep = ()=>{
    const sd = state.signupData;
    const e={};
    if(s===0&&!sd.gender) e.gender='성별을 선택해주세요';
    if(s===0&&!sd.job) e.job='직업을 선택해주세요';
    if(s===1&&!sd.country) e.country='국가를 선택해주세요';
    if(s===2){
      if(sd.username.length<6) e.username='아이디는 6자 이상';
      else if(/^admin$/i.test(sd.username)) e.username='"admin"은 사용할 수 없는 아이디입니다';
      else {
        const existUsers = ls.get('cp_users',[]);
        if(existUsers.find(u=>u.username.toLowerCase()===sd.username.toLowerCase())) e.username='이미 사용 중인 아이디입니다';
      }
      if(sd.nickname.length<2) e.nickname='닉네임은 2자 이상';
      if(!/\d/.test(sd.password)||sd.password.length<8) e.password='8자 이상, 숫자 포함';
      if(sd.password!==sd.pwConfirm) e.pwConfirm='비밀번호 불일치';
    }
    if(s===3&&!sd.agreePrivacy) e.agreePrivacy='필수 동의 항목입니다';
    if(s===4&&!sd.agreeThird) e.agreeThird='필수 동의 항목입니다';
    setState({signupErrors:e});
    return Object.keys(e).length===0;
  };

  const next = ()=>{
    if(!validateStep()) return;
    if(s<5) setState({signupStep:s+1});
    else finishSignup();
  };

  const finishSignup = ()=>{
    const d = state.signupData;
    const users = ls.get('cp_users',[]);
    if(/^admin$/i.test(d.username)){setState({signupErrors:{username:'"admin"은 사용할 수 없는 아이디입니다'},signupStep:2});return;}
    if(users.find(u=>u.username.toLowerCase()===d.username.toLowerCase())){setState({signupErrors:{username:'이미 사용 중인 아이디입니다'},signupStep:2});return;}
    const job = JOBS.find(j=>j.id===d.job);
    const country = COUNTRIES.find(c=>c.code===d.country);
    const gender = d.gender || 'M';
    const charKey = gender==='F' ? 'charF' : 'charM';
    const baseChar = job?.[charKey] || job?.char || '🧑';
    const charEmoji = applySkinTone(baseChar, d.race);
    const user = {
      username:d.username, password:d.password, nickname:d.nickname,
      job:d.job, country:d.country, gender, race:d.race || 'prefer_not_to_say',
      flag:country?.flag||'🌍', char:charEmoji,
      score:0, xp:0, coins:100, solved:[], submitted:0,
      achievements:[], inventory:[], equipped:{frame:'',hat:'',bg:'',acc:'',title:''},
      streak:0, maxStreak:0, attendanceDates:[], attendanceStreak:0,
      friends:[], blocked:[], friendRequests:[],
      pushEnabled:d.agreePush, warnings:0, banned:false, banUntil:null,
      wrongAnswers:[], usedPromos:[], heartVoted:{},
      createdAt:new Date().toISOString(), lastLogin:new Date().toISOString(),
      isAdmin:false, clubsCreated:0
    };
    ls.set('cp_users',[...users,user]);
    setState({currentUser:user, modal:null, attended:false});
    showToast('🎉 회원가입 완료! 코인 100개 지급!','success');
    addActivityLog('signup',{username:user.username,job:d.job,gender});
  };

  let content;
  if(s===0) {
    // 현재 선택된 직업/성별/인종 기반 미리보기 이모지
    const job = JOBS.find(j=>j.id===d.job);
    const charKey = d.gender==='F' ? 'charF' : 'charM';
    const previewBase = job ? (job[charKey]||job.char||'🧑') : '🧑';
    const previewEmoji = applySkinTone(previewBase, d.race||'prefer_not_to_say');

    content = h('div',{},
      // 성별 선택
      h('div',{className:'slabel',style:{marginBottom:'8px'}},'성별을 선택하세요'),
      h('div',{style:{display:'flex',gap:'10px',marginBottom:'18px'}},
        h('button',{
          style:{flex:1,padding:'12px',cursor:'pointer',fontFamily:'var(--body)',fontSize:'14px',
            background:d.gender==='M'?'#00f5ff18':'var(--panel)',
            border:'1px solid '+(d.gender==='M'?'var(--cyan)':'var(--border)'),
            color:d.gender==='M'?'var(--cyan)':'var(--text)'},
          onClick:()=>up('gender','M')},'👦 남성'),
        h('button',{
          style:{flex:1,padding:'12px',cursor:'pointer',fontFamily:'var(--body)',fontSize:'14px',
            background:d.gender==='F'?'#ff00aa18':'var(--panel)',
            border:'1px solid '+(d.gender==='F'?'var(--pink)':'var(--border)'),
            color:d.gender==='F'?'var(--pink)':'var(--text)'},
          onClick:()=>up('gender','F')},'👧 여성')
      ),
      // 인종 선택 - setState로 즉시 렌더링
      h('div',{className:'slabel',style:{marginBottom:'6px'}},'인종을 선택하세요 (이모지 피부색 적용)'),
      h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}},
        h('select',{
          className:'inp',style:{flex:1},
          value:d.race||'prefer_not_to_say',
          onChange:e=>up('race', e.target.value)
        },
          h('option',{value:'prefer_not_to_say'},'선택 안 함'),
          h('option',{value:'asian'},'아시아인'),
          h('option',{value:'black'},'흑인'),
          h('option',{value:'white'},'백인'),
          h('option',{value:'hispanic_latino'},'히스패닉/라틴계'),
          h('option',{value:'middle_eastern'},'중동계'),
          h('option',{value:'indigenous'},'원주민'),
          h('option',{value:'mixed'},'혼혈/다인종'),
          h('option',{value:'other'},'기타')
        ),
        h('div',{style:{fontSize:'32px',minWidth:'40px',textAlign:'center',border:'1px solid var(--border)',padding:'4px 8px',background:'var(--panel)'}},previewEmoji)
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'16px'}},
        '↑ 직업 선택 시 해당 피부색이 적용된 캐릭터로 지급됩니다'),
      // 직업 선택
      h('div',{className:'slabel',style:{marginBottom:'8px'}},'직업을 선택하세요 (픽셀 캐릭터 지급)'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},
        ...JOBS.map(j=>{
          const cKey = d.gender==='F' ? 'charF' : 'charM';
          const base = j[cKey] || j.char || '🧑';
          const charEmoji = applySkinTone(base, d.race||'prefer_not_to_say');
          return h('button',{
            style:{background:d.job===j.id?'#00f5ff18':'var(--panel)',border:'1px solid '+(d.job===j.id?'var(--cyan)':'var(--border)'),
              color:d.job===j.id?'var(--cyan)':'var(--text)',padding:'14px 8px',cursor:'pointer',fontFamily:'var(--body)',fontSize:'13px',
              display:'flex',flexDirection:'column',alignItems:'center',gap:'5px'},
            onClick:()=>up('job',j.id)},
            h('span',{style:{fontSize:'28px'}},charEmoji),
            h('span',{style:{fontSize:'11px',fontFamily:'var(--mono)'}},j.icon),
            j.label
          );
        })
      ),
      errs.job?h('div',{className:'errmsg',style:{marginTop:'8px'}},'⚠ '+errs.job):null,
      !d.gender?h('div',{className:'errmsg',style:{marginTop:'8px'}},'⚠ 성별을 먼저 선택해주세요'):null
    );
  }
  else if(s===1) content = h('div',{},
    h('div',{className:'slabel'},'국가를 선택하세요 (프로필 국기 표시)'),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginTop:'12px',maxHeight:'300px',overflowY:'auto'}},
      ...COUNTRIES.map(c=>h('button',{
        style:{background:d.country===c.code?'#00f5ff18':'var(--panel)',border:'1px solid '+(d.country===c.code?'var(--cyan)':'var(--border)'),
          color:d.country===c.code?'var(--cyan)':'var(--text)',padding:'10px 12px',cursor:'pointer',fontFamily:'var(--body)',fontSize:'13px',
          display:'flex',alignItems:'center',gap:'8px',textAlign:'left'},
        onClick:()=>up('country',c.code)},
        h('span',{style:{fontSize:'20px'}},c.flag),c.name
      ))
    )
  );
  else if(s===2) content = h('div',{},
    field('닉네임 (2자 이상)',errs.nickname||'',h('input',{className:'inp',placeholder:'표시될 닉네임',value:d.nickname,onInput:e=>up('nickname',e.target.value)})),
    field('아이디 (6자 이상)',errs.username||'',h('input',{className:'inp',placeholder:'brain_user01',value:d.username,onInput:e=>up('username',e.target.value)})),
    field('비밀번호 (8자 이상, 숫자 포함)',errs.password||'',h('div',{style:{position:'relative'}},
      h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwSignup?'text':'password',placeholder:'••••••••',value:d.password,onInput:e=>up('password',e.target.value)}),
      h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},
        onClick:()=>setState({showPwSignup:!state.showPwSignup})},state.showPwSignup?'🙈':'👁️')
    )),
    field('비밀번호 확인',errs.pwConfirm||'',h('div',{style:{position:'relative'}},
      h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwSignup2?'text':'password',placeholder:'••••••••',value:d.pwConfirm,onInput:e=>up('pwConfirm',e.target.value)}),
      h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},
        onClick:()=>setState({showPwSignup2:!state.showPwSignup2})},state.showPwSignup2?'🙈':'👁️')
    ))
  );
  else if(s===3) content = h('div',{},
    h('div',{className:'slabel'},'개인정보 처리 방침'),
    h('div',{className:'consent-box'},
      h('p',{},'수집 항목: 아이디, 비밀번호(암호화), 닉네임, 직업, 국가, 퀴즈 기록'),
      h('p',{},'수집 목적: 서비스 제공, 랭킹 관리, 맞춤 문제 추천'),
      h('p',{},'보유 기간: 회원 탈퇴 시까지')
    ),
    consentRow('[필수] 개인정보 처리 방침에 동의합니다',d.agreePrivacy,v=>up('agreePrivacy',v)),
    errs.agreePrivacy?h('div',{className:'errmsg'},'⚠ '+errs.agreePrivacy):null
  );
  else if(s===4) content = h('div',{},
    h('div',{className:'slabel'},'제3자 정보 제공 동의'),
    h('div',{className:'consent-box'},
      h('p',{},'제공 대상: 서비스 운영 파트너사'),
      h('p',{},'제공 항목: 닉네임, 점수, 활동 통계 (익명화)'),
      h('p',{},'제공 목적: 랭킹 서비스, 통계 분석'),
      h('p',{},'보유 기간: 제공일로부터 1년')
    ),
    consentRow('[필수] 제3자 정보 제공에 동의합니다',d.agreeThird,v=>up('agreeThird',v)),
    errs.agreeThird?h('div',{className:'errmsg'},'⚠ '+errs.agreeThird):null
  );
  else content = h('div',{style:{textAlign:'center',padding:'14px 0 20px'}},
    h('div',{style:{fontSize:'44px',marginBottom:'10px'}},'🔔'),
    h('div',{style:{fontFamily:'var(--display)',fontSize:'15px',color:'var(--cyan)',marginBottom:'8px'}},'푸시 알림'),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',lineHeight:'1.7'}},'새 문제 알림, 랭킹 변동, 이벤트 소식을 받아보시겠어요?'),
    consentRow('[선택] 푸시 알림을 받겠습니다',d.agreePush,v=>up('agreePush',v))
  );

  return h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'500px',width:'100%'},onClick:e=>e.stopPropagation()},
      h('div',{className:'mhdr'},
        h('button',{className:'xbtn',onClick:()=>setState({modal:'login'})},'←'),
        h('span',{className:'mtag'},'// 회원가입'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},SIGNUP_STEPS[s])
      ),
      h('div',{style:{padding:'22px 24px 28px'}},
        progressBar(s,6),
        content,
        h('button',{className:'cpbtn primary',style:{width:'100%',marginTop:'20px',padding:'13px'},onClick:next},
          s===5?'가입 완료 →':'다음 →')
      )
    )
  );
}
