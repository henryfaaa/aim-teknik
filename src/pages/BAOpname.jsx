// src/pages/BAOpname.jsx
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/api";
const toIDR = (n) =>
  Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const fmtDate = (s) => {
  if (!s) return "-";
  const [y, m, d] = String(s).split("-");
  return `${d}/${m}/${y}`;
};

function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[min(900px,95vw)] rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
        {footer && <div className="px-4 py-3 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}

export default function BAOpname() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Status Invoice (printed)
  const [status, setStatus] = useState("all"); // all | printed | not_printed
  // NEW: Status BA (ketersediaan BA di Gmail)
  const [baStatus, setBaStatus] = useState("all"); // all | has | missing

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 0,
    total_ba: 0,
    total_nilai: 0,
    page_total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // selection (pakai Set berisi ba_no)
  const [selected, setSelected] = useState(new Set());

  // toast
  const [toast, setToast] = useState("");

  // pagination (SERVER-SIDE)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10/25/50/100

  // Baris yang bisa dipilih (hanya yang BA-nya ada di Gmail)
  const selectableRows = useMemo(
    () => rows.filter((r) => Number(r.in_gmail) === 1),
    [rows]
  );

  // checkbox header = semua baris DI HALAMAN INI yang selectable terpilih
  const allChecked = useMemo(
    () =>
      selectableRows.length > 0 &&
      selectableRows.every((r) => selected.has(r.ba_no)),
    [selectableRows, selected]
  );

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // jaga-jaga kalau jumlah halaman mengecil setelah filter
  const pageCount = Math.max(1, Number(meta.pages || 1));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount]);

  // ---- LOAD DATA (server-side) ----
  const reload = async () => {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (status && status !== "all") params.set("status", status);
      if (baStatus && baStatus !== "all") params.set("ba_status", baStatus); // NEW
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      fetch(`${API_BASE}/ba?${params.toString()}`)
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Gagal memuat");

      setRows(Array.isArray(j.data) ? j.data : []);
      setMeta(j.meta || {});
      // clear selection tiap reload (biar konsisten)
      setSelected(new Set());
    } catch (e) {
      setErr(e?.message || "Gagal memuat");
      setRows([]);
      setMeta((m) => ({ ...m, total: 0, total_ba: 0, total_nilai: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // reload saat filter/pagination berubah
  useEffect(() => {
    reload();
  }, [q, from, to, status, baStatus, page, pageSize]);

  // saat filter diganti -> reset ke halaman 1
  const onChangeStatus = (v) => {
    setStatus(v);
    setPage(1);
  };
  const onChangeBaStatus = (v) => {
    setBaStatus(v);
    setPage(1);
  };

  const toggleOne = (ba_no) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ba_no)) next.delete(ba_no);
      else next.add(ba_no);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) selectableRows.forEach((r) => next.delete(r.ba_no));
      else selectableRows.forEach((r) => next.add(r.ba_no));
      return next;
    });
  };

  // ---- PREVIEW & EXPORT ----
  const [preview, setPreview] = useState({
    open: false,
    mode: null,
    total: 0,
    rows: [],
    error: "",
  });
  const hasSelection = selected.size > 0;

  const doPreview = async () => {
    try {
      setPreview((p) => ({
        ...p,
        open: true,
        error: "",
        rows: [],
        total: 0,
        mode: null,
      }));
      const r = await fetch("/api/invoice/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ba_list: Array.from(selected) }),
      });
      const j = await r.json();
      if (!r.ok || j.ok === false) throw new Error(j.error || "Gagal preview");
      setPreview({
        open: true,
        mode: j.mode,
        rows: j.rows || [],
        total: j.total || 0,
        error: "",
      });
    } catch (e) {
      setPreview({
        open: true,
        mode: null,
        rows: [],
        total: 0,
        error: e.message || "Gagal preview",
      });
    }
  };

  const doExport = async () => {
    try {
      const r = await fetch("/api/invoice/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ba_list: Array.from(selected),
          mark_printed: true,
          kota_footer: "Tangerang",
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Export gagal (${r.status})`);
      }

      // download file
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `INVOICE_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // optimistic printed utk baris di halaman aktif
      setRows((prev) =>
        prev.map((row) => (selected.has(row.ba_no) ? { ...row, printed: 1 } : row))
      );

      const count = selected.size;
      setSelected(new Set());
      setToast(`Berhasil ekspor & tandai ${count} BA sebagai "Sudah Tercetak".`);
      reload();
    } catch (e) {
      alert(e.message || "Export gagal");
    }
  };

  // angka ringkasan (akomodasi meta versi lama/baru)
  const totalBAAll = meta.total_ba ?? meta.total ?? 0;
  const totalNilaiAll = Number(meta.total_nilai || 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold">BA Opname</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={doPreview}
          disabled={!hasSelection}
          className={`px-3 py-2 rounded bg-indigo-600 text-white text-sm ${
            !hasSelection ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
          }`}
        >
          Preview Invoice
        </button>

        <button
          onClick={doExport}
          disabled={!hasSelection}
          className={`px-3 py-2 rounded bg-emerald-600 text-white text-sm ${
            !hasSelection ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
          }`}
        >
          Export Invoice
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-4 grid md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Cari</label>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="BA No / CO / KDTK / Nama toko"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Status Invoice</label>
          <select
            value={status}
            onChange={(e) => onChangeStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="printed">Sudah Tercetak</option>
            <option value="not_printed">Belum Tercetak</option>
          </select>
        </div>

        {/* NEW: Filter Status BA */}
        <div>
          <label className="text-sm text-gray-600">Status BAO</label>
          <select
            value={baStatus}
            onChange={(e) => onChangeBaStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="has">Sudah Ada</option>
            <option value="missing">Belum Ada</option>
          </select>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-6 text-sm">
        <div><b>Total BA:</b> {totalBAAll}</div>
        <div><b>Total Nilai:</b> Rp {toIDR(totalNilaiAll)}</div>
        <div><b>Dipilih:</b> {selected.size}</div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Memuat data…</div>
        ) : err ? (
          <div className="p-6 text-red-600">Error: {err}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-gray-500">Tidak ada data.</div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAllOnPage}
                        disabled={selectableRows.length === 0}
                        title={
                          selectableRows.length === 0
                            ? "Tidak ada BA yang bisa dipilih di halaman ini"
                            : "Pilih semua BA yang tersedia"
                        }
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Nomor BA Opname</th>
                    <th className="px-3 py-2 text-left">Nomor Complain</th>
                    <th className="px-3 py-2 text-left">Kode Toko</th>
                    <th className="px-3 py-2 text-left">Nama Toko</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Status BAO</th>
                    <th className="px-3 py-2 text-left">Status Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => {
                    const canSelect = Number(r.in_gmail) === 1;
                    const checked = selected.has(r.ba_no);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canSelect}
                            onChange={() => canSelect && toggleOne(r.ba_no)}
                            title={
                              canSelect
                                ? "Pilih BA ini"
                                : "BA belum ada di Gmail (tidak bisa dipilih)"
                            }
                          />
                        </td>
                        <td className="px-3 py-2">{fmtDate(r.tanggal)}</td>
                        <td className="px-3 py-2">{canSelect ? r.ba_no : "-"}</td>
                        <td className="px-3 py-2">{r.co_no}</td>
                        <td className="px-3 py-2">{r.kdtk}</td>
                        <td className="px-3 py-2">{r.nama_toko}</td>
                        <td className="px-3 py-2 text-right">Rp {toIDR(r.total)}</td>

                        {/* Status BA badge */}
                        <td className="px-3 py-2">
                          {canSelect ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium">
                              Sudah Ada
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">
                              Belum Ada
                            </span>
                          )}
                        </td>

                        {/* Status Invoice badge */}
                        <td className="px-3 py-2">
                          {r.printed ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                              Sudah Tercetak
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">
                              Belum Tercetak
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer (server-side) */}
            <div className="flex items-center justify-between p-3 border-t bg-white text-sm">
              <div>
                Halaman {page} dari {pageCount} • total {totalBAAll} data
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Tampil</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1); // reset halaman biar gak out of range
                    setSelected(new Set());
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Preview */}
      <Modal
        open={preview.open}
        onClose={() => setPreview((p) => ({ ...p, open: false }))}
        title="Preview Invoice"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mode: <b>{preview.mode || "-"}</b>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreview((p) => ({ ...p, open: false }))}
                className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setPreview((p) => ({ ...p, open: false }));
                  doExport();
                }}
                disabled={!!preview.error || (preview.rows?.length || 0) === 0}
                className={`px-3 py-2 rounded bg-emerald-600 text-white text-sm ${
                  preview.error ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                }`}
              >
                Export Invoice
              </button>
            </div>
          </div>
        }
      >
        {preview.error ? (
          <div className="text-red-600">{preview.error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">BA No</th>
                    <th className="px-3 py-2 text-left">CO No</th>
                    <th className="px-3 py-2 text-left">KDTK</th>
                    <th className="px-3 py-2 text-left">Nama Toko</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Status Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(preview.rows || []).map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2">{r.ba_opname_no}</td>
                      <td className="px-3 py-2">{r.no_co}</td>
                      <td className="px-3 py-2">{r.kode_toko}</td>
                      <td className="px-3 py-2">{r.nama_toko}</td>
                      <td className="px-3 py-2 text-right">Rp {toIDR(r.total_harga)}</td>
                      <td className="px-3 py-2">
                        {r.printed ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            Sudah Tercetak
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">
                            Belum Tercetak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right font-semibold">
              Total: Rp {toIDR(preview.total)}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
