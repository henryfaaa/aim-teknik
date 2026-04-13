import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Edit3, Trash2, RotateCw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOwnerToken } from "@/utils/token";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getOwnerToken()}`,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const ownerToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user_owner") || "{}")?.token || "";
  } catch {
    return "";
  }
};

export default function OwnerAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    id: null,
    username: "",
    name: "",
    email: "",
  });

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${ownerToken()}`,
  });

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      let r = await fetch(`${API}/api/owner/users`, { headers: headers() });
      if (!r.ok) r = await fetch(`${API}/api/users/admins`, { headers: headers() });
      const j = await r.json();
      const arr = Array.isArray(j) ? j : j.data || [];
      setAdmins(arr);
    } catch (e) {
      setErr("Gagal memuat daftar admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const filtered = useMemo(() => {
    let arr = admins || [];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          String(a.username || "").toLowerCase().includes(s) ||
          String(a.name || "").toLowerCase().includes(s) ||
          String(a.email || "").toLowerCase().includes(s)
      );
    }
    return arr;
  }, [admins, q]);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...form, role: "admin" }),
      });
      const j = await r.json();
      if (!r.ok || j.success === false)
        throw new Error(j.error || "Gagal menambah admin.");
      setForm({ username: "", name: "", email: "", password: "" });
      setShowAddForm(false);
      loadAdmins();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const { id, username, name, email } = editForm;
      const r = await fetch(`${API}/api/users/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ username, name, email }),
      });
      const j = await r.json();
      if (!r.ok || j.success === false)
        throw new Error(j.error || "Gagal mengubah data admin.");
      setOpenEdit(false);
      loadAdmins();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(a) {
    if (!confirm(`Hapus admin "${a.username}"?`)) return;
    try {
      const r = await fetch(`${API}/api/users/${a.id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false)
        throw new Error(j.error || "Gagal menghapus.");
      loadAdmins();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="flex h-full">
      {/* === LEFT SIDE (Table) === */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showAddForm ? "md:pr-[400px]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Manajemen Admin
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola akun admin internal secara efisien.
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => navigate("/owner/manajemen-admin/new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[.97] transition-all"
              >
                <Plus size={16} /> Tambah Admin
              </button>
            )}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 flex items-center gap-3 px-4 py-2 w-full sm:max-w-2xl">
            <Search className="text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari admin berdasarkan nama atau email..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          {/* Table */}
<div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
  <div className="bg-gray-50 px-5 py-3 font-semibold">
    Daftar Admin
  </div>
  
  {/* Border pemisah */}
  <div className="border-t border-gray-200" />

  <div className="p-4 overflow-x-auto">
    {loading ? (
      <div className="text-gray-500">Memuat data…</div>
    ) : filtered.length === 0 ? (
      <div className="text-gray-500 text-sm">Belum ada data.</div>
    ) : (
      <table className="min-w-[900px] w-full text-sm">
        <thead className="text-gray-600 border-b bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2">Username</th>
            <th className="text-left px-3 py-2">Nama</th>
            <th className="text-left px-3 py-2">Email</th>
            <th className="text-left px-3 py-2">No HP</th>
            <th className="text-left px-3 py-2">Alamat</th>
            <th className="text-left px-3 py-2">Role</th>
            <th className="text-right px-3 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 transition">
              <td className="px-3 py-2 font-medium">{a.username}</td>
              <td className="px-3 py-2">{a.name || "-"}</td>
              <td className="px-3 py-2">{a.email || "-"}</td>
              <td className="px-3 py-2">{a.phone || "-"}</td>
              <td className="px-3 py-2 max-w-[250px] truncate">{a.address || "-"}</td>
              <td className="px-3 py-2">{a.role || "-"}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center gap-3 justify-end">
                  <button
                    title="Edit"
                    onClick={() => navigate(`/owner/manajemen-admin/${a.id}/edit`)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    title="Hapus"
                    onClick={() => handleDelete(a)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

{err && (
  <div className="flex items-center gap-2 text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-3 py-2 rounded-lg">
    <RotateCw size={14} /> <span className="text-sm">{err}</span>
  </div>
          )}
        </div>
      </div>

      {/* === MODAL EDIT === */}
      {openEdit && (
        <div
          className="fixed inset-0 bg-black/30 z-50 grid place-items-center p-4"
          onClick={() => setOpenEdit(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Edit Admin</h3>
              <button
                onClick={() => setOpenEdit(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 grid gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((v) => ({ ...v, username: e.target.value }))
                }
                required
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Nama Lengkap"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((v) => ({ ...v, name: e.target.value }))
                }
              />
              <input
                type="email"
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((v) => ({ ...v, email: e.target.value }))
                }
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="px-3 py-2 rounded-lg ring-1 ring-gray-300 text-sm"
                >
                  Batal
                </button>
                <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}  