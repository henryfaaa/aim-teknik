import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // ✅ kirim email ke backend
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("❌ " + (data.error || "Gagal reset password."));
      } else {
        // Untuk skripsi/demo → backend balikin message
        setStatus("✅ " + data.message);
      }
    } catch (err) {
      console.error("[RESET] error:", err);
      setStatus("❌ Terjadi kesalahan. Coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img
            src="/logoaim.png"
            alt="Logo AIM Teknik"
            className="h-20 mx-auto mb-2"
          />
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-sm text-gray-600">
            Masukkan email akun Anda untuk menerima link reset password
          </p>
        </div>

        {status && (
          <p
            className={`text-sm text-center mb-4 font-medium ${
              status.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {status}
          </p>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email akun"
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
            } text-white py-2 rounded text-sm font-semibold`}
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}
