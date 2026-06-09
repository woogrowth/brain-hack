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
      h('span',{},xp.toLocaleString()+' XP '+(next?'→ '+next.minXp.toLocaleString():''))
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

// Mini stat card for admin/profile
function statCard(value, label, color) {
  color = color || 'var(--cyan)';
  return h('div',{style:{background:'#060e18',border:'1px solid '+color+'33',padding:'14px 10px',textAlign:'center',flex:'1',minWidth:'80px'}},
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'22px',fontWeight:'700',color:color,lineHeight:'1'}},value),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',letterSpacing:'1.5px',marginTop:'4px'}},label)
  );
}

// CSS bar chart helper
function barChart(data, maxVal, height) {
  height = height || 60;
  const barW = Math.floor(96 / data.length);
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

// ═══ SCREENS ═══
