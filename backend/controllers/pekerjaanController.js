  // backend/controllers/pekerjaanController.js
  import pool from "../config/db.js";
  import path from "path";
  import { syncBAFromGmailByCO } from "../integrations/gmailBaSync.js";

  const toIDR = (n) =>
    Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  // terima 2 varian field upload: "beforeFiles[]" / "beforeFiles"
  const getFiles = (req, key) => req.files?.[key] || req.files?.[key.replace("[]", "")] || [];

  function buildWAMessage(header, items) {
    const tanggal = new Date(header.tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const fmtDateDash = (s) => {
    if (!s) return "-";
    // kalau sudah YYYY-MM-DD
    const [y, m, d] = String(s).slice(0, 10).split("-");
    if (y && m && d) return `${d}-${m}-${y}`;
    // fallback
    const dt = new Date(s);
    if (Number.isNaN(dt.getTime())) return String(s);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    return `${dd}-${mm}-${yy}`;
  };

  const absUrl = (req, p) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
  };

    const deskripsiGabung = items
      .map((x) => {
        const d = String(x.deskripsi || "").trim();
        const qty = Number(x.qty || 0);
        const sat = String(x.satuan || "").trim();
        const qs = qty ? ` (${qty}${sat ? " " + sat : ""})` : "";
        const harga = Number(x.harga || 0);
        const hs = harga ? ` / ${toIDR(harga)}` : "";
        return (d + qs + hs).trim();

      })
      .filter(Boolean)
      .join(" + ");

    return [
      `Tgl pekerjaan: ${tanggal}`,
      `KDTK    : ${header.kode_toko}`,
      `Nama Toko : ${header.nama_toko}`,
      `Supplier: AIM TEHNIK`,
      `No Co : ${header.no_co || "-"}`,
      `Deskripsi pekerjaan: ${deskripsiGabung || "-"}`,
      `Nominal : Rp.${toIDR(header.total_harga || 0)}`,
    ].join("\n");
  }

  export const list = async (req, res) => {
    const { page = 1, limit = 20, search = "", status, from, to } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = [];
    const args = [];

    if (search) {
      where.push("(p.kode_toko LIKE ? OR p.nama_toko LIKE ? OR p.no_co LIKE ?)");
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { where.push("p.status = ?"); args.push(status); }
    if (from)   { where.push("p.tanggal >= ?"); args.push(from); }
    if (to)     { where.push("p.tanggal <= ?"); args.push(to); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    try {
     // ganti SELECT di handler list
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,        -- <== aman buat frontend
      COALESCE(p.no_co, '')      AS no_co,
      COALESCE(p.kode_toko, '')  AS kode_toko,
      COALESCE(p.nama_toko, '')  AS nama_toko,
      COALESCE(p.total_harga,0)  AS total_harga,
      COALESCE(p.ba_opname_no, '') AS ba_opname_no,
      CASE p.status
        WHEN 'draft' THEN 'siap_kirim'
        ELSE p.status
      END AS status,

      -- deskripsi ringkas, qty tanpa .00 di ekor
      (
        SELECT GROUP_CONCAT(
          TRIM(
            CONCAT(
              i.deskripsi,
              CASE
                WHEN COALESCE(i.qty,0) <> 0 THEN CONCAT(
                  ' (',
                    CASE
                      WHEN i.qty = FLOOR(i.qty)
                        THEN CAST(FLOOR(i.qty) AS CHAR)                -- 2.00 -> 2
                      ELSE TRIM(TRAILING '0' FROM TRIM(TRAILING '.' FROM CAST(i.qty AS CHAR))) -- 2.50 -> 2.5
                    END,
                  CASE WHEN TRIM(COALESCE(i.satuan,'')) <> '' THEN CONCAT(' ', i.satuan) ELSE '' END,
                ')')
                ELSE ''
              END
            )
          )
          ORDER BY i.urut SEPARATOR ' + '
        )
        FROM pekerjaan_item i
        WHERE i.pekerjaan_id = p.id
      ) AS deskripsi_ringkas,

      (SELECT COUNT(*) FROM pekerjaan_foto f WHERE f.pekerjaan_id = p.id) AS foto_count
    FROM pekerjaan p
    ${whereSql}
    ORDER BY p.tanggal DESC, p.id DESC
    LIMIT ? OFFSET ?
    `,
    [...args, Number(limit), offset]
  );


      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM pekerjaan p ${whereSql}`, args
      );

      res.json({ data: rows, page: Number(page), limit: Number(limit), total });
    } catch (e) {
      console.error("LIST ERROR:", e.sqlMessage || e.message || e);
      res.status(500).json({ message: "Query failed", error: e.sqlMessage || e.message || String(e) });
    }
  };


  export const detail = async (req, res) => {
    const id = req.params.id;
    const [[header]] = await pool.query(`SELECT * FROM pekerjaan WHERE id = ?`, [id]);
    if (!header) return res.status(404).json({ message: "Not found" });
    const [items]  = await pool.query(`SELECT * FROM pekerjaan_item WHERE pekerjaan_id = ? ORDER BY urut, id`, [id]);
    const [photos] = await pool.query(`SELECT * FROM pekerjaan_foto WHERE pekerjaan_id = ? ORDER BY id`, [id]);
    res.json({ header, items, photos });
  };

  export const create = async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { tanggal, no_co, kode_toko, nama_toko, items } = req.body;
      const co = String(no_co || "").trim();
      const parsedItems = JSON.parse(items || "[]").map((x, i) => ({
        deskripsi: String(x.deskripsi || "").trim(),
        satuan: String(x.satuan || "").trim(),
        qty: Number(x.qty || 0) || 0,
        harga: Number(x.harga || 0),
        urut: i + 1,
      }));

      // hitung total harga = Σ (qty * harga)
      const total_harga = parsedItems.reduce(
        (a, b) => a + Number(b.qty || 0) * Number(b.harga || 0),
        0
      );
  // === VALIDASI CO TIDAK BOLEH DOUBLE ===
  if (co) {
  console.log("CO MASUK:", co);

  const [rows] = await conn.query(
    `SELECT id, kode_toko, nama_toko
     FROM pekerjaan
     WHERE TRIM(no_co) = ?
     LIMIT 1`,
    [co]
  );

  console.log("HASIL CEK:", rows);

  if (rows.length > 0) {
    return res.status(400).json({
      ok: false,
      code: "DUPLICATE_CO",
      message: `Nomor complain ${co} sudah terdaftar.`,
    });
  }
}

      await conn.beginTransaction();

      const [r] = await conn.query(
        `INSERT INTO pekerjaan
          (tanggal, no_co, kode_toko, nama_toko, total_harga, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'siap_kirim', NOW(), NOW())`,
        [tanggal, co || null, kode_toko, nama_toko || null, total_harga]
      );
      const pekerjaanId = r.insertId;

      if (parsedItems.length) {
        await conn.query(
          `INSERT INTO pekerjaan_item (pekerjaan_id, deskripsi, satuan, qty, harga, urut)
           VALUES ?`,
          [parsedItems.map((x) => [pekerjaanId, x.deskripsi, x.satuan, x.qty, x.harga, x.urut])]
        );
      }

      // simpan foto (abaikan error biar header+items tetap commit)
      const filesBefore = getFiles(req, "beforeFiles[]");
      const filesAfter  = getFiles(req, "afterFiles[]");

      const savePhotos = async (arr, tipe) => {
        if (!arr || !arr.length) return;
        const values = arr.map((f) => [
          pekerjaanId, tipe,
          path.posix.join("/uploads", path.basename(f.path)),
          f.originalname, f.mimetype, f.size,
        ]);
        await conn.query(
          `INSERT INTO pekerjaan_foto (pekerjaan_id, tipe, path, original_name, mime, size_bytes)
           VALUES ?`,
          [values]
        );
      };

      try { await savePhotos(filesBefore, "before"); } catch {}
      try { await savePhotos(filesAfter,  "after");  } catch {}

     await conn.commit();
  if (no_co) {
    try {
      await syncBAFromGmailByCO(no_co);
    } catch (e) {
      console.warn("AUTO BA SYNC FAILED:", e.message);
    }
  }

  res.status(201).json({ ok: true, id: pekerjaanId });

    } catch (e) {
      await conn.rollback().catch(()=>{});
      console.error("CREATE ERROR:", e.sqlMessage || e.message || e);
      res.status(500).json({ ok:false, error: e.sqlMessage || e.message || String(e) });
    } finally {
      conn.release();
    }
  };
  export const removePhoto = async (req, res) => {
    const { id, fotoId } = req.params;
    await pool.query(`DELETE FROM pekerjaan_foto WHERE id=? AND pekerjaan_id=?`, [fotoId, id]);
    res.json({ ok: true });
  };

  export const update = async (req, res) => {
    const id = req.params.id;
    const conn = await pool.getConnection();
    try {
      const { tanggal, no_co, kode_toko, nama_toko, status, items } = req.body;

  const co = String(no_co || "").trim();

  const parsedItems = items ? JSON.parse(items) : null;

  // === VALIDASI CO SAAT UPDATE (ANTI TABRAK) ===
  if (co) {
    const [[exist]] = await conn.query(
      `SELECT id, kode_toko, nama_toko
       FROM pekerjaan
       WHERE TRIM(no_co) = ?
       AND id != ?
       LIMIT 1`,
      [co, id]
    );

    if (exist) {
      return res.status(400).json({
        ok: false,
        code: "DUPLICATE_CO",
        message: `Nomor complain ${co} sudah terdaftar pada toko ${exist.nama_toko || exist.kode_toko}.`,
      });
    }
  }

      // kalau ada items, hitung total baru. Kalau tidak, pertahankan yang lama
      let total_harga = null;
      if (parsedItems) {
        total_harga = parsedItems.reduce(
          (a, b) => a + Number(b.qty || 0) * Number(b.harga || 0),
          0
        );
      }

      await conn.beginTransaction();

      await conn.query(
        `
        UPDATE pekerjaan
           SET tanggal = ?,
               no_co = ?,
               kode_toko = ?,
               nama_toko = ?,
               ${parsedItems ? "total_harga = ?," : ""}
               status = ?,
               updated_at = NOW()
         WHERE id = ?
        `,
        parsedItems
          ? [tanggal, no_co || null, kode_toko, nama_toko || null, total_harga, (status || "siap_kirim"), id]
          : [tanggal, no_co || null, kode_toko, nama_toko || null, (status || "siap_kirim"), id]
      );

      if (parsedItems) {
        await conn.query(`DELETE FROM pekerjaan_item WHERE pekerjaan_id=?`, [id]);
        if (parsedItems.length) {
          const vals = parsedItems.map((x, i) => [
            id,
            String(x.deskripsi || "").trim(),
            String(x.satuan || "").trim(),
            Number(x.qty || 0) || 0,
            Number(x.harga || 0),
            i + 1,
          ]);
          await conn.query(
            `INSERT INTO pekerjaan_item (pekerjaan_id, deskripsi, satuan, qty, harga, urut)
             VALUES ?`,
            [vals]
          );
        }
      }

      // simpan foto tambahan bila ada (opsional – sama dengan create)
      const filesBefore = getFiles(req, "beforeFiles[]");
      const filesAfter  = getFiles(req, "afterFiles[]");
      const savePhotos = async (arr, tipe) => {
        if (!arr || !arr.length) return;
        const values = arr.map((f) => [
          id, tipe,
          path.posix.join("/uploads", path.basename(f.path)),
          f.originalname, f.mimetype, f.size,
        ]);
        await conn.query(
          `INSERT INTO pekerjaan_foto (pekerjaan_id, tipe, path, original_name, mime, size_bytes)
           VALUES ?`,
          [values]
        );
      };
      try { await savePhotos(filesBefore, "before"); } catch {}
      try { await savePhotos(filesAfter,  "after");  } catch {}

      await conn.commit();
      res.json({ ok: true, id });
    } catch (e) {
      await conn.rollback();
      console.error("CREATE ERROR FULL:", e);
      console.error("UPDATE ERROR:", e.sqlMessage || e.message || e);
      res.status(500).json({ ok:false, error: e.sqlMessage || e.message || String(e) });
    } finally {
      conn.release();
    }
  };


  export const remove = async (req, res) => {
    const id = req.params.id;
    await pool.query(`DELETE FROM pekerjaan WHERE id=?`, [id]);
    res.json({ message: "Deleted" });
  };

  export const exportWAOne = async (req, res) => {
    const id = req.params.id;
    const [[header]] = await pool.query(`SELECT * FROM pekerjaan WHERE id=?`, [id]);
    if (!header) return res.status(404).json({ message: "Not found" });
    const [items] = await pool.query(
      `SELECT deskripsi, satuan, qty, harga
         FROM pekerjaan_item
        WHERE pekerjaan_id=?
        ORDER BY urut, id`,
      [id]
    );
    const text = buildWAMessage(header, items);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    await pool.query(`UPDATE pekerjaan SET status=? WHERE id=?`, ["terkirim", id]);
    res.json({ id, text, url });
  };
  // helper format tanggal: YYYY-MM-DD -> DD-MM-YYYY
  const fmtDateDash = (s) => {
    if (!s) return "-";
    const [y, m, d] = String(s).slice(0, 10).split("-");
    if (y && m && d) return `${d}-${m}-${y}`;
    return s;
  };

  export const exportWABulk = async (req, res) => {
    try {
      const { ids = [] } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ ok: false, error: "ids required" });
      }

      const [headers] = await pool.query(
        `
        SELECT id, tanggal, kode_toko, nama_toko, no_co, total_harga
        FROM pekerjaan
        WHERE id IN (?)
        ORDER BY FIELD(id, ?)
        `,
        [ids, ids]
      );

      const [items] = await pool.query(
        `
        SELECT pekerjaan_id, deskripsi, satuan, qty, harga
        FROM pekerjaan_item
        WHERE pekerjaan_id IN (?)
        ORDER BY pekerjaan_id
        `,
        [ids]
      );

      const itemMap = {};
      for (const it of items) {
        if (!itemMap[it.pekerjaan_id]) itemMap[it.pekerjaan_id] = [];
        itemMap[it.pekerjaan_id].push(it);
      }

      const [photos] = await pool.query(
        `
        SELECT pekerjaan_id, tipe, path
        FROM pekerjaan_foto
        WHERE pekerjaan_id IN (?)
        ORDER BY pekerjaan_id,
                 CASE tipe WHEN 'before' THEN 0 WHEN 'after' THEN 1 ELSE 2 END
        `,
        [ids]
      );

      const absUrl = (p) => {
        if (!p) return "";
        if (/^https?:\/\//i.test(p)) return p;
        return `${process.env.BASE_URL || "http://localhost:5000"}${p}`;
      };

      const photoGroups = {};
      for (const p of photos) {
        if (!photoGroups[p.pekerjaan_id]) {
          photoGroups[p.pekerjaan_id] = [];
        }
        photoGroups[p.pekerjaan_id].push(absUrl(p.path));
      }

      const blocks = headers.map((h) => {
    const its = itemMap[Number(h.id)] || [];

    const deskripsiGabung = its
    .map((x) => {
      const d = String(x.deskripsi || "").trim();
      const qty = Number(x.qty || 0);
      const sat = String(x.satuan || "").trim();
      const harga = Number(x.harga || 0);

      if (!d) return "";

      const qtyPart = qty ? `${qty}${sat ? " " + sat : ""}` : "";
      const satuanHarga = qty && harga ? `${qtyPart} x ${toIDR(harga)}` : "";
      const total = qty && harga ? toIDR(qty * harga) : "";

      return `${d} (${satuanHarga}) / ${total}`;
    })
    .filter(Boolean)
    .join(" + ");


    return [
      `Tgl pekerjaan: ${fmtDateDash(h.tanggal)}`,
      `KDTK    : ${h.kode_toko}`,
      `Nama Toko : ${h.nama_toko}`,
      `Supplier: AIM TEHNIK`,
      `No Co : ${h.no_co || "-"}`,
      `Deskripsi pekerjaan: ${deskripsiGabung || "-"}`,
      `Nominal : Rp.${toIDR(h.total_harga || 0)}`,
    ].join("\n");
  });

  const text = blocks.join("\n\n");

  const wa_url = `https://wa.me/?text=${encodeURIComponent(text)}`;

  await pool.query(
    `UPDATE pekerjaan SET status='terkirim' WHERE id IN (?)`,
    [ids]
  );

  return res.json({ ok: true, wa_url });

    } catch (e) {
      console.error("EXPORT WA BULK ERROR:", e);
      return res.status(500).json({ ok: false, error: e.message });
    }
  };

  export default {
    list,
    detail,
    create,
    update,
    remove,
    removePhoto,
    exportWAOne,
    exportWABulk,
  };

