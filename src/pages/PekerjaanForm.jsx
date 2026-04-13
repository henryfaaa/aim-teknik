import React, { useMemo, useState } from "react";
import axios from "axios";

/* helpers */
const toIDR = (n) =>
  (Number(n || 0)).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const parseIDR = (s) => Number(String(s || "0").replace(/[^\d]/g, "") || 0);

export default function InputPekerjaan() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal: "",
    noCo: "",        
    kodeToko: "",    
    namaToko: "",    
    items: [{ deskripsi: "", satuan: "", qty: "", harga: "" }],
    beforeFiles: [],
    afterFiles: [],
  });

  // total = SUM(qty * hargaPerSatuan)
  const total = useMemo(
    () =>
      form.items.reduce((sum, it) => {
        const qty = Number(String(it.qty || "").replace(",", ".") || 0);
        return sum + (parseIDR(it.harga) * (isNaN(qty) ? 0 : qty));
      }, 0),
    [form.items]
  );

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const addItem = () =>
    setField("items", [...form.items, { deskripsi: "", satuan: "", qty: "", harga: "" }]);

  const updateItem = (idx, key, val) => {
    const items = form.items.slice();
    items[idx] = {
      ...items[idx],
      [key]: key === "harga" ? toIDR(parseIDR(val)) : val,
    };
    setField("items", items);
  };

  const removeItem = (idx) => {
    const items = form.items.slice();
    items.splice(idx, 1);
    setField(
      "items",
      items.length ? items : [{ deskripsi: "", satuan: "", qty: "", harga: "" }]
    );
  };

  const onFiles = (name, fileList) => {
    setField(name, Array.from(fileList || []));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.kodeToko || !form.namaToko) {
      alert("Lengkapi Tanggal, KDTK, dan Nama Toko.");
      return;
    }

    try {
      setLoading(true);

      const itemsClean = form.items
        .map((it, i) => ({
          deskripsi: String(it.deskripsi || "").trim(),
          satuan: String(it.satuan || "").trim(),
          qty: Number(String(it.qty || "").replace(",", ".") || 0) || 0,
          harga: parseIDR(it.harga), // harga per satuan (rupiah)
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

      await axios.post("/api/pekerjaan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Pekerjaan tersimpan.");
      window.location.href = "/pekerjaan";
    } catch (err) {
  console.error(err);

  const msg =
    err?.response?.data?.message ||
    "Nomor Complain sudah digunakan. Silakan input nomor CO baru.";

  alert("⚠️ " + msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold">Input Pekerjaan</h1>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Complain</label>
              <input
                type="text"
                value={form.noCo}
                onChange={(e) => setField("noCo", e.target.value)}
                placeholder="Masukkan Nomor CO"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kode Toko</label>
              <input
                type="text"
                value={form.kodeToko}
                onChange={(e) => setField("kodeToko", e.target.value)}
                placeholder="Kode Toko"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Toko</label>
              <input
                type="text"
                value={form.namaToko}
                onChange={(e) => setField("namaToko", e.target.value)}
                placeholder="Nama Toko"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </section>

          {/* Item Pekerjaan */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h2 className="font-semibold">Deskripsi, Satuan, Qty & Harga</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                + Tambah Item
              </button>
            </div>

            <div className="space-y-4">
              {form.items.map((it, idx) => (
                <div key={idx} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-xl bg-slate-50 relative">
                  
                  {/* Header & Tombol Hapus */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-sm font-bold text-gray-700">Item #{idx + 1}</span>
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-xs bg-red-100 text-red-600 hover:bg-red-200 font-semibold px-2 py-1 rounded"
                      >
                        Hapus Item
                      </button>
                    )}
                  </div>

                  {/* Deskripsi */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Deskripsi Pekerjaan</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Masukkan deskripsi"
                      value={it.deskripsi}
                      onChange={(e) => updateItem(idx, "deskripsi", e.target.value)}
                    />
                  </div>

                  {/* Satuan, Qty, Harga (Bisa vertikal di HP, nyamping dikit di PC) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Satuan */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Satuan</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        value={it.satuan || ""}
                        onChange={(e) => updateItem(idx, "satuan", e.target.value)}
                      >
                        <option value="">Pilih Satuan</option>
                        <option value="M">M</option>
                        <option value="M²">M²</option>
                        <option value="M³">M³</option>
                        <option value="Ls">Ls</option>
                        <option value="Bh">Bh</option>
                        <option value="Unit">Unit</option>
                        <option value="Set">Set</option>
                        <option value="kg">Kg</option>
                        <option value="Titik">Titik</option>
                        <option value="Liter">Liter</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </div>

                    {/* Qty */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Qty</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={it.qty ?? ""}
                        onChange={(e) => {
                          let val = e.target.value;
                          val = val.replace(/[^0-9.]/g, "");
                          if ((val.match(/\./g) || []).length > 1) return;
                          if (!/^\d*\.?\d*$/.test(val)) return;

                          if (/^0[0-9]+$/.test(val) && val.length > 1) {
                            val = "0." + val.slice(1);
                          }
                          if (val.includes(".")) {
                            const [a, b] = val.split(".");
                            val = a + "." + b.slice(0, 3);
                          }
                          updateItem(idx, "qty", val);
                        }}
                      />
                    </div>

                    {/* Harga/satuan */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Harga Satuan (Rp)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="0"
                        value={it.harga}
                        onChange={(e) => updateItem(idx, "harga", e.target.value)}
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-lg font-semibold">
              Total Harga: <span className="text-blue-700">Rp. {toIDR(total)}</span>
            </div>
          </section>

          {/* Upload Foto */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Foto Sebelum</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 md:p-6 text-gray-500 hover:border-blue-500 cursor-pointer">
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
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {form.beforeFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="before" className="h-20 w-full object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Foto Sesudah</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 md:p-6 text-gray-500 hover:border-blue-500 cursor-pointer">
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
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {form.afterFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="after" className="h-20 w-full object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>  
    </div>
  );
}
