import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetNewPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirm) {
      setError("Password baru dan konfirmasi wajib diisi.");
      return;
    }

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal reset password.");
      } else {
        setSuccess("Password berhasil direset. Silakan login kembali.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat reset.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src="/logoaim.png" alt="Logo AIM Teknik" className="h-20 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Buat Password Baru</h2>
          <p className="text-sm text-gray-600">Silakan masukkan password baru Anda</p>
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Password Baru</label>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Konfirmasi Password</label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
              placeholder="Ulangi password baru"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={show}
              onChange={() => setShow(!show)}
              id="showpass"
            />
            <label htmlFor="showpass" className="text-sm">Tampilkan password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded text-sm font-semibold"
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
