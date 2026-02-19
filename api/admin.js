// Vercel serverless function — uses the secret service-role key, never exposed to the browser.
// POST /api/admin   { "action": "delete-user", "username": "X" }
// Header: Authorization: Bearer <ADMIN_SECRET>

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify admin secret
  const auth = req.headers["authorization"] || "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action, username } = req.body || {};

  if (action === "delete-user") {
    if (!username) return res.status(400).json({ error: "username required" });

    const supaUrl = process.env.SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_KEY; // secret — never sent to browser

    const r = await fetch(
      `${supaUrl}/rest/v1/scores?username=eq.${encodeURIComponent(username)}`,
      {
        method: "DELETE",
        headers: {
          apikey: supaKey,
          Authorization: `Bearer ${supaKey}`,
          Prefer: "return=minimal",
        },
      }
    );

    return r.ok
      ? res.status(200).json({ success: true, deleted: username })
      : res.status(500).json({ error: "Supabase delete failed", status: r.status });
  }

  return res.status(400).json({ error: "Unknown action" });
}
