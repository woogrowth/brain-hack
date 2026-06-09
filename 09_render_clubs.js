function renderClubs() {
  const clubs = ls.get('cp_clubs', []);
  const u = state.currentUser;

  if(state.clubScreen === 'create') return renderClubCreate();
  if(state.clubScreen === 'detail' && state.selectedClubId) return renderClubDetail(state.selectedClubId);

  // List view
  const myClub = clubs.find(c => c.memberIds?.includes(u?.username));
  return h('div',{style:{padding:'24px 0'}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}},
      h('div',{},
        h('div',{style:{fontFamily:'var(--display)',fontSize:'20px',fontWeight:'900',color:'var(--cyan)'}},'🏟 CLUBS'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginTop:'2px'}},clubs.length+' 개 클럽 활성화')
      ),
      u ? h('button',{className:'cpbtn primary sm',onClick:()=>{
        if(myClub){showToast('이미 클럽에 소속되어 있습니다','error');return;}
        setState({clubScreen:'create'});
      }},'+ 클럽 창설 (1,000코인)') : null
    ),
    clubs.length===0 ? h('div',{style:{textAlign:'center',padding:'60px 20px',border:'1px dashed var(--border)'}},
      h('div',{style:{fontSize:'40px',marginBottom:'12px'}},'🏟'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)'}},'아직 클럽이 없습니다. 첫 번째 클럽을 만들어보세요!')
    ) :
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'12px'}},
      ...clubs.map(club=>{
        const isMember = club.memberIds?.includes(u?.username);
        const isLeader = club.leaderId === u?.username;
        const memberCount = (club.memberIds||[]).length;
        const users = ls.get('cp_users',[]);
        const leaderUser = users.find(x=>x.username===club.leaderId);
        return h('div',{style:{background:'var(--panel)',border:'1px solid '+(isMember?'var(--cyan)':'var(--border)'),
          padding:'18px',cursor:'pointer',transition:'all .2s',position:'relative'},
          onClick:()=>setState({selectedClubId:club.id,clubScreen:'detail'})},
          isMember ? h('div',{style:{position:'absolute',top:'10px',right:'10px',fontFamily:'var(--mono)',fontSize:'8px',
            color:'var(--cyan)',border:'1px solid var(--cyan)44',padding:'2px 6px',background:'var(--cyan)11'}},
            isLeader?'방장':'클럽원') : null,
          h('div',{style:{fontFamily:'var(--display)',fontSize:'16px',fontWeight:'900',marginBottom:'6px',color:'var(--text)'}},club.name),
          club.description ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'8px',
            lineHeight:'1.5',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:'2',WebkitBoxOrient:'vertical'}},
            club.description) : null,
          h('div',{style:{display:'flex',gap:'10px',alignItems:'center',marginTop:'8px'}},
            h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},
              '👥 '+memberCount+'명'),
            club.minTrophy > 0 ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},
              '🏆 '+club.minTrophy+' 이상') : null,
            h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginLeft:'auto'}},
              '방장: '+(leaderUser?.nickname||club.leaderId))
          )
        );
      })
    )
  );
}

