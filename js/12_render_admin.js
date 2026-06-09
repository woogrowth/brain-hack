function renderSysStats() {
  const users = ls.get('cp_users',[]);
  const probs = ls.get('cp_problems', PROBLEMS_DEFAULT);
  const pending = ls.get('cp_pending',[]);
  const reports = ls.get('cp_reports',[]);
  const clubs = ls.get('cp_clubs',[]);
  const chat = ls.get('cp_chat',[]);
  const appealLogs = ls.get('cp_appeal_logs',[]);
  const today = new Date().toDateString();
  const activeToday = users.filter(u=>(u.attendanceDates||[]).includes(today)).length;

  let storageBytes = 0;
  try { for(let k in localStorage) { if(k.startsWith('cp_')) storageBytes += localStorage.getItem(k)?.length||0; } } catch(e){}
  const storageKB = (storageBytes/1024).toFixed(1);

  const cats = {};
  probs.forEach(p=>{ cats[p.category]=(cats[p.category]||0)+1; });
  const catData = Object.entries(cats).map(([k,v])=>({label:k,value:v,color:'var(--cyan)'}));
  const catMax = Math.max(...catData.map(d=>d.value),1);

  const diffs = [1,2,3,4,5].map(d=>({ label:'◆'.repeat(d), value:probs.filter(p=>p.difficulty===d).length, color:d>=4?'var(--pink)':d===3?'var(--yellow)':'var(--green)' }));
  const diffMax = Math.max(...diffs.map(d=>d.value),1);

  const days7 = Array.from({length:7},(_,i)=>{
    const d = new Date(Date.now() - (6-i)*86400000);
    const label = (d.getMonth()+1)+'/'+(d.getDate());
    const dateStr = d.toDateString();
    const count = users.filter(u=>(u.attendanceDates||[]).includes(dateStr)).length;
    return {label, value: count, color:'var(--cyan)'};
  });
  const dayMax = Math.max(...days7.map(d=>d.value),1);

  const rankDist = RANKS.map(r=>({
    label: r.labelEn.slice(0,4),
    value: users.filter(u=>{const rr=getRank(u.xp||0);return rr.id===r.id;}).length,
    color: r.color
  })).filter(d=>d.value>0);
  const rankMax = Math.max(...rankDist.map(d=>d.value),1);

  const refreshBtn = h('button',{className:'cpbtn ghost sm',style:{marginLeft:'auto',fontSize:'10px'},
    onClick:()=>setState({sysStatsTick:(state.sysStatsTick||0)+1})},'↻ 새로고침');

  const Section = (title, children) => h('div',{style:{background:'#060e18',border:'1px solid #00f5ff1a',padding:'18px',marginBottom:'12px'}},
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',letterSpacing:'2px',marginBottom:'14px'}},title),
    ...children
  );

  return h('div',{style:{padding:'4px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',marginBottom:'16px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'2px'}},'// SYS_STATS — DEVELOPER CONSOLE'),
      refreshBtn
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'8px',marginBottom:'12px'}},
      statCard(users.length, 'TOTAL USERS', 'var(--cyan)'),
      statCard(activeToday, 'ACTIVE TODAY', 'var(--green)'),
      statCard(probs.length, 'PROBLEMS', 'var(--yellow)'),
      statCard(pending.length, 'PENDING', 'var(--pink)'),
      statCard(reports.filter(r=>r.status==='pending').length, 'OPEN REPORTS', '#ff6600'),
      statCard(clubs.length, 'CLUBS', '#8b00ff'),
      statCard(chat.length, 'CHAT MSGS', 'var(--dim)'),
      statCard(appealLogs.length, 'APPEAL LOGS', '#c0c0c0'),
    ),
    h('div',{style:{background:'#060e18',border:'1px solid #00f5ff1a',padding:'14px 18px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'16px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',letterSpacing:'2px'}},'💾 LOCALSTORAGE'),
      h('div',{style:{flex:'1',height:'6px',background:'#0a1a20',position:'relative',margin:'0 12px'}},
        h('div',{style:{height:'100%',width:Math.min(storageKB/50*100,100)+'%',background:'var(--green)',boxShadow:'0 0 6px var(--green)',transition:'width .5s'}})
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--green)',minWidth:'80px'}},storageKB+' KB / ~5MB'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},(storageKB/5120*100).toFixed(1)+'% 사용')
    ),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}},
      Section('// 문제 카테고리 분포', [barChart(catData, catMax, 80)]),
      Section('// 난이도 분포', [barChart(diffs, diffMax, 80)])
    ),
    Section('// 최근 7일 출석 활동', [barChart(days7, dayMax, 80)]),
    rankDist.length > 0 ? Section('// 등급 분포', [barChart(rankDist, rankMax, 80)]) : null,
    Section('// 활동 로그 & 데이터 관리', [
      h('div',{style:{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>{
          const log = JSON.parse(localStorage.getItem('cp_Log')||'[]');
          const users2 = ls.get('cp_users',[]);
          const clubs2 = ls.get('cp_clubs',[]);
          const problems2 = ls.get('cp_problems',[]);
          const full = {log, users:users2, clubs:clubs2, problems:problems2, exportedAt:new Date().toISOString()};
          const blob = new Blob([JSON.stringify(full,null,2)],{type:'application/json'});
          const a = document.createElement('a');
          a.href=URL.createObjectURL(blob);
          a.download='brainhack_backup_'+Date.now()+'.json';
          a.click();
          showToast('전체 데이터 다운로드 완료','success');
        }},'💾 전체 데이터 JSON 다운로드'),
        h('button',{className:'cpbtn danger sm',onClick:()=>{
          if(!confirm('⚠ 활동 로그를 초기화하겠습니까?')) return;
          localStorage.setItem('cp_Log','[]');
          showToast('활동 로그가 초기화되었습니다','info');
        }},'🗑 로그 초기화')
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)'}},
        '총 로그: '+(JSON.parse(localStorage.getItem('cp_Log')||'[]')).length+'건',h('br',{}),
        'JSON 파일 업로드로 전체 복구:',
        h('input',{type:'file',accept:'.json',className:'inp',style:{marginTop:'6px'},onChange:e=>{
          const file=e.target.files[0]; if(!file) return;
          const reader=new FileReader();
          reader.onload=ev=>{
            try {
              const data=JSON.parse(ev.target.result);
              if(data.users) ls.set('cp_users',data.users);
              if(data.problems) saveProblems(data.problems);
              if(data.clubs) saveClubs(data.clubs);
              if(data.log) localStorage.setItem('cp_Log',JSON.stringify(data.log));
              showToast('전체 데이터 복구 완료!','success');
              render();
            } catch { showToast('파일 형식이 올바르지 않습니다','error'); }
          };
          reader.readAsText(file);
        }})
      )
    ]),
    h('div',{style:{background:'#060e18',border:'1px solid #ffffff0a',padding:'14px 18px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'#3a6070',letterSpacing:'2px',marginBottom:'10px'}},'// RUNTIME INFO'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'#2a4050',lineHeight:'2'}},
        'UA: '+navigator.userAgent.slice(0,50)+'...',h('br',{}),
        'TIMESTAMP: '+new Date().toISOString(),h('br',{}),
        'USER COUNT: '+users.length+' | PROBLEMS: '+probs.length+' | CLUBS: '+clubs.length,h('br',{}),
        'SCREEN: '+window.innerWidth+'×'+window.innerHeight,h('br',{}),
        'ONLINE: '+(navigator.onLine?'YES':'NO')+' | LANG: '+state.lang
      )
    )
  );
}

