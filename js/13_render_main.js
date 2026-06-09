// ─── 설정 모달 ───
function renderSettingsModal() {
  const tab = state.settingsTab || 'music';
  const u = state.currentUser;

  const tabs = [
    {id:'music', label:'🎵 음악'},
    {id:'display', label:'🎨 화면'},
    ...(u ? [{id:'account', label:'👤 회원정보'}] : []),
    {id:'support', label:'💬 고객센터'},
    {id:'backup', label:'💾 백업/복구'},
  ];

  let tabContent = null;

  if(tab === 'music') {
    tabContent = h('div',{},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',marginBottom:'16px'}},'배경 음악 설정'),
      h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--text)'}},'BGM'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>showToast('음악 기능 준비 중입니다 🎵','info')},'▶ ON/OFF')
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'음악 기능은 추후 업데이트 예정입니다')
    );
  }

  if(tab === 'display') {
    tabContent = h('div',{},
      h('div',{style:{background:'#0a1e10',border:'1px solid #00ff9f33',padding:'12px',marginBottom:'20px',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--green)'}},
        'ℹ️ 다크모드가 기본 테마로 고정되어 있습니다.'),
      h('div',{className:'slabel',style:{marginBottom:'10px'},id:'fontSizeTitle'},'글씨 크기: '+(state.fontSizePercent||100)+'%'),
      h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}},
        h('input',{
          type:'range',
          min:'50',
          max:'150',
          value:state.fontSizePercent||100,
          style:{flex:1,height:'6px',cursor:'pointer'},
          onInput:e=>{
            const pct = parseInt(e.target.value,10);
            state.fontSizePercent = pct;
            ls.set('bh_fontSizePercent',pct);
            applyTheme();
            const title = document.getElementById('fontSizeTitle');
            const value = document.getElementById('fontSizeValue');
            if(title) title.textContent = '글씨 크기: '+pct+'%';
            if(value) value.textContent = pct+'%';
          }
        }),
        h('span',{id:'fontSizeValue',style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--cyan)',minWidth:'40px'}},(state.fontSizePercent||100)+'%')
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'슬라이더를 드래그하여 글씨 크기를 조정하세요 (50~150%)')
    );
  }

  if(tab === 'account' && u) {
    tabContent = h('div',{},
      h('div',{className:'slabel',style:{marginBottom:'8px'}},'닉네임 변경'),
      h('div',{style:{display:'flex',gap:'8px',marginBottom:'16px'}},
        h('input',{className:'inp',style:{flex:'1'},placeholder:'새 닉네임',
          value:state.settingsNickname||'',onInput:e=>setQ({settingsNickname:e.target.value})}),
        h('button',{className:'cpbtn primary sm',onClick:()=>{
          if(!(state.settingsNickname||'').trim()){showToast('닉네임을 입력하세요','error');return;}
          updateUser({...state.currentUser,nickname:state.settingsNickname.trim()});
          showToast('닉네임이 변경되었습니다','success');
        }},'변경')
      ),
      h('div',{className:'slabel',style:{marginBottom:'8px'}},'비밀번호 변경'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'12px'}},
        h('input',{className:'inp',type:'password',placeholder:'현재 비밀번호',
          value:state.settingsPwForm?.old||'',
          onInput:e=>setQ({settingsPwForm:{...state.settingsPwForm,old:e.target.value}})}),
        h('input',{className:'inp',type:'password',placeholder:'새 비밀번호 (8자 이상, 숫자 포함)',
          value:state.settingsPwForm?.new_||'',
          onInput:e=>setQ({settingsPwForm:{...state.settingsPwForm,new_:e.target.value}})}),
        h('input',{className:'inp',type:'password',placeholder:'새 비밀번호 확인',
          value:state.settingsPwForm?.confirm||'',
          onInput:e=>setQ({settingsPwForm:{...state.settingsPwForm,confirm:e.target.value}})})
      ),
      h('button',{className:'cpbtn secondary sm',style:{marginBottom:'24px'},onClick:()=>{
        const pf = state.settingsPwForm||{};
        if(pf.old!==u.password){showToast('현재 비밀번호가 틀렸습니다','error');return;}
        if(!pf.new_||pf.new_.length<8||!/\d/.test(pf.new_)){showToast('새 비밀번호: 8자 이상 숫자 포함','error');return;}
        if(pf.new_!==pf.confirm){showToast('비밀번호가 일치하지 않습니다','error');return;}
        updateUser({...u,password:pf.new_});
        setState({settingsPwForm:{old:'',new_:'',confirm:''}});
        showToast('비밀번호가 변경되었습니다','success');
      }},'비밀번호 변경'),
      h('div',{style:{borderTop:'1px solid var(--pink)',paddingTop:'16px',marginTop:'8px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--pink)',marginBottom:'10px'}},'⚠ 위험 구역'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'8px'}},'계정 탈퇴 시 모든 데이터가 삭제됩니다. 아이디를 입력하여 확인하세요.'),
        h('input',{className:'inp',style:{marginBottom:'8px'},placeholder:'아이디 입력 후 탈퇴',
          value:state.deleteConfirmId||'',onInput:e=>setQ({deleteConfirmId:e.target.value})}),
        h('button',{className:'cpbtn danger sm',onClick:()=>{
          if(state.deleteConfirmId!==u.username){showToast('아이디가 일치하지 않습니다','error');return;}
          const users = ls.get('cp_users',[]).filter(usr=>usr.username!==u.username);
          ls.set('cp_users',users);
          setState({currentUser:null,modal:null,settingsOpen:false,deleteConfirmId:''});
          showToast('계정이 탈퇴되었습니다','info');
        }},'계정 탈퇴')
      )
    );
  }

  if(tab === 'support') {
    const faqs = [
      {q:'퀴즈에서 오답이 났는데 정답이 맞는 것 같아요', a:'퀴즈 화면에서 "이의신청" 버튼을 눌러 사유를 제출하세요. 관리자가 검토 후 처리합니다.'},
      {q:'코인/XP가 갑자기 사라졌어요', a:'비정상적인 상황이라면 고객센터에 문의해주세요. 활동 로그를 통해 확인 가능합니다.'},
      {q:'클럽을 어떻게 만드나요?', a:'클럽 탭에서 "클럽 창설" 버튼을 클릭하고 이름과 소개를 입력하세요. 1,000코인이 차감됩니다.'},
      {q:'오답노트는 어떻게 이용하나요?', a:'에메랄드(7,000XP) 등급 이상부터 이용 가능합니다. 틀린 문제가 자동으로 기록됩니다.'},
      {q:'프로모코드는 어디서 받나요?', a:'공식 이벤트, SNS, 친구 추천 등을 통해 받을 수 있습니다. 상점 > 프로모코드 탭에서 입력하세요.'},
      {q:'비밀번호를 잊어버렸어요', a:'현재 비밀번호 찾기 기능은 없습니다. 관리자에게 문의해주세요.'},
    ];
    tabContent = h('div',{},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--cyan)',marginBottom:'14px',letterSpacing:'1px'}},'자주 묻는 질문 (FAQ)'),
      ...faqs.map((faq,i)=>h('div',{style:{marginBottom:'8px'}},
        h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'10px 14px',cursor:'pointer',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--text)'},
          onClick:e=>{
            const next = e.currentTarget.nextSibling;
            if(next) next.style.display = next.style.display==='none'?'block':'none';
          }},'Q. '+faq.q),
        h('div',{style:{background:'#0a1a20',border:'1px solid #0ff2',borderTop:'none',padding:'10px 14px',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',display:'none'}},faq.a)
      )),
      h('div',{style:{marginTop:'20px',borderTop:'1px solid var(--border)',paddingTop:'16px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',marginBottom:'10px'}},'직접 문의'),
        h('select',{className:'inp',style:{marginBottom:'8px'},value:state.supportTicketForm?.type||'bug',
          onChange:e=>setQ({supportTicketForm:{...state.supportTicketForm,type:e.target.value}}),
          children:null},
          ...['bug','account','payment','other'].map(t=>h('option',{value:t},{bug:'버그 신고',account:'계정 문제',payment:'결제 문의',other:'기타'}[t]))
        ),
        h('textarea',{className:'inp',rows:'3',placeholder:'문의 내용을 입력하세요...',
          value:state.supportTicketForm?.content||'',
          onInput:e=>setQ({supportTicketForm:{...state.supportTicketForm,content:e.target.value}}),
          style:{marginBottom:'8px'}}),
        h('button',{className:'cpbtn primary sm',onClick:()=>{
          const ticket = {
            id:Date.now(),
            user:u?.username||'anonymous',
            type:state.supportTicketForm?.type||'other',
            content:state.supportTicketForm?.content||'',
            status:'pending',
            time:new Date().toISOString()
          };
          const tickets = ls.get('cp_tickets',[]);
          ls.set('cp_tickets',[...tickets,ticket]);
          setQ({supportTicketForm:{type:'bug',content:''}});
          setState({});
          showToast('문의가 접수되었습니다! 빠르게 답변드리겠습니다 📩','success');
          addActivityLog('support_ticket',{type:ticket.type});
        }},'문의 제출')
      )
    );
  }

  if(tab === 'backup') {
    tabContent = h('div',{},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'14px'}},'내 계정 데이터를 백업하거나 복구합니다'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:'10px'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>{
          if(!u){showToast('로그인이 필요합니다','error');return;}
          const data = {user:u, problems:ls.get('cp_problems',[]), log:JSON.parse(localStorage.getItem('cp_Log')||'[]')};
          const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
          const a = document.createElement('a');
          a.href=URL.createObjectURL(blob);
          a.download='brainhack_backup_'+u.username+'_'+Date.now()+'.json';
          a.click();
          showToast('데이터 백업 완료!','success');
        }},'💾 내 데이터 JSON 다운로드'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)'}},'백업 파일로 복구:'),
        h('input',{type:'file',accept:'.json',className:'inp',onChange:e=>{
          const file = e.target.files[0];
          if(!file) return;
          const reader = new FileReader();
          reader.onload=ev=>{
            try {
              const data = JSON.parse(ev.target.result);
              if(data.user) {
                const users = ls.get('cp_users',[]).filter(u2=>u2.username!==data.user.username);
                ls.set('cp_users',[...users,data.user]);
                setState({currentUser:data.user});
              }
              if(data.problems) saveProblems(data.problems);
              showToast('데이터 복구 완료!','success');
            } catch(err) { showToast('파일 형식이 올바르지 않습니다','error'); }
          };
          reader.readAsText(file);
        }})
      )
    );
  }

  return h('div',{className:'overlay',onClick:e=>{if(e.target===e.currentTarget)setState({settingsOpen:false})}},
    h('div',{className:'modal-box',style:{maxWidth:'500px',width:'100%',maxHeight:'85vh',display:'flex',flexDirection:'column'}},
      h('div',{className:'mhdr'},
        h('span',{className:'mtag'},'// 설정'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({settingsOpen:false})},'✕')
      ),
      h('div',{style:{display:'flex',gap:'4px',padding:'12px 16px',borderBottom:'1px solid var(--border)',flexWrap:'wrap'}},
        ...tabs.map(t=>h('button',{className:'nbtn'+(tab===t.id?' on':''),onClick:()=>setState({settingsTab:t.id})},t.label))
      ),
      h('div',{style:{padding:'18px',overflowY:'auto',flex:'1'}},tabContent)
    )
  );
}