function renderClubCreate() {
  const f = state.clubCreateForm;
  const errs = state.clubCreateErrors;
  const u = state.currentUser;

  return h('div',{style:{padding:'24px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}},
      h('button',{className:'cpbtn ghost sm',onClick:()=>setState({clubScreen:'list'})},'← 뒤로'),
      h('div',{style:{fontFamily:'var(--display)',fontSize:'18px',fontWeight:'900',color:'var(--cyan)'}},'클럽 창설')
    ),
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'24px',maxWidth:'500px'}},
      // Cost info
      h('div',{style:{background:'#ffcc0011',border:'1px solid #ffcc0033',padding:'12px 16px',marginBottom:'20px',
        fontFamily:'var(--mono)',fontSize:'11px',color:'var(--yellow)'}},
        '💰 클럽 창설 비용: 1,000 코인 (현재 보유: '+(u?.coins||0).toLocaleString()+' 코인)'
      ),
      field('클럽 이름 *', errs.name||'',
        h('input',{className:'inp',placeholder:'클럽 이름 (2-20자)',value:f.name,
          onInput:e=>setQ({clubCreateForm:{...state.clubCreateForm,name:e.target.value}})})
      ),
      field('설명 (선택사항)', '',
        h('textarea',{className:'inp',rows:'3',placeholder:'클럽 소개 (선택 입력)',value:f.description,style:{resize:'vertical'},
          onInput:e=>setQ({clubCreateForm:{...state.clubCreateForm,description:e.target.value}})})
      ),
      field('최소 트로피 조건 (선택사항)', '',
        h('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
          h('input',{className:'inp',type:'number',style:{width:'120px'},min:'0',value:f.minTrophy,
            onInput:e=>setQ({clubCreateForm:{...state.clubCreateForm,minTrophy:Math.max(0,parseInt(e.target.value)||0)}})}),
          h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'점 이상 (0 = 제한 없음)')
        )
      ),
      h('button',{className:'cpbtn primary',style:{width:'100%',padding:'13px'},onClick:()=>{
        const errs={};
        if(!f.name||f.name.trim().length<2) errs.name='클럽 이름은 2자 이상 필요합니다';
        if(f.name.trim().length>20) errs.name='클럽 이름은 20자 이하';
        if(Object.keys(errs).length>0){setState({clubCreateErrors:errs});return;}
        if((u?.coins||0)<1000){showToast('코인이 부족합니다 (1,000코인 필요)','error');return;}
        const clubs = ls.get('cp_clubs',[]);
        if(clubs.find(c=>c.name===f.name.trim())){showToast('같은 이름의 클럽이 있습니다','error');return;}
        const newClub = {
          id: Date.now(),
          name: f.name.trim(),
          description: f.description.trim(),
          minTrophy: f.minTrophy||0,
          leaderId: u.username,
          viceLeaderIds: [],
          memberIds: [u.username],
          warnings: {},
          reports: [],
          createdAt: new Date().toISOString()
        };
        const newClubs = [...clubs, newClub];
        ls.set('cp_clubs', newClubs);
        updateUser({...u, coins:(u.coins||0)-1000, clubsCreated:(u.clubsCreated||0)+1});
        setState({clubs:newClubs, clubScreen:'detail', selectedClubId:newClub.id, clubCreateForm:{name:'',minTrophy:0,description:''}, clubCreateErrors:{}});
        showToast('🏟 클럽 창설 완료!','success');
      }},'🏟 클럽 창설 (1,000코인 차감)')
    )
  );
}

