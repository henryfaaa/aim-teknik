// POST /api/gmail/sync
export const syncGmailBA = async (req, res) => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: "subject:BA Opname filename:pdf",
    maxResults: 20 // BATASI, JANGAN SERAKAH
  });

  const messages = list.data.messages || [];
  let inserted = 0;

  for (const msg of messages) {
    try {
      // ambil detail email
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id
      });

      const headers = detail.data.payload.headers || [];
      const subject = headers.find(h => h.name === "Subject")?.value || "";

      // TODO: nanti parsing PDF
      // sementara simpan message_id dulu

      await pool.query(
        `INSERT IGNORE INTO gmail_ba_cache (message_id, subject)
         VALUES (?, ?)`,
        [msg.id, subject]
      );

      inserted++;
    } catch (e) {
      console.error("Skip message", msg.id);
    }
  }

  res.json({
    ok: true,
    scanned: messages.length,
    inserted
  });
};
