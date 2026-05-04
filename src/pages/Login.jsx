import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "https://aim-teknik-production.up.railway.app";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
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
        setError("Response server tidak valid.");
        return;
      }

      if (!token) {
        setError("Token tidak ditemukan.");
        return;
      }

      const user = { ...userRaw, token, role: payload.user?.role || userRaw.role || "admin" };

      localStorage.setItem("user_admin", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (user.role === "owner") {
        navigate("/owner", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">

          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <img src="/logoaim.png" alt="Logo AIM Teknik" className="h-20 sm:h-24" />
          </div>

          {/* TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold leading-tight">
              Manajemen Tagihan<br />CV. AIM Teknik
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Masuk untuk melanjutkan
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* USERNAME */}
            <div>
              <label className="text-sm text-gray-600">Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full mt-1 border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full mt-1 border rounded-lg px-4 py-3 text-sm pr-12 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[38px] text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition ${
                loading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

          </form>

          {/* FOOTER */}
          <div className="text-center mt-5">
            <a href="/lupa-password" className="text-blue-600 text-sm">
              Lupa password?
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}