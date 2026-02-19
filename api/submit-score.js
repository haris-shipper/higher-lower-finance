// Vercel serverless function — all score writes go through here.
// Validates game key + score range before touching the DB.
// Service key lives only in server env vars, never in the browser bundle.

const MAX_SCORES = {
  finance:     2500,
  connections: 1250,
  inbox:       6000,
  impostor:    4500,
  faces:       2500,
  whyear:      8500,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, game, score } = req.body || {};

  // Validate inputs
  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (!game || !(game in MAX_SCORES)) {
    return res.status(400).json({ error: "Invalid game" });
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score <= 0) {
    return res.status(400).json({ error: "Invalid score" });
  }
  if (score > MAX_SCORES[game]) {
    return res.status(400).json({ error: `Score exceeds maximum for ${game}` });
  }

  // Write to Supabase using the secret service key — never exposed to browser
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/scores`, {
    method: "POST",
    headers: {
      apikey:          process.env.SUPABASE_SERVICE_KEY,
      Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer:         "return=minimal",
    },
    body: JSON.stringify({ username: username.trim().toUpperCase().slice(0, 16), game, score }),
  });

  return r.ok
    ? res.status(200).json({ success: true })
    : res.status(500).json({ error: "DB write failed" });
}
