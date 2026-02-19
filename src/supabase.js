// Supabase REST API — no package needed, just fetch
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and Vercel env vars

const URL  = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HDR  = () => ({
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
  "Content-Type": "application/json",
});

export const supabaseConfigured = () => Boolean(URL && KEY);

export async function submitScore(username, game, score) {
  if (!username || score <= 0) return;
  try {
    await fetch("/api/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, game, score }),
    });
  } catch (_) { /* silent — never break the game */ }
}

export async function fetchAllScores() {
  if (!supabaseConfigured()) return [];
  try {
    const res = await fetch(
      `${URL}/rest/v1/scores?select=username,game,score&order=score.desc&limit=1000`,
      { headers: HDR() }
    );
    return res.ok ? res.json() : [];
  } catch (_) { return []; }
}

// Returns { byGame: { gameName: { username: highScore } }, overall: { username: totalScore } }
export function processScores(scores) {
  const byGame = {};
  for (const s of scores) {
    if (!byGame[s.game]) byGame[s.game] = {};
    if (!byGame[s.game][s.username] || byGame[s.game][s.username] < s.score)
      byGame[s.game][s.username] = s.score;
  }
  const overall = {};
  for (const gameScores of Object.values(byGame))
    for (const [user, sc] of Object.entries(gameScores))
      overall[user] = (overall[user] || 0) + sc;
  return { byGame, overall };
}

export function topOverallPlayer(scores) {
  const { overall } = processScores(scores);
  const entries = Object.entries(overall).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}
