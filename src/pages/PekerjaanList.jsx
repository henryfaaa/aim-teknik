import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge.jsx";
import { FaSearch, FaTrashAlt, FaWhatsapp, FaPaperclip, FaEdit } from "react-icons/fa";

const toIDR = (n) => Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
// backend kirim "YYYY-MM-DD"
const fmtDate = (s) => {
  if (!s) return "-";
  const [y, m, d] = String(s).split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

export default function PekerjaanList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // selection
  const [selected, setSelected] = useState(new Set());

  // modal preview foto
  const [preview, setPreview] = useState({ open: false, id: null, photos: [] });

  const reload = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q) params.set("search", q);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    setLoading(true);
    fetch(`/api/pekerjaan?${params.toString()}`)
      .then(async (r) => {
        // berjaga-jaga kalau backend balikin HTML error
        const text = await r.text();
        try { return JSON.parse(text); } catch { throw new Error("Unexpected token '<', \"<!DOCTYPE\" … is not valid JSON"); }
      })
      .then((json) => {
        setRows(Array.isArray(json.data) ? json.data : []);
        setTotal(json.total || 0);
        setError("");
      })
      .catch((e) => setError(e?.message || "Gagal memuat data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload(); // eslint-disable-next-line
  }, [q, status, from, to, page, limit]);

  // actions
  const toggleAll = (checked) => {
    setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());
  };
  const toggleRow = (id, checked) => {
    setSelected((s) => {
      const n = new Set(s);
      checked ? n.add(id) : n.delete(id);
      return n;
    });
  };

const bulkExportWA = async () => {
  if (selected.size === 0) {
    alert("Pilih minimal 1 pekerjaan.");
    return;
  }

  try {
    const ids = Array.from(selected);

    const res = await fetch("/api/pekerjaan/export-wa-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    const j = await res.json();
    if (!res.ok || j.ok === false) {
      throw new Error(j.error || "Gagal export WA");
    }

    // LANGSUNG BUKA WHATSAPP
    if (j.wa_url) {
      window.open(j.wa_url, "_blank");
    } else {
      alert("URL WhatsApp tidak terbentuk");
    }

     setSelected(new Set());   // <-- reset ceklis
    reload();
    
  } catch (e) {
    alert("❌ " + (e?.message || "Terjadi error"));
  }
};



  const removeOne = async (id) => {
    if (!confirm("Hapus pekerjaan ini?")) return;
    await fetch(`/api/pekerjaan/${id}`, { method: "DELETE" });
    reload();
  };

  const openPhotos = async (id) => {
    try {
      const r = await fetch(`/api/pekerjaan/${id}`);
      const j = await r.json();
      setPreview({ open: true, id, photos: j.photos || [] });
    } catch {
      alert("Gagal membuka lampiran.");
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 space-y-4">
<div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pekerjaan</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={selected.size === 0}
            onClick={bulkExportWA}
            className={`px-3 py-2 rounded text-white flex items-center gap-2 ${
              selected.size === 0 ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            title="Export WhatsApp untuk item terpilih"
          >
            <FaWhatsapp /> Export WA
          </button>
          <Link
            to="/pekerjaan/new"
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Tambah Pekerjaan
          </Link>
        </div>
      </div>

      {/* filter bar */}
<div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Cari</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
              placeholder="KDTK / Nama toko / No CO"
              className="w-full border rounded pl-9 pr-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Semua</option>
            <option value="siap_kirim">Siap kirim</option>
            <option value="terkirim">Terkirim</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Dari</label>
          <input type="date" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value); }} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Sampai</label>
          <input type="date" value={to} onChange={(e) => { setPage(1); setTo(e.target.value); }} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-gray-500">Memuat data…</div>
          ) : error ? (
            <div className="p-6 text-red-600">Gagal memuat: {error}</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-gray-500">Tidak ada data.</div>
          ) : (
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAll(e.target.checked)}
                      checked={rows.length>0 && selected.size===rows.length}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Kode Toko</th>
                  <th className="px-3 py-2 text-left">Nama Toko</th>
                  <th className="px-3 py-2 text-left">Nomor Complain</th>
                  <th className="px-3 py-2 text-left">Deskripsi</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Foto</th>
                  <th className="px-3 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={(e) => toggleRow(r.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-3 py-2">{fmtDate(r.tanggal)}</td>
                    <td className="px-3 py-2 font-medium">{r.kode_toko}</td>
                    <td className="px-3 py-2">{r.nama_toko}</td>
                    <td className="px-3 py-2">{r.no_co || "-"}</td>
                    <td className="px-3 py-2 max-w-[260px]">
                      <div className="truncate" title={r.deskripsi_ringkas || "-"}>
                        {r.deskripsi_ringkas || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">Rp {toIDR(r.total_harga)}</td>
                    <td className="px-3 py-2"><StatusBadge value={r.status} /></td>
                    <td className="px-3 py-2">
                      {r.foto_count > 0 ? (
                        <button
                          onClick={() => openPhotos(r.id)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          title="Lihat lampiran"
                        >
                          <FaPaperclip /> {r.foto_count} file
                        </button>
                      ) : "—"}
                    </td>
                      <td className="px-3 py-2 flex flex-wrap items-center gap-3">
                        <Link to={`/Pekerjaan/${r.id}/edit`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <FaEdit /> Edit
                        </Link>
                        <button
                          className="text-red-600 hover:underline flex items-center gap-1"
                          onClick={() => removeOne(r.id)}
                        >
                          <FaTrashAlt /> Hapus
                        </button>
                      </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t px-4 py-3">
          <div className="text-sm text-gray-600">
            Halaman <b>{page}</b> dari <b>{pages}</b> • total <b>{total}</b> data
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tampil</label>
            <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} className="border rounded px-2 py-1 text-sm">
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className={`px-3 py-1 rounded border text-sm ${page<=1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}>
              Prev
            </button>
            <button disabled={page >= Math.ceil(total/limit)} onClick={() => setPage(p => p+1)} className={`px-3 py-1 rounded border text-sm ${page >= Math.ceil(total/limit) ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal preview foto */}
      {preview.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow max-w-5xl w-full p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Lampiran Foto</h3>
              <button
                onClick={() => setPreview({ open:false, id:null, photos:[] })}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
            {preview.photos.length === 0 ? (
              <div className="text-gray-500">Tidak ada foto.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {preview.photos.map((p, i) => (
                  <a key={i} href={p.path} target="_blank" rel="noreferrer" className="block">
                    <img src={p.path} alt={p.original_name} className="w-full h-36 object-cover rounded" />
                    <div className="mt-1 text-xs text-gray-500 truncate">{p.original_name}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
