import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const token = () => {
  try {
    return JSON.parse(localStorage.getItem("user_owner") || "{}")?.token || "";
  } catch {
    return "";
  }
};

export default function OwnerAdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ username: "", name: "", email: "" });

  useEffect(() => {
  const fetchData = async () => {
    try {
      const r = await fetch(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!r.ok) throw new Error("Gagal memuat data admin");
      const j = await r.json();

      // ✅ Tambahkan phone dan address
      setForm({
        username: j.username || "",
        name: j.name || "",
        email: j.email || "",
        phone: j.phone || "",
        address: j.address || "",
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]);


  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const r = await fetch(`${API}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      }),
    });

    if (!r.ok) throw new Error("Gagal menyimpan perubahan");

    // ALERT BERHASIL CUUYY
    alert(" Data admin berhasil diperbarui");

    navigate("/owner/manajemen-admin");
  } catch (e) {
    alert("❌ " + e.message);
    setErr(e.message);
  } finally {
    setLoading(false);
  }
};



  if (loading) return <div className="p-6 text-gray-500">Memuat data…</div>;

  return (
  <div className="p-6 md:p-8 space-y-6">
    {/* Header */}

    <h1 className="text-2xl font-bold">Edit Admin</h1>

    {err && (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded">
        {err}
      </div>
    )}

    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {/* Kiri */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nama Lengkap</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Kanan */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">No HP</label>
          <input
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="08xxxxxxxxxx"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Alamat</label>
          <textarea
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[88px]"
            placeholder="Jl. ..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm ring-1 ring-gray-300 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
        >
          <FaSave size={16} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  </div>
);
}