// backend/controllers/baApplyController.js
import path from "path";
import pool from "../config/db.js";
import { parseBaPdf } from "../integrations/baParser.js";

const ATTACH_DIR = process.env.ATTACH_DIR || "attachments";

async function findInbox({ inbox_id, ba_no }) {
  if (inbox_id) {
    const [rows] = await pool.query(`SELECT * FROM ba_inbox WHERE id=?`, [inbox_id]);
    return rows[0] || null;
  }
  if (ba_no) {
    const [rows] = await pool.query(`SELECT * FROM ba_inbox WHERE ba_no=? ORDER BY id DESC LIMIT 1`, [ba_no]);
    return rows[0] || null;
  }
  return null;
}

async function fetchPekerjaanByCo(no_co) {
  const [rows] = await pool.query(
    `SELECT * FROM pekerjaan WHERE UPPER(no_co)=UPPER(?) ORDER BY id DESC LIMIT 1`,
    [no_co]
  );
  return rows[0] || null;
}

async function fetchCurrentItems(pekerjaan_id) {
  const [rows] = await pool.query(
    `SELECT id, deskripsi, satuan, qty, harga, urut
       FROM pekerjaan_item
      WHERE pekerjaan_id=?
      ORDER BY urut ASC, id ASC`,
    [pekerjaan_id]
  );
  return rows;
}

/** =======================
 *  POST /api/ba/preview
 *  Body: { inbox_id } | { ba_no }
 *  ======================= */
export async function previewFromInbox(req, res) {
  try {
    const { inbox_id, ba_no } = req.body || {};
    if (!inbox_id && !ba_no) {
      return res.status(400).json({ ok: false, error: "inbox_id atau ba_no wajib diisi" });
    }

    const inbox = await findInbox({ inbox_id, ba_no });
    if (!inbox) return res.status(404).json({ ok: false, error: "BA di inbox tidak ditemukan" });

    const filePath = path.join(process.cwd(), ATTACH_DIR, inbox.filename || "");
    const parsed = await parseBaPdf(filePath);

    // ambil pekerjaan by CO (prioritas: dari inbox.co_no; fallback: dari PDF)
    const co = inbox.co_no || parsed.co_no;
    if (!co) return res.status(422).json({ ok: false, error: "Nomor CO tidak terdeteksi." });

    const pekerjaan = await fetchPekerjaanByCo(co);
    if (!pekerjaan) {
      return res.status(404).json({ ok: false, error: `Pekerjaan dengan CO ${co} tidak ditemukan.` });
    }

    const curItems = await fetchCurrentItems(pekerjaan.id);
    const currentTotal = curItems.reduce((a, b) => a + Number(b.harga || 0) * Number(b.qty || 0), 0);
    const baTotal = Number(parsed.totals.total || 0);

    res.json({
      ok: true,
      inbox: {
        id: inbox.id,
        ba_no: inbox.ba_no,
        co_no: inbox.co_no,
        filename: inbox.filename,
      },
      pekerjaan: {
        id: pekerjaan.id,
        no_co: pekerjaan.no_co,
        kode_toko: pekerjaan.kode_toko,
        nama_toko: pekerjaan.nama_toko,
        total_harga: Number(pekerjaan.total_harga || 0),
        items: curItems,
      },
      ba: {
        ba_no: parsed.ba_no,
        co_no: parsed.co_no,
        kdtk: parsed.kdtk,
        nama_toko: parsed.nama_toko,
        totals: parsed.totals,
        items: parsed.items,
      },
      diff: {
        total_changed: currentTotal !== baTotal,
        item_count_changed: curItems.length !== parsed.items.length,
      },
    });
  } catch (e) {
    console.error("previewFromInbox error:", e);
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

/** =======================
 *  POST /api/ba/apply
 *  Body: { inbox_id } | { ba_no }
 *  ======================= */
export async function applyFromInbox(req, res) {
  const conn = await pool.getConnection();
  try {
    const { inbox_id, ba_no } = req.body || {};
    if (!inbox_id && !ba_no) {
      conn.release();
      return res.status(400).json({ ok: false, error: "inbox_id atau ba_no wajib diisi" });
    }

    const [inboxRows] = await conn.query(
      inbox_id ? `SELECT * FROM ba_inbox WHERE id=?` : `SELECT * FROM ba_inbox WHERE ba_no=? ORDER BY id DESC LIMIT 1`,
      inbox_id ? [inbox_id] : [ba_no]
    );
    const inbox = inboxRows[0];
    if (!inbox) { conn.release(); return res.status(404).json({ ok: false, error: "BA di inbox tidak ditemukan" }); }

    const filePath = path.join(process.cwd(), ATTACH_DIR, inbox.filename || "");
    const parsed = await parseBaPdf(filePath);

    const co = inbox.co_no || parsed.co_no;
    if (!co) { conn.release(); return res.status(422).json({ ok: false, error: "Nomor CO tidak terdeteksi." }); }

    const [pekRows] = await conn.query(
      `SELECT * FROM pekerjaan WHERE UPPER(no_co)=UPPER(?) ORDER BY id DESC LIMIT 1`,
      [co]
    );
    const pekerjaan = pekRows[0];
    if (!pekerjaan) { conn.release(); return res.status(404).json({ ok: false, error: `Pekerjaan CO ${co} tidak ditemukan.` }); }

    await conn.beginTransaction();

    // 1) Hapus item lama
    await conn.query(`DELETE FROM pekerjaan_item WHERE pekerjaan_id=?`, [pekerjaan.id]);

    // 2) Insert item dari BA (pakai nilai realisasi)
    let urut = 1;
    for (const it of parsed.items) {
      await conn.query(
        `INSERT INTO pekerjaan_item (pekerjaan_id, deskripsi, satuan, qty, harga, urut)
         VALUES (?,?,?,?,?,?)`,
        [pekerjaan.id, it.deskripsi, it.satuan || "", Number(it.qty || 1), Number(it.harga || 0), urut++]
      );
    }

    // 3) Update header pekerjaan
    await conn.query(
      `UPDATE pekerjaan
         SET ba_opname_no=?,
             ba_source='gmail',
             ba_synced_at=NOW(),
             kode_toko=COALESCE(?, kode_toko),
             nama_toko=COALESCE(?, nama_toko)
       WHERE id=?`,
      [parsed.ba_no || inbox.ba_no, parsed.kdtk || null, parsed.nama_toko || null, pekerjaan.id]
    );

    await conn.commit();
    conn.release();

    // ambil total baru (trigger DB sudah otomatis rehit total_harga)
    const [afterRows] = await pool.query(`SELECT total_harga FROM pekerjaan WHERE id=?`, [pekerjaan.id]);

    res.json({
      ok: true,
      applied_to: { pekerjaan_id: pekerjaan.id, no_co: pekerjaan.no_co },
      ba_no: parsed.ba_no || inbox.ba_no,
      total_after: Number(afterRows[0]?.total_harga || 0),
      items_applied: parsed.items.length,
      note: "Deskripsi & harga disamakan dengan BA email.",
    });
  } catch (e) {
    try { await conn.rollback(); } catch {}
    conn.release();
    console.error("applyFromInbox error:", e);
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
