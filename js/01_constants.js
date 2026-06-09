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
  { id:"worker",       label:"직장인",   labelEn:"WORKER",      icon:"💼", charM:"👨",  charF:"👩"  },
  { id:"jobseeker",    label:"취준생",   labelEn:"JOB SEEKER",  icon:"📋", charM:"🧑",  charF:"🧑"  },
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

// ── 칭호별 이펙트 정의 ──
const TITLE_EFFECTS = {
  'title_genius':  { color:'#ff00ff', shadow:'#ff00ff', particles:'✨', anim:'genius' },
  'title_hacker':  { color:'#00ff41', shadow:'#00ff41', particles:'💻', anim:'hacker' },
  'title_legend':  { color:'#ffd700', shadow:'#ffd700', particles:'⭐', anim:'legend' },
  'title_demon':   { color:'#ff0000', shadow:'#ff0000', particles:'🔥', anim:'demon'  },
  'title_angel':   { color:'#ffffff', shadow:'#88ffff', particles:'💫', anim:'angel'  },
  'title_dragon':  { color:'#ff6600', shadow:'#ff6600', particles:'🐉', anim:'dragon' },
  'title_phantom': { color:'#8b00ff', shadow:'#8b00ff', particles:'👻', anim:'phantom'},
  'title_king':    { color:'#ffd700', shadow:'#ff8800', particles:'👑', anim:'king'   },
  'admin_title':   { color:'#ff003c', shadow:'#ff003c', particles:'🛡️', anim:'admin'  },
};

const SHOP_ITEMS = [
  // ── 프레임 ──
  { id:"frame_gold",    name:"골드 프레임",   type:"frame", price:200,  icon:"🟡", rarity:"rare",      desc:"황금빛 프레임" },
  { id:"frame_neon",    name:"네온 프레임",   type:"frame", price:350,  icon:"💚", rarity:"epic",      desc:"형광 사이버 프레임" },
  { id:"frame_fire",    name:"파이어 프레임", type:"frame", price:500,  icon:"🔥", rarity:"epic",      desc:"불꽃이 타오르는 프레임" },
  { id:"frame_ice",     name:"아이스 프레임", type:"frame", price:500,  icon:"❄️", rarity:"epic",      desc:"얼음결정 프레임" },
  { id:"frame_rainbow", name:"무지개 프레임", type:"frame", price:700,  icon:"🌈", rarity:"legendary", desc:"7색 무지개 프레임" },
  { id:"frame_dark",    name:"다크 프레임",   type:"frame", price:400,  icon:"🌑", rarity:"rare",      desc:"어둠의 프레임" },
  // ── 모자/헤어 ──
  { id:"hat_crown",     name:"왕관",          type:"hat",   price:500,  icon:"👑", rarity:"epic",      desc:"왕의 위엄" },
  { id:"hat_hacker",    name:"해커 후드",     type:"hat",   price:300,  icon:"🎩", rarity:"rare",      desc:"어둠의 해커 후드" },
  { id:"hat_wizard",    name:"마법사 모자",   type:"hat",   price:400,  icon:"🧙", rarity:"rare",      desc:"마나가 담긴 모자" },
  { id:"hat_ninja",     name:"닌자 두건",     type:"hat",   price:350,  icon:"🥷", rarity:"rare",      desc:"그림자 속의 닌자" },
  { id:"hat_devil",     name:"악마 뿔",       type:"hat",   price:600,  icon:"😈", rarity:"epic",      desc:"악마의 뿔 장식" },
  { id:"hat_angel",     name:"천사 후광",     type:"hat",   price:600,  icon:"😇", rarity:"epic",      desc:"신성한 후광" },
  // ── 배경 ──
  { id:"bg_matrix",     name:"매트릭스 BG",  type:"bg",    price:400,  icon:"🟢", rarity:"epic",      desc:"코드 비가 내리는 배경" },
  { id:"bg_galaxy",     name:"갤럭시 BG",    type:"bg",    price:450,  icon:"🌌", rarity:"epic",      desc:"은하수 배경" },
  { id:"bg_fire",       name:"화염 BG",      type:"bg",    price:500,  icon:"🔥", rarity:"epic",      desc:"불꽃 배경" },
  { id:"bg_ocean",      name:"심해 BG",      type:"bg",    price:380,  icon:"🌊", rarity:"rare",      desc:"신비로운 심해 배경" },
  { id:"bg_forest",     name:"숲 BG",        type:"bg",    price:300,  icon:"🌲", rarity:"rare",      desc:"고요한 숲 배경" },
  { id:"bg_city",       name:"도시 BG",      type:"bg",    price:350,  icon:"🏙️", rarity:"rare",      desc:"밤의 사이버 도시" },
  // ── 액세서리 ──
  { id:"acc_glasses",   name:"해커 안경",    type:"acc",   price:150,  icon:"🕶️", rarity:"common",    desc:"멋진 해커 안경" },
  { id:"acc_badge",     name:"뇌풀기 뱃지", type:"acc",   price:100,  icon:"📛", rarity:"common",    desc:"공식 뱃지" },
  { id:"acc_mask",      name:"사이버 마스크",type:"acc",  price:300,  icon:"🎭", rarity:"rare",      desc:"미래형 마스크" },
  { id:"acc_wings",     name:"날개",         type:"acc",   price:800,  icon:"🦋", rarity:"legendary", desc:"빛나는 날개" },
  { id:"acc_sword",     name:"검",           type:"acc",   price:500,  icon:"⚔️", rarity:"epic",      desc:"전설의 검" },
  { id:"acc_shield",    name:"방패",         type:"acc",   price:500,  icon:"🛡️", rarity:"epic",      desc:"철벽 방패" },
  { id:"acc_magic",     name:"마법봉",       type:"acc",   price:450,  icon:"🪄", rarity:"epic",      desc:"마법사의 봉" },
  // ── 칭호 ──
  { id:"title_genius",  name:"천재",         type:"title", price:600,  icon:"🧠", rarity:"legendary", desc:"IQ 200의 천재",        effect:'genius'  },
  { id:"title_hacker",  name:"해커",         type:"title", price:800,  icon:"👾", rarity:"legendary", desc:"시스템을 해킹하는 자",  effect:'hacker'  },
  { id:"title_legend",  name:"레전드",       type:"title", price:1200, icon:"⭐", rarity:"legendary", desc:"전설이 된 자",          effect:'legend'  },
  { id:"title_demon",   name:"악마",         type:"title", price:1000, icon:"😈", rarity:"legendary", desc:"어둠의 화신",           effect:'demon'   },
  { id:"title_angel",   name:"천사",         type:"title", price:1000, icon:"😇", rarity:"legendary", desc:"빛의 수호자",           effect:'angel'   },
  { id:"title_dragon",  name:"드래곤",       type:"title", price:1500, icon:"🐉", rarity:"legendary", desc:"고대의 드래곤",         effect:'dragon'  },
  { id:"title_phantom", name:"팬텀",         type:"title", price:900,  icon:"👻", rarity:"legendary", desc:"유령처럼 나타나는 자",  effect:'phantom' },
  { id:"title_king",    name:"킹",           type:"title", price:2000, icon:"👑", rarity:"legendary", desc:"모든 것의 지배자",      effect:'king'    },
  // ── 포션 ──
  { id:"time_potion",   name:"시간포션",     type:"potion", price:300, icon:"⏰", rarity:"rare",      desc:"+30초 제한시간 연장" },
  { id:"xp_potion",     name:"경험치물약",   type:"potion", price:500, icon:"⚗️", rarity:"epic",      desc:"다음 문제 XP ×2" },
  { id:"coin_potion",   name:"코인물약",     type:"potion", price:500, icon:"💊", rarity:"epic",      desc:"다음 문제 코인 ×2" },
  { id:"hint_potion",   name:"힌트포션",     type:"potion", price:150, icon:"🧪", rarity:"common",    desc:"힌트 XP 차감 없음" },
  { id:"mega_potion",   name:"메가포션",     type:"potion", price:1200,icon:"🍶", rarity:"legendary", desc:"XP×3 + 코인×3 동시 적용" },
  // ── 관리자 전용 (숨김) ──
  { id:"admin_title",   name:"ADMINISTRATOR",type:"title", price:999999999, rarity:"legendary", icon:"🛡️", desc:"관리자 전용 칭호", effect:'admin', adminOnly:true },
];