// ─── 소셜 (친구) 화면 ───
function renderSocial() {
  const t = I18N[state.lang] || I18N.ko;
  if(!state.currentUser) return h('div',{style:{textAlign:'center',padding:'60px 0',fontFamily:'var(--mono)',color:'var(--dim)'}},
    '로그인 후 이용 가능합니다 ',
    h('button',{className:'cpbtn primary sm',style:{marginLeft:'10px'},onClick:()=>setState({modal:'login'})},'LOGIN')
  );
  const u = state.currentUser;
  const allUsers = ls.get('cp_users',[]).filter(usr=>!usr.isAdmin&&usr.username!==u.username);
  const friends = (u.friends||[]).map(fn=>allUsers.find(usr=>usr.username===fn)).filter(Boolean);
  const requests = u.friendRequests||[];
  const tab = state.socialTab||'friends';

  // 온라인 판단 (5분 기준)
  const isOnline = usr=>{
    if(!usr.lastLogin) return false;
    return (Date.now()-new Date(usr.lastLogin).getTime()) < 5*60*1000;
  };

  const searchResults = (state.socialSearch||'').length>=2
    ? allUsers.filter(usr=>usr.username.includes(state.socialSearch)||usr.nickname?.includes(state.socialSearch))
    : [];

  return h('div',{style:{padding:'28px 0'}},
    h('div',{className:'sec-title',style:{marginBottom:'14px'}},'// '+(t.social||'소셜')),
    h('div',{style:{display:'flex',gap:'6px',marginBottom:'18px',flexWrap:'wrap'}},
      ['friends','search','requests'].map(tabId=>h('button',{className:'nbtn'+(tab===tabId?' on':''),onClick:()=>setState({socialTab:tabId})},
        {friends:'👥 '+(t.friends||'친구'),search:'🔍 '+(t.search||'검색'),requests:'📬 '+(t.requests||'요청')}[tabId]+(tabId==='requests'&&requests.length?' ('+requests.length+')':'')
      ))
    ),
    tab==='friends' ? h('div',{},
      friends.length===0 ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',textAlign:'center',padding:'40px 0'}},'아직 친구가 없습니다. 유저 검색으로 친구를 추가해보세요!') :
      h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
        ...friends.map(fr=>h('div',{style:{display:'flex',alignItems:'center',gap:'12px',background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px'}},
          h('span',{style:{fontSize:'24px'}},fr.char||'🧑'),
          h('div',{style:{flex:'1'}},
            h('div',{style:{fontWeight:'700',fontSize:'14px'}},fr.nickname||fr.username),
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},fr.username),
            rankBadge(fr.xp||0,true)
          ),
          h('div',{style:{textAlign:'right',marginRight:'10px'}},
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:isOnline(fr)?'var(--green)':'var(--dim)'}},(isOnline(fr)?'🟢 온라인':'⚫ 오프라인'))
          ),
          h('button',{className:'cpbtn ghost sm',onClick:()=>{
            const newFriends=(u.friends||[]).filter(f=>f!==fr.username);
            updateUser({...u,friends:newFriends});
            showToast(fr.nickname+'님을 친구 목록에서 제거했습니다','info');
          }},'제거')
        ))
      )
    ) : null,
    tab==='search' ? h('div',{},
      h('div',{style:{display:'flex',gap:'8px',marginBottom:'14px'}},
        h('input',{className:'inp',style:{flex:'1'},placeholder:'닉네임 또는 아이디 검색 (2자 이상)',
          value:state.socialSearch||'',onInput:e=>setState({socialSearch:e.target.value})}),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({socialSearch:''})},'✕')
      ),
      searchResults.length===0&&(state.socialSearch||'').length>=2 ?
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',textAlign:'center',padding:'20px'}},'검색 결과가 없습니다') :
        h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
          ...searchResults.map(usr=>{
            const isFriend=(u.friends||[]).includes(usr.username);
            return h('div',{style:{display:'flex',alignItems:'center',gap:'12px',background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px'}},
              h('span',{style:{fontSize:'24px'}},usr.char||'🧑'),
              h('div',{style:{flex:'1'}},
                h('div',{style:{fontWeight:'700'}},usr.nickname||usr.username),
                h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},usr.username),
                rankBadge(usr.xp||0,true)
              ),
              isFriend ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--green)',border:'1px solid var(--green)',padding:'2px 8px'}},'친구') :
                h('button',{className:'cpbtn primary sm',onClick:()=>{
                  // 친구 요청 전송
                  const targetUsers = ls.get('cp_users',[]);
                  const targetIdx = targetUsers.findIndex(t=>t.username===usr.username);
                  if(targetIdx<0) return;
                  const target = targetUsers[targetIdx];
                  const existingReqs = target.friendRequests||[];
                  if(existingReqs.includes(u.username)){showToast('이미 요청을 보냈습니다','info');return;}
                  targetUsers[targetIdx]={...target,friendRequests:[...existingReqs,u.username]};
                  ls.set('cp_users',targetUsers);
                  showToast(usr.nickname+'님께 친구 요청을 보냈습니다!','success');
                }},'+ 친구 요청')
            );
          })
        )
    ) : null,
    tab==='requests' ? h('div',{},
      requests.length===0 ?
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',textAlign:'center',padding:'30px'}},'받은 친구 요청이 없습니다') :
        h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
          ...requests.map(reqUser=>{
            const requester = allUsers.find(usr=>usr.username===reqUser);
            return h('div',{style:{display:'flex',alignItems:'center',gap:'12px',background:'var(--panel)',border:'1px solid var(--yellow)',padding:'12px 16px'}},
              h('span',{style:{fontSize:'22px'}},requester?.char||'🧑'),
              h('div',{style:{flex:'1'}},
                h('div',{style:{fontWeight:'700'}},requester?.nickname||reqUser),
                h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},reqUser)
              ),
              h('div',{style:{display:'flex',gap:'6px'}},
                h('button',{className:'cpbtn primary sm',onClick:()=>{
                  const newFriends=[...(u.friends||[]),reqUser];
                  const newReqs=requests.filter(r=>r!==reqUser);
                  updateUser({...u,friends:newFriends,friendRequests:newReqs});
                  showToast('친구 요청을 수락했습니다!','success');
                  addActivityLog('friend_accept',{friend:reqUser});
                }},'✓ 수락'),
                h('button',{className:'cpbtn danger sm',onClick:()=>{
                  const newReqs=requests.filter(r=>r!==reqUser);
                  updateUser({...u,friendRequests:newReqs});
                  showToast('친구 요청을 거절했습니다','info');
                }},'✕ 거절')
              )
            );
          })
        )
    ) : null
  );
}

