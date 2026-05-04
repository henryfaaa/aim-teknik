// src/pages/Pencairan.jsx
import { useEffect, useMemo, useState } from "react";

const toIDR = (n) =>
  Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const fmtDateTime = (s) => (s ? new Date(s).toLocaleString("id-ID") : "-");

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

export default function Pencairan() {
  // List TTF
  const [ttf, setTtf] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filter & search (client-side)
  const [statusFilter, setStatusFilter] = useState("all"); // all | proses | sudah_cair
  const [q, setQ] = useState("");

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null); // {jumlahBA, nomorBA: []}

  // Detail TTF modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailMeta, setDetailMeta] = useState({
    id: null,
    filename: "",
    status: "",
  });

  // Load TTF list
  const reload = async () => {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch("/api/ttf");
      const j = await r.json();
      if (!r.ok || j.ok === false)
        throw new Error(j.error || "Gagal memuat data TTF");
      setTtf(Array.isArray(j.data) ? j.data : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data TTF");
      setTtf([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Derived list after filter & search
  const filtered = useMemo(() => {
    return ttf.filter((x) => {
      const okStatus =
        statusFilter === "all" ? true : (x.status || "") === statusFilter;
      const okSearch = q
        ? (x.filename || "").toLowerCase().includes(q.toLowerCase())
        : true;
      return okStatus && okSearch;
    });
  }, [ttf, statusFilter, q]);

  // Reset page saat filter/search berubah
  useEffect(() => {
    setPage(1);
  }, [statusFilter, q]);

  // Pagination view
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const viewRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Clamp page kalau jumlah halaman mengecil
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, pageCount), p));
  }, [pageCount]);

  // Summary cards
  const sumProses = useMemo(
    () => ttf.filter((x) => x.status === "proses").length,
    [ttf]
  );
  const sumSudah = useMemo(
    () => ttf.filter((x) => x.status === "sudah_cair").length,
    [ttf]
  );
  const sumBA = useMemo(
    () => ttf.reduce((a, b) => a + Number(b.jumlah_ba || 0), 0),
    [ttf]
  );

  // Upload handler
  const doUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadResult(null);

      const fd = new FormData();
      fd.append("ttf", uploadFile);

      const r = await fetch("/api/ttf/upload", {
        method: "POST",
        body: fd,
      });
      const j = await r.json();

      if (!r.ok || j.ok === false) {
        throw new Error(j.error || "Upload gagal");
      }

      setUploadResult({
        jumlahBA: j.jumlahBA ?? (j.nomorBA?.length || 0),
        nomorBA: j.nomorBA || [],
      });

      setToast(
        `Upload sukses. ${
          j.jumlahBA ?? (j.nomorBA?.length || 0)
        } BA ditandai "Proses Cair".`
      );
      setUploadFile(null);
      reload();
    } catch (e) {
      alert(e?.message || "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  // Open detail for one TTF
  const openDetail = async (row) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailMeta({ id: row.id, filename: row.filename, status: row.status });

      const r = await fetch(`/api/ttf/${row.id}`);
      const j = await r.json();
      if (!r.ok || j.ok === false)
        throw new Error(j.error || "Gagal memuat detail");
      const rows = Array.isArray(j.data) ? j.data : [];
      setDetailRows(rows);
    } catch (e) {
      setDetailRows([]);
      alert(e?.message || "Gagal memuat detail");
    } finally {
      setDetailLoading(false);
    }
  };

  // Mark TTF as cair (update semua BA di dalamnya)
  const markCair = async (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId.id : rowOrId;
    const yes = confirm(
      "Tandai TTF ini sebagai 'Sudah Dibayar' dan update semua BA di dalamnya?"
    );
    if (!yes) return;

    try {
      const r = await fetch(`/api/ttf/${id}/cair`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const j = await r.json();
      if (!r.ok || j.ok === false)
        throw new Error(j.error || "Gagal update status cair");

      setToast("Berhasil menandai TTF sebagai 'Sudah Dibayar'.");
      await reload();

      if (detailOpen && detailMeta.id === id) {
        openDetail({ id, filename: detailMeta.filename, status: "sudah_cair" });
      }
    } catch (e) {
      alert(e?.message || "Gagal update status Dibayar");
    }
  };

  // Total nilai di detail (kalau backend kirim total_harga)
  const detailTotal = useMemo(
    () => detailRows.reduce((a, r) => a + Number(r?.total_harga || 0), 0),
    [detailRows]
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold">Pencairan</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setUploadOpen(true)}
          className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          Upload TTF (PDF)
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-4 grid md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Cari (Nama File)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="cth: 1692890099-TTF_110825.pdf"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Status TTF</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="proses">Proses Pembayaran</option>
            <option value="sudah_cair">Sudah Dibayar</option>
          </select>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <b>Total TTF:</b> {ttf.length}
        </div>
        <div>
          <b>Proses Pembayaran:</b> {sumProses}
        </div>
        <div>
          <b>Sudah Dibayar:</b> {sumSudah}
        </div>
        <div>
          <b>Jumlah BA Opname:</b> {sumBA}
        </div>
      </div>
      {sumProses > 0 && (
  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-sm text-blue-700">
    ⏳ {sumProses} TTF masih dalam proses pembayaran
  </div>
)}
{/* ================= MOBILE VERSION ================= */}
<div className="block md:hidden space-y-3">

  {loading ? (
    <div className="text-gray-500">Memuat data…</div>
  ) : err ? (
    <div className="text-red-600">Error: {err}</div>
  ) : viewRows.length === 0 ? (
    <div className="text-gray-500">Tidak ada data.</div>
  ) : (
    viewRows.map((r) => (
      <div key={r.id} className="bg-white border rounded-xl p-4 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <div className="font-semibold text-sm">{r.filename}</div>
            <div className="text-xs text-gray-500">
              {fmtDateTime(r.uploaded_at)}
            </div>
          </div>
          <div className="text-sm font-bold">
            {r.jumlah_ba || 0} BA
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-2">
          {r.status === "sudah_cair" ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              Sudah Dibayar
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
              Proses Pembayaran
            </span>
          )}
        </div>

        {/* ACTION */}
        <div className="mt-3 flex gap-2">

          <button
            onClick={() => openDetail(r)}
            className="flex-1 text-xs py-2 bg-gray-100 rounded"
          >
            Lihat BA
          </button>

          {r.status !== "sudah_cair" && (
            <button
              onClick={() => markCair(r)}
              className="flex-1 text-xs py-2 bg-emerald-600 text-white rounded"
            >
              Tandai Cair
            </button>
          )}

        </div>

      </div>
    ))
  )}

</div>
      {/* Tabel TTF */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Memuat data…</div>
        ) : err ? (
          <div className="p-6 text-red-600">Error: {err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">Tidak ada data.</div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left">Waktu Upload</th>
                    <th className="px-3 py-2 text-left">File</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Jumlah BA Opname</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {viewRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{fmtDateTime(r.uploaded_at)}</td>
                      <td className="px-3 py-2">
                        {r.filename ? (
                          <a
                            className="text-indigo-600 hover:underline"
                            href={`/uploads/ttf/${r.filename}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {r.filename}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {r.status === "sudah_cair" ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            Sudah Dibayar
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                            Proses Pembayaran
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{r.jumlah_ba || 0}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(r)}
                            className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
                          >
                            Lihat BAO
                          </button>
                          {r.status !== "sudah_cair" && (
                            <button
                              onClick={() => markCair(r)}
                              className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                            >
                              Tandai Sudah Dibayar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between p-3 border-t bg-white text-sm">
              <div>
                Halaman {page} dari {pageCount} • total {filtered.length} data
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Tampil</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
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

      {/* Modal Upload */}
      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadResult(null);
          setUploadFile(null);
        }}
        title="Upload TTF (PDF)"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Format: PDF. Sistem akan otomatis mendeteksi nomor BA di dalam file
              dan menandai statusnya menjadi <b>Proses Pembayaran</b>.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUploadOpen(false);
                  setUploadResult(null);
                  setUploadFile(null);
                }}
                className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                onClick={doUpload}
                disabled={!uploadFile || uploading}
                className={`px-3 py-2 rounded bg-indigo-600 text-white text-sm ${
                  !uploadFile || uploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {uploading ? "Mengunggah..." : "Upload & Proses"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />

        {uploadResult && (
          <div className="mt-2">
            <div className="font-semibold mb-2">
              Hasil Parsing: {uploadResult.jumlahBA} BA ditemukan
            </div>
            <div className="border rounded-lg max-h-[30vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Nomor BA</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uploadResult.nomorBA.map((ba, i) => (
                    <tr key={ba + i}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{ba}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              BA di atas otomatis ditandai <b>Proses Pembayaran</b> pada tabel pekerjaan.
            </div>
          </div>
        )}
        </div>
      </Modal>

      {/* Modal Detail TTF */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detail TTF — ${detailMeta.filename || "-"}`}
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Status:{" "}
              {detailMeta.status === "sudah_cair" ? (
                <b>Sudah Dibayar</b>
              ) : (
                <b>Proses Pembayaran</b>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">
                Total Nilai: Rp {toIDR(detailTotal)}
              </div>
              {detailMeta.status !== "sudah_cair" && (
                <button
                  onClick={() => markCair(detailMeta.id)}
                  className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >
                  Tandai TTF Ini Sudah Dibayar
                </button>
              )}
              <button
                onClick={() => setDetailOpen(false)}
                className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        }
      >
        {detailLoading ? (
          <div className="text-gray-500">Memuat detail…</div>
        ) : detailRows.length === 0 ? (
          <div className="text-gray-500">Tidak ada BA di TTF ini.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">BA No</th>
                    <th className="px-3 py-2 text-left">CO No</th>
                    <th className="px-3 py-2 text-left">Nama Toko</th>
                    <th className="px-3 py-2 text-right">Nilai</th>
                    <th className="px-3 py-2 text-left">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detailRows.map((r, idx) => (
                    <tr key={(r.ba_no || "") + idx}>
                      <td className="px-3 py-2">{r.ba_no || "-"}</td>
                      <td className="px-3 py-2">{r.no_co || "-"}</td>
                      <td className="px-3 py-2">{r.nama_toko || "-"}</td>
                      <td className="px-3 py-2 text-right">
                        Rp {toIDR(r.total_harga)}
                      </td>
                      <td className="px-3 py-2">
                        {r.status_cair === "sudah" ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            Sudah Dibayar
                          </span>
                        ) : r.status_cair === "proses" ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                            Proses Pembayaran
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-medium">
                            Belum Dibayar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