function renderAppealsLog() {
  const logs = ls.get('cp_appeal_logs',[]);
  const f = state.appealForm;

  const downloadTxt = () => {
    const lines = ['BRAINHACK APPEALS LOG', '='.repeat(60), ''];
    logs.forEach(l=>{
      lines.push(`[${new Date(l.timestamp).toLocaleString('ko-KR')}] [${l.type.toUpperCase()}]`);
      lines.push(`  USER: ${l.user} | ACTION: ${l.action}`);
      if(l.details) lines.push(`  DETAILS: ${l.details}`);
      if(l.by) lines.push(`  BY: ${l.by}`);
      lines.push('');
    });
    if(lines.length<=3) lines.push('(No log entries)');
    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='brainhack_appeals_'+Date.now()+'.txt';
    a.click(); URL.revokeObjectURL(url);
  };

  const applyAction = () => {
    const f = state.appealForm;
    if(!f.username.trim()){showToast('사용자명을 입력하세요','error');return;}
    if(!f.details.trim()){showToast('상세 내용을 입력하세요','error');return;}
    const allUsers = ls.get('cp_users',[]);
    const targetUser = allUsers.find(u=>u.username===f.username.trim());
    let actionResult = '';

    if(f.action==='unban') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,banned:false,banUntil:null}:u));
      actionResult = 'BAN_REMOVED';
    } else if(f.action==='clear_warnings') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,warnings:0}:u));
      actionResult = 'WARNINGS_CLEARED';
    } else if(f.action==='restore_coins') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      const amt = Math.max(0,parseInt(f.amount)||0);
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,coins:(u.coins||0)+amt}:u));
      actionResult = 'COINS_RESTORED:+'+amt;
    } else if(f.action==='restore_xp') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      const amt = Math.max(0,parseInt(f.amount)||0);
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,xp:(u.xp||0)+amt}:u));
      actionResult = 'XP_RESTORED:+'+amt;
    } else if(f.action==='note') {
      actionResult = 'NOTE';
    }

    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: f.action==='note'?'info':'restore',
      user: f.username.trim(),
      action: actionResult || f.action.toUpperCase(),
      details: f.details.trim(),
      by: state.currentUser?.username||'admin'
    };
    addAppealLog(entry);
    setState({appealForm:{username:'',action:'unban',details:'',amount:0}});
    showToast('어필 로그 저장 완료','success');
  };

  const typeColors = {restore:'var(--green)',info:'var(--cyan)',error:'var(--pink)',note:'var(--yellow)'};
  const activityLogs = JSON.parse(localStorage.getItem('cp_Log')||'[]');

  return h('div',{style:{padding:'4px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'2px'}},'// AUDIT TERMINAL'),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},(logs.length + activityLogs.length)+' entries'),
      h('button',{className:'cpbtn ghost sm',style:{marginLeft:'auto',fontSize:'10px'},onClick:downloadTxt},'⬇ .txt 다운로드')
    ),
    h('div',{style:{background:'#010503',border:'1px solid #00ff4133',padding:'12px 14px',height:'400px',overflowY:'auto',
      fontFamily:'var(--mono)',fontSize:'11px',marginBottom:'16px',position:'relative'}},
      h('div',{style:{color:'#00ff41',marginBottom:'8px',borderBottom:'1px solid #00ff4122',paddingBottom:'6px'}},
        '> BRAINHACK REALTIME ACTIVITY & APPEALS LOG | '+new Date().toLocaleString('ko-KR')),
      (logs.length===0 && activityLogs.length===0) ? h('div',{style:{color:'#1a4030',marginTop:'20px',textAlign:'center'}},'[ NO LOG ENTRIES ]') :
      [...logs.map(l=>({...l, logType:'appeal'})), ...activityLogs.map(l=>({...l, logType:'activity', timestamp:l.time}))]
        .sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))
        .map(l=>{
          if(l.logType==='appeal') {
            const col = typeColors[l.type]||'var(--dim)';
            return h('div',{style:{marginBottom:'8px',borderLeft:'2px solid '+col+'44',paddingLeft:'8px'}},
              h('div',{style:{color:'#3a6050',fontSize:'9px'}},'[APPEAL] '+new Date(l.timestamp).toLocaleString('ko-KR')+' | by '+l.by),
              h('div',{style:{color:col,marginTop:'1px'}},
                '[',h('span',{style:{color:'#00ff41'}},'@'+l.user),'] ',
                h('span',{style:{color:'var(--yellow)'}},'ACTION: '+l.action)
              ),
              l.details ? h('div',{style:{color:'var(--dim)',fontSize:'10px',marginTop:'2px'}},'  └ '+l.details) : null
            );
          } else {
            return h('div',{style:{marginBottom:'8px',borderLeft:'2px solid var(--cyan)44',paddingLeft:'8px'}},
              h('div',{style:{color:'#3a6050',fontSize:'9px'}},'[ACTIVITY] '+new Date(l.timestamp).toLocaleString('ko-KR')),
              h('div',{style:{color:'var(--cyan)',marginTop:'1px'}},
                '[',h('span',{style:{color:'#00ff41'}},'@'+l.user),'] ',
                h('span',{style:{color:'var(--text)'}},'EVENT: '+l.type)
              ),
              l.data ? h('div',{style:{color:'var(--dim)',fontSize:'10px',marginTop:'2px'}},'  └ '+JSON.stringify(l.data)) : null
            );
          }
        })
    ),
    h('div',{style:{background:'#060e18',border:'1px solid var(--border)',padding:'18px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',letterSpacing:'2px',marginBottom:'14px'}},'// 어필 처리 입력'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
        h('div',{},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'대상 유저명'),
          h('input',{className:'inp',placeholder:'username',value:f.username,
            onInput:e=>setQ({appealForm:{...state.appealForm,username:e.target.value}})})
        ),
        h('div',{},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'처리 유형'),
          h('select',{className:'inp',value:f.action,onChange:e=>setState({appealForm:{...f,action:e.target.value}})},
            ...['unban','clear_warnings','restore_coins','restore_xp','note'].map(v=>{
              const labels={unban:'밴 해제',clear_warnings:'경고 초기화',restore_coins:'코인 복구',restore_xp:'XP 복구',note:'메모/기록'};
              const o=document.createElement('option'); o.value=v; o.textContent=labels[v]||v; return o;
            })
          )
        )
      ),
      (f.action==='restore_coins'||f.action==='restore_xp') ? h('div',{style:{marginBottom:'10px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},
          f.action==='restore_coins'?'복구 코인 수량':'복구 XP 수량'),
        h('input',{className:'inp',type:'number',min:'0',value:f.amount,style:{width:'120px'},
          onInput:e=>setQ({appealForm:{...state.appealForm,amount:Math.max(0,parseInt(e.target.value)||0)}})})
      ) : null,
      h('div',{style:{marginBottom:'12px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'상세 내용 / 사유 *'),
        h('textarea',{className:'inp',rows:'3',placeholder:'처리 사유 및 상세 내용을 입력하세요 (로그에 영구 기록됨)',
          value:f.details,style:{resize:'vertical'},
          onInput:e=>setQ({appealForm:{...state.appealForm,details:e.target.value}})})
      ),
      h('button',{className:'cpbtn primary',style:{padding:'10px 24px'},onClick:applyAction},'✓ 처리 및 로그 기록')
    )
  );
}

const ADMIN_PROBLEM_CATEGORIES = ['수학','논리','언어','창의','상식','과학','역사','기타'];

function defaultAdminProblemDraft(problem) {
  return {
    category: '기타', difficulty: 3, question: '', questionImage: '',
    hint: '', answer: '', explanation: '', explanationImage: '',
    timeLimit: 60, xp: 20, coins: 10,
    ...(problem || {})
  };
}
function openAdminProblemEditor(problem) {
  setState({
    adminProblemEditingId: problem ? problem.id : null,
    adminProblemDraft: defaultAdminProblemDraft(problem),
    adminProblemError: ''
  });
}
// ── 문제 에디터 전용 드래프트 업데이터 (렌더 없이 값만 변경) ──
function updateAdminProblemDraft(key, value, rerender) {
  state.adminProblemDraft = { ...(state.adminProblemDraft || defaultAdminProblemDraft()), [key]: value };
  if(rerender) {
    // 드롭다운·버튼 변경 시만 재렌더
    const draft = state.adminProblemDraft;
    // 에디터 모달만 업데이트 (포커스 유지)
    const existingModal = document.getElementById('admin-problem-editor-modal');
    if(existingModal) {
      const newModal = renderAdminProblemEditor();
      newModal.id = 'admin-problem-editor-modal';
      existingModal.replaceWith(newModal);
    } else {
      setState({ adminProblemDraft: state.adminProblemDraft });
    }
  }
}
function readAdminProblemImage(file, key) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => updateAdminProblemDraft(key, e.target.result, true);
  reader.readAsDataURL(file);
}
function saveAdminProblemDraft() {
  const d = defaultAdminProblemDraft(state.adminProblemDraft);
  if(!String(d.question || '').trim()) { setState({adminProblemError:'문제 내용을 입력해주세요'}); return; }
  if(!String(d.answer || '').trim()) { setState({adminProblemError:'정답을 입력해주세요'}); return; }
  const item = {
    ...d,
    id: state.adminProblemEditingId || d.id || Date.now(),
    category: ADMIN_PROBLEM_CATEGORIES.includes(d.category) ? d.category : '기타',
    difficulty: Math.min(5, Math.max(1, Number(d.difficulty) || 3)),
    question: String(d.question || '').trim(),
    questionImage: d.questionImage || '',
    hint: String(d.hint || '').trim(),
    answer: String(d.answer || '').trim(),
    explanation: String(d.explanation || '').trim(),
    explanationImage: d.explanationImage || '',
    timeLimit: Math.max(5, Number(d.timeLimit) || 60),
    xp: Math.max(0, Number(d.xp) || 0),
    coins: Math.max(0, Number(d.coins) || 0),
    status: 'approved'
  };
  const probs = ls.get('cp_problems', PROBLEMS_DEFAULT);
  const isEdit = !!state.adminProblemEditingId;
  const next = isEdit
    ? probs.map(p => p.id === state.adminProblemEditingId ? item : p)
    : [...probs, item];
  ls.set('cp_problems', next);
  setState({problems: next, adminProblemEditingId:null, adminProblemDraft:null, adminProblemError:''});
  showToast(isEdit ? '문제가 수정되었습니다' : '새 문제가 추가되었습니다', 'success');
}

function renderAdminProblemEditor() {
  const d = defaultAdminProblemDraft(state.adminProblemDraft);

  // 숫자 입력: onInput 이벤트로만 처리 (재렌더 없이)
  const numberInput = (label, key, min) => {
    const wrapper = h('div',{style:{marginBottom:'16px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',letterSpacing:'2px',marginBottom:'6px'}},label)
    );
    const inp = document.createElement('input');
    inp.className='inp'; inp.type='number'; inp.min=String(min); inp.value=d[key];
    inp.addEventListener('input',e=>{ state.adminProblemDraft = {...(state.adminProblemDraft||{}), [key]: e.target.value}; });
    wrapper.appendChild(inp);
    return wrapper;
  };

  const textArea = (label, key, rows, placeholder) => {
    const wrapper = h('div',{style:{marginBottom:'16px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',letterSpacing:'2px',marginBottom:'6px'}},label)
    );
    const ta = document.createElement('textarea');
    ta.className='inp'; ta.rows=rows; ta.placeholder=placeholder||''; ta.value=d[key]||'';
    ta.addEventListener('input',e=>{ state.adminProblemDraft = {...(state.adminProblemDraft||{}), [key]: e.target.value}; });
    wrapper.appendChild(ta);
    return wrapper;
  };

  const textInput = (label, key, placeholder) => {
    const wrapper = h('div',{style:{marginBottom:'16px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',letterSpacing:'2px',marginBottom:'6px'}},label)
    );
    const inp = document.createElement('input');
    inp.className='inp'; inp.placeholder=placeholder||''; inp.value=d[key]||'';
    inp.addEventListener('input',e=>{ state.adminProblemDraft = {...(state.adminProblemDraft||{}), [key]: e.target.value}; });
    wrapper.appendChild(inp);
    return wrapper;
  };

  const imageControl = (label, key) => h('div', {style:{marginBottom:'16px'}},
    h('div',{className:'slabel',style:{marginBottom:'6px'}}, label),
    d[key] ? h('div',{style:{marginBottom:'8px',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
      h('img',{src:d[key],style:{maxWidth:'160px',maxHeight:'100px',border:'1px solid var(--border)',objectFit:'contain',background:'var(--panel)'}}),
      h('button',{className:'cpbtn danger sm',onClick:()=>updateAdminProblemDraft(key,'',true)},'이미지 삭제')
    ) : null,
    h('input',{className:'inp',type:'file',accept:'image/*',onChange:e=>readAdminProblemImage(e.target.files[0], key)})
  );

  const el = h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'680px',width:'100%',maxHeight:'90vh',display:'flex',flexDirection:'column'}},
      h('div',{className:'mhdr'},
        h('span',{className:'mtag'}, state.adminProblemEditingId ? '// 문제 편집' : '// 새 문제 추가'),
        h('button',{className:'xbtn',onClick:()=>setState({adminProblemEditingId:null,adminProblemDraft:null,adminProblemError:''})},'✕')
      ),
      h('div',{style:{padding:'20px',overflowY:'auto'}},
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}},
          field('카테고리 선택','',h('select',{className:'inp',value:d.category,onChange:e=>updateAdminProblemDraft('category',e.target.value,true)},
            ...ADMIN_PROBLEM_CATEGORIES.map(c=>h('option',{value:c},c))
          )),
          h('div',{},
            h('div',{className:'slabel',style:{marginBottom:'6px'}},'난도 1~5'),
            h('div',{style:{display:'flex',gap:'4px',height:'36px',alignItems:'center'}},
              ...[1,2,3,4,5].map(n=>h('button',{className:'nbtn'+(Number(d.difficulty)>=n?' on':''),style:{fontSize:'14px',padding:'6px 10px'},onClick:()=>updateAdminProblemDraft('difficulty',n,true)},'★'))
            )
          )
        ),
        textArea('문제 내용','question',4,'문제 내용을 입력하세요'),
        imageControl('문제 사진 업로드 (base64 인라인 저장)', 'questionImage'),
        textArea('힌트','hint',2,'힌트를 입력하세요'),
        textInput('정답','answer','정답'),
        textArea('해설','explanation',3,'해설을 입력하세요'),
        imageControl('해설 이미지 업로드', 'explanationImage'),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}},
          numberInput('제한시간(초)', 'timeLimit', 5),
          numberInput('XP', 'xp', 0),
          numberInput('코인', 'coins', 0)
        ),
        state.adminProblemError ? h('div',{className:'errmsg',style:{marginTop:'8px'}},'⚠ '+state.adminProblemError) : null,
        h('div',{style:{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'18px'}},
          h('button',{className:'cpbtn ghost',onClick:()=>setState({adminProblemEditingId:null,adminProblemDraft:null,adminProblemError:''})},'취소'),
          h('button',{className:'cpbtn primary',onClick:saveAdminProblemDraft}, state.adminProblemEditingId ? '수정 저장' : '문제 추가')
        )
      )
    )
  );
  el.id = 'admin-problem-editor-modal';
  return el;
}

