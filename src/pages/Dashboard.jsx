import { useEffect, useMemo, useState, useCallback } from "react";
import { getAdminToken } from "@/utils/token";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAdminToken()}`,
});

/* ===== Utils ===== */
const toIDR = (n) =>
  Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const parseYmd = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/* ===== Small comps ===== */
function Ring({ percent = 0, size = 110, stroke = 12, color = "#2563eb" }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  return (
    <svg width={size} height={size} aria-label={`${p}%`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#eef2f7" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${size/2} ${size/2})`} fill="none" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        className="fill-gray-900 font-bold text-xl">{p}%</text>
    </svg>
  );
}
function Pill({ label, value, tone = "gray" }) {
  const toneCls = {
    gray: "bg-gray-50 text-gray-800 ring-gray-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  }[tone];
  return (
    <div className={`px-4 py-3 rounded-2xl ring-1 ${toneCls} flex items-center justify-between`}>
      <span className="text-xs">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
function Card({ title, tone = "blue", href, children }) {
  const headColor =
    tone === "indigo" ? "bg-indigo-600"
    : tone === "emerald" ? "bg-emerald-600"
    : "bg-blue-600";
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper href={href} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition">
      <div className={`${headColor} text-white px-5 py-3 text-base font-semibold`}>{title}</div>
      <div className="p-4 md:p-6 grid gap-4">{children}</div>
    </Wrapper>
  );
}
const Badge = ({ children, tone = "gray" }) => {
  const cls = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
  }[tone];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{children}</span>;
};

/* ===== Page ===== */
export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [baStatusMap, setBaStatusMap] = useState({}); // BA → 'proses' | 'sudah'
  const [ttfSum, setTtfSum] = useState({ total: 0, proses: 0, sudah: 0 }); // opsional
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // periode filter
  const [range, setRange] = useState("30d"); // 30d | 90d | ytd | all

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [rJobs, rMap] = await Promise.all([
          fetch("/api/pekerjaan?limit=1000&page=1"),
          fetch("/api/ttf/ba-status"),
        ]);

        const jJobs = await rJobs.json();
        const jMap  = await rMap.json().catch(() => ({ ok:false }));

        if (!on) return;
        setRows(Array.isArray(jJobs.data) ? jJobs.data : []);
        setBaStatusMap(jMap?.ok ? (jMap.map || {}) : {});
        } catch {
          if (on) setErr("Gagal memuat data");
      } finally {
        if (on) setLoading(false);
      }
    })();

    // ambil ringkas TTF
    (async () => {
      try {
        const r = await fetch("/api/ttf");
        const j = await r.json();
        if (j?.ok && Array.isArray(j.data)) {
          const total  = j.data.length;
          const proses = j.data.filter(x => x.status === "proses").length;
          const sudah  = j.data.filter(x => x.status === "sudah_cair").length;
          setTtfSum({ total, proses, sudah });
        }
      } catch {
        // error diabaikan
      }
    })();

    return () => (on = false);
  }, []);

  // Normalisasi status cair
  const statusCairEff = useCallback((r) => {
    const s1 = String(r.status_cair || "").trim().toLowerCase();
    if (["sudah","cair","selesai","done"].includes(s1)) return "cair";
    if (["proses","progress","onprogress","finance"].includes(s1)) return "proses";
    const ba = String(r.ba_opname_no || "").replace(/\s+/g, "");
    const viaTtf = ba ? baStatusMap[ba] : "";
    if (viaTtf === "sudah") return "cair";
    if (viaTtf === "proses") return "proses";
    return "belum";
  }, [baStatusMap]);

  // Filter by periode
  const rowsInRange = useMemo(() => {
    if (range === "all") return rows;
    const now = new Date();
    let start = new Date(0);
    if (range === "30d") start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    if (range === "90d") start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    if (range === "ytd") start = new Date(now.getFullYear(), 0, 1);
    return rows.filter(r => {
      const dt = parseYmd(r.tanggal);
      return dt ? dt >= start && dt <= now : true;
    });
  }, [rows, range]);

  const stat = useMemo(() => {
    const arr = rowsInRange || [];

    // ---- Pekerjaan (count)
    const siapKirim  = arr.filter(r => String(r.status || "").toLowerCase() === "siap_kirim").length;
    const terkirimWA = arr.filter(r => String(r.status || "").toLowerCase() === "terkirim").length;
    const totalJobs  = arr.length;

    // ---- Pencairan (nominal)
    const totals = arr.reduce((a, r) => {
      const g   = statusCairEff(r); // 'belum' | 'proses' | 'cair'
      const val = Number(r.total_harga || 0);
      a[g] = (a[g] || 0) + val;
      return a;
    }, { belum:0, proses:0, cair:0 });

    const totalTagihan = totals.belum + totals.proses + totals.cair;
    const pctCair = totalTagihan ? Math.round((totals.cair / totalTagihan) * 100) : 0;

    // ---- BA Opname (hanya yang belum cair)
    const notCair = arr.filter(r => statusCairEff(r) !== "cair");
    const withBA  = notCair.filter(r => !!String(r.ba_opname_no || "").trim()).length;
    const pctBA   = notCair.length ? Math.round((withBA / notCair.length) * 100) : 0;

    return {
      pekerjaan: { siapKirim, terkirimWA, total: totalJobs },
      pencairan: { ...totals, total: totalTagihan, pct: pctCair },
      ba: { withBA, withoutBA: notCair.length - withBA, pct: pctBA },
    };
  }, [rowsInRange, statusCairEff]);

  // Recent 5
  const recent = useMemo(() => {
    return [...rows]
      .sort((a,b) => String(b.tanggal).localeCompare(String(a.tanggal)))
      .slice(0,5);
  }, [rows]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6 space-y-6">
     <div className="space-y-3">

  {/* ALERT (pisahin biar jadi fokus) */}
  {stat.ba.withoutBA > 0 && (
    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm text-amber-700">
      ⚠️ {stat.ba.withoutBA} pekerjaan belum ada BA
    </div>
  )}

  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    
    <h2 className="text-xl font-bold">Dashboard</h2>

    <div className="flex items-center gap-2">
      <select
        value={range}
        onChange={(e)=>setRange(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="30d">30 hari</option>
        <option value="90d">90 hari</option>
        <option value="ytd">Year to date</option>
        <option value="all">Semua</option>
      </select>

      <div className="text-xs text-gray-500">
        {rows.length} data
      </div>
    </div>

  </div>

</div>

      {/* 3 main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="Pekerjaan" tone="blue" href="/pekerjaan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pill label="Siap Kirim"    value={stat.pekerjaan.siapKirim}  tone="indigo" />
            <Pill label="Terkirim (WA)" value={stat.pekerjaan.terkirimWA} tone="blue" />
          </div>
          <div className="mt-2 flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 ring-1 ring-gray-200">
            <span className="text-sm text-gray-600">Total Pekerjaan</span>
            <span className="text-3xl font-black text-gray-900">{stat.pekerjaan.total}</span>
          </div>
        </Card>

        <Card title="BA Opname" tone="indigo" href="/ba-opname">
          <div className="flex items-center gap-6">
            <Ring percent={stat.ba.pct} size={70}color="#4f46e5" />
            <div className="flex-1 grid gap-3">
              <Pill label="Ada BA"        value={stat.ba.withBA}     tone="emerald" />
              <Pill label="Belum Ada BA"  value={stat.ba.withoutBA}  tone="amber" />
              <div className="text-[12px] text-gray-500 mt-1">* Ringkasan BA Opname yang belum masuk pencairan.</div>
            </div>
          </div>
        </Card>

        <Card title="Pencairan" tone="emerald" href="/pencairan">
          <div className="flex items-center gap-6">
            <Ring percent={stat.pencairan.pct} size={80}color="#059669" />
            <div className="flex-1 grid gap-3">
              <Pill label="Belum Dibayar"  value={`Rp ${toIDR(stat.pencairan.belum)}`}  tone="gray" />
              <Pill label="Proses Pembayaran" value={`Rp ${toIDR(stat.pencairan.proses)}`} tone="indigo" />
              <Pill label="Sudah Dibayar"  value={`Rp ${toIDR(stat.pencairan.cair)}`}   tone="emerald" />
              <div className="text-[12px] text-gray-500 mt-1">
                Total tagihan: <b>Rp {toIDR(stat.pencairan.total)}</b>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-lg transition ring-1 ring-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 font-semibold">Aktivitas Terbaru</div>
          <div className="p-3 md:p-4">
            {recent.length === 0 ? (
              <div className="text-sm text-gray-500">Belum ada aktivitas.</div>
            ) : (
              <div className="space-y-3">
  {recent.map((r) => {
    const status = statusCairEff(r);

    return (
      <div key={r.id} className="bg-white border rounded-xl p-4 shadow-sm">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm">{r.nama_toko}</div>
            <div className="text-xs text-gray-500">
              {r.tanggal?.split("-").reverse().join("/")}
            </div>
          </div>

          <div className="text-sm font-semibold">
            Rp {toIDR(r.total_harga)}
          </div>
        </div>

        {/* INFO */}
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div>CO: {r.no_co}</div>
          <div>BA: {r.ba_opname_no || "-"}</div>
        </div>

        {/* STATUS */}
        <div className="mt-3">
          {status === "cair" ? (
            <Badge tone="green">Sudah Dibayar</Badge>
          ) : status === "proses" ? (
            <Badge tone="blue">Proses</Badge>
          ) : (
            <Badge tone="yellow">Belum</Badge>
          )}
        </div>
      </div>
    );
  })}
            </div>
            )}
          </div>
        </div>

        {/* TTF summary small card */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition ring-1 ring-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 font-semibold">Ringkasan Jumlah File TTF</div>
          <div className="p-5 grid gap-3">
            <Pill label="Total TTF"   value={ttfSum.total} tone="gray" />
            <Pill label="Proses Cair" value={ttfSum.proses} tone="indigo" />
            <Pill label="Sudah Cair"  value={ttfSum.sudah} tone="emerald" />
            <a href="/pencairan" className="mt-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">Kelola TTF</a>
          </div>
        </div>
      </div>

      {loading && <div className="text-gray-500">Memuat data…</div>}
      {err && <div className="text-red-600">{err}</div>}
    </div>
  );
}
