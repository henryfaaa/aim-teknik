// src/pages/OwnerLaporan.jsx
import { useEffect, useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import { getOwnerToken } from "@/utils/token";

const toIDR = (n) =>
  Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

function Ring({ percent = 0, size = 90, stroke = 10, color = "#059669" }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#e5e7eb"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        fill="none"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-gray-900 font-bold"
      >
        {p}%
      </text>
    </svg>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="text-lg font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

const fmtDateID = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const nowStampID = () => {
  const d = new Date();
  const tgl = d.toLocaleDateString("id-ID");
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${tgl} ${jam}`;
};

// header owner
const ownerHeaders = () => ({
  Authorization: `Bearer ${getOwnerToken()}`,
});

export default function OwnerLaporan() {
  // filters
  const today = new Date();
  const to0 = today.toISOString().slice(0, 10);
  const from0 = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(from0);
  const [to, setTo] = useState(to0);
  const [status, setStatus] = useState("all"); // status_cair
  const [hasBa, setHasBa] = useState("all"); // ba filter
  const [search, setSearch] = useState("");

  // summary
  const [sum, setSum] = useState(null);
  const [loadingSum, setLoadingSum] = useState(false);

  // detail table
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 20, total: 0 });
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const pctBA = useMemo(() => {
    if (!sum) return 0;
    const aktif = (sum.ba?.with_ba || 0) + (sum.ba?.without_ba || 0);
    return aktif ? Math.round((sum.ba.with_ba / aktif) * 100) : 0;
  }, [sum]);

  const pctCair = useMemo(() => {
    if (!sum) return 0;
    const t = sum.pencairan?.total || 0;
    return t ? Math.round((sum.pencairan.sudah / t) * 100) : 0;
  }, [sum]);

  // load summary (SAMA KAYAK ADMIN, tapi pakai header owner)
  const loadSummary = async () => {
    setLoadingSum(true);
    try {
      const params = new URLSearchParams({ from, to });
      const r = await fetch(`/api/laporan/summary?${params.toString()}`, {
        headers: ownerHeaders(),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) setSum(j.data);
    } finally {
      setLoadingSum(false);
    }
  };

  // load detail (SAMA KAYAK ADMIN, tapi pakai header owner)
  const loadDetail = async () => {
    setLoadingTable(true);
    try {
      const params = new URLSearchParams({
        from,
        to,
        status,
        has_ba: hasBa,
        search,
        page,
        limit,
      });
      const r = await fetch(`/api/laporan/detail?${params.toString()}`, {
        headers: ownerHeaders(),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        setRows(j.data || []);
        setMeta(j.meta || {});
      }
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [from, to]);

  useEffect(() => {
    setPage(1);
  }, [from, to, status, hasBa, search, limit]);

  useEffect(() => {
    loadDetail();
  }, [from, to, status, hasBa, search, page, limit]);

  // ====== PDF TEMPLATE (HEADER + TABLE) ======
  const buildHeaderHtml = ({ subtitle = "" }) => {
    return `
      <div style="display:flex; align-items:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:12px;">
        <div style="width:95px;">
          <img src="/logoaim.png" style="width:80px;" />
        </div>
        <div style="flex:1;">
          <div style="font-size:18px;font-weight:bold;">CV. AIM TEKNIK</div>
          <div style="font-size:12px;font-weight:bold;">
            CIVIL, ELECTRICAL & GENERAL CONTRACTOR
          </div>
          <div style="font-size:11px;margin-top:4px;line-height:1.35;">
            Jl. Raya Serang Cikupa<br/>
            Mulya Asri Blok JB/26, RT 24 RW 009, Kel. Sukamulya,<br/>
            Kec. Cikupa, Kab. Tangerang, 15710<br/>
            Telp: 0822-1398-6759 • Email: aimteknik13@gmail.com
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:10px;">
        <b>LAPORAN REALISASI PEMBAYARAN</b><br/>
        <span style="font-size:11px;">
          ${subtitle}
        </span>
      </div>
    `;
  };

  const buildTableHtml = ({ data, showStatus, mode = "detail" }) => {
    if (mode === "bulan") {
      return `
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:6px;">Bulan</th>
              <th style="border:1px solid #000;padding:6px;">Jumlah Berita Acara Opname</th>
              <th style="border:1px solid #000;padding:6px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (r) => `
              <tr>
                <td style="border:1px solid #000;padding:6px;">${r.bulan}</td>
                <td style="border:1px solid #000;padding:6px;text-align:center;">${r.jumlah}</td>
                <td style="border:1px solid #000;padding:6px;text-align:right;">
                  Rp ${toIDR(r.total)}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    return `
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr>
            <th style="border:1px solid #000;padding:6px;">Tanggal</th>
            <th style="border:1px solid #000;padding:6px;">Nomor Komplain</th>
            <th style="border:1px solid #000;padding:6px;">Nomor Berita Acara Opname</th>
            <th style="border:1px solid #000;padding:6px;">Kode Toko</th>
            <th style="border:1px solid #000;padding:6px;">Nama Toko</th>
            <th style="border:1px solid #000;padding:6px;text-align:right;">Total</th>
            ${showStatus ? `<th style="border:1px solid #000;padding:6px;">Status</th>` : ``}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (r) => `
            <tr>
              <td style="border:1px solid #000;padding:6px;">${r.tanggal}</td>
              <td style="border:1px solid #000;padding:6px;">${r.no_co}</td>
              <td style="border:1px solid #000;padding:6px;">${r.ba_opname_no || "-"}</td>
              <td style="border:1px solid #000;padding:6px;">${r.kode_toko}</td>
              <td style="border:1px solid #000;padding:6px;">${r.nama_toko}</td>
              <td style="border:1px solid #000;padding:6px;text-align:right;">Rp ${toIDR(
                r.total_harga
              )}</td>
              ${showStatus ? `<td style="border:1px solid #000;padding:6px;">${r.status_cair}</td>` : ``}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  const buildFooterHtml = () => {
    return `
      <div style="margin-top:20px; display:flex; justify-content:space-between; text-align:center; font-size:11px;">
        <div style="width:40%;">
          Dibuat oleh,<br/><br/><br/>
          <b>Admin</b>
        </div>
        <div style="width:40%;">
          Disetujui oleh,<br/><br/><br/>
          <b>Pemilik</b>
        </div>
      </div>

      <p style="margin-top:16px; font-size:10px; text-align:center; color:#555;">
        Dokumen ini dihasilkan oleh sistem dan bersifat final.
      </p>
    `;
  };

  const exportPdf = ({ filename, subtitle, data, showStatus, mode }) => {
    const el = document.createElement("div");
    el.style.fontFamily = "Arial";
    el.style.padding = "6px";

    el.innerHTML = `
      ${buildHeaderHtml({ subtitle })}
      ${buildTableHtml({ data, showStatus, mode })}
      ${buildFooterHtml()}
    `;

    html2pdf()
      .set({
        margin: 10,
        filename,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(el)
      .save();
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach((r) => {
      const bulan = r.tanggal?.slice(0, 7); // YYYY-MM
      if (!bulan) return;

      if (!map[bulan]) {
        map[bulan] = { bulan, jumlah: 0, total: 0 };
      }
      map[bulan].jumlah += 1;
      map[bulan].total += Number(r.total_harga || 0);
    });
    return Object.values(map);
  };

  const doExport = async (type) => {
    if (!rows.length) return alert("Data kosong");

    if (type === "bulan") {
      const rekap = groupByMonth(rows);
      exportPdf({
        filename: `LAPORAN_REKAP_BULAN_${from}_sd_${to}.pdf`,
        subtitle: "Rekapitulasi Per Bulan",
        data: rekap,
        showStatus: false,
        mode: "bulan",
      });
    } else {
      exportPdf({
        filename: `LAPORAN_DETAIL_${from}_sd_${to}.pdf`,
        subtitle: "Detail Per Toko",
        data: rows,
        showStatus: true,
        mode: "detail",
      });
    }
  };

  // modal pilih toko
  const [showModal, setShowModal] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);

  const toggleStore = (kode) => {
    setSelectedStores((prev) =>
      prev.includes(kode) ? prev.filter((x) => x !== kode) : [...prev, kode]
    );
  };

  const exportSelectedStores = () => {
    const data = rows.filter((r) => selectedStores.includes(r.kode_toko));
    if (!data.length) return alert("Tidak ada data terpilih");

    exportPdf({
      filename: `LAPORAN_TOKO_TERPILIH_${from}_sd_${to}.pdf`,
      subtitle: "Export berdasarkan toko terpilih",
      data,
      showStatus: true,
    });

    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Laporan</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-6 gap-3">
        <div>
          <label className="text-sm text-gray-600">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Status Cair</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="belum">Belum</option>
            <option value="proses">Proses</option>
            <option value="sudah">Sudah</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Status BA</label>
          <select
            value={hasBa}
            onChange={(e) => setHasBa(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="ada">Ada BA</option>
            <option value="tidak">Belum Ada BA</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Cari</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CO/BA/KDTK/Nama toko"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
          Pilih Toko
        </button>
        <button
          onClick={() => doExport("bulan")}
          className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          Unduh Laporan PDF (Per Bulan)
        </button>
        <button
          onClick={() => doExport("toko")}
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          Unduh Laporan PDF (Per Toko)
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b text-sm text-gray-600">
          Periode {from} s/d {to} — {meta.total} baris
        </div>

        {loadingTable ? (
          <div className="p-6 text-gray-500">Memuat data…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-gray-500">Tidak ada data.</div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Nomor Komplain</th>
                    <th className="px-3 py-2 text-left">Nomor BA Opname</th>
                    <th className="px-3 py-2 text-left">Kode Toko</th>
                    <th className="px-3 py-2 text-left">Nama Toko</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Status Cair</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => (
                    <tr key={r.id || `${r.no_co}-${r.kode_toko}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{r.tanggal}</td>
                      <td className="px-3 py-2">{r.no_co}</td>
                      <td className="px-3 py-2">{r.ba_opname_no || "-"}</td>
                      <td className="px-3 py-2">{r.kode_toko}</td>
                      <td className="px-3 py-2">{r.nama_toko}</td>
                      <td className="px-3 py-2 text-right">Rp {toIDR(r.total_harga)}</td>
                      <td className="px-3 py-2">
                        {r.status_cair === "sudah" ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                            Sudah
                          </span>
                        ) : r.status_cair === "proses" ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                            Proses
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            Belum
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* modal pilih toko */}
            {showModal && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg w-[95%] md:w-[900px] p-6 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-3">
                    Pilih Toko yang Akan Diexport
                  </h2>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStores.length === rows.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStores(rows.map((r) => r.kode_toko));
                                } else {
                                  setSelectedStores([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-3 py-2 text-left">Tanggal</th>
                          <th className="px-3 py-2 text-left">Nomor Komplain</th>
                          <th className="px-3 py-2 text-left">Nomor BA Opname</th>
                          <th className="px-3 py-2 text-left">Kode Toko</th>
                          <th className="px-3 py-2 text-left">Nama Toko</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 text-left">Status Cair</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.map((r) => (
                          <tr key={`${r.kode_toko}-${r.no_co}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedStores.includes(r.kode_toko)}
                                onChange={() => toggleStore(r.kode_toko)}
                              />
                            </td>
                            <td className="px-3 py-2">{r.tanggal}</td>
                            <td className="px-3 py-2">{r.no_co}</td>
                            <td className="px-3 py-2">{r.ba_opname_no || "-"}</td>
                            <td className="px-3 py-2">{r.kode_toko}</td>
                            <td className="px-3 py-2">{r.nama_toko}</td>
                            <td className="px-3 py-2 text-right">Rp {toIDR(r.total_harga)}</td>
                            <td className="px-3 py-2">
                              {r.status_cair === "sudah" ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                  Sudah
                                </span>
                              ) : r.status_cair === "proses" ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                                  Proses
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                  Belum
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      onClick={exportSelectedStores}
                      className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* pagination */}
            <div className="flex items-center justify-between p-3 border-t bg-white text-sm">
              <div>
                Halaman {meta.page} / {meta.pages}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Tampil</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="border rounded px-2 py-1"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages || 1, p + 1))}
                  disabled={meta.page >= meta.pages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
