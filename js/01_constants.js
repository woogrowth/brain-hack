// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const RANKS = [
  { id:"bronze",     label:"브론즈",    labelEn:"BRONZE",    minXp:0,     icon:"🥉", color:"#cd7f32" },
  { id:"silver",     label:"실버",      labelEn:"SILVER",    minXp:500,   icon:"🥈", color:"#c0c0c0" },
  { id:"gold",       label:"골드",      labelEn:"GOLD",      minXp:1500,  icon:"🥇", color:"#ffd700" },
  { id:"platinum",   label:"플래티넘",  labelEn:"PLATINUM",  minXp:3500,  icon:"💎", color:"#e5e4e2" },
  { id:"emerald",    label:"에메랄드",  labelEn:"EMERALD",   minXp:7000,  icon:"💚", color:"#50c878" },
  { id:"diamond",    label:"다이아몬드",labelEn:"DIAMOND",   minXp:13000, icon:"💠", color:"#b9f2ff" },
  { id:"hacker",     label:"해커",      labelEn:"HACKER",    minXp:22000, icon:"👾", color:"#00ff41" },
  { id:"darkness",   label:"다크니스",  labelEn:"DARKNESS",  minXp:35000, icon:"🌑", color:"#8b00ff" },
  { id:"challenger", label:"챌린저",    labelEn:"CHALLENGER",minXp:55000, icon:"⚡", color:"#ff4500" },
];
const JOBS = [
  { id:"student_high", label:"고등학생", labelEn:"HIGH SCHOOL", icon:"🎒", charM:"👦",  charF:"👧"  },
  { id:"student_univ", label:"대학생",   labelEn:"UNIVERSITY",  icon:"🎓", charM:"👨‍🎓", charF:"👩‍🎓" },
  { id:"teacher",      label:"선생님",   labelEn:"TEACHER",     icon:"📚", charM:"👨‍🏫", charF:"👩‍🏫" },
  { id:"worker",       label:"직장인",   labelEn:"WORKER",      icon:"💼", charM:"👔",  charF:"👩‍💼" },
  { id:"jobseeker",    label:"취준생",   labelEn:"JOB SEEKER",  icon:"📋", charM:"🔍",  charF:"🔍"  },
  { id:"freelancer",   label:"프리랜서", labelEn:"FREELANCER",  icon:"💻", charM:"🧑‍💻", charF:"👩‍💻" },
  { id:"etc",          label:"기타",     labelEn:"OTHER",       icon:"✦",  charM:"🧑",  charF:"👩"  },
];
const COUNTRIES = [
  { code:"KR", name:"대한민국", flag:"🇰🇷" },{ code:"US", name:"미국", flag:"🇺🇸" },
  { code:"JP", name:"일본", flag:"🇯🇵" },{ code:"CN", name:"중국", flag:"🇨🇳" },
  { code:"GB", name:"영국", flag:"🇬🇧" },{ code:"DE", name:"독일", flag:"🇩🇪" },
  { code:"FR", name:"프랑스", flag:"🇫🇷" },{ code:"CA", name:"캐나다", flag:"🇨🇦" },
  { code:"AU", name:"호주", flag:"🇦🇺" },{ code:"BR", name:"브라질", flag:"🇧🇷" },
  { code:"IN", name:"인도", flag:"🇮🇳" },{ code:"MX", name:"멕시코", flag:"🇲🇽" },
  { code:"OTHER", name:"기타", flag:"🌍" },
];
const SHOP_ITEMS = [
  { id:"frame_gold",   name:"골드 프레임",  type:"frame", price:200, icon:"🟡", rarity:"rare" },
  { id:"frame_neon",   name:"네온 프레임",  type:"frame", price:350, icon:"💚", rarity:"epic" },
  { id:"hat_crown",    name:"왕관",         type:"hat",   price:500, icon:"👑", rarity:"epic" },
  { id:"hat_hacker",   name:"해커 후드",    type:"hat",   price:300, icon:"🎩", rarity:"rare" },
  { id:"bg_matrix",    name:"매트릭스 BG",  type:"bg",    price:400, icon:"🟢", rarity:"epic" },
  { id:"bg_galaxy",    name:"갤럭시 BG",    type:"bg",    price:450, icon:"🌌", rarity:"epic" },
  { id:"title_genius", name:"천재 칭호",    type:"title", price:600, icon:"🧠", rarity:"legendary" },
  { id:"title_hacker", name:"해커 칭호",    type:"title", price:800, icon:"👾", rarity:"legendary" },
  { id:"acc_glasses",  name:"해커 안경",    type:"acc",   price:150, icon:"🕶️", rarity:"common" },
  { id:"acc_badge",    name:"뇌풀기 뱃지", type:"acc",   price:100, icon:"📛", rarity:"common" },
  // ── 포션 ──
  { id:"time_potion",  name:"시간포션",  type:"potion", price:300,  icon:"⏰", rarity:"rare",   desc:"+30초 제한시간 연장" },
  { id:"xp_potion",    name:"경험치물약", type:"potion", price:500,  icon:"⚗️", rarity:"epic",   desc:"다음 문제 XP ×2" },
  { id:"coin_potion",  name:"코인물약",  type:"potion", price:500,  icon:"💊", rarity:"epic",   desc:"다음 문제 코인 ×2" },
  { id:"hint_potion",  name:"힌트포션",  type:"potion", price:150,  icon:"🧪", rarity:"common", desc:"힌트 XP 차감 없음" },
];
const ACHIEVEMENTS = [
  { id:"first_solve",  name:"첫 정답",       desc:"첫 번째 문제를 맞혔습니다",  icon:"🌟", cond: u => (u.solved||[]).length >= 1 },
  { id:"streak_3",     name:"3연속",         desc:"3문제 연속 정답",            icon:"🔥", cond: u => (u.maxStreak||0) >= 3 },
  { id:"streak_7",     name:"7연속",         desc:"7문제 연속 정답",            icon:"⚡", cond: u => (u.maxStreak||0) >= 7 },
  { id:"solve_50",     name:"50문제",        desc:"50문제 이상 풀기",           icon:"💯", cond: u => (u.solved||[]).length >= 50 },
  { id:"coin_500",     name:"부자",          desc:"코인 500개 보유",            icon:"💰", cond: u => (u.coins||0) >= 500 },
  { id:"rank_emerald", name:"에메랄드 달성", desc:"에메랄드 등급 달성",         icon:"💚", cond: u => (u.xp||0) >= 7000 },
  { id:"attendance_7", name:"7일 출석",      desc:"7일 연속 출석",              icon:"📅", cond: u => (u.attendanceStreak||0) >= 7 },
  { id:"submit_q",     name:"문제 제출",     desc:"문제를 처음 제출했습니다",   icon:"✍️", cond: u => (u.submitted||0) >= 1 },
  { id:"club_create",  name:"클럽 창설",     desc:"클럽을 처음 만들었습니다",   icon:"🏟️", cond: u => (u.clubsCreated||0) >= 1 },
];
const PROBLEMS_DEFAULT = [
  { id:1, category:"수학",  difficulty:3, question:"1부터 100까지 모두 더하면?", hint:"가우스 공식", answer:"5050", explanation:"101×50=5050", timeLimit:60, xp:30, coins:15 },
  { id:2, category:"논리",  difficulty:4, question:"성냥 6개로 정삼각형 4개를 만드는 방법은?", hint:"3D로 생각하세요", answer:"정사면체", explanation:"입체도형(정사면체)을 만들면 됩니다", timeLimit:90, xp:40, coins:20 },
  { id:3, category:"언어",  difficulty:2, question:"대한민국에서 가장 긴 강은?", hint:"남쪽 지방", answer:"낙동강", explanation:"약 510km", timeLimit:45, xp:20, coins:10 },
  { id:4, category:"창의",  difficulty:5, question:"시계가 3시 15분일 때 시침과 분침이 이루는 각도는?", hint:"시침은 분마다 0.5도씩 움직입니다", answer:"7.5도", explanation:"3×30도−15×5.5도=90도−82.5도=7.5도", timeLimit:120, xp:50, coins:25 },
  { id:5, category:"수학",  difficulty:3, question:"2의 10승 ÷ 4의 3승 × 8 = ?", hint:"밑을 2로 통일하세요", answer:"128", explanation:"2^10 ÷ 2^6 × 2^3 = 2^7 = 128", timeLimit:60, xp:30, coins:15 },
  { id:6, category:"상식",  difficulty:2, question:"태양계에서 가장 큰 행성은?", hint:"가스 행성입니다", answer:"목성", explanation:"목성은 지구의 약 1,300배 부피입니다", timeLimit:45, xp:20, coins:10 },
  { id:7, category:"논리",  difficulty:4, question:"방에 3명, 빨간 모자 2개 파란 모자 1개. 서로의 모자만 보일 때 한 명이 자기 모자 색을 맞혔다. 어떻게?", hint:"파랑 모자 쓴 사람 관점에서", answer:"나머지 두 명이 빨간 모자를 보고 침묵했으므로 자신이 파랑임을 추론", explanation:"자신도 빨강이라면 남은 빨강이 없으므로 다른 두 명이 바로 맞혔을 것", timeLimit:120, xp:40, coins:20 },
];
const BANNED_WORDS = ["욕설1","욕설2","spam"];
const I18N = {
  ko:{ home:"홈",quiz:"퀴즈",rank:"랭킹",shop:"상점",chat:"채팅",profile:"프로필",club:"클럽",
       login:"로그인",logout:"로그아웃",signup:"회원가입",startQuiz:"▶ 퀴즈 시작",
       submit:"제출",correct:"✓ 정답!",wrong:"✗ 오답",hint:"힌트",skip:"스킵",
       problems:"문제",players:"플레이어",myScore:"내 점수",solved:"풀이 완료",
       coins:"코인",xp:"경험치",streak:"연속 정답",attendCheck:"출석 체크",
       achievements:"업적",submitProblem:"문제 제출",social:"소셜",friends:"친구",search:"검색",requests:"요청",appName:"BRAIN HACK" },
  en:{ home:"HOME",quiz:"QUIZ",rank:"RANK",shop:"SHOP",chat:"CHAT",profile:"PROFILE",club:"CLUB",
       login:"LOGIN",logout:"LOGOUT",signup:"SIGN UP",startQuiz:"▶ START QUIZ",
       submit:"SUBMIT",correct:"✓ CORRECT!",wrong:"✗ WRONG",hint:"HINT",skip:"SKIP",
       problems:"PROBLEMS",players:"PLAYERS",myScore:"MY SCORE",solved:"SOLVED",
       coins:"COINS",xp:"EXP",streak:"STREAK",attendCheck:"ATTENDANCE",
       achievements:"ACHIEVEMENTS",submitProblem:"SUBMIT Q",social:"SOCIAL",friends:"FRIENDS",search:"SEARCH",requests:"REQUESTS",appName:"BRAIN HACK" }
};