const ACHIEVEMENTS = [
  { id:"first_solve",   name:"첫 정답",         desc:"첫 번째 문제를 맞혔습니다",    icon:"🌟", cond: u => (u.solved||[]).length >= 1 },
  { id:"streak_3",      name:"3연속",           desc:"3문제 연속 정답",              icon:"🔥", cond: u => (u.maxStreak||0) >= 3 },
  { id:"streak_7",      name:"7연속",           desc:"7문제 연속 정답",              icon:"⚡", cond: u => (u.maxStreak||0) >= 7 },
  { id:"streak_15",     name:"15연속",          desc:"15문제 연속 정답",             icon:"💥", cond: u => (u.maxStreak||0) >= 15 },
  { id:"solve_50",      name:"50문제",          desc:"50문제 이상 풀기",             icon:"💯", cond: u => (u.solved||[]).length >= 50 },
  { id:"solve_100",     name:"100문제",         desc:"100문제 이상 풀기",            icon:"🏆", cond: u => (u.solved||[]).length >= 100 },
  { id:"coin_500",      name:"부자",            desc:"코인 500개 보유",              icon:"💰", cond: u => (u.coins||0) >= 500 },
  { id:"coin_5000",     name:"재벌",            desc:"코인 5000개 보유",             icon:"💎", cond: u => (u.coins||0) >= 5000 },
  { id:"rank_emerald",  name:"에메랄드 달성",   desc:"에메랄드 등급 달성",           icon:"💚", cond: u => (u.xp||0) >= 7000 },
  { id:"rank_diamond",  name:"다이아 달성",     desc:"다이아몬드 등급 달성",         icon:"💠", cond: u => (u.xp||0) >= 13000 },
  { id:"rank_hacker",   name:"해커 달성",       desc:"해커 등급 달성",               icon:"👾", cond: u => (u.xp||0) >= 22000 },
  { id:"attendance_7",  name:"7일 출석",        desc:"7일 연속 출석",                icon:"📅", cond: u => (u.attendanceStreak||0) >= 7 },
  { id:"attendance_30", name:"30일 출석",       desc:"30일 연속 출석",               icon:"🗓️", cond: u => (u.attendanceStreak||0) >= 30 },
  { id:"submit_q",      name:"문제 제출",       desc:"문제를 처음 제출했습니다",     icon:"✍️", cond: u => (u.submitted||0) >= 1 },
  { id:"club_create",   name:"클럽 창설",       desc:"클럽을 처음 만들었습니다",     icon:"🏟️", cond: u => (u.clubsCreated||0) >= 1 },
  { id:"item_10",       name:"쇼핑중독",        desc:"아이템 10개 이상 보유",        icon:"🛒", cond: u => (u.inventory||[]).length >= 10 },
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


