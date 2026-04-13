// backend/scripts/getRefreshToken.js
import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/oauth2callback";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify"
];

// Step 1: Generate auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline", // penting biar dapat refresh token
  scope: SCOPES,
  prompt: "consent" // paksa Google kasih refresh token walaupun sudah pernah login
});

console.log("Buka link ini di browser, login pakai akun Gmail yang dipakai:");
console.log(authUrl);

// Step 2: Tunggu input code dari user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("\nMasukkan kode yang didapat dari URL redirect: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\n=== REFRESH TOKEN KAMU ===");
    console.log(tokens.refresh_token);
    console.log("==========================\n");
    rl.close();
  } catch (err) {
    console.error("Gagal mendapatkan refresh token:", err.message);
    rl.close();
  }
});
