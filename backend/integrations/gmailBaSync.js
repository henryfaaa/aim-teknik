// backend/integrations/gmailBaSync.js
/* eslint-env node */
/* global process */
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import pool from "../config/db.js";
import pdfParse from "pdf-parse-fixed";

/* =============== Regex Utama =============== */
const RX_BA = /BA-OPNAME\/\d{4}\/\d{2}\/\d{3}\/\d{6}/i;
// regex buat 2025 ampe 2029, nanti 2030 keatas harus di ubah lg regex nomer komplen nya
const RX_CO_HARUS = /\b2[5-9][A-Z]\d{7,9}\b/;
// fallback untuk format lain
const RX_CO_FALLBACKS = [
  /\bRef\.?\s*No\.?\s*CO\s*:\s*([A-Z0-9/\-._ ]{6,})/i,
  /\bSPK-?BE-?CO\/\d{4}\/\d{2}\/\d{3}\/\d{6}\b/i,
];

// regex tambahan buat ambil angka total harga (Rp xxx.xxx,xx)
const RX_TOTAL = /Rp[ .0-9]+,\d{2}/i;

/* =============== Utils =============== */
const b64urlToBuf = (b64url = "") =>
  Buffer.from(b64url.replace(/-/g, "+").replace(/_/g, "/"), "base64");

function flattenParts(root) {
  const out = [];
  (function walk(p) {
    if (!p) return;
    out.push(p);
    (p.parts || []).forEach(walk);
  })(root);
  return out;
}

function getHeader(headers, name) {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

async function extractTextBody(parts) {
  const text = parts.find((p) => p.mimeType === "text/plain" && p.body?.data)?.body?.data;
  const html = parts.find((p) => p.mimeType === "text/html" && p.body?.data)?.body?.data;
  const raw = text || html;
  if (!raw) return "";
  return b64urlToBuf(raw).toString("utf8");
}

function ensureDir(dir) {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  return abs;
}
function sanitizeName(s) {
  // use RegExp constructor to avoid escape issues in linting
  return String(s || "").replace(new RegExp(`[^\\w./-]`, "g"), "_");
}

/* =============== Gmail Client =============== */
function gmailClient() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Config Google OAuth belum lengkap (CLIENT/SECRET/REDIRECT).");
  }
  if (!GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN belum di-set.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oAuth2Client });
}

/* =============== Parsers =============== */
function extractBA({ subject = "", pdfText = "", filename = "" }) {
  const baFromPdf = (pdfText.match(RX_BA) || [])[0];
  const baFromSubject = (subject.match(RX_BA) || [])[0];
  const baFromFile = (filename.match(RX_BA) || [])[0];
  const baNo = (baFromPdf || baFromSubject || baFromFile || "").toUpperCase();
  return baNo || null;
}

function extractCO({ pdfText = "", bodyText = "", filename = "" }) {
  let coNo =
    (pdfText.match(RX_CO_HARUS) || [])[0] ||
    (bodyText.match(RX_CO_HARUS) || [])[0] ||
    (filename.match(RX_CO_HARUS) || [])[0] ||
    null;

  if (!coNo) {
    for (const rx of RX_CO_FALLBACKS) {
      const take = (pdfText.match(rx) || bodyText.match(rx) || [])[1] || "";
      if (take) {
        const t = (take.match(RX_CO_HARUS) || [])[0];
        if (t) { coNo = t; break; }
      }
    }
  }
  return coNo ? coNo.toUpperCase() : null;
}

function extractTotal(pdfText = "") {
  const t = (pdfText.match(RX_TOTAL) || [])[0] || null;
  return t ? t.replace(/\s/g, "").replace("Rp", "").replace(/\./g, "").replace(",", ".") : null;
}

