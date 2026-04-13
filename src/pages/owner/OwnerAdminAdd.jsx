import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const ownerToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user_owner") || "{}")?.token || "";
  } catch {
    return "";
  }
};

export default function OwnerAdminAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  // REGEX
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^(628\d{8,13}|08\d{8,13})$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  // VALIDASI → ALERT
  if (!emailRegex.test(form.email)) {
    alert("❌ Email tidak valid. Gunakan format email yang benar.");
    setLoading(false);
    return;
  }

  if (form.phone && !phoneRegex.test(form.phone)) {
    alert("❌ Nomor HP harus format Indonesia (628xxxx atau 08xxxx).");
    setLoading(false);
    return;
  }

  if (!passwordRegex.test(form.password)) {
    alert("❌ Password minimal 6 karakter dan harus mengandung huruf & angka.");
    setLoading(false);
    return;
  }

  let phoneFix = form.phone;
  if (phoneFix.startsWith("08")) {
    phoneFix = "628" + phoneFix.slice(1);
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerToken()}`,
      },
      body: JSON.stringify({
        ...form,
        phone: phoneFix,
        role: "admin",
      }),
    });

    const j = await res.json();
    if (!res.ok || j.success === false) {
      throw new Error(j.error || "Gagal menambah admin.");
    }

    // ALERT BERHASIL
    alert("✅ Admin berhasil ditambahkan");

    // PINDAH HALAMAN
    navigate("/owner/manajemen-admin");
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    setLoading(false);
  }
}



  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tambah Admin Baru</h2>
        
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Kiri */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama Lengkap</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Kanan */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">No HP</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Alamat</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[88px]"required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Jl. ..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t">
          {msg && (
            <span
              className={`text-sm ${
                msg.startsWith("✅") ? "text-emerald-600" : "text-rose-600"
              } mr-auto`}
            >
              {msg}
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate("/owner/manajemen-admin")}
            className="px-4 py-2 rounded-lg text-sm ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save size={16} /> {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
