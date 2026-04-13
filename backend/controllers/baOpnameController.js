// backend/controllers/baOpnameController.js
import pool from "../config/db.js";
import { syncBAFromGmail } from "../integrations/gmailBaSync.js";

/** ========================================================================
 *  PATCH /api/ba/:id/status
 *  Body: { status_ba: "belum_cetak" | "sudah_cetak" }
 *  ====================================================================== */
export async function updateBAStatus(req, res) {
  try {
    const { id } = req.params;
    const { status_ba } = req.body;
    if (!["belum_cetak", "sudah_cetak"].includes(status_ba)) {
      return res.status(400).json({ ok:false, error:"Status tidak valid" });
    }
    await pool.query(
      "UPDATE pekerjaan SET status_ba=?, status_ba_at=NOW() WHERE id=?",
      [status_ba, id]
    );
    res.json({ ok:true });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
}

/** Ubah status banyak baris berdasarkan daftar BA_no (dipakai setelah export) */
export async function bulkSetPrintedByBAList(ba_list = [], status = "sudah_cetak") {
  if (!Array.isArray(ba_list) || ba_list.length === 0) return;
  await pool.query(
    `UPDATE pekerjaan 
       SET status_ba=?, status_ba_at=NOW()
     WHERE ba_opname_no IN (${ba_list.map(()=>"?").join(",")})`,
    [status, ...ba_list]
  );
}

/** ========================================================================
 *  GET helper opsional: kalau suatu saat ingin pindahkan query list ke controller
 *  ====================================================================== */
export async function listBA(req, res) {
  try {
    const {
      search = "",
      from = "",
      to = "",
      status = "all",
      ba_status = "all",
      page = 1,
      limit = 10
    } = req.query;

    const where = [];
    const vals = [];

    if (search) {
      where.push(`(
        p.ba_opname_no LIKE ?
        OR p.no_co LIKE ?
        OR p.kode_toko LIKE ?
        OR p.nama_toko LIKE ?
      )`);
      vals.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (from) { where.push("p.tanggal >= ?"); vals.push(from); }
    if (to)   { where.push("p.tanggal <= ?"); vals.push(to); }

    if (status !== "all") {
      where.push(status === "printed" ? "p.printed=1" : "p.printed=0");
    }

    if (ba_status !== "all") {
      where.push(
        ba_status === "has"
          ? "b.id IS NOT NULL"
          : "b.id IS NULL"
      );
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (Number(page) - 1) * Number(limit);

    const sql = `
      SELECT
        p.id,
        p.tanggal,
        p.no_co        AS co_no,
        p.kode_toko   AS kdtk,
        p.nama_toko,
        p.total_harga AS total,
        p.ba_opname_no AS ba_no,
        p.printed,
        CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS in_gmail
      FROM pekerjaan p
      LEFT JOIN ba_inbox b
        ON b.co_no = p.no_co
      ${whereSQL}
      GROUP BY p.id
      ORDER BY p.tanggal DESC, p.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...vals, Number(limit), offset]);

    const [[agg]] = await pool.query(`
      SELECT COUNT(*) AS total_ba, COALESCE(SUM(p.total_harga),0) AS total_nilai
      FROM pekerjaan p
      LEFT JOIN ba_inbox b ON b.co_no = p.no_co
      ${whereSQL}
    `, vals);

    res.json({
      ok: true,
      data: rows,
      meta: {
        total_ba: Number(agg.total_ba),
        total_nilai: Number(agg.total_nilai),
        page: Number(page),
        pages: Math.ceil(agg.total_ba / limit)
      }
    });
  } catch (e) {
    console.error("listBA ERR:", e);
    res.status(500).json({ ok:false, error:e.message });
  }
}

/** ========================================================================
 *  Opsional: dipanggil dari /invoice/export agar auto-flag “sudah_cetak”
 *  ====================================================================== */
export async function markPrintedByBaNos(baNos = []) {
  if (!Array.isArray(baNos) || baNos.length === 0) return { affected: 0 };
  const placeholders = baNos.map(() => "?").join(",");
  const [resUpd] = await pool.query(
    `UPDATE pekerjaan
       SET status_ba='sudah_cetak'
     WHERE ba_opname_no IN (${placeholders})`,
    baNos
  );
  return { affected: resUpd.affectedRows || 0 };
}

/** ========================================================================
 *  Yang sudah ada: sinkronisasi & saran BA (tetap dipakai)
 *  ====================================================================== */
export async function syncBA(req, res) {
  try {
    const result = await syncBAFromGmail({ qDays: 45 });
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function suggestBA(req, res) {
  try {
    const { no_co } = req.query;
    if (!no_co) return res.json({ ba: null });
    const [rows] = await pool.query(
      `SELECT ba_opname_no AS ba
         FROM pekerjaan
        WHERE UPPER(no_co)=UPPER(?)
     ORDER BY ba_synced_at DESC
        LIMIT 1`,
      [no_co]
    );
    res.json({ ba: rows?.[0]?.ba || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