function renderAdmin() {
  const problems2 = ls.get('cp_problems',PROBLEMS_DEFAULT);
  const pending = ls.get('cp_pending',[]);
  const users = ls.get('cp_users',[]);
  const reports = ls.get('cp_reports',[]);
  const BAN_OPTIONS=[{label:'30분',value:1800},{label:'1시간',value:3600},{label:'1일',value:86400},{label:'1주일',value:604800},{label:'영구',value:'permanent'}];

  const approvePending = item=>{
    const probs=ls.get('cp_problems',PROBLEMS_DEFAULT);
    ls.set('cp_problems',[...probs,{...item,status:'approved',id:Date.now()}]);
    ls.set('cp_pending',pending.filter(p=>p.id!==item.id));
    render();
  };
  const rejectPending = id=>{ ls.set('cp_pending',pending.filter(p=>p.id!==id)); render(); };
  const banUser = (username,duration)=>{
    const banUntil=duration==='permanent'?null:new Date(Date.now()+duration*1000).toISOString();
    ls.set('cp_users',users.map(u=>u.username===username?{...u,banned:true,banUntil}:u)); render();
  };
  const unbanUser = username=>{ ls.set('cp_users',users.map(u=>u.username===username?{...u,banned:false,banUntil:null}:u)); render(); };
  const delProblem = id=>{ ls.set('cp_problems',ls.get('cp_problems',[]).filter(x=>x.id!==id)); render(); };
  const probs = ls.get('cp_problems',PROBLEMS_DEFAULT);

  // ── 아이템 지급 헬퍼 (equipped 즉시 적용 + admin_title 시 관리자 권한 부여) ──
  function giveItemToUser(mu, itemId, allUsersArr) {
    const item = SHOP_ITEMS.find(it=>it.id===itemId);
    if(!item) return null;
    if(mu.inventory?.includes(itemId)) return null; // 이미 보유

    let updates = { inventory: [...(mu.inventory||[]), itemId] };

    // admin_title 부여 시 관리자 권한 + 모든 아이템 자동 지급 + 장착
    if(itemId === 'admin_title') {
      updates.isAdmin = true;
      updates.xp = 999999;
      updates.coins = 999999;
      // 모든 칭호 제외 아이템 인벤에 추가
      const allItemIds = SHOP_ITEMS
        .filter(it=>it.type!=='potion')
        .map(it=>it.id);
      updates.inventory = [...new Set([...(mu.inventory||[]), ...allItemIds])];
      updates.equipped = {
        ...(mu.equipped||{}),
        title: 'admin_title',
        frame: 'frame_rainbow',
        hat: 'hat_crown',
        bg: 'bg_matrix',
        acc: 'acc_wings',
      };
    } else if(item.type !== 'potion') {
      // 일반 아이템은 인벤에만 추가, 장착은 사용자가 직접
    }

    const nextUser = {...mu, ...updates};
    const nextUsers = allUsersArr.map(x=>x.username===mu.username ? nextUser : x);
    ls.set('cp_users', nextUsers);
    return nextUser;
  }

  let tabContent;
  if(state.adminTab==='problems') tabContent = h('div',{},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('span',{className:'sec-title'},'// 문제 데이터베이스 — '+probs.length+'건'),
      h('button',{className:'cpbtn ghost sm',onClick:()=>openAdminProblemEditor(null)},'+ 새 문제 추가')
    ),
    ...probs.map(p=>h('div',{className:'prow'},
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',minWidth:'40px'}},'#'+String(p.id).slice(-4)),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',background:'#00f5ff12',padding:'2px 8px',minWidth:'50px'}},p.category),
      h('span',{style:{flex:'1',fontSize:'13px',fontWeight:'600',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},p.question),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)',marginRight:'8px'}},'★'.repeat(p.difficulty)),
      h('button',{className:'cpbtn ghost sm',onClick:()=>openAdminProblemEditor(p)},'편집'),
      h('button',{className:'cpbtn danger sm',onClick:()=>delProblem(p.id)},'삭제')
    ))
  );
  else if(state.adminTab==='pending') tabContent = h('div',{},
    h('span',{className:'sec-title',style:{display:'block',marginBottom:'14px'}},'// 심의 대기 문제 — '+pending.length+'건'),
    pending.length===0?h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',padding:'40px'}},'대기 중인 문제 없음'):null,
    ...pending.map(p=>h('div',{style:{background:'var(--panel)',border:'1px solid #ffcc0033',padding:'14px',marginBottom:'10px'}},
      h('div',{style:{display:'flex',gap:'8px',marginBottom:'8px',alignItems:'center'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',background:'#00f5ff12',padding:'2px 8px'}},p.category),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'◆'.repeat(p.difficulty)),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginLeft:'auto'}},'by @'+p.submitter)
      ),
      h('div',{style:{fontSize:'14px',fontWeight:'600',marginBottom:'4px'}},p.question),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--green)',marginBottom:'10px'}},'정답: '+p.answer),
      h('div',{style:{display:'flex',gap:'8px'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>approvePending(p)},'✓ 승인'),
        h('button',{className:'cpbtn danger sm',onClick:()=>rejectPending(p.id)},'✗ 반려')
      )
    ))
  );
  else if(state.adminTab==='members') tabContent = h('div',{},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('span',{className:'sec-title'},'// 회원 관리 — '+users.length+'명'),
      h('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
        statCard(users.length,'TOTAL','var(--cyan)'),
        statCard(users.filter(u=>u.banned).length,'BANNED','var(--pink)'),
        statCard(users.filter(u=>!u.banned).length,'ACTIVE','var(--green)')
      )
    ),
    ...users.map(u=>h('div',{style:{background:'var(--panel)',border:'1px solid '+(u.banned?'#ff003c33':'var(--border)'),
      padding:'12px 16px',marginBottom:'6px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}},
      h('span',{style:{fontSize:'18px'}},u.char||'🧑'),
      h('span',{style:{fontSize:'14px'}},u.flag||'🌍'),
      h('div',{style:{flex:'1',minWidth:'120px'}},
        h('div',{style:{fontWeight:'700'}},u.nickname||u.username,
          u.isAdmin ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--pink)',marginLeft:'6px',border:'1px solid var(--pink)33',padding:'1px 4px'}},'ADMIN') : null
        ),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'@'+u.username+' · XP '+(u.xp||0)+' · ⚠ '+(u.warnings||0)+' · 💰'+(u.coins||0))
      ),
      rankBadge(u.xp||0,true),
      h('button',{className:'cpbtn secondary sm',onClick:()=>setState({adminMemberManage:u.username})},'관리'),
      u.banned?h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--pink)',border:'1px solid var(--pink)44',padding:'2px 6px'}},'BANNED'):null
    )),
    state.adminMemberManage ? (()=>{
      const mu = users.find(x=>x.username===state.adminMemberManage);
      if(!mu) return null;
      return h('div',{className:'overlay'},
        h('div',{className:'modal-box',style:{maxWidth:'500px'}},
          h('div',{className:'mhdr'},
            h('span',{className:'mtag'},'// 회원 상세 관리: @'+mu.username),
            h('button',{className:'xbtn',onClick:()=>setState({adminMemberManage:null})},'✕')
          ),
          h('div',{style:{padding:'20px',overflowY:'auto',maxHeight:'80vh'}},
            // 재화 관리
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'코인 관리 (현재: '+(mu.coins||0)+')'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('input',{className:'inp',type:'number',placeholder:'금액 (음수=회수)',id:'adminCoinAmt'}),
                h('button',{className:'cpbtn primary sm',onClick:()=>{
                  const val = parseInt(document.getElementById('adminCoinAmt').value)||0;
                  const allUsersNow = ls.get('cp_users',[]);
                  const nextUsers = allUsersNow.map(x=>x.username===mu.username?{...x,coins:Math.max(0,(x.coins||0)+val)}:x);
                  ls.set('cp_users',nextUsers);
                  if(state.currentUser?.username===mu.username) setState({currentUser:{...state.currentUser, coins:Math.max(0,(state.currentUser.coins||0)+val)}});
                  setState({adminMemberManage:mu.username});
                  addActivityLog('admin_coins_adjust',{target:mu.username, amount:val});
                  addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'COINS_ADJUST:'+val,details:'관리자 조정',by:state.currentUser.username});
                  showToast('코인이 조정되었습니다','success');
                }},'지급/회수')
              )
            ),
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'XP 관리 (현재: '+(mu.xp||0)+')'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('input',{className:'inp',type:'number',placeholder:'경험치 (음수=회수)',id:'adminXpAmt'}),
                h('button',{className:'cpbtn secondary sm',onClick:()=>{
                  const val = parseInt(document.getElementById('adminXpAmt').value)||0;
                  const allUsersNow = ls.get('cp_users',[]);
                  const nextUsers = allUsersNow.map(x=>x.username===mu.username?{...x,xp:Math.max(0,(x.xp||0)+val)}:x);
                  ls.set('cp_users',nextUsers);
                  if(state.currentUser?.username===mu.username) setState({currentUser:{...state.currentUser, xp:Math.max(0,(state.currentUser.xp||0)+val)}});
                  setState({adminMemberManage:mu.username});
                  addActivityLog('admin_xp_adjust',{target:mu.username, amount:val});
                  addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'XP_ADJUST:'+val,details:'관리자 조정',by:state.currentUser.username});
                  showToast('XP가 조정되었습니다','success');
                }},'지급/회수')
              )
            ),
            // 아이템 지급
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'아이템 지급'),
              h('div',{style:{display:'flex',gap:'8px',marginBottom:'8px'}},
                h('select',{className:'inp',id:'adminItemSelect'},
                  ...SHOP_ITEMS.map(it=>{
                    const o=document.createElement('option');
                    o.value=it.id;
                    o.textContent=it.icon+' '+it.name+' ('+it.type+')';
                    return o;
                  })
                ),
                h('button',{className:'cpbtn ghost sm',onClick:()=>{
                  const itemId = document.getElementById('adminItemSelect').value;
                  const allUsersNow = ls.get('cp_users',[]);
                  const muFresh = allUsersNow.find(x=>x.username===mu.username);
                  if(!muFresh) return;
                  if(muFresh.inventory?.includes(itemId) && itemId !== 'admin_title') {
                    showToast('이미 보유 중인 아이템입니다','info');
                    return;
                  }
                  const updatedUser = giveItemToUser(muFresh, itemId, allUsersNow);
                  if(!updatedUser) { showToast('지급 실패','error'); return; }

                  // admin_title 부여 시 isAdmin=true 반영
                  const finalUsers = allUsersNow.map(x=>x.username===mu.username?updatedUser:x);
                  ls.set('cp_users', finalUsers);

                  // 현재 로그인 유저가 대상인 경우 state도 갱신
                  if(state.currentUser?.username===mu.username) {
                    setState({currentUser: updatedUser, adminMemberManage: mu.username});
                  } else {
                    setState({adminMemberManage: mu.username});
                  }

                  const item = SHOP_ITEMS.find(it=>it.id===itemId);
                  addActivityLog('admin_item_given',{target:mu.username, itemId});
                  addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'ITEM_GIVEN:'+itemId,details:'관리자 지급',by:state.currentUser.username});
                  showToast((item?.name||itemId)+' 지급 완료'+(itemId==='admin_title'?' (관리자 권한 부여됨)':''),'success');
                }},'지급')
              ),
              h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--pink)',marginTop:'4px'}},'⚠ ADMINISTRATOR 칭호 지급 시 관리자 권한이 자동 부여됩니다')
            ),
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'보유 아이템 (클릭=회수)'),
              h('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap'}},
                ...(mu.inventory||[]).map(id=>{
                  const it = SHOP_ITEMS.find(x=>x.id===id);
                  return h('button',{className:'nbtn',style:{fontSize:'10px',borderColor:'var(--pink)',color:'var(--pink)'},
                    onClick:()=>{
                      const allUsersNow = ls.get('cp_users',[]);
                      const nextUsers = allUsersNow.map(x=>x.username===mu.username?{
                        ...x,
                        inventory:(x.inventory||[]).filter(y=>y!==id),
                        equipped:Object.fromEntries(Object.entries(x.equipped||{}).map(([k,v])=>[k,v===id?'':v])),
                        isAdmin: id==='admin_title' ? false : x.isAdmin
                      }:x);
                      ls.set('cp_users',nextUsers);
                      if(state.currentUser?.username===mu.username) {
                        const nextEquipped = Object.fromEntries(Object.entries(state.currentUser.equipped||{}).map(([k,v])=>[k,v===id?'':v]));
                        setState({currentUser:{...state.currentUser,
                          inventory:(state.currentUser.inventory||[]).filter(y=>y!==id),
                          equipped:nextEquipped,
                          isAdmin: id==='admin_title' ? false : state.currentUser.isAdmin
                        }});
                      }
                      setState({adminMemberManage:mu.username});
                      addActivityLog('admin_item_removed',{target:mu.username, itemId:id});
                      showToast((it?.name||id)+' 회수 완료','info');
                    }},(it?.icon||'')+' '+(it?.name||id)+' ✕');
                })
              )
            ),
            // 제재 관리
            h('div',{},
              h('div',{className:'slabel'},'계정 상태 제재'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('select',{className:'inp',style:{width:'auto'},
                  onChange:e=>{ if(e.target.value){banUser(mu.username,e.target.value==='permanent'?'permanent':Number(e.target.value));e.target.value=''; setState({adminMemberManage:mu.username});}}},
                  h('option',{value:'',disabled:true},'제재 선택'),
                  ...BAN_OPTIONS.map(o=>{ const op=document.createElement('option'); op.value=o.value; op.textContent=o.label+' 정지'; return op; })
                ),
                mu.banned?h('button',{className:'cpbtn ghost sm',onClick:()=>{unbanUser(mu.username);setState({adminMemberManage:mu.username});}},'밴 해제'):null
              )
            )
          )
        )
      );
    })() : null
  );
  else if(state.adminTab==='reports') tabContent = h('div',{},
    h('span',{className:'sec-title',style:{display:'block',marginBottom:'14px'}},'// 신고 처리 — '+reports.filter(r=>r.status==='pending').length+'건 대기'),
    reports.length===0?h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',padding:'40px'}},'신고 없음'):null,
    ...reports.map(r=>h('div',{style:{background:'var(--panel)',border:'1px solid '+(r.status==='pending'?'var(--yellow)33':'var(--border)'),padding:'12px 16px',marginBottom:'8px'}},
      h('div',{style:{display:'flex',gap:'10px',alignItems:'center',marginBottom:'4px'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--pink)'}},'@'+r.target),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'사유: '+r.reason),
        r.type ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--cyan)',border:'1px solid var(--cyan)22',padding:'1px 5px'}},r.type) : null,
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginLeft:'auto'}},'by @'+r.reporter)
      ),
      r.status==='pending'?h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
        h('button',{className:'cpbtn danger sm',onClick:()=>{banUser(r.target,3600);ls.set('cp_reports',reports.map(x=>x.id===r.id?{...x,status:'processed'}:x));render();}},'1시간 제재'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>{ls.set('cp_reports',reports.map(x=>x.id===r.id?{...x,status:'dismissed'}:x));render();}},'무시')
      ):h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginTop:'4px',display:'block'}},r.status)
    ))
  );
  else if(state.adminTab==='sys_stats') tabContent = renderSysStats();
  else if(state.adminTab==='appeals_log') tabContent = renderAppealsLog();

  const emergencyModal = state.showEmergencyModal?h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'380px',width:'100%',border:'2px solid var(--pink)'}},
      h('div',{className:'mhdr',style:{borderColor:'var(--pink)44'}},
        h('span',{className:'mtag',style:{color:'var(--pink)'}},'⚠ 긴급 정지 확인'),
        h('button',{className:'xbtn',onClick:()=>setState({showEmergencyModal:false})},'✕')
      ),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--pink)',marginBottom:'16px',lineHeight:'1.8'}},'모든 일반 사용자의 서비스 이용이 즉시 중단됩니다.'),
        field('관리자 비밀번호','',h('input',{className:'inp',type:'password',value:state.emergencyPw,onInput:e=>setQ({emergencyPw:e.target.value})})),
        consentRow('위 내용을 이해하고 긴급 정지를 실행합니다',state.emergencyConfirm,v=>setState({emergencyConfirm:v})),
        h('button',{className:'cpbtn danger',style:{width:'100%',marginTop:'14px',padding:'12px'},disabled:!state.emergencyConfirm,
          onClick:()=>{
            if(state.emergencyPw!=='admin1234!'){showToast('비밀번호가 틀렸습니다','error');return;}
            ls.set('cp_emergency',true);setState({emergency:true,showEmergencyModal:false});
            showToast('⚠ 긴급 정지 활성화됨','error');
          }},'⚠ 긴급 정지 활성화')
      )
    )
  ):null;

  const repairModal = state.showRepairModal?h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'380px',width:'100%',border:'2px solid #ff6600'}},
      h('div',{className:'mhdr',style:{borderColor:'#ff660044'}},
        h('span',{className:'mtag',style:{color:'#ff6600'}},'🔧 수리 모드 확인'),
        h('button',{className:'xbtn',onClick:()=>setState({showRepairModal:false})},'✕')
      ),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'#ff8800',marginBottom:'16px',lineHeight:'1.8'}},
          '수리 모드를 활성화하면 모든 일반 사용자에게 \"수리 중입니다\" 화면이 표시됩니다.'),
        field('관리자 비밀번호','',h('input',{className:'inp',type:'password',value:state.repairPw,onInput:e=>setQ({repairPw:e.target.value})})),
        h('button',{className:'cpbtn',style:{width:'100%',marginTop:'14px',padding:'12px',background:'#ff6600',color:'#000',fontFamily:'var(--mono)',fontSize:'12px',border:'none',cursor:'pointer'},
          onClick:()=>{
            if(state.repairPw!=='admin1234!'){showToast('비밀번호가 틀렸습니다','error');return;}
            ls.set('cp_repair',true);setState({repair:true,showRepairModal:false,repairPw:''});
            showToast('🔧 수리 모드 활성화됨','warning');
          }},'🔧 수리 모드 활성화')
      )
    )
  ):null;

  const adminTabs = [
    ['problems','📁 문제 DB'],
    ['pending','⏳ 심의 대기'+(pending.length>0?' ('+pending.length+')':'')],
    ['members','👥 회원'],
    ['reports','🚨 신고'+(reports.filter(r=>r.status==='pending').length>0?' ('+reports.filter(r=>r.status==='pending').length+')':'')],
    ['sys_stats','📊 시스템'],
    ['appeals_log','📋 어필 로그'],
  ];

  return h('div',{style:{minHeight:'100vh',background:'#010308',color:'var(--text)'}},
    h('div',{style:{background:'#020912',borderBottom:'1px solid #ff003c33',padding:'0 24px',display:'flex',alignItems:'stretch',gap:'0'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 0',flex:'1'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'13px',color:'var(--pink)',letterSpacing:'2px',fontWeight:'700'}},'⚙ BRAINHACK'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'#ff003c66',border:'1px solid #ff003c33',padding:'2px 8px'}},'ADMIN CONSOLE v2'),
      ),
      h('div',{style:{display:'flex',gap:'6px',alignItems:'center',padding:'8px 0'}},
        state.repair ? h('button',{className:'cpbtn ghost sm',style:{borderColor:'#ff6600',color:'#ff6600'},
          onClick:()=>{ls.set('cp_repair',false);setState({repair:false});showToast('🔧 수리 모드 해제','info');}},'🔧 수리 해제') :
          h('button',{className:'cpbtn ghost sm',style:{borderColor:'#ff660066',color:'#ff6600aa'},
            onClick:()=>setState({showRepairModal:true})},'🔧 REPAIR'),
        state.emergency ? h('button',{className:'cpbtn primary sm',
          onClick:()=>{ls.set('cp_emergency',false);setState({emergency:false});}},'🔴 긴급 해제') :
          h('button',{className:'cpbtn danger sm',onClick:()=>setState({showEmergencyModal:true})},'⚠ 긴급 정지'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({currentUser:null,screen:'home'})},'LOGOUT')
      )
    ),
    state.repair ? h('div',{style:{background:'#1a0800',border:'1px solid #ff6600',borderLeft:'none',borderRight:'none',
      padding:'10px 24px',fontFamily:'var(--mono)',fontSize:'12px',color:'#ff8800',display:'flex',alignItems:'center',gap:'10px'}},
      '🔧 수리 모드 활성 — 일반 사용자에게 \"수리 중\" 화면 표시됨') : null,
    state.emergency ? h('div',{style:{background:'#1a0000',border:'1px solid var(--pink)',borderLeft:'none',borderRight:'none',
      padding:'10px 24px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--pink)',display:'flex',alignItems:'center',gap:'10px'}},
      '⚠ 긴급 정지 활성 — 모든 일반 사용자 접근 차단됨') : null,
    h('div',{style:{display:'flex',gap:'2px',padding:'0 24px',marginTop:'12px',flexWrap:'wrap'}},
      ...adminTabs.map(([k,l])=>
        h('button',{style:{
          background:state.adminTab===k?'var(--cyan)':'transparent',
          color:state.adminTab===k?'#000':'var(--dim)',
          border:'1px solid '+(state.adminTab===k?'var(--cyan)':'var(--border)'),
          fontFamily:'var(--mono)',fontSize:'10px',padding:'7px 14px',cursor:'pointer',
          letterSpacing:'1px',transition:'all .2s',marginBottom:'4px',fontWeight:state.adminTab===k?'700':'400'},
          onClick:()=>setState({adminTab:k})},l)
      )
    ),
    h('div',{style:{padding:'20px 24px'}},tabContent),
    emergencyModal, repairModal, state.adminProblemDraft ? renderAdminProblemEditor() : null
  );
}

