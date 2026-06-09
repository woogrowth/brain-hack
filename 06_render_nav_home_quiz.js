function renderNav() {
  const t = I18N[state.lang];
  const tabs = [['home',t.home],['quizMode',t.quiz],['leaderboard',t.rank],['shop',t.shop],['chat',t.chat],['clubs',t.club],['social','소셜']];
  if(state.currentUser) tabs.push(['profile',t.profile]);
  const navLinks = h('div',{style:{display:'flex',gap:'4px',flexWrap:'wrap'}},
    ...tabs.map(([s,l])=>h('button',{className:'nbtn'+(state.screen===s?' on':''),
      onClick:()=>setState({screen:s, clubScreen:'list'})},l))
  );
  // Repair badge for admins
  const repairBadge = state.repair ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',
    background:'#ff660022',border:'1px solid #ff6600',color:'#ff6600',padding:'3px 8px',letterSpacing:'1px'}},
    '🔧 REPAIR') : null;
  const rightSide = h('div',{style:{display:'flex',gap:'6px',alignItems:'center',marginLeft:'auto'}},
    repairBadge,
    h('button',{className:'nbtn',title:'설정',onClick:()=>setState({settingsOpen:true})},'⚙'),
    h('button',{className:'nbtn',onClick:()=>{const next=state.lang==='ko'?'en':'ko';setState({lang:next});ls.set('cp_lang',next);}},
      state.lang==='ko'?'EN':'KO'),
    state.currentUser ?
      h('span',{style:{display:'flex',alignItems:'center',gap:'6px'}},
        h('span',{className:'user-chip'},state.currentUser.flag+' '+(state.currentUser.nickname||state.currentUser.username)),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({currentUser:null,screen:'home'})},'OUT')
      ) :
      h('button',{className:'cpbtn primary sm',onClick:()=>setState({modal:'login'})},t.login)
  );
  return h('nav',{className:'nav'},
    h('div',{className:'nav-logo',style:{cursor:'pointer'},onClick:()=>setState({screen:'home'})},
      glitchTitle('BRAIN'),' ',h('em',{},'HACK'),
      h('span',{style:{color:'#ffcc0055',fontSize:'8px',fontFamily:'var(--mono)',marginLeft:'6px'}},'v2.0')
    ),
    navLinks, rightSide
  );
}
function renderHome() {
  const t = I18N[state.lang];
  const users = ls.get('cp_users',[]);
  const rankGrid = h('div',{style:{marginTop:'40px',maxWidth:'560px',margin:'40px auto 0'}},
    h('div',{className:'sec-title',style:{marginBottom:'14px',textAlign:'left'}},'// 랭킹 시스템'),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}},
      ...RANKS.map(r=>h('div',{style:{background:'var(--panel)',border:'1px solid '+r.color+'33',padding:'10px 12px',textAlign:'center'}},
        h('div',{style:{fontSize:'18px',marginBottom:'4px'}},r.icon),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:r.color,letterSpacing:'1px'}},state.lang==='ko'?r.label:r.labelEn),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},r.minXp.toLocaleString()+' XP')
      ))
    )
  );
  const userCard = state.currentUser ? h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',
    padding:'16px 24px',maxWidth:'560px',margin:'24px auto',textAlign:'left'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}},
      h('span',{style:{fontSize:'36px'}},state.currentUser.char||'🧑'),
      h('div',{style:{flex:'1'}},
        h('div',{style:{fontWeight:'700',fontSize:'16px'}},state.currentUser.flag+' '+(state.currentUser.nickname||state.currentUser.username)),
        rankBadge(state.currentUser.xp||0)
      ),
      h('div',{style:{textAlign:'right'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--yellow)'}},'💰 '+(state.currentUser.coins||0).toLocaleString()),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)'}},(state.currentUser.xp||0).toLocaleString()+' XP')
      )
    ),
    xpBar(state.currentUser.xp||0, state.lang),
    h('div',{style:{display:'flex',gap:'8px',marginTop:'12px'}},
      h('button',{className:'cpbtn secondary sm',onClick:handleAttendance,disabled:state.attended},'📅 '+t.attendCheck),
      h('button',{className:'cpbtn ghost sm',onClick:()=>setState({modal:'submitProblem'})},'✍️ '+t.submitProblem)
    )
  ) : null;

  return h('div',{className:'hero'},
    h('div',{className:'hero-title'},glitchTitle('BRAIN HACK')),
    h('div',{className:'hero-sub'},'QUIZ & PROBLEM SOLVING PLATFORM'),
    h('p',{className:'hero-desc'},'Made By WooSung Jang, YoungJoo Kim, JooSung Park'),
    userCard,
    h('div',{className:'stat-grid'},
      h('div',{className:'stat-c'},h('div',{className:'stat-n'},state.problems.length),h('div',{className:'stat-l'},t.problems)),
      h('div',{className:'stat-c'},h('div',{className:'stat-n'},users.filter(u=>!u.isAdmin).length),h('div',{className:'stat-l'},t.players)),
      state.currentUser?h('div',{className:'stat-c'},h('div',{className:'stat-n',style:{color:'var(--green)'}},state.currentUser.score||0),h('div',{className:'stat-l'},t.myScore)):null,
      state.currentUser?h('div',{className:'stat-c'},h('div',{className:'stat-n',style:{color:'var(--yellow)'}},(state.currentUser.solved||[]).length),h('div',{className:'stat-l'},t.solved)):null
    ),
    h('div',{className:'action-row'},
      h('button',{className:'cpbtn primary',style:{fontSize:'14px',padding:'14px 44px'},onClick:()=>startQuiz()},t.startQuiz),
      !state.currentUser?h('button',{className:'cpbtn ghost',onClick:()=>setState({modal:'login'})},t.login+' / '+t.signup):null
    ),
    rankGrid
  );
}

