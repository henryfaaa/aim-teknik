// src/components/Topbar.jsx
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Menu } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || ""; // kosong = pakai proxy Vite

// helper: build URL avatar + cache buster
function resolveAvatar(avatar, ts) {
  if (!avatar) return "/user.png";
  const url = avatar.startsWith("/uploads") ? `${API_URL}${avatar}` : avatar;
  return ts ? `${url}?t=${ts}` : url;
}

export default function Topbar({ setOpen }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPass, setOpenPass] = useState(false);
  const dropdownRef = useRef(null);

  // 🔹 Cek role berdasarkan path URL
  const isOwnerPage = window.location.pathname.startsWith("/owner");

  // 🔹 Ambil user sesuai role
  useEffect(() => {
    const raw = isOwnerPage
  ? localStorage.getItem("user_owner")
  : localStorage.getItem("user_admin") || localStorage.getItem("user");

    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, [isOwnerPage]);

 // 🔹 Sinkronisasi ke /me sesuai role
useEffect(() => {
  const raw = isOwnerPage 
  ? localStorage.getItem("user_owner")
  : localStorage.getItem("user_admin") || localStorage.getItem("user");

  const stored = JSON.parse(raw || "{}");
  const token = isOwnerPage
  ? localStorage.getItem("owner_token")
  : localStorage.getItem("token");

if (!token) return;


  //  Tentukan endpoint sesuai role
  const endpoint = isOwnerPage ? "/api/owner/me" : "/api/users/me";

  fetch(`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r)))
    .then((me) => {
      const next = { ...stored, ...me };
      const key = isOwnerPage ? "user_owner" : "user_admin";
      localStorage.setItem(key, JSON.stringify(next));
      setUser(next);
    })
    .catch(() => {});
}, [isOwnerPage]);


  // 🔹 Logout bersih
 function handleLogout() {
  const isOwnerPage = window.location.pathname.startsWith("/owner");

  localStorage.removeItem("user_admin");
  localStorage.removeItem("user_owner");
  localStorage.removeItem("user");

  window.location.href = isOwnerPage ? "/owner/login" : "/login";
}


  // 🔹 Warna otomatis
  const isOwner = isOwnerPage || user?.role === "owner";
  const headerClass = "bg-white text-gray-800 shadow-sm border-b border-gray-200";


  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
  className={`flex justify-between items-center px-4 md:px-6 py-4 md:py-5 z-20 relative transition-colors ${headerClass}`}
>
      <div className="flex items-center gap-3">

  {/* tombol hamburger mobile */}
  <button
    onClick={() => setOpen(true)}
    className="lg:hidden"
  >
    <Menu size={22} />
  </button>

  <div
    className={`text-sm md:text-base ${
      isOwner ? "text-white/90" : "text-gray-700"
    }`}
  >
    {today}
  </div>

</div>

      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-4 hover:bg-gray-100 px-4 py-2 rounded-md transition hover:scale-[1.01]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <img
              src={resolveAvatar(user.avatar, user._avatarTs)}
              alt="User"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 object-cover"
            />
            <span className="flex flex-col text-left leading-tight">
              <span className="font-semibold text-sm text-gray-800">
                {user.name || "User"}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user.role}
              </span>
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-md text-sm border z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b">
                <div className="font-medium text-gray-800 truncate">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email || "—"}
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setOpenEdit(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                role="menuitem"
              >
                Edit Profil
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setOpenPass(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                role="menuitem"
              >
                Ganti Password
              </button>

              <div className="border-t my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {openEdit && (
        <EditProfileModal
          initialUser={user}
          onClose={() => setOpenEdit(false)}
          onSaved={(updated) => {
            setUser(updated);
            setOpenEdit(false);
          }}
        />
      )}

      {openPass && (
        <ChangePasswordModal
          onClose={() => setOpenPass(false)}
          onSaved={() => setOpenPass(false)}
        />
      )}
    </header>
  );
}

/* ------------------ Edit Profile Modal ------------------ */
function EditProfileModal({ initialUser, onClose, onSaved }) {
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");

  const [preview, setPreview] = useState(
    initialUser?.avatar ? resolveAvatar(initialUser.avatar) : "/user.png"
  );
  const [avatarB64, setAvatarB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function onPickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarB64(reader.result);
      setPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

      try {
        const storedRaw =
          localStorage.getItem("user_admin") ||
          localStorage.getItem("user_owner") ||
          localStorage.getItem("user");
        const stored = JSON.parse(storedRaw || "{}");
        const token =
    initialUser?.role === "owner"
      ? localStorage.getItem("owner_token")
      : localStorage.getItem("token");

  if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");



        const endpoint = initialUser?.role === "owner" ? "/api/owner/me" : "/api/users/me";
  const res = await fetch(`${API_URL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name?.trim(),
            email: email?.trim(),
            avatarBase64: avatarB64 || undefined,
          }),
        });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menyimpan profil.");
      }

      const updated = await res.json();
      const nextUser = {
        ...stored,
        ...updated,
        token: stored.token,
        _avatarTs: Date.now(),
      };

      const key = stored.role === "owner" ? "user_owner" : "user_admin";
      localStorage.setItem(key, JSON.stringify(nextUser));

      setMsg("Profil berhasil disimpan.");
      onSaved(nextUser);
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Gagal menyimpan profil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-[min(520px,95vw)] rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">Edit Profil</div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={preview || "/user.png"}
              alt="Preview"
              className="w-16 h-16 rounded-full border object-cover"
            />
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickAvatar}
              />
              <span className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">
                Ubah Foto
              </span>
              <span className="text-gray-500">(jpg/png)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
              placeholder="Nama"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
              placeholder="Email"
            />
          </div>

          {msg && <p className="text-sm text-gray-600">{msg}</p>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md text-sm hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              disabled={loading}
              className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------ Change Password Modal ------------------ */
function ChangePasswordModal({ onClose, onSaved }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setMsg("");

    if (newPassword.length < 6) {
      setMsg("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirm) {
      setMsg("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const raw =
        localStorage.getItem("user_owner") ||
        localStorage.getItem("user_admin") ||
        localStorage.getItem("user");

      const stored = JSON.parse(raw || "{}");
      const token =
  stored.role === "owner"
    ? localStorage.getItem("owner_token")
    : localStorage.getItem("token");

if (!token) throw new Error("Harap login ulang.");

      const endpoint =
        stored.role === "owner"
          ? "/api/owner/me/change-password"
          : "/api/users/me/change-password";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengganti password.");
      }

      setMsg("Password berhasil diganti.");
      onSaved();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-[min(480px,95vw)] rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">Ganti Password</div>
          <button onClick={onClose} className="px-2 py-1">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* CURRENT PASSWORD */}
          <div>
  <label className="block text-xs text-gray-500 mb-1">Password Saat Ini</label>
  <div className="relative">
    <input
      type={showCurrent ? "text" : "password"}
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm pr-11 focus:outline-none focus:ring"
      placeholder="Masukkan password saat ini"
      required
    />

    <button
      type="button"
      onClick={() => setShowCurrent((v) => !v)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
    >
      {showCurrent ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
    </button>
  </div>
</div>

          {/* NEW PASSWORD */}
          <div>
  <label className="block text-xs text-gray-500 mb-1">Password Baru</label>
  <div className="relative">
    <input
      type={showNew ? "text" : "password"}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm pr-11 focus:outline-none focus:ring"
      placeholder="Masukkan password baru"
      required
    />

    <button
      type="button"
      onClick={() => setShowNew((v) => !v)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
    >
      {showNew ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
    </button>
  </div>
</div>


          {/* CONFIRM */}
          <div>
  <label className="block text-xs text-gray-500 mb-1">Konfirmasi Password Baru</label>
  <div className="relative">
    <input
      type={showConfirm ? "text" : "password"}
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm pr-11 focus:outline-none focus:ring"
      placeholder="Ulangi password baru"
      required
    />

    <button
      type="button"
      onClick={() => setShowConfirm((v) => !v)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
    >
      {showConfirm ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
    </button>
  </div>
</div>

          {msg && <p className="text-sm text-red-600">{msg}</p>}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              Batal
            </button>
            <button
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