// ═══ MAIN RENDER ═══
      Section('// 문제 카테고리 분포', [barChart(catData, catMax, 80)]),
      Section('// 난이도 분포', [barChart(diffs, diffMax, 80)])
    ),
    Section('// 최근 7일 출석 활동', [barChart(days7, dayMax, 80)]),
    rankDist.length > 0 ? Section('// 등급 분포', [barChart(rankDist, rankMax, 80)]) : null,
    // 활동 로그 다운로드/복구
    Section('// 활동 로그 & 데이터 관리', [
      h('div',{style:{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>{
          const log = JSON.parse(localStorage.getItem('cp_Log')||'[]');
          const users2 = ls.get('cp_users',[]);
          const clubs2 = ls.get('cp_clubs',[]);
          const problems2 = ls.get('cp_problems',[]);
          const full = {log, users:users2, clubs:clubs2, problems:problems2, exportedAt:new Date().toISOString()};
          const blob = new Blob([JSON.stringify(full,null,2)],{type:'application/json'});
          const a = document.createElement('a');
          a.href=URL.createObjectURL(blob);
          a.download='brainhack_backup_'+Date.now()+'.json';
          a.click();
          showToast('전체 데이터 다운로드 완료','success');
        }},'💾 전체 데이터 JSON 다운로드'),
        h('button',{className:'cpbtn danger sm',onClick:()=>{
          if(!confirm('⚠ 활동 로그를 초기화하겠습니까?')) return;
          localStorage.setItem('cp_Log','[]');
          showToast('활동 로그가 초기화되었습니다','info');
        }},'🗑 로그 초기화')
      ),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--dim)'}},
        '총 로그: '+(JSON.parse(localStorage.getItem('cp_Log')||'[]')).length+'건',h('br',{}),
        'JSON 파일 업로드로 전체 복구:',
        h('input',{type:'file',accept:'.json',className:'inp',style:{marginTop:'6px'},onChange:e=>{
          const file=e.target.files[0]; if(!file) return;
          const reader=new FileReader();
          reader.onload=ev=>{
            try {
              const data=JSON.parse(ev.target.result);
              if(data.users) ls.set('cp_users',data.users);
              if(data.problems) saveProblems(data.problems);
              if(data.clubs) saveClubs(data.clubs);
              if(data.log) localStorage.setItem('cp_Log',JSON.stringify(data.log));
              showToast('전체 데이터 복구 완료!','success');
              render();
            } catch { showToast('파일 형식이 올바르지 않습니다','error'); }
          };
          reader.readAsText(file);
        }})
      )
    ]),
    // Debug info
    h('div',{style:{background:'#060e18',border:'1px solid #ffffff0a',padding:'14px 18px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'#3a6070',letterSpacing:'2px',marginBottom:'10px'}},'// RUNTIME INFO'),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'#2a4050',lineHeight:'2'}},
        'UA: '+navigator.userAgent.slice(0,50)+'...',h('br',{}),
        'TIMESTAMP: '+new Date().toISOString(),h('br',{}),
        'USER COUNT: '+users.length+' | PROBLEMS: '+probs.length+' | CLUBS: '+clubs.length,h('br',{}),
        'SCREEN: '+window.innerWidth+'×'+window.innerHeight,h('br',{}),
        'ONLINE: '+(navigator.onLine?'YES':'NO')+' | LANG: '+state.lang
      )
    )
  );
}

