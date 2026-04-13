import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/* helpers */
const toIDR = (n) => (Number(n || 0)).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const parseIDR = (s) => Number(String(s || "0").replace(/[^\d]/g, "") || 0);

export default function EditPekerjaan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    tanggal: "",
    noCo: "",
    kodeToko: "",
    namaToko: "",
    items: [{ deskripsi: "", satuan: "", qty: "", harga: "" }],
    beforeFiles: [],
    afterFiles: [],
  });

  const [photos, setPhotos] = useState([]); // foto lama (read-only, hanya preview/link)

  // load detail
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/pekerjaan/${id}`);
        const j = await r.json();
        if (!alive) return;

        if (!j || !j.header) throw new Error("Data tidak ditemukan");
        const h = j.header;

        // map items → string harga terformat
        const items = (j.items || []).map((it) => ({
          deskripsi: it.deskripsi || "",
          satuan: it.satuan || "",
          qty: (it.qty ?? "") === "" ? "" : String(it.qty),
          harga: toIDR(it.harga || 0),
        }));
        setForm({
          tanggal: (h.tanggal || "").slice(0, 10),
          noCo: h.no_co || "",
          kodeToko: h.kode_toko || "",
          namaToko: h.nama_toko || "",
          items: items.length ? items : [{ deskripsi: "", satuan: "", qty: "", harga: "" }],
          beforeFiles: [],
          afterFiles: [],
        });
        setPhotos(j.photos || []);
        setErr("");
      } catch (e) {
        setErr(e?.message || "Gagal memuat data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const addItem = () =>
    setField("items", [...form.items, { deskripsi: "", satuan: "", qty: "", harga: "" }]);

  const updateItem = (idx, key, val) => {
    const next = form.items.slice();
    next[idx] = {
      ...next[idx],
      [key]: key === "harga" ? toIDR(parseIDR(val)) : val,
    };
    setField("items", next);
  };

  const removeItem = (idx) => {
    const next = form.items.slice();
    next.splice(idx, 1);
    setField("items", next.length ? next : [{ deskripsi: "", satuan: "", qty: "", harga: "" }]);
  };

  const onFiles = (name, fileList) => {
    setField(name, Array.from(fileList || []));
  };
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

const deletePhoto = async (fotoId) => {
  if (!confirm("Hapus foto ini?")) return;
  try {
    setDeletingPhotoId(fotoId);
    const r = await fetch(`/api/pekerjaan/${id}/foto/${fotoId}`, { method: "DELETE" });
    const j = await r.json();
    if (j?.ok === false) throw new Error(j?.message || "Delete failed");
    // hapus dari state tanpa reload
    setPhotos((arr) => arr.filter((p) => p.id !== fotoId));
  } catch (e) {
    alert(e?.message || "Gagal menghapus foto.");
  } finally {
    setDeletingPhotoId(null);
  }
};

  const total = useMemo(
    () =>
      form.items.reduce((sum, it) => {
        const qty = Number(String(it.qty || "").replace(",", ".") || 0);
        return sum + parseIDR(it.harga) * (isNaN(qty) ? 0 : qty);
      }, 0),
    [form.items]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.kodeToko || !form.namaToko) {
      alert("Lengkapi Tanggal, KDTK, dan Nama Toko.");
      return;
    }
    try {
      setSaving(true);

      const itemsClean = form.items
        .map((it, i) => ({
          deskripsi: String(it.deskripsi || "").trim(),
          satuan: String(it.satuan || "").trim(),
          qty: Number(String(it.qty || "").replace(",", ".") || 0) || 0,
          harga: parseIDR(it.harga),
          urut: i + 1,
        }))
        .filter((x) => x.deskripsi || x.harga > 0 || x.qty > 0);

      const fd = new FormData();
      fd.append("tanggal", form.tanggal);
      fd.append("no_co", form.noCo || "");
      fd.append("kode_toko", form.kodeToko);
      fd.append("nama_toko", form.namaToko);
      fd.append("items", JSON.stringify(itemsClean));
      form.beforeFiles.forEach((f) => fd.append("beforeFiles[]", f));
      form.afterFiles.forEach((f) => fd.append("afterFiles[]", f));

      await axios.put(`/api/pekerjaan/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Perubahan tersimpan.");
      navigate("/pekerjaan");
    } catch (e) {
  console.error(e);

  const msg =
    e?.response?.data?.message ||
    "Gagal melakukan pembaruan. Silakan input nomor CO baru.";

  alert("⚠️ " + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Memuat…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="w-full max-w-none mx-auto px-3 md:px-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Pekerjaan</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Identitas */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setField("tanggal", e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor CO</label>
              <input
                type="text"
                value={form.noCo}
                onChange={(e) => setField("noCo", e.target.value)}
                className="w-full border rounded px-3 py-2" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kode Toko (KDTK)</label>
              <input
                type="text"
                value={form.kodeToko}
                onChange={(e) => setField("kodeToko", e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Toko</label>
              <input
                type="text"
                value={form.namaToko}
                onChange={(e) => setField("namaToko", e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </section>

          {/* Items */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Deskripsi, Satuan, Qty & Harga</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                + Tambah Item
              </button>
            </div>

            <div className="space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    className="col-span-6 border rounded px-3 py-2"
                    placeholder="Deskripsi pekerjaan"
                    value={it.deskripsi}
                    onChange={(e) => updateItem(idx, "deskripsi", e.target.value)}
                  />
                  <input
                    type="text"
                    className="col-span-2 border rounded px-3 py-2"
                    placeholder="Satuan (m/ls/bh)"
                    value={it.satuan || ""}
                    onChange={(e) => updateItem(idx, "satuan", e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="col-span-2 border rounded px-3 py-2 text-right"
                    placeholder="Qty"
                    value={it.qty || ""}
                    onChange={(e) => updateItem(idx, "qty", e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    className="col-span-2 border rounded px-3 py-2 text-right"
                    placeholder="Harga"
                    value={it.harga}
                    onChange={(e) => updateItem(idx, "harga", e.target.value)}
                  />
                  <div className="col-span-12 text-right">
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-600 font-bold"
                        title="Hapus baris"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-lg font-semibold">
              Total Harga: <span className="text-blue-700">Rp. {toIDR(total)}</span>
            </div>
          </section>

          {/* Foto lama (preview) + tambah foto baru */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-semibold mb-2">Foto Lama</label>
  {photos.length === 0 ? (
    <div className="text-sm text-gray-500">Tidak ada foto.</div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {photos.map((p) => (
        <div key={p.id} className="relative group">
          <a href={p.path} target="_blank" rel="noreferrer" className="block">
            <img
              src={p.path}
              alt={p.original_name}
              className="w-full h-36 object-cover rounded"
            />
            <div className="mt-1 text-[10px] text-gray-500 truncate">
              {p.original_name}
            </div>
          </a>

          {/* Tombol Hapus (muncul saat hover) */}
          <button
            type="button"
            onClick={() => deletePhoto(p.id)}
            disabled={deletingPhotoId === p.id}
            className="absolute top-1 right-1 px-2 py-1 rounded text-xs
                       bg-red-600 text-white opacity-0 group-hover:opacity-100
                       disabled:opacity-60"
            title="Hapus foto"
          >
            {deletingPhotoId === p.id ? "..." : "Hapus"}
          </button>
        </div>
      ))}
    </div>
  )}
</div>


            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tambah Foto Sebelum</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 text-gray-500 hover:border-blue-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles("beforeFiles", e.target.files)}
                  />
                  <span className="text-sm">Klik untuk pilih foto</span>
                  <span className="text-xs">PNG/JPG</span>
                </label>
                {form.beforeFiles.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.beforeFiles.map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="before" className="h-20 w-full object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tambah Foto Sesudah</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 text-gray-500 hover:border-blue-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles("afterFiles", e.target.files)}
                  />
                  <span className="text-sm">Klik untuk pilih foto</span>
                  <span className="text-xs">PNG/JPG</span>
                </label>
                {form.afterFiles.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.afterFiles.map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="after" className="h-20 w-full object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded border"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
