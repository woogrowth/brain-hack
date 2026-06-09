// ═══ RENDER HELPERS ═══
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if(attrs) {
    for(const [k,v] of Object.entries(attrs)) {
      if(k==='className') el.className=v;
      else if(k==='style' && typeof v==='object') Object.assign(el.style, v);
      else if(k.startsWith('on') && typeof v==='function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if(k==='disabled') { if(v) el.disabled=true; }
      else if(k==='type') el.type=v;
      else if(k==='placeholder') el.placeholder=v;
      else if(k==='value' && (tag==='input'||tag==='textarea'||tag==='select')) { el.value=v; }
      else if(k==='rows') el.rows=v;
      else if(k==='data-t') el.dataset.t=v;
      else if(k==='href') el.href=v;
      else if(k==='children') { /* skip */ }
      else el.setAttribute(k,v);
    }
  }
  for(const c of children.flat()) {
    if(c==null||c===false||c===undefined) continue;
    if(typeof c==='string'||typeof c==='number') el.appendChild(document.createTextNode(String(c)));
    else if(c instanceof Node) el.appendChild(c);
  }
  return el;
}

function xpBar(xp, lang) {
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const pct = next ? Math.round(((xp-rank.minXp)/(next.minXp-rank.minXp))*100) : 100;
  return h('div',{style:{marginTop:'6px'}},
    h('div',{style:{display:'flex',justifyContent:'space-between',fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginBottom:'4px'}},
      h('span',{style:{color:rank.color}},rank.icon+' '+(lang==='ko'?rank.label:rank.labelEn)),
      h('span',{},xp.toLocaleString()+' XP '+(next?'→ '+next.minXp.toLocaleString():'MAX'))
    ),
    h('div',{style:{height:'4px',background:'#0a1a20',position:'relative'}},
      h('div',{style:{height:'100%',width:pct+'%',background:rank.color,boxShadow:'0 0 8px '+rank.color,transition:'width .8s'}})
    )
  );
}

function rankBadge(xp, small) {
  const rank = getRank(xp||0);
  return h('span',{style:{fontFamily:'var(--mono)',fontSize:small?'9px':'10px',color:rank.color,
    border:'1px solid '+rank.color+'44',padding:small?'1px 5px':'2px 8px',
    background:rank.color+'11',letterSpacing:'1px'}}, rank.icon+' '+rank.labelEn);
}

function glitchTitle(text) {
  return h('span',{'className':'g-title','data-t':text}, text);
}

function progressBar(step, total) {
  const steps = Array.from({length:total},(_,i)=>
    h('div',{style:{flex:'1',height:'3px',
      background:i<step?'var(--cyan)':i===step?'var(--pink)':'#0a1a20',
      boxShadow:i<step?'0 0 6px var(--cyan)':'none',transition:'all .3s'}})
  );
  return h('div',{style:{marginBottom:'24px'}},
    h('div',{style:{display:'flex',gap:'4px',marginBottom:'6px'}},...steps),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',letterSpacing:'2px'}},'STEP '+(step+1)+' / '+total)
  );
}

function field(label, error, child) {
  return h('div',{style:{marginBottom:'16px'}},
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',letterSpacing:'2px',marginBottom:'6px'}},label),
    child,
    error ? h('div',{className:'errmsg'},'⚠ '+error) : null
  );
}

function consentRow(label, checked, onChange) {
  return h('div',{style:{display:'flex',alignItems:'center',gap:'12px',cursor:'pointer',
    padding:'12px 14px',border:'1px solid '+(checked?'var(--cyan)':'var(--border)'),
    background:checked?'#00f5ff08':'transparent',marginTop:'10px',transition:'all .2s'},
    onClick:()=>onChange(!checked)},
    h('div',{style:{width:'18px',height:'18px',border:'2px solid '+(checked?'var(--cyan)':'var(--dim)'),
      display:'flex',alignItems:'center',justifyContent:'center',flexShrink:'0',
      background:checked?'var(--cyan)':'transparent',transition:'all .2s'}},
      checked?h('span',{style:{color:'#000',fontSize:'11px',fontWeight:'900'}},'✓'):null
    ),
    h('span',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:checked?'var(--text)':'var(--dim)'}},label)
  );
}

function statCard(value, label, color) {
  color = color || 'var(--cyan)';
  return h('div',{style:{background:'#060e18',border:'1px solid '+color+'33',padding:'14px 10px',textAlign:'center',flex:'1',minWidth:'80px'}},
    h('div',{style:{fontFamily:'var(--display)',fontSize:'22px',color:color}},value),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',letterSpacing:'1px',marginTop:'4px'}},label)
  );
}