function renderQuiz() {
  const t = I18N[state.lang];
  const p = state.currentProblem;
  if(!p) return h('div',{},'');
  const pct = (state.quizTimeLeft / p.timeLimit) * 100;
  const tc = pct > 50 ? 'var(--green)' : pct > 25 ? 'var(--yellow)' : 'var(--pink)';
  const mode = state.quizMode;
  const idx = state.quizIndex || 0;
  const freeHint = state.currentUser?.activePotion === 'hint_potion';

  // ── 입력 영역 ──
  const inputRow = h('div',{},
    h('div',{style:{display:'flex',gap:'10px',marginBottom:'10px'}},
      h('input',{className:'inp',style:{flex:'1'},placeholder:'답 입력 후 ENTER',
        value:state.quizAns,
        onInput:e=>{
          setQ({quizAns:e.target.value});
          // 화면에 입력값이 즉시 보이도록 하기 위해 value만 직접 조작 (rerender 방지)
          e.target.value = e.target.value;
        },
        onKeydown:e=>{if(e.key==='Enter')submitQuiz();}}),
      h('button',{className:'cpbtn primary sm',onClick:()=>submitQuiz()},t.submit)
    ),
    h('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
      p.hint ? h('button',{className:'cpbtn ghost sm',onClick:()=>{
        if(!freeHint && state.currentUser) {
          updateUser({...state.currentUser, xp:Math.max(0,(state.currentUser.xp||0)-5)});
        }
        setState({quizHint:!state.quizHint});
      }}, state.quizHint ? (t.hint+' 숨기기') : (freeHint ? t.hint+' 🧪 FREE' : t.hint+' (-5XP)')) : null,
      h('button',{className:'cpbtn ghost sm',onClick:()=>{
        clearInterval(quizInterval);
        setState({screen:'home'});
      }},'← 나가기')
    ),
    state.quizHint && p.hint ? h('div',{style:{marginTop:'12px',background:'#0a1e10',border:'1px solid #00ff9f33',
      padding:'10px 14px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--green)'}},'💡 '+p.hint) : null
  );

  // ── 결과 박스 ──
  const hasVoted = (state.heartVoted||{})[p.id];
  const resultBox = h('div',{style:{padding:'18px',textAlign:'center',
    background:state.quizCorrect?'#001a0a':'#1a0008',
    border:'1px solid '+(state.quizCorrect?'var(--green)':'var(--pink)')}},
    h('div',{style:{fontFamily:'var(--display)',fontSize:'20px',fontWeight:'700',
      color:state.quizCorrect?'var(--green)':'var(--pink)',marginBottom:'8px'}},
      state.quizCorrect ? t.correct : t.wrong),
    state.quizCorrect ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--yellow)',marginBottom:'6px'}},
      '+'+p.xp+' XP  +'+p.coins+' 💰  '+(state.session.streak>1?'🔥 '+state.session.streak+' STREAK!':'')) : null,
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'14px',color:'var(--text)',marginBottom:'6px'}},
      '정답: ',h('strong',{style:{color:'var(--cyan)'}},p.answer)),
    p.explanation ? h('div',{style:{fontSize:'13px',color:'var(--dim)',lineHeight:'1.6',marginBottom:'12px'}},p.explanation) : null,
    p.explanationImage ? h('img',{src:p.explanationImage,style:{maxWidth:'100%',marginBottom:'10px',borderRadius:'4px'}}) : null,
    // 이의신청 (오답 시)
    !state.quizCorrect && state.currentUser ? h('div',{style:{marginBottom:'10px'}},
      !state.quizAppeal ?
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({quizAppeal:true})},'📝 이의신청') :
        h('div',{style:{textAlign:'left'}},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'6px'}},'이의신청 사유 입력'),
          h('textarea',{className:'inp',rows:'2',placeholder:'이의신청 사유를 입력하세요',
            value:state.quizAppealText||'',
            onInput:e=>setQ({quizAppealText:e.target.value}),
            style:{marginBottom:'6px',fontSize:'12px'}}),
          h('div',{style:{display:'flex',gap:'6px',justifyContent:'center'}},
            h('button',{className:'cpbtn primary sm',onClick:()=>{
              const appeals = ls.get('appeals_log',[]);
              appeals.push({
                id:Date.now(),user:state.currentUser.username,
                problemId:p.id,problem:p.question,correctAnswer:p.answer,
                userAnswer:state.quizAns,reason:state.quizAppealText||'',
                status:'pending',time:new Date().toISOString()
              });
              ls.set('appeals_log',appeals);
              setState({quizAppeal:false,quizAppealText:''});
              showToast('이의신청이 접수되었습니다','success');
            }},'제출'),
            h('button',{className:'cpbtn ghost sm',onClick:()=>setState({quizAppeal:false})},'취소')
          )
        )
    ) : null,
    // 하트 투표 & 다음 문제
    h('div',{style:{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}},
      h('button',{
        className:'cpbtn '+(hasVoted?'secondary':'ghost')+' sm',
        onClick:()=>{
          if(hasVoted) return;
          const probs = ls.get('cp_problems', state.problems);
          const updated = probs.map(pr=>pr.id===p.id?{...pr,hearts:(pr.hearts||0)+1}:pr);
          saveProblems(updated);
          setState({heartVoted:{...state.heartVoted,[p.id]:true}});
          showToast('💗 추천했습니다!','success');
        },
        disabled: !!hasVoted
      }, '💗 추천 '+(p.hearts||0)),
      h('button',{className:'cpbtn primary sm',onClick:nextProblem},'다음 문제 →')
    )
  );

  // ── 진행도 표시 ──
  const modeBadge = mode==='random' ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)'}},(idx+1)+'/15') :
    mode==='wrongNote' ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'오답노트 '+(idx+1)) :
    mode==='popular' ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--pink)'}},'💗 인기 순서') :
    h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--green)'}},'∞ 무한모드');

  return h('div',{className:'quiz-wrap'},
    h('div',{className:'qhdr'},
      h('button',{className:'cpbtn ghost sm',onClick:()=>{
        clearInterval(quizInterval);
        setState({screen:'home',quizAppeal:false});
      }},'← EXIT'),
      modeBadge,
      h('div',{className:'sess'},
        h('span',{style:{color:'var(--green)'}},'✓ '+state.session.correct),
        h('span',{style:{color:'var(--pink)'}},'✗ '+state.session.wrong),
        h('span',{style:{color:'var(--yellow)'}},'⬡ '+state.session.score+'pts'),
        h('span',{style:{color:'var(--cyan)'}},'🔥 '+state.session.streak)
      )
    ),
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'28px',position:'relative'}},
      h('div',{style:{position:'absolute',top:'-1px',left:'20px',width:'80px',height:'2px',background:'var(--cyan)'}}),
      h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',background:'#00f5ff15',padding:'3px 10px'}},p.category),
        h('span',{style:{color:'var(--yellow)',fontSize:'12px',letterSpacing:'2px'}},'◆'.repeat(p.difficulty)+'◇'.repeat(5-p.difficulty)),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--green)',marginLeft:'auto'}},'🔥 '+t.streak+' '+state.session.streak),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'XP +'+p.xp+' 💰 +'+p.coins)
      ),
      h('div',{style:{height:'4px',background:'#0a1a20',marginBottom:'18px',position:'relative'}},
        h('div',{style:{height:'100%',width:pct+'%',background:tc,boxShadow:'0 0 6px '+tc,transition:'width 1s linear'}}),
        h('span',{style:{position:'absolute',right:'0',top:'7px',fontFamily:'var(--mono)',fontSize:'11px',color:tc}},state.quizTimeLeft+'s')
      ),
      h('div',{style:{marginBottom:'22px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--pink)',letterSpacing:'2px',marginBottom:'10px'}},'// QUESTION'),
        h('p',{style:{fontSize:'17px',lineHeight:'1.7',color:'#e8f4fa',fontWeight:'600'}},p.question),
        p.image ? h('img',{src:p.image,style:{maxWidth:'100%',marginTop:'10px',borderRadius:'4px',border:'1px solid var(--border)'}}) : null
      ),
      state.quizDone ? resultBox : inputRow
    )
  );
}

