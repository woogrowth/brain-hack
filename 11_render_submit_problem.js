function renderSubmitProblemModal() {
  const f = state.submitForm;
  const up = (k,v) => setState({submitForm:{...state.submitForm,[k]:v}});
  const submit = async ()=>{
    const f = state.submitForm;
    if(!f.question||!f.answer){showToast('문제와 정답을 입력해주세요.','error');return;}
    setState({submitLoading:true});
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:400,
          messages:[{role:'user',content:'다음 퀴즈 문제를 검수해주세요. JSON으로만 답변하세요.\n문제: '+f.question+'\n정답: '+f.answer+'\n카테고리: '+f.category+'\n난이도: '+f.difficulty+'\n\n응답 형식: pass(true/false), reason(검수결과), suggestion(개선제안) 필드를 가진 JSON\n마크다운 없이 JSON만 반환하세요.'}]})
      });
      const d2 = await res.json();
      const raw = d2.content?.map(c=>c.text||'').join('')||'';
      const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
      setState({submitResult:parsed,submitLoading:false});
      if(parsed.pass){
        const pending=ls.get('cp_pending',[]);
        ls.set('cp_pending',[...pending,{...f,id:Date.now(),submitter:state.currentUser.username,status:'pending',submittedAt:new Date().toISOString()}]);
        updateUser({...state.currentUser,submitted:(state.currentUser.submitted||0)+1});
      }
    } catch(e){
      const fallback={pass:true,reason:'AI 검수 서버 미연결 - 수동 심의 대기',suggestion:''};
      setState({submitResult:fallback,submitLoading:false});
      const pending=ls.get('cp_pending',[]);
      ls.set('cp_pending',[...pending,{...f,id:Date.now(),submitter:state.currentUser.username,status:'pending',submittedAt:new Date().toISOString()}]);
      updateUser({...state.currentUser,submitted:(state.currentUser.submitted||0)+1});
    }
  };
  const resultView = state.submitResult?h('div',{style:{textAlign:'center',padding:'20px 0'}},
    h('div',{style:{fontSize:'48px',marginBottom:'12px'}},state.submitResult.pass?'✅':'❌'),
    h('div',{style:{fontFamily:'var(--display)',fontSize:'16px',color:state.submitResult.pass?'var(--green)':'var(--pink)',marginBottom:'12px'}},
      state.submitResult.pass?'AI 검수 통과 — 심의 대기 중':'AI 검수 반려'),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--dim)',lineHeight:'1.8',marginBottom:'16px'}},state.submitResult.reason),
    state.submitResult.suggestion?h('div',{style:{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--yellow)',marginBottom:'16px'}},'💡 '+state.submitResult.suggestion):null,
    h('button',{className:'cpbtn primary sm',onClick:()=>setState({modal:null,submitResult:null,submitForm:{category:'수학',difficulty:3,question:'',hint:'',answer:'',explanation:'',timeLimit:60}})},'확인')
  ):null;
  const formView = h('div',{},
    h('div',{style:{display:'flex',gap:'10px',marginBottom:'14px'}},
      h('div',{style:{flex:'1'}},h('div',{className:'slabel'},'카테고리'),
        h('select',{className:'inp',value:f.category,onChange:e=>up('category',e.target.value)},
          ...['수학','논리','언어','창의','상식'].map(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; return o; })
        )
      ),
      h('div',{style:{flex:'1'}},h('div',{className:'slabel'},'난이도 (1-5)'),
        h('select',{className:'inp',value:f.difficulty,onChange:e=>up('difficulty',Number(e.target.value))},
          ...[1,2,3,4,5].map(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; return o; })
        )
      )
    ),
    field('문제 내용','',h('textarea',{className:'inp',rows:'3',placeholder:'문제를 입력하세요',value:f.question,style:{resize:'vertical'},onInput:e=>setQ({submitForm:{...state.submitForm,question:e.target.value}})})),
    field('힌트 (선택)','',h('input',{className:'inp',placeholder:'힌트',value:f.hint,onInput:e=>setQ({submitForm:{...state.submitForm,hint:e.target.value}})})),
    field('정답','',h('input',{className:'inp',placeholder:'정답',value:f.answer,onInput:e=>setQ({submitForm:{...state.submitForm,answer:e.target.value}})})),
    field('풀이 설명','',h('textarea',{className:'inp',rows:'2',placeholder:'풀이 설명',value:f.explanation,style:{resize:'vertical'},onInput:e=>setQ({submitForm:{...state.submitForm,explanation:e.target.value}})})),
    h('button',{className:'cpbtn primary',style:{width:'100%',padding:'12px'},onClick:submit,disabled:state.submitLoading},
      state.submitLoading?'AI 검수 중...':'AI 자동 검수 후 제출 →'),
    h('div',{style:{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--dim)',marginTop:'10px',textAlign:'center'}},'제출 후 AI 검수 → 에메랄드 이상 심의 → 어드민 최종 승인 절차')
  );
  return h('div',{className:'overlay'},
    h('div',{className:'modal-box',style:{maxWidth:'560px',width:'100%',maxHeight:'90vh',overflowY:'auto'}},
      h('div',{className:'mhdr'},h('span',{className:'mtag'},'// 문제 제출'),h('button',{className:'xbtn',onClick:()=>setState({modal:null,submitResult:null})},'✕')),
      h('div',{style:{padding:'20px 24px'}},state.submitResult?resultView:formView)
    )
  );
}

// ═══ ADMIN (redesigned + sys_stats + appeals_log) ═══
