function renderProfile() {
  if(!state.currentUser) return h('div',{style:{textAlign:'center',padding:'80px 0',fontFamily:'var(--mono)',color:'var(--dim)'}},'로그인이 필요합니다');
  const u = state.currentUser;
  const t = I18N[state.lang];

  // 장착된 칭호 이름 가져오기
  const equippedTitleId = u.equipped?.title || '';
  const equippedTitleItem = SHOP_ITEMS.find(it=>it.id===equippedTitleId);
  const equippedTitleName = equippedTitleId==='admin_title' ? 'ADMINISTRATOR' : (equippedTitleItem?.name||'');

  // 칭호 색상
  const titleEff = TITLE_EFFECTS[equippedTitleId];
  const titleColor = titleEff ? titleEff.color : 'var(--yellow)';

  // Header card
  const headerCard = h('div',{className:'profile-anim',style:{background:'linear-gradient(135deg,#060e18 60%,#0a1a24)',border:'1px solid var(--cyan)33',padding:'28px',marginBottom:'12px',position:'relative',overflow:'hidden'}},
    h('div',{style:{position:'absolute',top:'0',right:'0',width:'200px',height:'200px',
      background:'radial-gradient(circle at top right,var(--cyan)08,transparent 70%)',pointerEvents:'none'}}),
    h('div',{style:{display:'flex',alignItems:'center',gap:'20px',marginBottom:'20px'}},
      h('div',{style:{position:'relative',cursor: u.isAdmin ? 'pointer' : 'default'},
        onClick: u.isAdmin ? ()=>{
          const next = prompt('사용할 커스텀 이모지를 입력하세요 (예: 🐱, 👑, 💀)', u.char);
          if(next && next.trim()) {
            updateUser({...u, char: next.trim()});
            showToast('아바타가 변경되었습니다', 'success');
          }
        } : ()=>setState({screen:'shop',shopMainTab:'emoji'})},
        h('span',{style:{fontSize:'64px',lineHeight:'1',display:'block',userSelect:'none'}},u.char||'🧑'),
        h('span',{style:{position:'absolute',bottom:'0',right:'-4px',fontSize:'22px'}},u.flag||'🌍'),
        h('div',{style:{position:'absolute',bottom:'-6px',left:'50%',transform:'translateX(-50%)',
          fontFamily:'var(--mono)',fontSize:'8px',color:u.isAdmin?'var(--pink)':'var(--dim)',
          background:'var(--panel)',padding:'1px 6px',border:'1px solid var(--border)',whiteSpace:'nowrap',letterSpacing:'1px'}}),
        u.isAdmin
          ? h('div',{style:{position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',
              background:'rgba(0,0,0,0)',opacity:'0',transition:'opacity .2s',borderRadius:'4px'},
              onMouseenter:e=>e.currentTarget.style.opacity='1',onMouseleave:e=>e.currentTarget.style.opacity='0'},
              h('span',{style:{fontSize:'12px',background:'rgba(0,0,0,.7)',padding:'2px 6px',color:'var(--cyan)',fontFamily:'var(--mono)'}},'✏ 변경')
            )
          : h('div',{style:{position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',
              background:'rgba(0,0,0,0)',opacity:'0',transition:'opacity .2s',borderRadius:'4px',cursor:'pointer'},
              onMouseenter:e=>e.currentTarget.style.opacity='1',onMouseleave:e=>e.currentTarget.style.opacity='0'},
              h('span',{style:{fontSize:'10px',background:'rgba(0,0,0,.7)',padding:'2px 6px',color:'var(--cyan)',fontFamily:'var(--mono)'}},'상점')
            )
      ),
      h('div',{style:{flex:'1'}},
        h('div',{style:{fontFamily:'var(--display)',fontSize:'22px',fontWeight:'900',color:'var(--text)',marginBottom:'4px'}},
          u.nickname||u.username),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'8px'}},'@'+u.username),
        h('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}},
          rankBadge(u.xp||0),
          equippedTitleName ? h('span',{
            style:{fontFamily:'var(--mono)',fontSize:'9px',color:titleColor,border:'1px solid '+titleColor+'44',
              padding:'1px 6px',background:titleColor+'11',fontWeight:'700',cursor:'pointer',letterSpacing:'1px'},
            onClick:()=>renderTitleEffect(equippedTitleId),
            title:'클릭하면 칭호 이펙트 재생'
          },'✦ '+equippedTitleName) : null
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

  // ── 장착된 아이템 섹션 ──
  const equipped = u.equipped || {};
  const activePotion = u.activePotion || '';
  const equippedTypes = ['frame','hat','bg','acc','title'];
  const equippedList = equippedTypes
    .map(type=>{
      const id = equipped[type];
      if(!id) return null;
      const item = SHOP_ITEMS.find(it=>it.id===id);
      const eff = TITLE_EFFECTS[id];
      const col = eff ? eff.color : 'var(--cyan)';
      return {type, id, item, col};
    })
    .filter(Boolean);
  const potionItem = activePotion ? SHOP_ITEMS.find(it=>it.id===activePotion) : null;

  const equippedSection = (equippedList.length > 0 || potionItem) ? h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px',marginBottom:'12px'}},
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px',marginBottom:'14px'}},'// 장착 중인 아이템'),
    h('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
      ...equippedList.map(({type, id, item, col})=>
        h('div',{
          style:{background:'#020810',border:'1px solid '+col+'55',padding:'10px 14px',
            display:'flex',alignItems:'center',gap:'8px',cursor: type==='title' ? 'pointer' : 'default'},
          onClick: type==='title' ? ()=>renderTitleEffect(id) : undefined,
          title: type==='title' ? '클릭으로 이펙트 재생' : ''
        },
          h('span',{style:{fontSize:'22px'}},item?.icon||'❓'),
          h('div',{},
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',letterSpacing:'1px'}},({frame:'프레임',hat:'모자',bg:'배경',acc:'액세서리',title:'칭호'})[type]||type),
            h('div',{style:{fontSize:'12px',fontWeight:'700',color:col}},item?.name||id),
            type==='title' ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'8px',color:'var(--dim)'}},'클릭 → 이펙트') : null
          )
        )
      ),
      potionItem ? h('div',{style:{background:'#020810',border:'1px solid var(--green)55',padding:'10px 14px',display:'flex',alignItems:'center',gap:'8px'}},
        h('span',{style:{fontSize:'22px'}},potionItem.icon||'⚗️'),
        h('div',{},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',letterSpacing:'1px'}},'활성 포션'),
          h('div',{style:{fontSize:'12px',fontWeight:'700',color:'var(--green)'}},potionItem.name)
        )
      ) : null
    )
  ) : null;

  // Nickname edit section
  const editSection = h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px',marginBottom:'12px'}},
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px'}},'// 닉네임 변경'),
    ),
    !state.profileEditing ?
      h('div',{style:{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>setState({profileEditing:true,profileForm:{nickname:u.nickname||u.username}})},'✏ 닉네임 변경'),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginTop:'4px'}},'아이디·비밀번호 변경은 우측 상단 ⚙ 설정에서 가능합니다')
      ) :
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

  // Inventory section
  const inventory = u.inventory || [];
  const inventorySection = inventory.length > 0 ? h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'20px',marginBottom:'12px'}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'3px'}},'// 보유 아이템'),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},inventory.length+'개')
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'8px'}},
      ...inventory.map(invId=>{
        const item = SHOP_ITEMS.find(it=>it.id===invId);
        if(!item) return null;
        const isEquipped = item.type==='potion'
          ? u.activePotion===invId
          : (equipped[item.type]===invId);
        const eff = TITLE_EFFECTS[invId];
        const borderCol = isEquipped ? 'var(--cyan)' : (eff ? eff.color+'66' : '#00ff9f44');
        return h('div',{
          style:{background:'#020810',border:'1px solid '+borderCol,padding:'10px 8px',textAlign:'center',
            position:'relative',cursor:'pointer',transition:'border .2s'},
          onClick:()=>{
            if(item.type==='potion'){
              updateUser({...u,activePotion:isEquipped?null:invId});
              showToast(isEquipped?'포션 비활성화':'🧪 '+item.name+' 활성화!','success');
              return;
            }
            if(item.type==='title' && !isEquipped) renderTitleEffect(invId);
            const already = equipped[item.type]===invId;
            const newEq = {...equipped,[item.type]:already?'':invId};
            updateUser({...u,equipped:newEq});
            showToast(already?item.name+' 해제':item.name+' 장착!','success');
          }
        },
          isEquipped?h('div',{style:{position:'absolute',top:'4px',right:'4px',fontFamily:'var(--mono)',fontSize:'8px',color:'var(--cyan)'}},'ON'):null,
          h('div',{style:{fontSize:'24px',marginBottom:'4px'}},item.icon||'❓'),
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:isEquipped?'var(--cyan)':'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},item.name),
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'8px',color:'var(--dim)'}},({frame:'프레임',hat:'모자',bg:'배경',acc:'액세서리',title:'칭호',potion:'포션'})[item.type]||item.type)
        );
      }).filter(Boolean)
    )
  ) : null;

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

  return h('div',{style:{padding:'24px 0'}}, headerCard, infoRow, equippedSection, editSection, inventorySection, achSection);
}

// ═══ CLUBS ═══