function renderAppealsLog() {
  const logs = ls.get('cp_appeal_logs',[]);
  const users = ls.get('cp_users',[]);
  const f = state.appealForm;

  const downloadTxt = () => {
    const lines = ['BRAINHACK APPEALS LOG', '='.repeat(60), ''];
    logs.forEach(l=>{
      lines.push(`[${new Date(l.timestamp).toLocaleString('ko-KR')}] [${l.type.toUpperCase()}]`);
      lines.push(`  USER: ${l.user} | ACTION: ${l.action}`);
      if(l.details) lines.push(`  DETAILS: ${l.details}`);
      if(l.by) lines.push(`  BY: ${l.by}`);
      lines.push('');
    });
    if(lines.length<=3) lines.push('(No log entries)');
    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='brainhack_appeals_'+Date.now()+'.txt';
    a.click(); URL.revokeObjectURL(url);
  };

  const applyAction = () => {
    const f = state.appealForm;
    if(!f.username.trim()){showToast('사용자명을 입력하세요','error');return;}
    if(!f.details.trim()){showToast('상세 내용을 입력하세요','error');return;}
    const allUsers = ls.get('cp_users',[]);
    const targetUser = allUsers.find(u=>u.username===f.username.trim());
    let actionResult = '';

    if(f.action==='unban') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,banned:false,banUntil:null}:u));
      actionResult = 'BAN_REMOVED';
    } else if(f.action==='clear_warnings') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,warnings:0}:u));
      actionResult = 'WARNINGS_CLEARED';
    } else if(f.action==='restore_coins') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      const amt = Math.max(0,parseInt(f.amount)||0);
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,coins:(u.coins||0)+amt}:u));
      actionResult = 'COINS_RESTORED:+'+amt;
    } else if(f.action==='restore_xp') {
      if(!targetUser){showToast('사용자를 찾을 수 없습니다','error');return;}
      const amt = Math.max(0,parseInt(f.amount)||0);
      ls.set('cp_users', allUsers.map(u=>u.username===f.username.trim()?{...u,xp:(u.xp||0)+amt}:u));
      actionResult = 'XP_RESTORED:+'+amt;
    } else if(f.action==='note') {
      actionResult = 'NOTE';
    }

    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: f.action==='note'?'info':'restore',
      user: f.username.trim(),
      action: actionResult || f.action.toUpperCase(),
      details: f.details.trim(),
      by: state.currentUser?.username||'admin'
    };
    addAppealLog(entry);
    setState({appealForm:{username:'',action:'unban',details:'',amount:0}});
    showToast('어필 로그 저장 완료','success');
  };

  const typeColors = {restore:'var(--green)',info:'var(--cyan)',error:'var(--pink)',note:'var(--yellow)'};

  const activityLogs = JSON.parse(localStorage.getItem('cp_Log')||'[]');
  return h('div',{style:{padding:'4px 0'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--cyan)',letterSpacing:'2px'}},'// AUDIT TERMINAL'),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)'}},(logs.length + activityLogs.length)+' entries'),
      h('button',{className:'cpbtn ghost sm',style:{marginLeft:'auto',fontSize:'10px'},onClick:downloadTxt},'⬇ .txt 다운로드')
    ),
    // Terminal log
    h('div',{style:{background:'#010503',border:'1px solid #00ff4133',padding:'12px 14px',height:'400px',overflowY:'auto',
      fontFamily:'var(--mono)',fontSize:'11px',marginBottom:'16px',position:'relative'}},
      h('div',{style:{color:'#00ff41',marginBottom:'8px',borderBottom:'1px solid #00ff4122',paddingBottom:'6px'}},
        '> BRAINHACK REALTIME ACTIVITY & APPEALS LOG | '+new Date().toLocaleString('ko-KR')),
      (logs.length===0 && activityLogs.length===0) ? h('div',{style:{color:'#1a4030',marginTop:'20px',textAlign:'center'}},'[ NO LOG ENTRIES ]') :
      [...logs.map(l=>({...l, logType:'appeal'})), ...activityLogs.map(l=>({...l, logType:'activity', timestamp:l.time}))]
        .sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))
        .map(l=>{
          if(l.logType==='appeal') {
            const col = typeColors[l.type]||'var(--dim)';
            return h('div',{style:{marginBottom:'8px',borderLeft:'2px solid '+col+'44',paddingLeft:'8px'}},
              h('div',{style:{color:'#3a6050',fontSize:'9px'}},'[APPEAL] '+new Date(l.timestamp).toLocaleString('ko-KR')+' | by '+l.by),
              h('div',{style:{color:col,marginTop:'1px'}},
                '[',h('span',{style:{color:'#00ff41'}},'@'+l.user),'] ',
                h('span',{style:{color:'var(--yellow)'}},'ACTION: '+l.action)
              ),
              l.details ? h('div',{style:{color:'var(--dim)',fontSize:'10px',marginTop:'2px'}},'  └ '+l.details) : null
            );
          } else {
            return h('div',{style:{marginBottom:'8px',borderLeft:'2px solid var(--cyan)44',paddingLeft:'8px'}},
              h('div',{style:{color:'#3a6050',fontSize:'9px'}},'[ACTIVITY] '+new Date(l.timestamp).toLocaleString('ko-KR')),
              h('div',{style:{color:'var(--cyan)',marginTop:'1px'}},
                '[',h('span',{style:{color:'#00ff41'}},'@'+l.user),'] ',
                h('span',{style:{color:'var(--text)'}},'EVENT: '+l.type)
              ),
              l.data ? h('div',{style:{color:'var(--dim)',fontSize:'10px',marginTop:'2px'}},'  └ '+JSON.stringify(l.data)) : null
            );
          }
        })
    ),
    // Input form
    h('div',{style:{background:'#060e18',border:'1px solid var(--border)',padding:'18px'}},
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',letterSpacing:'2px',marginBottom:'14px'}},'// 어필 처리 입력'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
        h('div',{},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'대상 유저명'),
          h('input',{className:'inp',placeholder:'username',value:f.username,
            onInput:e=>setQ({appealForm:{...state.appealForm,username:e.target.value}})})
        ),
        h('div',{},
          h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'처리 유형'),
          h('select',{className:'inp',value:f.action,onChange:e=>setState({appealForm:{...f,action:e.target.value}})},
            ...['unban','clear_warnings','restore_coins','restore_xp','note'].map(v=>{
              const labels={unban:'밴 해제',clear_warnings:'경고 초기화',restore_coins:'코인 복구',restore_xp:'XP 복구',note:'메모/기록'};
              const o=document.createElement('option'); o.value=v; o.textContent=labels[v]||v; return o;
            })
          )
        )
      ),
      (f.action==='restore_coins'||f.action==='restore_xp') ? h('div',{style:{marginBottom:'10px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},
          f.action==='restore_coins'?'복구 코인 수량':'복구 XP 수량'),
        h('input',{className:'inp',type:'number',min:'0',value:f.amount,style:{width:'120px'},
          onInput:e=>setQ({appealForm:{...state.appealForm,amount:Math.max(0,parseInt(e.target.value)||0)}})})
      ) : null,
      h('div',{style:{marginBottom:'12px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginBottom:'5px'}},'상세 내용 / 사유 *'),
        h('textarea',{className:'inp',rows:'3',placeholder:'처리 사유 및 상세 내용을 입력하세요 (로그에 영구 기록됨)',
          value:f.details,style:{resize:'vertical'},
          onInput:e=>setQ({appealForm:{...state.appealForm,details:e.target.value}})})
      ),
      h('button',{className:'cpbtn primary',style:{padding:'10px 24px'},onClick:applyAction},'✓ 처리 및 로그 기록')
    )
  );
}


