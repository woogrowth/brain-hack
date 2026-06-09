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
          type:'range', min:'50', max:'150', value:state.fontSizePercent||100,
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
      h('div',{style:{marginBottom:'20px'}},
        h('div',{className:'slabel',style:{marginBottom:'8px'}},'닉네임 변경'),
        h('div',{style:{display:'flex',gap:'8px'}},
          h('input',{className:'inp',style:{flex:'1'},placeholder:'새 닉네임',
            value:state.settingsNickname||'',onInput:e=>setQ({settingsNickname:e.target.value})}),
          h('button',{className:'cpbtn primary sm',onClick:()=>{
            if(!(state.settingsNickname||'').trim()){showToast('닉네임을 입력하세요','error');return;}
            updateUser({...state.currentUser,nickname:state.settingsNickname.trim()});
            setQ({settingsNickname:''});
            showToast('닉네임이 변경되었습니다','success');
          }},'변경')
        )
      ),
      h('div',{style:{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--border)'}},
        h('div',{className:'slabel',style:{marginBottom:'8px'}},'아이디 변경 (현재: '+u.username+')'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'8px'}},'⚠ 아이디 변경 후 재로그인이 필요합니다'),
        h('div',{style:{display:'flex',gap:'8px'}},
          h('input',{className:'inp',style:{flex:'1'},placeholder:'새 아이디 (6자 이상)',
            value:state.settingsNewUsername||'',onInput:e=>setQ({settingsNewUsername:e.target.value})}),
          h('button',{className:'cpbtn secondary sm',onClick:()=>{
            const newId = (state.settingsNewUsername||'').trim();
            if(newId.length<6){showToast('아이디는 6자 이상이어야 합니다','error');return;}
            if(/^admin$/i.test(newId)){showToast('"admin"은 사용할 수 없습니다','error');return;}
            const allUsers = ls.get('cp_users',[]);
            if(allUsers.find(usr=>usr.username.toLowerCase()===newId.toLowerCase()&&usr.username!==u.username)){
              showToast('이미 사용 중인 아이디입니다','error');return;
            }
            const updatedUser = {...u, username:newId};
            const nextUsers = allUsers.map(usr=>usr.username===u.username?updatedUser:usr);
            ls.set('cp_users', nextUsers);
            ls.set('cp_currentUser', {username:newId});
            setState({currentUser:updatedUser, settingsNewUsername:'', settingsOpen:false});
            showToast('아이디가 변경되었습니다. 다시 로그인해주세요','success');
          }},'변경')
        )
      ),
      h('div',{style:{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--border)'}},
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
        h('button',{className:'cpbtn secondary sm',onClick:()=>{
          const pf = state.settingsPwForm||{};
          if(pf.old!==u.password){showToast('현재 비밀번호가 틀렸습니다','error');return;}
          if(!pf.new_||pf.new_.length<8||!/\d/.test(pf.new_)){showToast('새 비밀번호: 8자 이상 숫자 포함','error');return;}
          if(pf.new_!==pf.confirm){showToast('비밀번호가 일치하지 않습니다','error');return;}
          updateUser({...u,password:pf.new_});
          setState({settingsPwForm:{old:'',new_:'',confirm:''}});
          showToast('비밀번호가 변경되었습니다','success');
        }},'비밀번호 변경')
      ),
      h('div',{style:{borderTop:'1px solid var(--pink)33',paddingTop:'16px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--pink)',marginBottom:'10px'}},'⚠ 위험 구역'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'8px'}},'계정 탈퇴 시 모든 데이터가 삭제됩니다. 아이디를 입력하여 확인하세요.'),
        h('input',{className:'inp',style:{marginBottom:'8px'},placeholder:'아이디 입력 후 탈퇴',
          value:state.deleteConfirmId||'',onInput:e=>setQ({deleteConfirmId:e.target.value})}),
        h('button',{className:'cpbtn danger sm',onClick:()=>{
          if(state.deleteConfirmId!==u.username){showToast('아이디가 일치하지 않습니다','error');return;}
          const users = ls.get('cp_users',[]).filter(usr=>usr.username!==u.username);
          ls.set('cp_users',users);
          ls.set('cp_currentUser',null);
          setState({currentUser:null,modal:null,settingsOpen:false,deleteConfirmId:''});
          showToast('계정이 탈퇴되었습니다','info');
        }},'계정 탈퇴')
      )
    );
  }

  if(tab === 'support') {
    const faqs = [
      {q:'퀴즈에서 오답이 났는데 정답이 맞는 것 같아요', a:'퀴즈 화면에서 \"이의신청\" 버튼을 눌러 사유를 제출하세요. 관리자가 검토 후 처리합니다.'},
      {q:'코인/XP가 갑자기 사라졌어요', a:'비정상적인 상황이라면 고객센터에 문의해주세요. 활동 로그를 통해 확인 가능합니다.'},
      {q:'클럽을 어떻게 만드나요?', a:'클럽 탭에서 \"클럽 창설\" 버튼을 클릭하고 이름과 소개를 입력하세요. 1,000코인이 차감됩니다.'},
      {q:'오답노트는 어떻게 이용하나요?', a:'에메랄드(7,000XP) 등급 이상부터 이용 가능합니다. 틀린 문제가 자동으로 기록됩니다.'},
      {q:'프로모코드는 어디서 받나요?', a:'공식 이벤트, SNS, 친구 추천 등을 통해 받을 수 있습니다. 상점 > 프로모코드 탭에서 입력하세요.'},
      {q:'비밀번호를 잊어버렸어요', a:'설정 > 회원정보 탭에서 비밀번호를 변경하거나 관리자에게 문의해주세요.'},
    ];
    tabContent = h('div',{},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--cyan)',marginBottom:'14px',letterSpacing:'1px'}},'자주 묻는 질문 (FAQ)'),
      ...faqs.map((faq)=>h('div',{style:{marginBottom:'8px'}},
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
          onChange:e=>setQ({supportTicketForm:{...state.supportTicketForm,type:e.target.value}})},
          ...['bug','account','payment','other'].map(t=>h('option',{value:t},{bug:'버그 신고',account:'계정 문제',payment:'결제 문의',other:'기타'}[t]))
        ),
        h('textarea',{className:'inp',rows:'3',placeholder:'문의 내용을 입력하세요...',
          value:state.supportTicketForm?.content||'',
          onInput:e=>setQ({supportTicketForm:{...state.supportTicketForm,content:e.target.value}}),
          style:{marginBottom:'8px'}}),
        h('button',{className:'cpbtn primary sm',onClick:()=>{
          const ticket = {
            id:Date.now(), user:u?.username||'anonymous',
            type:state.supportTicketForm?.type||'other',
            content:state.supportTicketForm?.content||'',
            status:'pending', time:new Date().toISOString()
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

// ─── 랭크업 오버레이 렌더러 ───
function createRankUpOverlay(rankInfo) {
  const rank = rankInfo.rank;
  const ov = document.createElement('div');
  ov.className = 'rankup-overlay';
  ov.style.setProperty('--rcolor', rank.color);

  // 파티클
  for(let i=0;i<24;i++){
    const p=document.createElement('div');
    const angle = (i/24)*360;
    const dist = 140+Math.random()*60;
    const tx = Math.cos(angle*Math.PI/180)*dist+'px';
    const ty = Math.sin(angle*Math.PI/180)*dist+'px';
    p.style.cssText=`position:absolute;left:50%;top:50%;font-size:${14+Math.random()*12}px;
      --tx:${tx};--ty:${ty};
      animation:rankupParticle 2.5s ease-out ${i*0.06}s both;`;
    p.textContent = rank.icon;
    ov.appendChild(p);
  }

  // 카드
  const card = document.createElement('div');
  card.className = 'rankup-card';
  card.style.cssText = `--rcolor:${rank.color};border-color:${rank.color};`;

  card.innerHTML = `
    <div style="font-size:80px;margin-bottom:16px;animation:titleIconSpin 1.5s ease both;">${rank.icon}</div>
    <div style="font-family:var(--display);font-size:14px;color:var(--dim);letter-spacing:4px;margin-bottom:6px;">RANK UP!</div>
    <div style="font-family:var(--display);font-size:36px;font-weight:900;color:${rank.color};
      text-shadow:0 0 20px ${rank.color};letter-spacing:3px;margin-bottom:8px;">${rank.labelEn}</div>
    <div style="font-family:var(--mono);font-size:13px;color:var(--text);">${rank.label} 달성!</div>
    <div style="font-family:var(--mono);font-size:11px;color:var(--dim);margin-top:8px;">${rank.minXp.toLocaleString()} XP</div>
  `;
  ov.appendChild(card);
  return ov;
}

// ─── MAIN RENDER ───
function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';

  applyTheme();

  if(state.currentUser?.isAdmin) {
    root.appendChild(renderAdmin());
    return;
  }

  if(state.screen === 'quiz') {
    root.appendChild(renderQuiz());
  } else if(state.screen === 'quizMode') {
    root.appendChild(renderQuizMode());
  } else if(state.screen === 'rank') {
    root.appendChild(renderRank());
  } else if(state.screen === 'shop') {
    root.appendChild(renderShop());
  } else if(state.screen === 'chat') {
    root.appendChild(renderChat());
  } else if(state.screen === 'profile') {
    root.appendChild(renderProfile());
  } else if(state.screen === 'social') {
    root.appendChild(renderSocial());
  } else if(state.screen === 'club') {
    root.appendChild(renderClub());
  } else {
    root.appendChild(renderHome());
  }

  if(state.modal === 'login') root.appendChild(renderLoginModal());
  else if(state.modal === 'signup') root.appendChild(renderSignupModal());
  else if(state.modal === 'problem_add') root.appendChild(renderProblemAddModal());
  else if(state.modal === 'item_detail') root.appendChild(renderItemDetailModal());

  if(state.settingsOpen) root.appendChild(renderSettingsModal());

  if(state.rankUpInfo && state.rankUpInfo.show) {
    root.appendChild(createRankUpOverlay(state.rankUpInfo));
  }
}

// ─── 초기 데이터 로드 ───
(function() {
  const users = ls.get('cp_users', []);
  if(users.length === 0) {
    ls.set('cp_users', [{
      username:'admin', password:'password123', nickname:'관리자',
      job:'freelancer', country:'KR', flag:'🇰🇷', char:'🤖',
      score:0, xp:100000, coins:100000, solved:[], achievements:[],
      inventory:[], equipped:{frame:'',hat:'',bg:'',acc:'',title:''},
      streak:0, maxStreak:0, attendanceDates:[], attendanceStreak:0,
      friends:[], blocked:[], friendRequests:[],
      wrongAnswers:[], usedPromos:[], heartVoted:{},
      pushEnabled:false, warnings:0, banned:false, banUntil:null,
      createdAt:new Date().toISOString(), lastLogin:null,
      isAdmin:true, clubsCreated:0
    },{
      username:'user01', password:'password123', nickname:'두뇌풀기',
      job:'student_univ', country:'KR', flag:'🇰🇷', char:'🧑‍🎓',
      score:0, xp:0, coins:100, solved:[], achievements:[],
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
      const rewarded = checkDormantReward(fresh);
      if(rewarded !== fresh) {
        const updated = users.map(u=>u.username===fresh.username?rewarded:u);
        ls.set('cp_users', updated);
      }
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
