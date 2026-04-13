import express from "express";
import { google } from "googleapis";

const r = express.Router();

function getOAuth2() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Env OAuth belum lengkap: GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI");
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

// Mulai login
r.get("/init", (req, res) => {
  console.log("=== ENV CHECK ===", {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: !!process.env.GOOGLE_CLIENT_SECRET,
    redirect: process.env.GOOGLE_REDIRECT_URI,
  });
  const o = getOAuth2();
  const url = o.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
  });
  console.log("Auth URL:", url); // periksa client_id & redirect_uri
  res.redirect(url);
});
// Callback
r.get("/callback", async (req, res) => {
  try {
    const { code, error } = req.query;
    console.log("Callback query:", req.query); // <— lihat ada code atau tidak
    if (error) return res.status(400).send("Google error: " + error);
    if (!code) return res.status(400).send("Tidak ada ?code. Jalankan dari /api/gmail/init dulu.");

    console.log("Using ENV:", {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirect: process.env.GOOGLE_REDIRECT_URI,
    });

    const o = getOAuth2();
    const { tokens } = await o.getToken(code);
    const rt = tokens.refresh_token;

    if (!rt) {
      return res.status(400).send(
        "Tidak ada refresh_token dari Google. Ulangi /api/gmail/init dan pastikan pilih akun & beri izin (prompt=consent)."
      );
    }

    res.send(`
      <h3>Refresh Token didapat ✅</h3>
      <pre style="white-space:pre-wrap;font-size:14px;">${rt}</pre>
      <p>Tambahkan ke <code>.env</code> sebagai <b>GOOGLE_REFRESH_TOKEN</b>, lalu <b>restart server</b>.</p>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).send("Callback error: " + (e.message || e));
  }
});

export default r;