// ─── MAIN RENDER ───
function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';

  // 테마 적용
  applyTheme();

  if(state.currentUser?.isAdmin) {
    root.appendChild(renderAdmin());
    return;
  }

  const wrap = h('div',{});

  // Scanlines effect
  const scanlines = h('div',{style:{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'9999',
    background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.10) 2px,rgba(0,0,0,.10) 4px)',
    animation:'flicker 9s infinite'}});
  const glow1 = h('div',{style:{position:'fixed',top:'20%',left:'5%',width:'350px',height:'350px',borderRadius:'50%',
    background:'radial-gradient(circle,#00f5ff06 0%,transparent 70%)',pointerEvents:'none',zIndex:'0'}});
  const glow2 = h('div',{style:{position:'fixed',bottom:'15%',right:'3%',width:'250px',height:'250px',borderRadius:'50%',
    background:'radial-gradient(circle,#ff003c05 0%,transparent 70%)',pointerEvents:'none',zIndex:'0'}});

  // 수리 모드
  if(state.repair && !state.currentUser?.isAdmin) {
    wrap.appendChild(h('div',{style:{position:'fixed',inset:'0',background:'rgba(1,3,8,.97)',zIndex:'8000',
      display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'20px'}},
      h('div',{style:{fontSize:'64px'}},'🔧'),
      h('div',{style:{fontFamily:'var(--display)',fontSize:'28px',color:'#ff8800',letterSpacing:'2px'}},'수리 중입니다'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',lineHeight:'2'}},'서비스 점검 중입니다. 잠시 후 다시 이용해주세요.')
    ));
    wrap.appendChild(scanlines);
    root.appendChild(wrap);
    return;
  }

  // 비상 오버레이
  if(state.emergency && !state.currentUser?.isAdmin) {
    wrap.appendChild(h('div',{style:{position:'fixed',inset:'0',background:'rgba(0,0,0,.9)',zIndex:'8000',
      display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'20px'}},
      h('div',{style:{fontFamily:'var(--display)',fontSize:'32px',color:'var(--pink)'}},'⚠ 서비스 점검 중'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'14px',color:'var(--dim)'}},'관리자에 의해 일시 중지되었습니다.')
    ));
  }

  // 토스트
  if(state.toast) {
    const colors={success:'var(--green)',error:'var(--pink)',info:'var(--cyan)',warning:'var(--yellow)'};
    const c=colors[state.toast.type]||colors.info;
    wrap.appendChild(h('div',{style:{position:'fixed',bottom:'24px',right:'24px',zIndex:'9000',
      background:'var(--bg2)',border:'1px solid '+c,padding:'12px 20px',fontFamily:'var(--mono)',fontSize:'12px',color:c,
      boxShadow:'0 0 20px '+c+'44',animation:'slideIn .25s ease',maxWidth:'320px',letterSpacing:'1px'}},state.toast.msg));
  }

  const appDiv = h('div',{className:'app',style:{position:'relative',zIndex:'1'}});
  appDiv.appendChild(renderNav());

  if(state.screen==='home')           appDiv.appendChild(renderHome());
  else if(state.screen==='quizMode')  appDiv.appendChild(renderQuizModeSelect());
  else if(state.screen==='quiz')      appDiv.appendChild(renderQuiz());
  else if(state.screen==='leaderboard') appDiv.appendChild(renderLeaderboard());
  else if(state.screen==='shop')      appDiv.appendChild(renderShop());
  else if(state.screen==='chat')      appDiv.appendChild(renderChat());
  else if(state.screen==='profile')   appDiv.appendChild(renderProfile());
  else if(state.screen==='clubs')     appDiv.appendChild(renderClubs());
  else if(state.screen==='social')    appDiv.appendChild(renderSocial());

  // 모달
  if(state.modal==='login')        appDiv.appendChild(renderLoginModal());
  else if(state.modal==='signup')  appDiv.appendChild(renderSignupModal());
  else if(state.modal==='submitProblem'&&state.currentUser) appDiv.appendChild(renderSubmitProblemModal());

  // 설정 모달
  if(state.settingsOpen) appDiv.appendChild(renderSettingsModal());

  // 랭크업 애니메이션
  if(state.rankUpInfo?.show) {
    const rankUpOverlay = h('div',{className:'rankup-overlay'},
      h('div',{className:'rankup-card'},
        h('div',{style:{fontSize:'60px',marginBottom:'20px'}},state.rankUpInfo.rank.icon),
        h('div',{style:{fontFamily:'var(--display)',fontSize:'32px',color:'var(--cyan)',marginBottom:'10px'}},'RANK UP!'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'18px',color:'var(--text)'}},state.rankUpInfo.rank.label)
      )
    );
    wrap.appendChild(rankUpOverlay);
  }

  wrap.appendChild(scanlines);
  wrap.appendChild(glow1);
  wrap.appendChild(glow2);
  wrap.appendChild(appDiv);
  root.appendChild(wrap);
}