/* =============== Core Sync =============== */
export async function syncBAFromGmail({
  qDays = 45,
  maxResults = 200,
  attachDir = process.env.ATTACH_DIR || "attachments",
} = {}) {
  const gmail = gmailClient();
  const absDir = ensureDir(attachDir);

  const baseQ =
    (process.env.GOOGLE_BA_QUERY && process.env.GOOGLE_BA_QUERY.trim()) ||
    [
      'from:aclweb@indomaret.co.id',
      '(subject:"BA Opname" OR subject:"BA-OPNAME")',
      'has:attachment',
      'filename:pdf',
      `newer_than:${qDays}d`,
    ].join(" ");

  let nextPageToken = undefined;
  const stats = {
    scanned: 0,
    withPdf: 0,
    saved: 0,
    parsed: 0,
    updatedPekerjaan: 0,
    upsertInbox: 0,
    skipped: 0,
  };

  do {
    const list = await gmail.users.messages.list({
      userId: "me",
      q: baseQ,
      maxResults,
      pageToken: nextPageToken,
    });
    nextPageToken = list.data.nextPageToken;
    const msgs = list.data.messages || [];
    stats.scanned += msgs.length;

    for (const m of msgs) {
      try {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "full",
        });

        const headers = msg.data.payload?.headers || [];
        const subject = getHeader(headers, "Subject");
        const from = getHeader(headers, "From");
        const receivedAtMs = Number(msg.data.internalDate || Date.now());

        const parts = flattenParts(msg.data.payload);
        const bodyText = await extractTextBody(parts);

        // cari PDF attachment
        const pdfParts = parts.filter(
          (p) => p.filename?.toLowerCase?.().endsWith(".pdf") && p.body?.attachmentId
        );
        if (!pdfParts.length) { stats.skipped++; continue; }
        stats.withPdf++;

        for (const pdfPart of pdfParts) {
          // ambil byte
          const att = await gmail.users.messages.attachments.get({
            userId: "me",
            messageId: m.id,
            id: pdfPart.body.attachmentId,
          });
          const pdfBuffer = b64urlToBuf(att.data.data || "");

          // baca teks PDF
          let pdfText = "";
          try {
            const parsedPdf = await pdfParse(pdfBuffer);
            pdfText = parsedPdf.text || "";
          } catch (e) {
            console.warn("pdf-parse gagal (skip parse teks):", e.message);
          }

          // ekstraksi BA & CO
          const originalName = pdfPart.filename || "";
          const baNo = extractBA({ subject, pdfText, filename: originalName });
          const coNo = extractCO({ pdfText, bodyText, filename: originalName });
          const baTotal = extractTotal(pdfText);
          const baDesc = pdfText ? pdfText.slice(0, 500) : null; // potong isi awal PDF buat deskripsi singkat

          if (!baNo || !coNo) {
            stats.skipped++;
            continue;
          }
          stats.parsed++;

          // simpan ke disk
          const baseName =
            sanitizeName(originalName) ||
            sanitizeName(`${baNo}_${coNo}.pdf`) ||
            sanitizeName(`${m.id}.pdf`);
          const savePath = path.join(absDir, baseName);
          try {
            fs.writeFileSync(savePath, pdfBuffer);
            stats.saved++;
          } catch (e) {
            console.warn("Gagal save attachment:", e.message);
          }

          // upsert ke ba_inbox
          const [resInbox] = await pool.query(
            `INSERT INTO ba_inbox
               (gmail_id, subject, from_email, ba_no, co_no, filename, received_at, parsed_at)
             VALUES (?,?,?,?,?,?,FROM_UNIXTIME(?/1000),NOW())
             ON DUPLICATE KEY UPDATE
               ba_no=VALUES(ba_no),
               co_no=VALUES(co_no),
               filename=VALUES(filename),
               parsed_at=NOW()`,
            [m.id, subject, from, baNo, coNo, baseName, receivedAtMs]
          );
          stats.upsertInbox += (resInbox.affectedRows || 0) > 0 ? 1 : 0;

          // update pekerjaan by no_co
          const [resPek] = await pool.query(
            `UPDATE pekerjaan
               SET ba_opname_no=?,
                   ba_source='gmail',
                   ba_synced_at=NOW(),
                   ba_final_total=COALESCE(?, ba_final_total),
                   ba_final_desc=COALESCE(?, ba_final_desc)
             WHERE UPPER(no_co)=UPPER(?)`,
            [baNo, baTotal, baDesc, coNo]
          );
          stats.updatedPekerjaan += resPek.affectedRows || 0;
        }
      } catch (e) {
        console.error("sync BA: gagal proses message:", e.message);
        stats.skipped++;
      }
    }
  } while (nextPageToken);

  console.log(
    `[GMAIL BA SYNC] scanned=${stats.scanned} pdf=${stats.withPdf} saved=${stats.saved} parsed=${stats.parsed} upsertInbox=${stats.upsertInbox} updatedPekerjaan=${stats.updatedPekerjaan} skipped=${stats.skipped}`
  );

  return stats;
}
export async function syncBAFromGmailByCO(noCo) {
  const gmail = gmailClient();

  const q = [
    'from:aclweb@indomaret.co.id',
    '(subject:"BA Opname" OR subject:"BA-OPNAME")',
    'has:attachment',
    'filename:pdf',
    noCo
  ].join(" ");

  const list = await gmail.users.messages.list({
    userId: "me",
    q,
    maxResults: 3,
  });

  if (!list.data.messages?.length) {
    return null; // BA memang belum ada
  }

  // ambil email TERBARU
  const msg = await gmail.users.messages.get({
    userId: "me",
    id: list.data.messages[0].id,
    format: "full",
  });

  const headers = msg.data.payload?.headers || [];
  const subject = getHeader(headers, "Subject");
  const from = getHeader(headers, "From");
  const receivedAtMs = Number(msg.data.internalDate || Date.now());

  const parts = flattenParts(msg.data.payload);
  const bodyText = await extractTextBody(parts);

  const pdfParts = parts.filter(
    (p) => p.filename?.toLowerCase?.().endsWith(".pdf") && p.body?.attachmentId
  );
  if (!pdfParts.length) return null;

  // 🔥 AMBIL 1 PDF SAJA (cukup)
  const pdfPart = pdfParts[0];

  const att = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId: msg.data.id,
    id: pdfPart.body.attachmentId,
  });

  const pdfBuffer = b64urlToBuf(att.data.data || "");

  let pdfText = "";
  try {
    const parsedPdf = await pdfParse(pdfBuffer);
    pdfText = parsedPdf.text || "";
  } catch (e) {
    console.warn("pdf parse gagal:", e.message);
  }

  const originalName = pdfPart.filename || "";
  const baNo = extractBA({ subject, pdfText, filename: originalName });
  const coNo = extractCO({ pdfText, bodyText, filename: originalName });
  const baTotal = extractTotal(pdfText);

  if (!baNo || !coNo) return null;

  // 🔥 UPSERT ba_inbox (BIAR KONSISTEN)
  await pool.query(
    `INSERT INTO ba_inbox
      (gmail_id, subject, from_email, ba_no, co_no, filename, received_at, parsed_at)
     VALUES (?,?,?,?,?,?,FROM_UNIXTIME(?/1000),NOW())
     ON DUPLICATE KEY UPDATE
      ba_no=VALUES(ba_no),
      co_no=VALUES(co_no),
      filename=VALUES(filename),
      parsed_at=NOW()`,
    [msg.data.id, subject, from, baNo, coNo, originalName, receivedAtMs]
  );

  // 🔥 UPDATE pekerjaan LANGSUNG
  await pool.query(
    `UPDATE pekerjaan
       SET ba_opname_no=?,
           ba_source='gmail',
           ba_synced_at=NOW(),
           ba_final_total=COALESCE(?, ba_final_total)
     WHERE UPPER(no_co)=UPPER(?)`,
    [baNo, baTotal, coNo]
  );

  return baNo;
}

export default { syncBAFromGmail };