function renderQuizModeSelect() {
  const u = state.currentUser;
  const rank = u ? getRank(u.xp||0) : null;
  const isEmerald = u && (u.xp||0) >= 7000;
  const wrongCount = (u?.wrongAnswers||[]).length;

  const modes = [
    {
      id:'random', icon:'🎲', title:'15문제 모드',
      desc:`무작위 15문제를 풀고 결과를 확인합니다\n중복 없음, 진행도 표시 (1/15)`,
      color:'var(--cyan)', locked:false
    },
    {
      id:'infinite', icon:'∞', title:'무한 모드',
      desc:`문제가 무한히 출제됩니다\n전체 소진 시 자동 재셔플`,
      color:'var(--green)', locked:false
    },
    {
      id:'popular', icon:'💗', title:'인기 문제',
      desc:`하트를 많이 받은 순서로 출제\n투표로 인기 문제가 결정됩니다`,
      color:'var(--pink)', locked:false
    },
    {
      id:'wrongNote', icon:'📝', title:'오답노트',
      desc:isEmerald
        ? `틀린 문제만 다시 풀기\n현재 오답 ${wrongCount}문제`
        : `🔒 에메랄드(7,000 XP) 이상만 이용 가능\n${u ? `현재: ${(u.xp||0).toLocaleString()} / 7,000 XP` : '로그인이 필요합니다'}`,
      color:'var(--yellow)', locked:!isEmerald
    },
  ];

  return h('div',{style:{padding:'32px 0'}},
    h('div',{style:{textAlign:'center',marginBottom:'28px'}},
      h('div',{style:{fontFamily:'var(--display)',fontSize:'22px',fontWeight:'900',color:'var(--cyan)',letterSpacing:'2px'}},'QUIZ MODE SELECT'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginTop:'6px'}},'게임 모드를 선택하세요')
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'14px',maxWidth:'860px',margin:'0 auto'}},
      ...modes.map(m=>h('div',{
        style:{
          background:'var(--panel)',
          border:'2px solid '+(m.locked?'var(--border)':m.color+'66'),
          padding:'24px 18px',textAlign:'center',cursor:m.locked?'not-allowed':'pointer',
          opacity:m.locked?0.5:1,transition:'all .2s',position:'relative'
        },
        onClick:()=>{
          if(m.locked){showToast('에메랄드 등급 이상에서 이용 가능합니다','error');return;}
          startQuiz(m.id);
        }
      },
        m.locked ? h('div',{style:{position:'absolute',top:'10px',right:'10px',fontSize:'16px'}},'⛓️') : null,
        h('div',{style:{fontSize:'40px',marginBottom:'10px'}},m.icon),
        h('div',{style:{fontFamily:'var(--display)',fontSize:'15px',fontWeight:'700',color:m.locked?'var(--dim)':m.color,marginBottom:'10px'}},m.title),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',lineHeight:'1.7',whiteSpace:'pre-line'}},m.desc)
      ))
    ),
    h('div',{style:{textAlign:'center',marginTop:'20px'}},
      h('button',{className:'cpbtn ghost',onClick:()=>setState({screen:'home'})},'← 홈으로')
    )
  );
}
