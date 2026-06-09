function renderLeaderboard() {
  const users = ls.get('cp_users',[]).filter(u=>!u.isAdmin);
  const sorted = [...users].sort((a,b)=>
    state.lbTab==='score'?(b.score-a.score):state.lbTab==='xp'?(b.xp||0)-(a.xp||0):(b.solved||[]).length-(a.solved||[]).length
  ).slice(0,20);
  // 관리자 권한 유저(admin_title 보유) 최상단 고정
  const adminUsers = ls.get('cp_users',[]).filter(u=>u.isAdmin || (u.equipped?.title === 'admin_title'));
  const finalSorted = [...adminUsers, ...sorted.filter(u=>!adminUsers.find(a=>a.username===u.username))];
  const medals = ['①','②','③'];
  return h('div',{className:'lb-wrap'},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('span',{className:'sec-title'},'// GLOBAL LEADERBOARD')
    ),
    h('div',{style:{display:'flex',gap:'6px',marginBottom:'16px'}},
      ...([['score','점수'],['xp','경험치'],['solved','풀이수']].map(([k,l])=>
        h('button',{className:'nbtn'+(state.lbTab===k?' on':''),onClick:()=>setState({lbTab:k})},l)
      ))
    ),
    sorted.length===0?h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',padding:'40px'}},'아직 플레이어가 없습니다'):null,
    ...finalSorted.map((u,i)=>{
      const isAdmin = u.isAdmin || (u.equipped?.title === 'admin_title');
      const job = JOBS.find(j=>j.id===u.job);
      const equippedTitle = SHOP_ITEMS.find(it=>it.id===u.equipped?.title);
      const titleEff = TITLE_EFFECTS[u.equipped?.title||''];
      return h('div',{className:'lbrow'+(u.username===state.currentUser?.username?' me':'')},
        h('span',{style:{fontFamily:'var(--display)',fontSize:'14px',color:'var(--yellow)',minWidth:'28px'}},i<3?medals[i]:(i+1)+'.'),
        h('span',{style:{fontSize:'18px',marginRight:'4px'}},u.char||'🧑'),
        h('span',{style:{fontSize:'14px',marginRight:'4px'}},u.flag||'🌍'),
        h('div',{style:{flex:'1'}},
          h('div',{style:{fontWeight:'700',fontSize:'14px',display:'flex',alignItems:'center',gap:'6px'}},
            u.nickname||u.username,
            equippedTitle && u.equipped?.title ?
              h('span',{style:{fontFamily:'var(--mono)',fontSize:'8px',
                color: titleEff ? titleEff.color : 'var(--yellow)',
                border:'1px solid '+(titleEff ? titleEff.color+'44' : 'var(--yellow)44'),
                padding:'0 5px',background:(titleEff ? titleEff.color : 'var(--yellow)')+'11'}},
                equippedTitle.name) : null
          ),
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},job?.label||'')
        ),
        rankBadge(u.xp||0, true),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'13px',color:isAdmin?'var(--pink)':'var(--green)',marginLeft:'10px'}},
          state.lbTab==='score'?(u.score||0)+' pts':
          state.lbTab==='xp'?(isAdmin?'∞':(u.xp||0).toLocaleString())+' XP':
          (u.solved||[]).length+'문제')
      );
    })
  );
}

