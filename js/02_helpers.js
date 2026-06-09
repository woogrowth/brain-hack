// ═══ HELPERS ═══
const ls = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const getRank = xp => {
  let r = RANKS[0];
  for(const x of RANKS) { if(xp >= x.minXp) r = x; }
  return r;
};
const getNextRank = xp => {
  for(const r of RANKS) { if(xp < r.minXp && r.id !== 'admin') return r; }
  return null;
};
const checkAchs = user => {
  const earned = user.achievements || [];
  return ACHIEVEMENTS.filter(a => !earned.includes(a.id) && a.cond(user)).map(a => a.id);
};
const filterBad = t => {
  let s = t;
  for(const w of BANNED_WORDS) s = s.replace(new RegExp(w, 'gi'), '***');
  return s;
};