function renderClubDetail(clubId) {
  const clubs = ls.get('cp_clubs', []);
  const club = clubs.find(c=>c.id===clubId);
  if(!club) { setState({clubScreen:'list'}); return h('div',{},''); }
  const u = state.currentUser;
  const users = ls.get('cp_users',[]);
  const isLeader = club.leaderId === u?.username;
  const isVice = (club.viceLeaderIds||[]).includes(u?.username);
  const isMember = (club.memberIds||[]).includes(u?.username);
  const canManage = isLeader || isVice;

  const saveClub = (updated) => {
    const newClubs = clubs.map(c=>c.id===clubId?updated:c);
    ls.set('cp_clubs', newClubs);
    setState({clubs:newClubs});
  };

  const handleJoin = () => {
    if(!u){setState({modal:'login'});return;}
    const alreadyIn = clubs.find(c=>(c.memberIds||[]).includes(u.username));
    if(alreadyIn){showToast('이미 클럽에 소속되어 있습니다','error');return;}
    if(club.minTrophy > 0 && (u.score||0) < club.minTrophy){showToast(`트로피 ${club.minTrophy}점 이상이어야 합니다 (현재: ${u.score||0})`, 'error'); return;}
    saveClub({...club, memberIds:[...(club.memberIds||[]),u.username]});
    showToast('클럽에 가입했습니다!','success');
  };

  const handleLeave = () => {
    if(isLeader){showToast('방장은 새 방장을 지정 후 탈퇴 가능합니다','error');return;}
    saveClub({...club, memberIds:(club.memberIds||[]).filter(id=>id!==u.username),
      viceLeaderIds:(club.viceLeaderIds||[]).filter(id=>id!==u.username)});
    setState({clubScreen:'list', selectedClubId:null});
    showToast('클럽을 탈퇴했습니다','info');
  };

  const handleKick = (memberId) => {
    if(!canManage||memberId===club.leaderId){showToast('방장은 내보낼 수 없습니다','error');return;}
    saveClub({...club,
      memberIds:(club.memberIds||[]).filter(id=>id!==memberId),
      viceLeaderIds:(club.viceLeaderIds||[]).filter(id=>id!==memberId)});
    setState({clubKickTarget:null});
    showToast('멤버를 내보냈습니다','info');
  };

  const handleWarn = (memberId, reason) => {
    if(!reason.trim()){showToast('경고 사유를 입력하세요','error');return;}
    const warns = {...(club.warnings||{})};
    const prev = warns[memberId]||[];
    if(prev.length>=3){showToast('이미 최대 경고 횟수(3회)에 달했습니다','error');return;}
    warns[memberId]=[...prev,{reason:reason.trim(),date:new Date().toISOString(),by:u.username}];
    saveClub({...club, warnings:warns});
    setState({clubWarnTarget:null, clubWarnForm:{memberId:'',reason:''}});
    showToast(`경고 발행 완료 (${prev.length+1}/3)`, 'warning');
  };

  const handleSetVice = (memberId) => {
    if(!isLeader){showToast('방장만 가능합니다','error');return;}
    const vices = club.viceLeaderIds||[];
    if(vices.includes(memberId)){
      saveClub({...club, viceLeaderIds:vices.filter(v=>v!==memberId)});
      showToast('부방장 해제','info');
    } else {
      if(vices.length>=3){showToast('부방장은 최대 3명','error');return;}
      saveClub({...club, viceLeaderIds:[...vices,memberId]});
      showToast('부방장 지정','success');
    }
    setState({clubViceTarget:null});
  };

  const handleSetLeader = (memberId) => {
    if(!isLeader){showToast('방장만 가능합니다','error');return;}
    saveClub({...club, leaderId:memberId, viceLeaderIds:(club.viceLeaderIds||[]).filter(v=>v!==memberId)});
    setState({clubLeaderTarget:null});
    showToast('새 방장 지정 완료','success');
  };

  const handleReport = () => {
    const {target, reason} = state.clubReportForm;
    if(!target||!reason.trim()){showToast('신고 대상과 사유를 입력하세요','error');return;}
    const reps = ls.get('cp_reports',[]);
    ls.set('cp_reports',[...reps,{id:Date.now(),target,reason,reporter:u?.username||'익명',status:'pending',type:'club',clubId:club.id}]);
    setState({clubReportForm:{target:'',reason:''}});
    showToast('신고가 접수되었습니다','success');
  };

  const memberList = (club.memberIds||[]).map(mid=>{
    const mu = users.find(x=>x.username===mid);
    if(!mu) return null;
    const isClubLeader = club.leaderId===mid;
    const isClubVice = (club.viceLeaderIds||[]).includes(mid);
    const warns = (club.warnings||{})[mid]||[];
    return h('div',{style:{background:'#060e18',border:'1px solid '+(isClubLeader?'var(--yellow)33':isClubVice?'var(--cyan)22':'var(--border)'),
      padding:'12px 14px',display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap',marginBottom:'6px'}},
      h('span',{style:{fontSize:'20px'}},mu.char||'🧑'),
      h('span',{style:{fontSize:'14px'}},mu.flag||''),
      h('div',{style:{flex:'1',minWidth:'100px'}},
        h('div',{style:{fontWeight:'700',fontSize:'13px'}},mu.nickname||mu.username),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},'@'+mu.username)
      ),
      rankBadge(mu.xp||0,true),
      isClubLeader ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--yellow)',border:'1px solid var(--yellow)44',padding:'2px 6px'}},'방장') :
      isClubVice ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--cyan)',border:'1px solid var(--cyan)44',padding:'2px 6px'}},'부방장') : null,
      warns.length>0 ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--pink)',border:'1px solid var(--pink)44',padding:'2px 6px'}},
        '⚠ '+warns.length+'/3') : null,
      // Management buttons
      canManage && !isClubLeader && mid!==u?.username ? h('div',{style:{display:'flex',gap:'4px'}},
        isLeader ? h('button',{className:'cpbtn ghost sm',style:{fontSize:'9px',padding:'3px 7px'},
          onClick:e=>{e.stopPropagation();handleSetVice(mid);}},
          isClubVice?'부방장 해제':'부방장 지정') : null,
        isLeader ? h('button',{className:'cpbtn secondary sm',style:{fontSize:'9px',padding:'3px 7px'},
          onClick:e=>{e.stopPropagation();handleSetLeader(mid);}},
          '새 방장') : null,
        warns.length<3 ? h('button',{className:'cpbtn ghost sm',style:{fontSize:'9px',padding:'3px 7px',borderColor:'var(--yellow)',color:'var(--yellow)'},
          onClick:e=>{e.stopPropagation();setState({clubWarnTarget:mid,clubWarnForm:{memberId:mid,reason:''}}); }},
          '경고') : null,
        h('button',{className:'cpbtn danger sm',style:{fontSize:'9px',padding:'3px 7px'},
          onClick:e=>{e.stopPropagation();handleKick(mid);}},
          '내보내기')
      ) : null,
      // Report button (anyone can report)
      u && mid!==u.username ? h('button',{className:'cpbtn ghost sm',style:{fontSize:'9px',padding:'3px 7px'},
        onClick:e=>{e.stopPropagation();setState({clubReportForm:{target:mid,reason:''}}); }},
        '신고') : null
    );
  }).filter(Boolean);

  // Warn modal
  const warnModal = state.clubWarnTarget ? h('div',{className:'overlay',onClick:()=>setState({clubWarnTarget:null})},
    h('div',{className:'modal-box',style:{maxWidth:'380px'},onClick:e=>e.stopPropagation()},
      h('div',{className:'mhdr'},h('span',{className:'mtag'},'// 경고 발행'),h('button',{className:'xbtn',onClick:()=>setState({clubWarnTarget:null})},'✕')),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'14px'}},
          '대상: @'+state.clubWarnTarget+' · 남은 경고: '+(3-((club.warnings||{})[state.clubWarnTarget]||[]).length)+'회'),
        field('경고 사유 *','',h('textarea',{className:'inp',rows:'3',placeholder:'구체적인 사유를 입력하세요',
          value:state.clubWarnForm.reason,style:{resize:'vertical'},
          onInput:e=>setQ({clubWarnForm:{...state.clubWarnForm,reason:e.target.value}})})),
        h('button',{className:'cpbtn danger',style:{width:'100%'},
          onClick:()=>handleWarn(state.clubWarnTarget,state.clubWarnForm.reason)},'⚠ 경고 발행')
      )
    )
  ) : null;

  // Report modal
  const reportModal = state.clubReportForm.target && !state.clubWarnTarget ? h('div',{className:'overlay',onClick:()=>setState({clubReportForm:{target:'',reason:''}})},
    h('div',{className:'modal-box',style:{maxWidth:'380px'},onClick:e=>e.stopPropagation()},
      h('div',{className:'mhdr'},h('span',{className:'mtag'},'// 신고'),h('button',{className:'xbtn',onClick:()=>setState({clubReportForm:{target:'',reason:''}})},'✕')),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'14px'}},'신고 대상: @'+state.clubReportForm.target),
        field('신고 사유 *','',h('textarea',{className:'inp',rows:'3',placeholder:'신고 사유를 구체적으로 입력하세요',
          value:state.clubReportForm.reason,style:{resize:'vertical'},
          onInput:e=>setQ({clubReportForm:{...state.clubReportForm,reason:e.target.value}})})),
        h('button',{className:'cpbtn danger',style:{width:'100%'},onClick:handleReport},'신고 접수')
      )
    )
  ) : null;

  return h('div',{style:{padding:'24px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}},
      h('button',{className:'cpbtn ghost sm',onClick:()=>setState({clubScreen:'list',selectedClubId:null})},'← 목록'),
      h('div',{style:{fontFamily:'var(--display)',fontSize:'18px',fontWeight:'900',color:'var(--cyan)'}},club.name),
      isLeader ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--yellow)',border:'1px solid var(--yellow)33',padding:'2px 8px'}},'방장') :
      isVice ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--cyan)',border:'1px solid var(--cyan)33',padding:'2px 8px'}},'부방장') :
      isMember ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--green)',border:'1px solid var(--green)33',padding:'2px 8px'}},'클럽원') : null
    ),
    // Club info
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'18px',marginBottom:'12px'}},
      club.description ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'10px',lineHeight:'1.8'}},club.description) : null,
      h('div',{style:{display:'flex',gap:'16px',flexWrap:'wrap'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'👥 '+(club.memberIds||[]).length+'명'),
        club.minTrophy>0 ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'🏆 최소 '+club.minTrophy+'점') : null,
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'📅 '+new Date(club.createdAt).toLocaleDateString('ko-KR'))
      ),
      h('div',{style:{display:'flex',gap:'8px',marginTop:'14px'}},
        !isMember && u ? h('button',{className:'cpbtn primary sm',onClick:handleJoin},'클럽 가입') : null,
        isMember && !isLeader ? h('button',{className:'cpbtn ghost sm',style:{color:'var(--pink)',borderColor:'var(--pink)'},onClick:handleLeave},'탈퇴') : null,
        // Report club
        u ? h('button',{className:'cpbtn ghost sm',style:{fontSize:'10px'},
          onClick:()=>{const reps=ls.get('cp_reports',[]);
            ls.set('cp_reports',[...reps,{id:Date.now(),target:club.name,reason:'클럽 신고',reporter:u.username,status:'pending',type:'club_report',clubId:club.id}]);
            showToast('클럽 신고 접수','success');}},'클럽 신고') : null
      )
    ),
    // Member list
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'18px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px',marginBottom:'14px'}},'// 클럽원 목록'),
      ...memberList
    ),
    warnModal, reportModal
  );
}

// ═══ MODALS ═══