function renderShop() {
  if(!state.currentUser) return h('div',{style:{textAlign:'center',padding:'80px 0',fontFamily:'var(--mono)',color:'var(--dim)'}},
    '로그인 후 이용 가능합니다 ',
    h('button',{className:'cpbtn primary sm',style:{marginLeft:'12px'},onClick:()=>setState({modal:'login'})},'LOGIN')
  );
  const mainTab = state.shopMainTab || 'items';
  const mainTabs = [{id:'items',label:'🛒 아이템'},{id:'coins',label:'💳 코인구매'},{id:'promo',label:'🎫 프로모코드'},{id:'emoji',label:'🦊 이모지샵'}];
  const tabBar = h('div',{style:{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap',borderBottom:'1px solid var(--border)',paddingBottom:'12px'}},
    ...mainTabs.map(mt=>h('button',{className:'nbtn'+(mainTab===mt.id?' on':''),onClick:()=>setState({shopMainTab:mt.id})},mt.label))
  );

  if(mainTab==='items') {
    const tabs = ['all','frame','hat','bg','acc','title','potion'];
    const tabLabels = {all:'전체',frame:'프레임',hat:'모자',bg:'배경',acc:'액세서리',title:'칭호',potion:'⚗️ 포션'};
    const rarityColor = {common:'var(--dim)',rare:'var(--cyan)',epic:'var(--yellow)',legendary:'var(--pink)'};
    const owned = state.currentUser.inventory||[];
    const equipped = state.currentUser.equipped||{};
    const isAdminUser = (equipped.title === 'admin_title') || state.currentUser.isAdmin;

    // 관리자 전용 아이템 및 admin_title 숨김
    const filtered = ((state.shopTab==='all')?SHOP_ITEMS:SHOP_ITEMS.filter(i=>i.type===state.shopTab))
      .filter(it => !it.adminOnly);

    return h('div',{style:{padding:'28px 0'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}},
        h('span',{className:'sec-title'},'// ITEM SHOP'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--yellow)'}},'💰 '+(state.currentUser.coins||0).toLocaleString()+' COINS'+(isAdminUser?' (ADMIN: 전품목 무료)':''))
      ),
      tabBar,
      h('div',{style:{display:'flex',gap:'6px',marginBottom:'18px',flexWrap:'wrap'}},
        ...tabs.map(t2=>h('button',{className:'nbtn'+(state.shopTab===t2?' on':''),onClick:()=>setState({shopTab:t2})},tabLabels[t2]))
      ),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'12px'}},
        ...filtered.map(item=>{
          const isOwned = owned.includes(item.id);
          const isPotion = item.type==='potion';
          const isEquipped = isPotion
            ? state.currentUser.activePotion===item.id
            : (equipped)[item.type]===item.id;
          const titleEff = TITLE_EFFECTS[item.id];
          const borderCol = isEquipped
            ? (titleEff ? titleEff.color : 'var(--cyan)')
            : isOwned ? '#00ff9f44' : 'var(--border)';

          const buy = ()=>{
            if(!isAdminUser && (state.currentUser.coins||0)<item.price){showToast('코인이 부족합니다!','error');return;}
            if(isOwned&&!isPotion){showToast('이미 보유 중입니다.','info');return;}
            const newCoins = isAdminUser ? (state.currentUser.coins||0) : (state.currentUser.coins||0)-item.price;
            updateUser({...state.currentUser, coins:newCoins, inventory:[...owned, item.id]});
            addActivityLog('shop_buy',{item:item.id, price:isAdminUser?0:item.price});
            showToast(item.name+' 구매 완료!'+(isAdminUser?' (관리자 혜택)':''),'success');
          };

          const equip = ()=>{
            if(isPotion){
              updateUser({...state.currentUser, activePotion:isEquipped?null:item.id});
              showToast(isEquipped?'포션 비활성화':'🧪 '+item.name+' 활성화!', 'success');
              return;
            }
            const already = (equipped)[item.type]===item.id;
            const newEq = {...equipped, [item.type]: already?'':item.id};
            // 칭호 장착 시 이펙트 재생
            if(item.type==='title' && !already) {
              renderTitleEffect(item.id);
            }
            updateUser({...state.currentUser, equipped:newEq});
            showToast(already ? item.name+' 해제' : '✦ '+item.name+' 장착!', 'success');
          };

          const rarityLabel = rarityColor[item.rarity]||'var(--dim)';

          return h('div',{style:{background:'var(--panel)',border:'1px solid '+borderCol,
            padding:'16px',position:'relative',transition:'border .2s, box-shadow .2s',
            boxShadow: isEquipped ? '0 0 12px '+(titleEff?titleEff.color+'44':'var(--cyan)44') : 'none'}},
            isEquipped?h('div',{style:{position:'absolute',top:'6px',right:'8px',fontFamily:'var(--mono)',fontSize:'9px',
              color:titleEff?titleEff.color:'var(--cyan)'}},'✦ ON'):null,
            h('div',{style:{fontSize:'32px',textAlign:'center',marginBottom:'10px'}},item.icon),
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:rarityLabel,letterSpacing:'1px',marginBottom:'4px'}},item.rarity.toUpperCase()),
            h('div',{style:{fontWeight:'700',marginBottom:'4px',fontSize:'13px'}},item.name),
            item.desc?h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'6px',lineHeight:'1.4'}},item.desc):null,
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--yellow)',marginBottom:'12px'}},
              '💰 '+(isAdminUser ? 'FREE' : item.price.toLocaleString())),
            isOwned&&!isPotion?
              h('button',{className:'cpbtn '+(isEquipped?'secondary':'ghost')+' sm',style:{width:'100%'},onClick:equip},
                isEquipped?'장착 해제':'장착'):
              h('button',{className:'cpbtn primary sm',style:{width:'100%'},onClick:buy},'구매')
          );
        })
      )
    );
  }

  if(mainTab==='coins') {
    return h('div',{style:{padding:'28px 0'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}},
        h('span',{className:'sec-title'},'// 코인 구매'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--yellow)'}},'💰 '+(state.currentUser.coins||0).toLocaleString()+' COINS')
      ),
      tabBar,
      h('div',{style:{background:'#0a1e10',border:'1px solid #00ff9f33',padding:'12px 16px',marginBottom:'16px',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--green)'}},'ℹ️ 결제 시스템 준비 중입니다. 곧 오픈 예정!'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'14px'}},
        ...COIN_PACKAGES.map(pkg=>h('div',{style:{background:'var(--panel)',border:'1px solid '+(pkg.label?'var(--yellow)':'var(--border)'),padding:'22px',textAlign:'center',position:'relative'}},
          pkg.label?h('div',{style:{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background:'var(--yellow)',color:'#000',fontFamily:'var(--mono)',fontSize:'9px',padding:'2px 10px',letterSpacing:'1px'}},pkg.label):null,
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',marginBottom:'10px'}},pkg.name),
          h('div',{style:{fontSize:'30px',fontWeight:'900',color:'var(--yellow)',marginBottom:'4px'}},'💰'+pkg.coins.toLocaleString()),
          pkg.bonusCoins?h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--green)',marginBottom:'6px'}},'+'+pkg.bonusCoins+' 보너스'):null,
          h('div',{style:{fontFamily:'var(--display)',fontSize:'16px',color:'var(--text)',marginBottom:'16px'}},pkg.price),
          h('button',{className:'cpbtn ghost sm',style:{width:'100%'},onClick:()=>showToast('결제 시스템 준비 중입니다 🚧','info')},'구매 (준비중)')
        ))
      )
    );
  }

  if(mainTab==='promo') {
    const usedPromos = state.currentUser.usedPromos||[];
    const applyPromo = ()=>{
      const code = (state.promoInput||'').trim().toUpperCase();
      if(!code){showToast('코드를 입력하세요','error');return;}
      if(usedPromos.includes(code)){showToast('이미 사용한 코드입니다','error');return;}
      const reward = PROMO_CODES[code];
      if(!reward){showToast('유효하지 않은 코드입니다','error');return;}
      updateUser({
        ...state.currentUser,
        coins:(state.currentUser.coins||0)+reward.coins,
        xp:(state.currentUser.xp||0)+reward.xp,
        usedPromos:[...usedPromos,code]
      });
      setState({promoInput:''});
      showToast('🎫 '+reward.msg+' +'+reward.coins+'코인 +'+reward.xp+'XP','success');
      addActivityLog('promo_used',{code});
    };
    return h('div',{style:{padding:'28px 0'}},
      h('span',{className:'sec-title'},'// 프로모코드'),
      tabBar,
      h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',padding:'24px',marginTop:'16px',maxWidth:'480px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'16px'}},'코드당 1회 사용 가능합니다'),
        h('div',{style:{display:'flex',gap:'8px',marginBottom:'16px'}},
          h('input',{className:'inp',style:{flex:'1'},placeholder:'BRAINHACK, WELCOME, HACKER99 ...',
            value:state.promoInput||'',
            onInput:e=>setQ({promoInput:e.target.value.toUpperCase()}),
            onKeydown:e=>{if(e.key==='Enter')applyPromo();}}),
          h('button',{className:'cpbtn primary sm',onClick:applyPromo},'적용')
        ),
        usedPromos.length ? h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)'}},
          '사용 완료: '+usedPromos.join(', ')) : null
      )
    );
  }

  if(mainTab==='emoji') {
    const owned = state.currentUser.inventory||[];
    const isAdminUser = (state.currentUser.equipped?.title==='admin_title') || state.currentUser.isAdmin;
    return h('div',{style:{padding:'28px 0'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}},
        h('span',{className:'sec-title'},'// 이모지샵'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--yellow)'}},'💰 '+(state.currentUser.coins||0).toLocaleString()+' COINS')
      ),
      tabBar,
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',marginBottom:'14px'}},
        isAdminUser ? '✦ 관리자: 모든 이모지 무료 | 클릭하여 즉시 적용' : '개당 10,000 코인 | 구매 즉시 아바타 전환 가능'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:'8px'}},
        ...EMOJI_SHOP.map((emoji,i)=>{
          const eid='emoji_'+i;
          const isOwned=owned.includes(eid);
          const isActive=state.currentUser.char===emoji;
          return h('div',{
            style:{background:'var(--panel)',border:'2px solid '+(isActive?'var(--cyan)':isOwned?'#00ff9f44':'var(--border)'),
              padding:'12px 8px',textAlign:'center',cursor:'pointer',transition:'border .2s'},
            onClick:()=>{
              if(isActive){showToast('현재 사용 중인 이모지입니다','info');return;}
              if(!isOwned){
                if(!isAdminUser && (state.currentUser.coins||0)<10000){showToast('코인이 부족합니다! (10,000코인 필요)','error');return;}
                const newCoins = isAdminUser ? (state.currentUser.coins||0) : (state.currentUser.coins||0)-10000;
                updateUser({...state.currentUser,coins:newCoins,inventory:[...owned,eid],char:emoji});
                addActivityLog('emoji_buy',{emoji, price:isAdminUser?0:10000});
                showToast(emoji+' 이모지 구매 및 적용 완료!'+(isAdminUser?' (관리자 혜택)':''),'success');
              } else {
                updateUser({...state.currentUser,char:emoji});
                showToast(emoji+' 아바타로 변경!','success');
              }
            }},
            h('div',{style:{fontSize:'28px'}},emoji),
            h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',
              color:isActive?'var(--cyan)':isOwned?'var(--green)':'var(--dim)',marginTop:'6px'}},
              isActive?'사용중':isOwned?'보유':(isAdminUser?'FREE':'10,000'))
          );
        })
      )
    );
  }
  return h('div',{});
}