// Apply skin tone to emoji based on race
function applySkinTone(emoji, race) {
  if (!emoji) return '🧑';
  const tones = {
    'asian':            '\u{1F3FC}',
    'white':            '\u{1F3FB}',
    'hispanic_latino':  '\u{1F3FD}',
    'middle_eastern':   '\u{1F3FE}',
    'mixed':            '\u{1F3FD}',
    'black':            '\u{1F3FF}',
    'indigenous':       '\u{1F3FE}',
    'other':            '\u{1F3FD}',
    'prefer_not_to_say':''
  };
  const tone = tones[race] || '';
  if (!tone) return emoji;
  // 이미 스킨톤이 적용된 경우 스킵
  if (/\u{1F3FB}|\u{1F3FC}|\u{1F3FD}|\u{1F3FE}|\u{1F3FF}/u.test(emoji)) return emoji;
  // ZWJ 시퀀스 처리
  if (emoji.includes('\u200D')) {
    const parts = emoji.split('\u200D');
    return parts[0] + tone + '\u200D' + parts.slice(1).join('\u200D');
  }
  // 단순 이모지에 스킨톤 추가 (2글자 이상 복합 이모지는 건드리지 않음)
  const cp = emoji.codePointAt(0);
  // 사람 관련 코드포인트 범위
  if (
    (cp >= 0x1F466 && cp <= 0x1F469) || // 👦👧👨👩
    cp === 0x1F9D1 || // 🧑
    cp === 0x1F471 || // 👱
    cp === 0x1F474 || cp === 0x1F475 || // 👴👵
    cp === 0x1F476 || // 👶
    cp === 0x1F9D2 || cp === 0x1F9D3 || // 🧒🧓
    cp === 0x1F46E || // 👮
    cp === 0x1F477 || // 👷
    cp === 0x1F9B8 || cp === 0x1F9B9  // 🦸🦹
  ) {
    const chars = [...emoji];
    return chars[0] + tone + (chars.length > 1 ? chars.slice(1).join('') : '');
  }
  return emoji;
}

function barChart(data, maxVal, height) {
  height = height || 60;
  return h('div',{style:{display:'flex',alignItems:'flex-end',gap:'3px',height:height+'px',padding:'0 2px'}},
    ...data.map(({label,value,color})=>{
      const pct = maxVal > 0 ? Math.max(4, Math.round((value/maxVal)*100)) : 4;
      return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',flex:'1',gap:'2px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'8px',color:'var(--dim)'}},value),
        h('div',{style:{width:'100%',background:(color||'var(--cyan)')+'99',height:pct+'%',
          boxShadow:'0 0 6px '+(color||'var(--cyan)')+'66',transition:'height .5s',minHeight:'4px'}}),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'7px',color:'var(--dim)',textAlign:'center',lineHeight:'1.2',maxWidth:'30px',overflow:'hidden',whiteSpace:'nowrap'}},label)
      );
    })
  );
}

// ── 칭호 이펙트 렌더러 ──
function renderTitleEffect(titleId) {
  const eff = TITLE_EFFECTS[titleId];
  if(!eff) return null;
  const item = SHOP_ITEMS.find(it=>it.id===titleId);
  const name = item ? item.name : titleId;

  const container = document.createElement('div');
  container.style.cssText = `
    position:fixed;inset:0;z-index:10000;pointer-events:none;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.75);
  `;

  // 파티클 생성
  for(let i=0;i<18;i++){
    const p=document.createElement('div');
    const angle = (i/18)*360;
    const dist = 120 + Math.random()*80;
    const size = 16 + Math.random()*16;
    p.style.cssText=`
      position:absolute;font-size:${size}px;
      left:50%;top:50%;
      transform:translate(-50%,-50%) rotate(${angle}deg) translateY(-${dist}px);
      opacity:0;animation:titleParticle 3.5s ease-out ${i*0.08}s forwards;
    `;
    p.textContent = eff.particles;
    container.appendChild(p);
  }

  // 메인 카드
  const card = document.createElement('div');
  card.style.cssText = `
    background:var(--panel);
    border:3px solid ${eff.color};
    padding:40px 60px;text-align:center;
    box-shadow:0 0 60px ${eff.shadow}88, 0 0 120px ${eff.shadow}44;
    animation:titleCardIn 3.5s ease forwards;
    position:relative;overflow:hidden;
  `;

  const iconEl = document.createElement('div');
  iconEl.style.cssText=`font-size:64px;margin-bottom:14px;animation:titleIconSpin 3.5s ease forwards;`;
  iconEl.textContent = item?.icon||'✨';
  card.appendChild(iconEl);

  const titleEl = document.createElement('div');
  titleEl.style.cssText=`font-family:var(--display);font-size:28px;font-weight:900;color:${eff.color};
    text-shadow:0 0 20px ${eff.shadow};letter-spacing:4px;margin-bottom:8px;`;
  titleEl.textContent = name;
  card.appendChild(titleEl);

  const sub = document.createElement('div');
  sub.style.cssText=`font-family:var(--mono);font-size:12px;color:var(--dim);letter-spacing:3px;`;
  sub.textContent = '칭호 장착 완료';
  card.appendChild(sub);

  container.appendChild(card);
  document.body.appendChild(container);
  setTimeout(()=>container.remove(), 3600);
}

// ── 칭호 이펙트 CSS 주입 ──
(function injectTitleEffectCSS(){
  if(document.getElementById('title-effect-styles')) return;
  const style = document.createElement('style');
  style.id='title-effect-styles';
  style.textContent=`
    @keyframes titleParticle {
      0%   { opacity:0; transform:translate(-50%,-50%) rotate(var(--r,0deg)) translateY(0); }
      20%  { opacity:1; }
      100% { opacity:0; transform:translate(-50%,-50%) rotate(var(--r,0deg)) translateY(-200px) scale(.5); }
    }
    @keyframes titleCardIn {
      0%   { opacity:0; transform:scale(.6) translateY(30px); }
      15%  { opacity:1; transform:scale(1.08) translateY(-4px); }
      25%  { transform:scale(1) translateY(0); }
      80%  { opacity:1; transform:scale(1); }
      100% { opacity:0; transform:scale(1.1) translateY(-20px); }
    }
    @keyframes titleIconSpin {
      0%   { transform:scale(.5) rotate(-180deg); }
      20%  { transform:scale(1.3) rotate(20deg); }
      35%  { transform:scale(1) rotate(0deg); }
      100% { transform:scale(1) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
})();

// ═══ SCREENS ═══
