// ═══ QUIZ LOGIC ═══
let quizInterval = null;

// 퀴즈 모드 선택 화면에서 호출
function startQuiz(mode) {
  if(!state.currentUser) {
    showToast("로그인 후 퀴즈를 이용할 수 있습니다", "error");
    setState({ modal: "login" });
    return;
  }
  if(!state.problems.length) return;
  if((state.emergency || state.repair) && !state.currentUser?.isAdmin) {
    showToast("⚠ 서비스 점검 중입니다", "error");
    return;
  }
  // 모드 없이 호출 → 모드 선택 화면
  if(!mode) { setState({ screen: 'quizMode' }); return; }

  addActivityLog('quiz_start', { mode });

  // 문제 풀 구성
  let pool = [];
  if(mode === 'random') {
    pool = [...state.problems].sort(() => Math.random() - 0.5).slice(0, 15);
  } else if(mode === 'infinite') {
    pool = [...state.problems].sort(() => Math.random() - 0.5);
  } else if(mode === 'popular') {
    pool = [...state.problems].sort((a, b) => (b.hearts||0) - (a.hearts||0));
  } else if(mode === 'wrongNote') {
    const wa = state.currentUser.wrongAnswers || [];
    pool = state.problems.filter(p => wa.includes(p.id));
    if(!pool.length) { showToast('오답 기록이 없습니다! 먼저 퀴즈를 풀어보세요', 'info'); return; }
  }
  if(!pool.length) return;

  const p = pool[0];
  clearInterval(quizInterval);
  setState({
    screen: 'quiz',
    quizMode: mode,
    quizIndex: 0,
    quizPool: pool,
    currentProblem: p,
    quizAns: '',
    quizDone: false,
    quizCorrect: null,
    quizHint: false,
    quizAppeal: false,
    quizAppealText: '',
    quizTimeLeft: p.timeLimit,
    session: { correct: 0, wrong: 0, score: 0, streak: 0 }
  });
  startTimer();
}

function startTimer() {
  clearInterval(quizInterval);
  quizInterval = setInterval(() => {
    if(state.quizDone) return;
    const newT = state.quizTimeLeft - 1;
    if(newT <= 0) { clearInterval(quizInterval); submitQuiz(true); }
    else setState({ quizTimeLeft: newT });
  }, 1000);
}

function nextProblem() {
  const mode = state.quizMode;
  const nextIdx = (state.quizIndex || 0) + 1;
  let pool = state.quizPool || [];

  // 15문제 모드 종료
  if(mode === 'random' && nextIdx >= 15) {
    const s = state.session;
    clearInterval(quizInterval);
    setState({ screen: 'home', quizAppeal: false });
    showToast(`🏁 퀴즈 완료! ✓${s.correct} ✗${s.wrong} 점수:${s.score}pts`, 'success');
    return;
  }

  // 오답노트 모두 완료
  if(mode === 'wrongNote' && nextIdx >= pool.length) {
    clearInterval(quizInterval);
    setState({ screen: 'home', quizAppeal: false });
    showToast('✅ 오답노트 완료! 모든 오답을 다시 풀었습니다 🎉', 'success');
    return;
  }

  // 풀 소진 시 재셔플
  if(nextIdx >= pool.length) {
    if(mode === 'popular') {
      pool = [...state.problems].sort((a, b) => (b.hearts||0) - (a.hearts||0));
    } else {
      pool = [...state.problems].sort(() => Math.random() - 0.5);
    }
    setState({ quizPool: pool });
  }

  const p = pool[nextIdx % pool.length] || pool[0];
  clearInterval(quizInterval);
  setState({
    currentProblem: p,
    quizAns: '',
    quizDone: false,
    quizCorrect: null,
    quizHint: false,
    quizAppeal: false,
    quizAppealText: '',
    quizTimeLeft: p.timeLimit,
    quizIndex: nextIdx
  });
  startTimer();
}

function submitQuiz(timeout = false) {
  clearInterval(quizInterval);
  const p = state.currentProblem;
  const ok = !timeout && state.quizAns.trim().toLowerCase() === p.answer.trim().toLowerCase();
  const newStreak = ok ? state.session.streak + 1 : 0;
  const bonusMulti = newStreak >= 7 ? 2 : newStreak >= 3 ? 1.5 : 1;

  // 포션 보너스 적용
  const hasXpPotion = state.currentUser?.activePotion === 'xp_potion';
  const hasCoinPotion = state.currentUser?.activePotion === 'coin_potion';
  const xpGain   = ok ? Math.round(p.xp * bonusMulti * (hasXpPotion ? 2 : 1)) : 0;
  const coinGain = ok ? Math.round((p.coins||10) * bonusMulti * (hasCoinPotion ? 2 : 1)) : 0;
  const ptGain   = ok ? p.difficulty * 20 : -5;

  const newSession = {
    correct: state.session.correct + (ok ? 1 : 0),
    wrong:   state.session.wrong   + (ok ? 0 : 1),
    score:   state.session.score   + ptGain,
    streak:  newStreak
  };

  setState({ quizDone: true, quizCorrect: ok, session: newSession });

  if(ok && newStreak > 0 && newStreak % 3 === 0)
    showToast(`🔥 ${newStreak}연속 정답! ×${bonusMulti} 보너스!`, "warning");

  if(state.currentUser && !state.currentUser.isAdmin) {
    // 오답 기록 관리
    let wrongAnswers = [...(state.currentUser.wrongAnswers || [])];
    if(!ok) {
      if(!wrongAnswers.includes(p.id)) wrongAnswers.push(p.id);
    } else {
      wrongAnswers = wrongAnswers.filter(id => id !== p.id);
    }

    // 랭크업 체크
    const prevRank = getRank(state.currentUser.xp || 0);
    const newXp = (state.currentUser.xp || 0) + xpGain;
    const newRank = getRank(newXp);
    if(newRank.id !== prevRank.id && xpGain > 0) {
      showToast(`🎉 랭크업! ${newRank.icon} ${newRank.label} 달성!`, 'success');
    }

    updateUser({
      ...state.currentUser,
      score:        Math.max(0, (state.currentUser.score || 0) + ptGain),
      xp:           newXp,
      coins:        (state.currentUser.coins || 0) + coinGain,
      streak:       newStreak,
      maxStreak:    Math.max(state.currentUser.maxStreak || 0, newStreak),
      solved:       [...new Set([...(state.currentUser.solved || []), p.id])],
      wrongAnswers: wrongAnswers,
      activePotion: null,
    });
    addActivityLog('quiz_submit', { problem: p.id, correct: ok, xp: xpGain, coins: coinGain });
  }
  // 자동 진행 제거 - 사용자가 "다음 문제" 버튼 클릭
}

function handleAttendance() {
  if(!state.currentUser || state.attended) return;
  const today = new Date().toDateString();
  const dates = state.currentUser.attendanceDates || [];
  if(dates.includes(today)) { showToast("이미 출석 완료!", "info"); return; }
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = dates.includes(yesterday) ? (state.currentUser.attendanceStreak || 0) + 1 : 1;
  const bonus = Math.min(newStreak * 10, 100);
  updateUser({
    ...state.currentUser,
    attendanceDates: [...dates, today],
    attendanceStreak: newStreak,
    coins: (state.currentUser.coins || 0) + bonus
  });
  setState({ attended: true });
  showToast(`📅 출석 완료! +${bonus} 코인 (${newStreak}일 연속)`, "success");
  addActivityLog('attendance', { streak: newStreak, bonus });
}