function renderChat() {
  const server = state.chatServer || 'global';
  const serverMap = {global:'cp_chat',kr:'cp_chat_kr',jp:'cp_chat_jp',en:'cp_chat_en'};
  const serverLabels = {global:'🌐 글로벌',kr:'🇰🇷 한국',jp:'🇯🇵 일본',en:'🌏 영어권'};
  const msgKey = serverMap[server];
  const blocked = state.currentUser?.blocked || [];
  const defaultMsg = [{id:1,user:'system',text:'BRAIN HACK 채팅방에 오신 것을 환영합니다! 🧠',time:'00:00',isSystem:true}];
  const allMsgs = ls.get(msgKey, defaultMsg);
  const visible = allMsgs.filter(m=>!blocked.includes(m.user));

  const serverTabs = h('div',{style:{display:'flex',gap:'4px',marginBottom:'14px',flexWrap:'wrap'}},
    ...Object.keys(serverLabels).map(s=>h('button',{className:'nbtn'+(server===s?' on':''),onClick:()=>setState({chatServer:s})},serverLabels[s]))
  );

  const msgList = h('div',{style:{background:'var(--panel)',border:'1px solid var(--border)',height:'320px',overflowY:'auto',padding:'12px'},id:'chat-messages'},
    ...visible.map(msg=>
      msg.isSystem ?
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)',textAlign:'center',padding:'6px 0'}},'── '+msg.text+' ──') :
        h('div',{style:{marginBottom:'8px',display:'flex',gap:'8px',alignItems:'flex-start'}},
          h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',minWidth:'44px',marginTop:'2px'}},msg.time),
          h('span',{style:{fontSize:'12px',marginTop:'1px'}},msg.flag||''),
          h('span',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:msg.rankColor||'var(--dim)',minWidth:'80px',fontWeight:'700'}},msg.nickname||msg.user),
          h('span',{style:{fontSize:'13px',flex:'1',lineHeight:'1.5'}},msg.text),
          state.currentUser&&msg.user!==state.currentUser.username?
            h('button',{style:{background:'transparent',border:'none',color:'var(--dim)',fontSize:'10px',cursor:'pointer',fontFamily:'var(--mono)'},
              onClick:()=>setState({reportTarget:msg.user,reportReason:''})},'신고'):null
        )
    )
  );
  setTimeout(()=>{const el=document.getElementById('chat-messages');if(el)el.scrollTop=el.scrollHeight;},60);

  const sendChatMsg = ()=>{
    if(!state.currentUser){showToast('로그인이 필요합니다','error');return;}
    const txt = (state.chatInput||'').trim();
    if(!txt) return;
    const filtered = filterBad(txt);
    const rank = getRank(state.currentUser.xp||0);
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    const msgs = ls.get(msgKey, defaultMsg);
    const newMsg = {id:Date.now(),user:state.currentUser.username,nickname:state.currentUser.nickname||state.currentUser.username,
      flag:state.currentUser.flag||'🌍',text:filtered,time,rankColor:rank.color};
    const updated = [...msgs, newMsg].slice(-300);
    ls.set(msgKey, updated);
    setQ({chatInput:''});
    setState({});
    addActivityLog('chat',{server,chars:txt.length});
  };

  const inputRow = state.currentUser ?
    h('div',{style:{display:'flex',gap:'8px',marginTop:'10px'}},
      h('input',{className:'inp',style:{flex:'1'},placeholder:'메시지 입력...',value:state.chatInput||'',
        onInput:e=>setQ({chatInput:e.target.value}),
        onKeydown:e=>{if(e.key==='Enter')sendChatMsg();}}),
      h('button',{className:'cpbtn primary sm',onClick:sendChatMsg},'전송')
    ) :
    h('div',{style:{marginTop:'10px',textAlign:'center',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)'}},
      '로그인 후 채팅 참여 가능 ',
      h('button',{className:'cpbtn primary sm',style:{marginLeft:'8px'},onClick:()=>setState({modal:'login'})},'LOGIN')
    );

  const reportModal = state.reportTarget ? h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'360px',width:'100%'}},
      h('div',{className:'mhdr'},
        h('span',{className:'mtag'},'// 신고'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({reportTarget:null})},'✕')
      ),
      h('div',{style:{padding:'16px'}},
        h('div',{style:{marginBottom:'10px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)'}},'신고 대상: ',h('strong',{style:{color:'var(--text)'}},state.reportTarget)),
        h('textarea',{className:'inp',rows:'3',placeholder:'신고 사유를 입력하세요',value:state.reportReason||'',
          onInput:e=>setQ({reportReason:e.target.value}),style:{marginBottom:'10px'}}),
        h('div',{style:{display:'flex',gap:'8px',justifyContent:'flex-end'}},
          h('button',{className:'cpbtn ghost sm',onClick:()=>setState({reportTarget:null})},'취소'),
          h('button',{className:'cpbtn danger sm',onClick:()=>{
            const reps=ls.get('cp_reports',[]);
            reps.push({id:Date.now(),target:state.reportTarget,reason:state.reportReason||'',reporter:state.currentUser?.username,status:'pending',time:new Date().toISOString(),server});
            ls.set('cp_reports',reps);
            setState({reportTarget:null,reportReason:''});
            showToast('신고가 접수되었습니다','success');
          }},'신고 제출')
        )
      )
    )
  ) : null;

  return h('div',{style:{padding:'24px 0'}},
    h('div',{className:'sec-title',style:{marginBottom:'14px'}},'// CHAT ROOM'),
    serverTabs,
    msgList,
    inputRow,
    reportModal
  );
}