const ADMIN_PROBLEM_CATEGORIES = ['수학','논리','언어','창의','상식','과학','역사','기타'];
function defaultAdminProblemDraft(problem) {
  return {
    category: '기타', difficulty: 3, question: '', questionImage: '',
    hint: '', answer: '', explanation: '', explanationImage: '',
    timeLimit: 60, xp: 20, coins: 10,
    ...(problem || {})
  };
}
function openAdminProblemEditor(problem) {
  setState({
    adminProblemEditingId: problem ? problem.id : null,
    adminProblemDraft: defaultAdminProblemDraft(problem),
    adminProblemError: ''
  });
}
function updateAdminProblemDraft(key, value, rerender) {
  state.adminProblemDraft = { ...(state.adminProblemDraft || defaultAdminProblemDraft()), [key]: value };
  if(rerender) setState({ adminProblemDraft: state.adminProblemDraft });
}
function readAdminProblemImage(file, key) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => updateAdminProblemDraft(key, e.target.result, true);
  reader.readAsDataURL(file);
}
function saveAdminProblemDraft() {
  const d = defaultAdminProblemDraft(state.adminProblemDraft);
  if(!String(d.question || '').trim()) { setState({adminProblemError:'문제 내용을 입력해주세요'}); return; }
  if(!String(d.answer || '').trim()) { setState({adminProblemError:'정답을 입력해주세요'}); return; }
  const item = {
    ...d,
    id: state.adminProblemEditingId || d.id || Date.now(),
    category: ADMIN_PROBLEM_CATEGORIES.includes(d.category) ? d.category : '기타',
    difficulty: Math.min(5, Math.max(1, Number(d.difficulty) || 3)),
    question: String(d.question || '').trim(),
    questionImage: d.questionImage || '',
    hint: String(d.hint || '').trim(),
    answer: String(d.answer || '').trim(),
    explanation: String(d.explanation || '').trim(),
    explanationImage: d.explanationImage || '',
    timeLimit: Math.max(5, Number(d.timeLimit) || 60),
    xp: Math.max(0, Number(d.xp) || 0),
    coins: Math.max(0, Number(d.coins) || 0),
    status: 'approved'
  };
  const probs = ls.get('cp_problems', PROBLEMS_DEFAULT);
  const isEdit = !!state.adminProblemEditingId;
  const next = isEdit
    ? probs.map(p => p.id === state.adminProblemEditingId ? item : p)
    : [...probs, item];
  ls.set('cp_problems', next);
  setState({problems: next, adminProblemEditingId:null, adminProblemDraft:null, adminProblemError:''});
  showToast(isEdit ? '문제가 수정되었습니다' : '새 문제가 추가되었습니다', 'success');
}
function renderAdminProblemEditor() {
  const d = defaultAdminProblemDraft(state.adminProblemDraft);
  const numberInput = (label, key, min) => field(label, '', h('input', {className:'inp', type:'number', min:String(min), value:d[key], onInput:e=>updateAdminProblemDraft(key, e.target.value, false)}));
  const imageControl = (label, key) => h('div', {style:{marginBottom:'16px'}},
    h('div',{className:'slabel',style:{marginBottom:'6px'}}, label),
    d[key] ? h('div',{style:{marginBottom:'8px',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
      h('img',{src:d[key],style:{maxWidth:'160px',maxHeight:'100px',border:'1px solid var(--border)',objectFit:'contain',background:'var(--panel)'}}),
      h('button',{className:'cpbtn danger sm',onClick:()=>updateAdminProblemDraft(key,'',true)},'이미지 삭제')
    ) : null,
    h('input',{className:'inp',type:'file',accept:'image/*',onChange:e=>readAdminProblemImage(e.target.files[0], key)})
  );
  return h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'680px',width:'100%',maxHeight:'90vh',display:'flex',flexDirection:'column'}},
      h('div',{className:'mhdr'},
        h('span',{className:'mtag'}, state.adminProblemEditingId ? '// 문제 편집' : '// 새 문제 추가'),
        h('button',{className:'xbtn',onClick:()=>setState({adminProblemEditingId:null,adminProblemDraft:null,adminProblemError:''})},'✕')
      ),
      h('div',{style:{padding:'20px',overflowY:'auto'}},
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}},
          field('카테고리 선택','',h('select',{className:'inp',value:d.category,onChange:e=>updateAdminProblemDraft('category',e.target.value,true)},
            ...ADMIN_PROBLEM_CATEGORIES.map(c=>h('option',{value:c},c))
          )),
          h('div',{},
            h('div',{className:'slabel',style:{marginBottom:'6px'}},'난도 1~5'),
            h('div',{style:{display:'flex',gap:'4px',height:'36px',alignItems:'center'}},
              ...[1,2,3,4,5].map(n=>h('button',{className:'nbtn'+(Number(d.difficulty)>=n?' on':''),style:{fontSize:'14px',padding:'6px 10px'},onClick:()=>updateAdminProblemDraft('difficulty',n,true)},'★'))
            )
          )
        ),
        field('문제 내용','',h('textarea',{className:'inp',rows:'4',placeholder:'문제 내용을 입력하세요',value:d.question,onInput:e=>updateAdminProblemDraft('question',e.target.value,false)})),
        imageControl('문제 사진 업로드 (base64 인라인 저장)', 'questionImage'),
        field('힌트','',h('textarea',{className:'inp',rows:'2',placeholder:'힌트를 입력하세요',value:d.hint,onInput:e=>updateAdminProblemDraft('hint',e.target.value,false)})),
        field('정답','',h('input',{className:'inp',placeholder:'정답',value:d.answer,onInput:e=>updateAdminProblemDraft('answer',e.target.value,false)})),
        field('해설','',h('textarea',{className:'inp',rows:'3',placeholder:'해설을 입력하세요',value:d.explanation,onInput:e=>updateAdminProblemDraft('explanation',e.target.value,false)})),
        imageControl('해설 이미지 업로드 (base64 인라인 저장)', 'explanationImage'),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}},
          numberInput('제한시간(초)', 'timeLimit', 5),
          numberInput('XP', 'xp', 0),
          numberInput('코인', 'coins', 0)
        ),
        state.adminProblemError ? h('div',{className:'errmsg',style:{marginTop:'8px'}},'⚠ '+state.adminProblemError) : null,
        h('div',{style:{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'18px'}},
          h('button',{className:'cpbtn ghost',onClick:()=>setState({adminProblemEditingId:null,adminProblemDraft:null,adminProblemError:''})},'취소'),
          h('button',{className:'cpbtn primary',onClick:saveAdminProblemDraft}, state.adminProblemEditingId ? '수정 저장' : '문제 추가')
        )
      )
    )
  );
}