// ── 프로모 코드 ──
const PROMO_CODES = {
  'BRAINHACK': { coins:500,  xp:100, msg:"BRAINHACK 코드 적용!" },
  'WELCOME':   { coins:300,  xp:50,  msg:"환영합니다! 보너스 지급!" },
  'HACKER99':  { coins:999,  xp:0,   msg:"해커 코드 적용!" },
  'FRIEND10':  { coins:200,  xp:200, msg:"친구 추천 보너스!" },
  'QUIZ2024':  { coins:400,  xp:400, msg:"QUIZ2024 보너스!" },
};

// ── 이모지샵 목록 ──
const EMOJI_SHOP = [
  "🦊","🐼","🤖","☀️","🔥","🦋","🌈","⚡","🎯","🎮",
  "🎲","🎸","🎺","🎻","🎹","🥁","🌊","🌺","🌸","🌻",
  "🍀","🌙","⭐","🌟","💫","✨","🔮","💎","🏆","🥇",
  "🎖️","🏅","🦁","🐯","🦄","🐉","🦅","🦜","🐸","🦝",
];

// ── 코인 패키지 ──
const COIN_PACKAGES = [
  { name:"스타터",  coins:500,   bonusCoins:0,    price:"₩900",   label:""    },
  { name:"기본",    coins:1500,  bonusCoins:0,    price:"₩2,500", label:""    },
  { name:"인기 ⭐", coins:4000,  bonusCoins:500,  price:"₩5,900", label:"인기" },
  { name:"프리미엄",coins:10000, bonusCoins:2000, price:"₩14,900",label:"최고가성비" },
];
