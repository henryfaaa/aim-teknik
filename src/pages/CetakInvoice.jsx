import { useEffect, useState } from "react";

export default function CetakInvoice() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [list, setList] = useState([]);  // kandidat BA dari pekerjaan yg sudah punya ba_opname_no
  const [pick, setPick] = useState([]);  // ba_list terpilih
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");

  // ambil kandidat (dari pekerjaan langsung biar cepat)
  const reload = async () => {
    setErr("");
    try {
      const p = new URLSearchParams();
      p.set("limit", 200);
      if (query) p.set("search", query);
      if (from)  p.set("from", from);
      if (to)    p.set("to", to);

      const r = await fetch(`/api/pekerjaan?${p.toString()}`);
      const j = await r.json();
      const data = (j?.data || []).filter(x => x.ba_opname_no); // hanya yang ada BA
      setList(data);
    } catch (e) {
      setErr("Gagal memuat data");
      setList([]);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [query, from, to]);

  const togglePick = (ba) => {
    setPick(prev => prev.includes(ba) ? prev.filter(x=>x!==ba) : [...prev, ba]);
    setPreview(null);
  };

  const doPreview = async () => {
    setErr("");
    setPreview(null);
    if (pick.length === 0) return;
    try {
      const r = await fetch("/api/invoice/preview", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ba_list: pick })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Preview gagal");
      setPreview(j);
    } catch (e) {
      setErr(e.message || String(e));
    }
  };

  const doExport = async () => {
    if (!pick.length) return;
    const r = await fetch("/api/invoice/export", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ba_list: pick, mark_printed: true })
    });
    if (!r.ok) {
      const j = await r.json().catch(()=>null);
      alert(j?.error || "Gagal export");
      return;
    }
    // download blob
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INVOICE_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Cetak Invoice</h1>

      <div className="bg-white rounded-xl shadow p-4 grid md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Cari</label>
          <input value={query} onChange={e=>setQuery(e.target.value)}
                 placeholder="KDTK / Nama toko / No CO / No BA"
                 className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Dari</label>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Sampai</label>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        {err && <div className="p-4 text-red-600">{err}</div>}
        <div className="p-4 flex items-center gap-2">
          <button onClick={doPreview}
                  disabled={!pick.length}
                  className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Preview</button>
          <button onClick={doExport}
                  disabled={!preview}
                  className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">Export Excel</button>
          <div className="text-sm text-gray-600">Dipilih: <b>{pick.length}</b> BA</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-left">BA No</th>
                <th className="px-3 py-2 text-left">CO No</th>
                <th className="px-3 py-2 text-left">KDTK</th>
                <th className="px-3 py-2 text-left">Nama Toko</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={pick.includes(r.ba_opname_no)}
                      onChange={()=>togglePick(r.ba_opname_no)}
                    />
                  </td>
                  <td className="px-3 py-2">{r.tanggal}</td>
                  <td className="px-3 py-2">{r.ba_opname_no}</td>
                  <td className="px-3 py-2">{r.no_co}</td>
                  <td className="px-3 py-2">{r.kode_toko}</td>
                  <td className="px-3 py-2">{r.nama_toko}</td>
                  <td className="px-3 py-2 text-right">
                    Rp {Number(r.total_harga||0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {preview && (
          <div className="p-4 border-t">
            <div className="text-sm mb-2">
              Mode: <b>{preview.mode || "-"}</b> •
              Total: <b>Rp {Number(preview.total||0).toLocaleString("id-ID")}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