function renderAdmin() {
  const problems2 = ls.get('cp_problems',PROBLEMS_DEFAULT);
  const pending = ls.get('cp_pending',[]);
  const users = ls.get('cp_users',[]);
  const reports = ls.get('cp_reports',[]);
  const BAN_OPTIONS=[{label:'30분',value:1800},{label:'1시간',value:3600},{label:'1일',value:86400},{label:'1주일',value:604800},{label:'영구',value:'permanent'}];

  const approvePending = item=>{
    const probs=ls.get('cp_problems',PROBLEMS_DEFAULT);
    ls.set('cp_problems',[...probs,{...item,status:'approved',id:Date.now()}]);
    ls.set('cp_pending',pending.filter(p=>p.id!==item.id));
    render();
  };
  const rejectPending = id=>{ ls.set('cp_pending',pending.filter(p=>p.id!==id)); render(); };
  const banUser = (username,duration)=>{
    const banUntil=duration==='permanent'?null:new Date(Date.now()+duration*1000).toISOString();
    ls.set('cp_users',users.map(u=>u.username===username?{...u,banned:true,banUntil}:u)); render();
  };
  const unbanUser = username=>{ ls.set('cp_users',users.map(u=>u.username===username?{...u,banned:false,banUntil:null}:u)); render(); };
  const delProblem = id=>{ ls.set('cp_problems',ls.get('cp_problems',[]).filter(x=>x.id!==id)); render(); };
  const probs = ls.get('cp_problems',PROBLEMS_DEFAULT);

  let tabContent;
  if(state.adminTab==='problems') tabContent = h('div',{},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('span',{className:'sec-title'},'// 문제 데이터베이스 — '+probs.length+'건'),
      h('button',{className:'cpbtn ghost sm',onClick:()=>openAdminProblemEditor(null)},'+ 새 문제 추가')
    ),
    ...probs.map(p=>h('div',{className:'prow'},
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',minWidth:'40px'}},'#'+String(p.id).slice(-4)),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',background:'#00f5ff12',padding:'2px 8px',minWidth:'50px'}},p.category),
      h('span',{style:{flex:'1',fontSize:'13px',fontWeight:'600',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},p.question),
      h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)',marginRight:'8px'}},'★'.repeat(p.difficulty)),
      h('button',{className:'cpbtn ghost sm',onClick:()=>openAdminProblemEditor(p)},'편집'),
      h('button',{className:'cpbtn danger sm',onClick:()=>delProblem(p.id)},'삭제')
    ))
  );
  else if(state.adminTab==='pending') tabContent = h('div',{},
    h('span',{className:'sec-title',style:{display:'block',marginBottom:'14px'}},'// 심의 대기 문제 — '+pending.length+'건'),
    pending.length===0?h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',padding:'40px'}},'대기 중인 문제 없음'):null,
    ...pending.map(p=>h('div',{style:{background:'var(--panel)',border:'1px solid #ffcc0033',padding:'14px',marginBottom:'10px'}},
      h('div',{style:{display:'flex',gap:'8px',marginBottom:'8px',alignItems:'center'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--cyan)',background:'#00f5ff12',padding:'2px 8px'}},p.category),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'◆'.repeat(p.difficulty)),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginLeft:'auto'}},'by @'+p.submitter)
      ),
      h('div',{style:{fontSize:'14px',fontWeight:'600',marginBottom:'4px'}},p.question),
      h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--green)',marginBottom:'10px'}},'정답: '+p.answer),
      h('div',{style:{display:'flex',gap:'8px'}},
        h('button',{className:'cpbtn secondary sm',onClick:()=>approvePending(p)},'✓ 승인'),
        h('button',{className:'cpbtn danger sm',onClick:()=>rejectPending(p.id)},'✗ 반려')
      )
    ))
  );
  else if(state.adminTab==='members') tabContent = h('div',{},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}},
      h('span',{className:'sec-title'},'// 회원 관리 — '+users.length+'명'),
      h('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
        statCard(users.length,'TOTAL','var(--cyan)'),
        statCard(users.filter(u=>u.banned).length,'BANNED','var(--pink)'),
        statCard(users.filter(u=>!u.banned).length,'ACTIVE','var(--green)')
      )
    ),
    ...users.map(u=>h('div',{style:{background:'var(--panel)',border:'1px solid '+(u.banned?'#ff003c33':'var(--border)'),
      padding:'12px 16px',marginBottom:'6px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}},
      h('span',{style:{fontSize:'18px'}},u.char||'🧑'),
      h('span',{style:{fontSize:'14px'}},u.flag||'🌍'),
      h('div',{style:{flex:'1',minWidth:'120px'}},
        h('div',{style:{fontWeight:'700'}},u.nickname||u.username),
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)'}},'@'+u.username+' · XP '+(u.xp||0)+' · ⚠ '+(u.warnings||0)+' · 💰'+(u.coins||0))
      ),
      rankBadge(u.xp||0,true),
      h('button',{className:'cpbtn secondary sm',onClick:()=>setState({adminMemberManage:u.username})},'관리'),
      u.banned?h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--pink)',border:'1px solid var(--pink)44',padding:'2px 6px'}},'BANNED'):null
    )),
    state.adminMemberManage ? (()=>{
      const mu = users.find(x=>x.username===state.adminMemberManage);
      if(!mu) return null;
      return h('div',{className:'overlay'},
        h('div',{className:'modal-box',style:{maxWidth:'500px'}},
          h('div',{className:'mhdr'},
            h('span',{className:'mtag'},'// 회원 상세 관리: @'+mu.username),
            h('button',{className:'xbtn',onClick:()=>setState({adminMemberManage:null})},'✕')
          ),
          h('div',{style:{padding:'20px',overflowY:'auto',maxHeight:'80vh'}},
            // 재화 관리
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'코인 관리 ('+(mu.coins||0)+')'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('input',{className:'inp',type:'number',placeholder:'금액',id:'adminCoinAmt'}),
                h('button',{className:'cpbtn primary sm',onClick:()=>{
                  const val = parseInt(document.getElementById('adminCoinAmt').value)||0;
                  const nextUsers = users.map(x=>x.username===mu.username?{...x,coins:(x.coins||0)+val}:x);
                  ls.set('cp_users',nextUsers); 
                  if(state.currentUser.username===mu.username) setState({currentUser:{...state.currentUser, coins:(state.currentUser.coins||0)+val}});
                  setState({adminMemberManage:mu.username});
                  addActivityLog('admin_coins_adjust',{target:mu.username, amount:val});
                  addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'COINS_ADJUST:'+val,details:'관리자 조정',by:state.currentUser.username});
                  showToast('코인이 조정되었습니다','success');
                }},'지급/회수')
              )
            ),
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'XP 관리 ('+(mu.xp||0)+')'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('input',{className:'inp',type:'number',placeholder:'경험치',id:'adminXpAmt'}),
                h('button',{className:'cpbtn secondary sm',onClick:()=>{
                  const val = parseInt(document.getElementById('adminXpAmt').value)||0;
                  const nextUsers = users.map(x=>x.username===mu.username?{...x,xp:(x.xp||0)+val}:x);
                  ls.set('cp_users',nextUsers);
                  if(state.currentUser.username===mu.username) setState({currentUser:{...state.currentUser, xp:(state.currentUser.xp||0)+val}});
                  setState({adminMemberManage:mu.username});
                  addActivityLog('admin_xp_adjust',{target:mu.username, amount:val});
                  addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'XP_ADJUST:'+val,details:'관리자 조정',by:state.currentUser.username});
                  showToast('XP가 조정되었습니다','success');
                }},'지급/회수')
              )
            ),
            // 아이템 관리
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'아이템 지급'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('select',{className:'inp',id:'adminItemSelect'},
                  ...SHOP_ITEMS.map(it=>h('option',{value:it.id},it.name+' ('+it.type+')'))
                ),
                h('button',{className:'cpbtn ghost sm',onClick:()=>{
                  const itemId = document.getElementById('adminItemSelect').value;
                  const item = SHOP_ITEMS.find(it=>it.id===itemId);
                  if(!mu.inventory?.includes(itemId)) {
                    const nextUsers = users.map(x=>x.username===mu.username?{...x,inventory:[...(x.inventory||[]),itemId]}:x);
                    ls.set('cp_users',nextUsers);
                    if(state.currentUser.username===mu.username) setState({currentUser:{...state.currentUser, inventory:[...(state.currentUser.inventory||[]),itemId]}});
                    setState({adminMemberManage:mu.username});
                    addActivityLog('admin_item_given',{target:mu.username, itemId});
                    addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'ITEM_GIVEN:'+itemId,details:'관리자 지급',by:state.currentUser.username});
                    showToast(item.name+' 지급 완료','success');
                  } else { showToast('이미 보유 중인 아이템입니다','info'); }
                }},'지급')
              )
            ),
            h('div',{style:{marginBottom:'20px'}},
              h('div',{className:'slabel'},'보유 아이템 (회수)'),
              h('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap'}},
                ...(mu.inventory||[]).map(id=>{
                  const it = SHOP_ITEMS.find(x=>x.id===id);
                  return h('button',{className:'nbtn',style:{fontSize:'10px',borderColor:'var(--pink)',color:'var(--pink)'},
                    onClick:()=>{
                      const nextUsers = users.map(x=>x.username===mu.username?{...x,inventory:(x.inventory||[]).filter(y=>y!==id),equipped:Object.fromEntries(Object.entries(x.equipped||{}).map(([k,v])=>[k,v===id?'':v]))}:x);
                      ls.set('cp_users',nextUsers);
                      if(state.currentUser.username===mu.username) {
                        const nextEquipped = Object.fromEntries(Object.entries(state.currentUser.equipped||{}).map(([k,v])=>[k,v===id?'':v]));
                        setState({currentUser:{...state.currentUser, inventory:(state.currentUser.inventory||[]).filter(y=>y!==id), equipped:nextEquipped}});
                      }
                      setState({adminMemberManage:mu.username});
                      addActivityLog('admin_item_removed',{target:mu.username, itemId:id});
                      addAppealLog({id:Date.now(),timestamp:new Date().toISOString(),type:'restore',user:mu.username,action:'ITEM_REMOVED:'+id,details:'관리자 회수',by:state.currentUser.username});
                      showToast((it?.name||id)+' 회수 완료','info');
                    }},(it?.icon||'')+' '+(it?.name||id)+' ✕');
                })
              )
            ),
            // 제재 관리
            h('div',{},
              h('div',{className:'slabel'},'계정 상태 제재'),
              h('div',{style:{display:'flex',gap:'8px'}},
                h('select',{className:'inp',style:{width:'auto'},
                  onChange:e=>{ if(e.target.value){banUser(mu.username,e.target.value==='permanent'?'permanent':Number(e.target.value));e.target.value=''; setState({adminMemberManage:mu.username});}}},
                  h('option',{value:'',disabled:true},'제재 선택'),
                  ...BAN_OPTIONS.map(o=>{ const op=document.createElement('option'); op.value=o.value; op.textContent=o.label+' 정지'; return op; })
                ),
                mu.banned?h('button',{className:'cpbtn ghost sm',onClick:()=>{unbanUser(mu.username);setState({adminMemberManage:mu.username});}},'밴 해제'):null
              )
            )
          )
        )
      );
    })() : null
  );
  else if(state.adminTab==='reports') tabContent = h('div',{},
    h('span',{className:'sec-title',style:{display:'block',marginBottom:'14px'}},'// 신고 처리 — '+reports.filter(r=>r.status==='pending').length+'건 대기'),
    reports.length===0?h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',textAlign:'center',padding:'40px'}},'신고 없음'):null,
    ...reports.map(r=>h('div',{style:{background:'var(--panel)',border:'1px solid '+(r.status==='pending'?'var(--yellow)33':'var(--border)'),padding:'12px 16px',marginBottom:'8px'}},
      h('div',{style:{display:'flex',gap:'10px',alignItems:'center',marginBottom:'4px'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--pink)'}},'@'+r.target),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--yellow)'}},'사유: '+r.reason),
        r.type ? h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--cyan)',border:'1px solid var(--cyan)22',padding:'1px 5px'}},r.type) : null,
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--dim)',marginLeft:'auto'}},'by @'+r.reporter)
      ),
      r.status==='pending'?h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
        h('button',{className:'cpbtn danger sm',onClick:()=>{banUser(r.target,3600);ls.set('cp_reports',reports.map(x=>x.id===r.id?{...x,status:'processed'}:x));render();}},'1시간 제재'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>{ls.set('cp_reports',reports.map(x=>x.id===r.id?{...x,status:'dismissed'}:x));render();}},'무시')
      ):h('span',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginTop:'4px',display:'block'}},r.status)
    ))
  );
  else if(state.adminTab==='sys_stats') tabContent = renderSysStats();
  else if(state.adminTab==='appeals_log') tabContent = renderAppealsLog();

  // Emergency modal
  const emergencyModal = state.showEmergencyModal?h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'380px',width:'100%',border:'2px solid var(--pink)'}},
      h('div',{className:'mhdr',style:{borderColor:'var(--pink)44'}},
        h('span',{className:'mtag',style:{color:'var(--pink)'}},'⚠ 긴급 정지 확인'),
        h('button',{className:'xbtn',onClick:()=>setState({showEmergencyModal:false})},'✕')
      ),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--pink)',marginBottom:'16px',lineHeight:'1.8'}},'모든 일반 사용자의 서비스 이용이 즉시 중단됩니다.'),
        field('관리자 비밀번호','',h('input',{className:'inp',type:'password',value:state.emergencyPw,onInput:e=>setQ({emergencyPw:e.target.value})})),
        consentRow('위 내용을 이해하고 긴급 정지를 실행합니다',state.emergencyConfirm,v=>setState({emergencyConfirm:v})),
        h('button',{className:'cpbtn danger',style:{width:'100%',marginTop:'14px',padding:'12px'},disabled:!state.emergencyConfirm,
          onClick:()=>{
            if(state.emergencyPw!=='admin1234!'){showToast('비밀번호가 틀렸습니다','error');return;}
            ls.set('cp_emergency',true);setState({emergency:true,showEmergencyModal:false});
            showToast('⚠ 긴급 정지 활성화됨','error');
          }},'⚠ 긴급 정지 활성화')
      )
    )
  ):null;

  // Repair modal
  const repairModal = state.showRepairModal?h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'380px',width:'100%',border:'2px solid #ff6600'}},
      h('div',{className:'mhdr',style:{borderColor:'#ff660044'}},
        h('span',{className:'mtag',style:{color:'#ff6600'}},'🔧 수리 모드 확인'),
        h('button',{className:'xbtn',onClick:()=>setState({showRepairModal:false})},'✕')
      ),
      h('div',{style:{padding:'20px'}},
        h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'#ff8800',marginBottom:'16px',lineHeight:'1.8'}},
          '수리 모드를 활성화하면 모든 일반 사용자에게 "수리 중입니다" 화면이 표시됩니다.'),
        field('관리자 비밀번호','',h('input',{className:'inp',type:'password',value:state.repairPw,onInput:e=>setQ({repairPw:e.target.value})})),
        h('button',{className:'cpbtn',style:{width:'100%',marginTop:'14px',padding:'12px',background:'#ff6600',color:'#000',fontFamily:'var(--mono)',fontSize:'12px',border:'none',cursor:'pointer'},
          onClick:()=>{
            if(state.repairPw!=='admin1234!'){showToast('비밀번호가 틀렸습니다','error');return;}
            ls.set('cp_repair',true);setState({repair:true,showRepairModal:false,repairPw:''});
            showToast('🔧 수리 모드 활성화됨','warning');
          }},'🔧 수리 모드 활성화')
      )
    )
  ):null;

  // Admin tabs config
  const adminTabs = [
    ['problems','📁 문제 DB'],
    ['pending','⏳ 심의 대기'+(pending.length>0?' ('+pending.length+')':'')],
    ['members','👥 회원'],
    ['reports','🚨 신고'+(reports.filter(r=>r.status==='pending').length>0?' ('+reports.filter(r=>r.status==='pending').length+')':'')],
    ['sys_stats','📊 시스템'],
    ['appeals_log','📋 어필 로그'],
  ];

  return h('div',{style:{minHeight:'100vh',background:'#010308',color:'var(--text)'}},
    // Top bar
    h('div',{style:{background:'#020912',borderBottom:'1px solid #ff003c33',padding:'0 24px',display:'flex',alignItems:'stretch',gap:'0'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 0',flex:'1'}},
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'13px',color:'var(--pink)',letterSpacing:'2px',fontWeight:'700'}},'⚙ BRAINHACK'),
        h('span',{style:{fontFamily:'var(--mono)',fontSize:'9px',color:'#ff003c66',border:'1px solid #ff003c33',padding:'2px 8px'}},'ADMIN CONSOLE v2'),
      ),
      h('div',{style:{display:'flex',gap:'6px',alignItems:'center',padding:'8px 0'}},
        state.repair ? h('button',{className:'cpbtn ghost sm',style:{borderColor:'#ff6600',color:'#ff6600'},
          onClick:()=>{ls.set('cp_repair',false);setState({repair:false});showToast('🔧 수리 모드 해제','info');}},'🔧 수리 해제') :
          h('button',{className:'cpbtn ghost sm',style:{borderColor:'#ff660066',color:'#ff6600aa'},
            onClick:()=>setState({showRepairModal:true})},'🔧 REPAIR'),
        state.emergency ? h('button',{className:'cpbtn primary sm',
          onClick:()=>{ls.set('cp_emergency',false);setState({emergency:false});}},'🔴 긴급 해제') :
          h('button',{className:'cpbtn danger sm',onClick:()=>setState({showEmergencyModal:true})},'⚠ 긴급 정지'),
        h('button',{className:'cpbtn ghost sm',onClick:()=>setState({currentUser:null,screen:'home'})},'LOGOUT')
      )
    ),
    // Status banners
    state.repair ? h('div',{style:{background:'#1a0800',border:'1px solid #ff6600',borderLeft:'none',borderRight:'none',
      padding:'10px 24px',fontFamily:'var(--mono)',fontSize:'12px',color:'#ff8800',display:'flex',alignItems:'center',gap:'10px'}},
      '🔧 수리 모드 활성 — 일반 사용자에게 "수리 중" 화면 표시됨') : null,
    state.emergency ? h('div',{style:{background:'#1a0000',border:'1px solid var(--pink)',borderLeft:'none',borderRight:'none',
      padding:'10px 24px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--pink)',display:'flex',alignItems:'center',gap:'10px'}},
      '⚠ 긴급 정지 활성 — 모든 일반 사용자 접근 차단됨') : null,
    // Tab nav
    h('div',{style:{display:'flex',gap:'2px',padding:'0 24px',marginTop:'12px',flexWrap:'wrap'}},
      ...adminTabs.map(([k,l])=>
        h('button',{style:{
          background:state.adminTab===k?'var(--cyan)':'transparent',
          color:state.adminTab===k?'#000':'var(--dim)',
          border:'1px solid '+(state.adminTab===k?'var(--cyan)':'var(--border)'),
          fontFamily:'var(--mono)',fontSize:'10px',padding:'7px 14px',cursor:'pointer',
          letterSpacing:'1px',transition:'all .2s',marginBottom:'4px',fontWeight:state.adminTab===k?'700':'400'},
          onClick:()=>setState({adminTab:k})},l)
      )
    ),
    // Content
    h('div',{style:{padding:'20px 24px'}},tabContent),
    emergencyModal, repairModal, state.adminProblemDraft ? renderAdminProblemEditor() : null
  );
}

// ═══ MAIN RENDER ═══
