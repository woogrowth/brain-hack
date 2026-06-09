function renderProfile() {
  if(!state.currentUser) return h('div',{style:{textAlign:'center',padding:'80px 0',fontFamily:'var(--mono)',color:'var(--dim)'}},'로그인이 필요합니다');
  const u = state.currentUser;
  const t = I18N[state.lang];

  // Header card
  const headerCard = h('div',{className:'profile-anim',style:{background:'linear-gradient(135deg,#060e18 60%,#0a1a24)',border:'1px solid var(--cyan)33',padding:'28px',marginBottom:'12px',position:'relative',overflow:'hidden'}},
    h('div',{style:{position:'absolute',top:'0',right:'0',width:'200px',height:'200px',
      background:'radial-gradient(circle at top right,var(--cyan)08,transparent 70%)',pointerEvents:'none'}}),
    h('div',{style:{display:'flex',alignItems:'center',gap:'20px',marginBottom:'20px'}},
      h('div',{style:{position:'relative'}},
        h('span',{style:{fontSize:'64px',lineHeight:'1',display:'block'}},u.char||'🧑'),
        h('span',{style:{position:'absolute',bottom:'0',right:'-4px',fontSize:'22px'}},u.flag||'🌍')
      ),
      h('div',{style:{flex:'1'}},
        h('div',{style:{fontFamily:'var(--display)',fontSize:'22px',fontWeight:'900',color:'var(--text)',marginBottom:'4px'}},
          u.nickname||u.username),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'8px'}},'@'+u.username),
        h('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}},
          rankBadge(u.xp||0),
          u.equipped?.title ? (()=>{
            const item = SHOP_ITEMS.find(it=>it.id===u.equipped.title);
            const label = item ? item.name : u.equipped.title;
            const isAdmin = u.equipped.title === 'admin_title';
            return h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:isAdmin?'var(--pink)':'var(--yellow)',border:'1px solid '+(isAdmin?'var(--pink)':'var(--yellow)')+'44',padding:'1px 6px',background:(isAdmin?'var(--pink)':'var(--yellow)')+'11',fontWeight:isAdmin?'700':'400'}},label);
          })() : null
        )
      )
    ),
    xpBar(u.xp||0, state.lang),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginTop:'16px'}},
      statCard(u.score||0, 'SCORE', 'var(--cyan)'),
      statCard((u.xp||0).toLocaleString(), 'XP', '#50c878'),
      statCard((u.coins||0).toLocaleString(), 'COINS', 'var(--yellow)'),
      statCard((u.solved||[]).length, 'SOLVED', 'var(--pink)')
    )
  );

  // Info row
  const infoRow = h('div',{style:{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}},
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px',flex:'1',minWidth:'140px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'4px'}},'직업'),
      h('div',{style:{fontSize:'13px',fontWeight:'600'}},JOBS.find(j=>j.id===u.job)?.label||'-')
    ),
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px',flex:'1',minWidth:'140px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'4px'}},'국가'),
      h('div',{style:{fontSize:'13px',fontWeight:'600'}},COUNTRIES.find(c=>c.code===u.country)?.name||'-')
    ),
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px',flex:'1',minWidth:'140px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'4px'}},'최고 연속'),
      h('div',{style:{fontSize:'13px',fontWeight:'600',color:'var(--yellow)'}},u.maxStreak||0,' 연속')
    ),
    h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'12px 16px',flex:'1',minWidth:'140px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'4px'}},'출석 연속'),
      h('div',{style:{fontSize:'13px',fontWeight:'600',color:'var(--green)'}},u.attendanceStreak||0,' 일')
    )
  );

  // Edit section
  const editSection = h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px',marginBottom:'12px'}},
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px'}},'// 프로필 수정'),
    ),
    !state.profileEditing ?
      h('button',{className:'cpbtn secondary sm',onClick:()=>setState({profileEditing:true,profileForm:{nickname:u.nickname||u.username}})},'✏ 닉네임 변경') :
      h('div',{style:{display:'flex',gap:'8px'}},
        h('input',{className:'inp',style:{flex:'1'},placeholder:'새 닉네임 (2자 이상)',value:state.profileForm.nickname,
          onInput:e=>setQ({profileForm:{...state.profileForm,nickname:e.target.value}})}),
        h('button',{className:'cpbtn primary sm',onClick:()=>{
          if((state.profileForm.nickname||'').length<2){showToast('닉네임은 2자 이상','error');return;}
          updateUser({...u,nickname:state.profileForm.nickname});
          setState({profileEditing:false});
          showToast('닉네임 변경 완료!','success');
        }},'저장'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({profileEditing:false})},'취소')
      )
  );

  // Password section
  const pwSection = h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px',marginBottom:'12px'}},
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px',marginBottom:'14px'}},'// 비밀번호 변경'),
    field('현재 비밀번호','',h('div',{style:{position:'relative'}},
      h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwOld?'text':'password',value:state.pwForm.old,onInput:e=>setQ({pwForm:{...state.pwForm,old:e.target.value}})}),
      h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},onClick:()=>setState({showPwOld:!state.showPwOld})},state.showPwOld?'🙈':'👁️')
    )),
    field('새 비밀번호','',h('div',{style:{position:'relative'}},
      h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwNew?'text':'password',value:state.pwForm.new_,onInput:e=>setQ({pwForm:{...state.pwForm,new_:e.target.value}})}),
      h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},onClick:()=>setState({showPwNew:!state.showPwNew})},state.showPwNew?'🙈':'👁️')
    )),
    field('비밀번호 확인','',h('div',{style:{position:'relative'}},
      h('input',{className:'inp',style:{paddingRight:'40px'},type:state.showPwConfirm?'text':'password',value:state.pwForm.confirm,onInput:e=>setQ({pwForm:{...state.pwForm,confirm:e.target.value}})}),
      h('button',{style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',fontSize:'16px',color:'var(--dim)',lineHeight:'1'},onClick:()=>setState({showPwConfirm:!state.showPwConfirm})},state.showPwConfirm?'🙈':'👁️')
    )),
    state.pwError?h('div',{className:'errmsg',style:{marginBottom:'10px'}},state.pwError):null,
    h('button',{className:'cpbtn secondary sm',onClick:()=>{
      if(state.pwForm.old!==u.password){setState({pwError:'현재 비밀번호가 틀렸습니다'});return;}
      if(state.pwForm.new_.length<8||!/\d/.test(state.pwForm.new_)){setState({pwError:'8자 이상, 숫자 포함'});return;}
      if(state.pwForm.new_!==state.pwForm.confirm){setState({pwError:'비밀번호 불일치'});return;}
      updateUser({...u,password:state.pwForm.new_});
      setState({pwForm:{old:'',new_:'',confirm:''},pwError:''});
      showToast('비밀번호 변경 완료!','success');
    }},'🔒 비밀번호 변경')
  );

  // Achievements
  const achSection = h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px'}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px'}},'// '+(t.achievements||'업적')),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},(u.achievements||[]).length+'/'+ACHIEVEMENTS.length)
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}},
      ...ACHIEVEMENTS.map(ach=>{
        const earned = (u.achievements||[]).includes(ach.id);
        return h('div',{style:{background:'#020810',border:'1px solid '+(earned?'var(--yellow)33':'var(--border)'),
          padding:'12px',opacity:earned?'1':'0.4',transition:'all .2s',position:'relative'}},
          earned ? h('div',{style:{position:'absolute',top:'6px',right:'6px',fontFamily:'var(--mono)',fontSize:'8px',color:'var(--yellow)'}},'✓') : null,
          h('div',{style:{fontSize:'24px',marginBottom:'6px'}},ach.icon),
          h('div',{style:{fontWeight:'700',fontSize:'12px',marginBottom:'2px'}},ach.name),
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},ach.desc)
        );
      })
    )
  );

  return h('div',{style:{padding:'24px 0'}}, headerCard, infoRow, editSection, pwSection, achSection);
}

// ═══ CLUBS ═══