// ─── 로그인 시 처리 (03_state.js의 updateUser에 hook) ───
// 기존 updateUser를 래핑하여 lastLogin 업데이트
const _origUpdateUser = updateUser;
// updateUser는 03_state.js에서 정의됨 - 아래에서 lastLogin/휴면 처리를 render()에서 수행

// ─── SEED DEFAULT ACCOUNT ───
(function() {
  const users = ls.get('cp_users', []);
  if(!users.find(u => u.username === 'woogrowth')) {
    ls.set('cp_users', [...users, {
      username:'woogrowth', password:'woogrowth1',
      nickname:'woogrowth', job:'etc', country:'KR', gender:'M',
      flag:'🇰🇷', char:'🧑', score:0, xp:0, coins:100,
      solved:[], submitted:0, achievements:[],
      inventory:[], equipped:{frame:'',hat:'',bg:'',acc:'',title:''},
      streak:0, maxStreak:0, attendanceDates:[], attendanceStreak:0,
      friends:[], blocked:[], friendRequests:[],
      wrongAnswers:[], usedPromos:[], heartVoted:{},
      pushEnabled:false, warnings:0, banned:false, banUntil:null,
      createdAt:new Date().toISOString(), lastLogin:null,
      isAdmin:false, clubsCreated:0
    }]);
  }
})();

// ─── 저장된 로그인 상태 복원 ───
(function() {
  const savedUser = ls.get('cp_currentUser', null);
  if(savedUser) {
    const users = ls.get('cp_users', []);
    const fresh = users.find(u => u.username === savedUser.username);
    if(fresh && !fresh.banned) {
      // 휴면 복귀 보상 체크
      const rewarded = checkDormantReward(fresh);
      if(rewarded !== fresh) {
        const updated = users.map(u=>u.username===fresh.username?rewarded:u);
        ls.set('cp_users', updated);
      }
      // lastLogin 업데이트
      const withLogin = {...(rewarded||fresh), lastLogin:new Date().toISOString()};
      const updated2 = users.map(u=>u.username===fresh.username?withLogin:u);
      ls.set('cp_users', updated2);
      state.currentUser = withLogin;
    } else {
      ls.set('cp_currentUser', null);
    }
  }
})();

applyTheme();
render();
