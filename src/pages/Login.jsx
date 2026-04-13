import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // username ATAU email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
  e.preventDefault();
  setError("");

  const u = username.trim();
  const p = password;
  if (!u || !p) {
    setError("Username/Email dan Password wajib diisi.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json() : { success: false, error: await res.text() };

    if (!res.ok || payload.success === false) {
      setError(payload?.error || `Login gagal (${res.status}).`);
      return;
    }

    // Normalisasi bentuk payload
    const userRaw =
      payload.user ?? {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        name: payload.name,
        avatar: payload.avatar,
      };

    const token =
      payload.token ?? payload.accessToken ?? payload.jwt ?? userRaw?.token;

    if (!userRaw?.id || !userRaw?.username) {
      setError("Response server tidak valid (user kosong).");
      return;
    }
    if (!token) {
      setError("Token tidak diterima dari server. Pastikan backend mengirim JWT.");
      return;
    }

    // Simpan user + token
const user = { ...userRaw, token, role: payload.user?.role || userRaw.role || "admin" };
localStorage.setItem("user_admin", JSON.stringify(user));
localStorage.setItem("token", token);

// Redirect sesuai role
if (user.role === "owner") {
  navigate("/owner", { replace: true });
} else {
  navigate("/dashboard", { replace: true });
}
} catch (err) {
  console.error("[LOGIN] fetch error:", err);
  setError("Tidak dapat terhubung ke server. Cek backend & jaringan.");
} finally {
  setLoading(false);
}
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logoaim.png" alt="Logo AIM Teknik" className="h-24 md:h-28 mx-auto" />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold mb-1">
          Aplikasi Manajemen Tagihan<br />CV. AIM Teknik
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Silakan isi <b>username/email</b> dan password untuk masuk
        </p>

        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username atau Email"
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
              autoFocus
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password"
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-2 text-gray-500"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"} text-white py-2 rounded text-sm font-semibold`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-sm text-center mt-4">
          <a href="/lupa-password" className="text-blue-700 text-sm">
            Lupa password?
          </a>
        </div>
      </div>
    </div>
  );
}
