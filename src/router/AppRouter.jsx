import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import OwnerLayout from "../pages/owner/OwnerLayout";

// Pages (Admin)
import Dashboard from "../pages/Dashboard";
import PekerjaanList from "../pages/PekerjaanList";
import PekerjaanForm from "../pages/PekerjaanForm";
import PekerjaanEdit from "../pages/EditPekerjaan.jsx";
import BAOpname from "../pages/BAOpname";
import Pencairan from "../pages/Pencairan";
import Laporan from "../pages/Laporan";
import UploadTTF from "../pages/UploadTTF";
import CetakInvoice from "../pages/CetakInvoice";

// Pages (Owner)
import OwnerLogin from "../pages/owner/OwnerLogin";
import OwnerAdminManagement from "../pages/owner/OwnerAdminManagement";
import OwnerLaporan from "../pages/owner/OwnerLaporan";
import OwnerAdminAdd from "../pages/owner/OwnerAdminAdd";
import OwnerAdminEdit from "../pages/owner/OwnerAdminEdit";

// Auth
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";
import ResetNewPassword from "../pages/ResetNewPassword";

/* ============================
 * UTILITIES
 * ============================ */
const getAuthUser = () => {
  try {
    const rawAdmin = localStorage.getItem("user_admin");
    const rawOwner = localStorage.getItem("user_owner");

    if (window.location.pathname.startsWith("/owner") && rawOwner)
      return JSON.parse(rawOwner);

    if (rawAdmin) return JSON.parse(rawAdmin);
    if (rawOwner) return JSON.parse(rawOwner);
    return null;
  } catch {
    return null;
  }
};

const fetchUserFromServer = async () => {
  try {
    const token =
      JSON.parse(localStorage.getItem("user_admin"))?.token ||
      JSON.parse(localStorage.getItem("user_owner"))?.token;

    if (!token) return null;

    const res = await fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("unauthorized");

    const data = await res.json();

    if (data.role === "owner")
      localStorage.setItem("user_owner", JSON.stringify({ ...data, token }));
    else
      localStorage.setItem("user_admin", JSON.stringify({ ...data, token }));

    return data;
  } catch {
    localStorage.removeItem("user_admin");
    localStorage.removeItem("user_owner");
    return null;
  }
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ============================
 * GUARDS
 * ============================ */
const RequireAuth = ({ children }) => {
  const [user, setUser] = useState(getAuthUser());
  const [checked, setChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const serverUser = await fetchUserFromServer();
        if (serverUser) setUser(serverUser);
      }
      setChecked(true);
    };
    init();
  }, []);

  if (!checked) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const RequireRole = ({ role, children }) => {
  const user =
    getAuthUser() ||
    JSON.parse(localStorage.getItem("user_admin")) ||
    JSON.parse(localStorage.getItem("user_owner"));

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role)
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2 text-red-500">
          Akses ditolak
        </h1>
        <p className="text-gray-700">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <a
          className="text-blue-600 underline mt-3 block"
          href={user.role === "owner" ? "/owner/laporan" : "/dashboard"}
        >
          Kembali ke {user.role === "owner" ? "Laporan Owner" : "Dashboard"}
        </a>
      </div>
    );

  return children;
};

const PublicOnly = ({ children }) => {
  const location = useLocation();
  const user = getAuthUser();

  if (user) {
    if (user.role === "owner") return <Navigate to="/owner/laporan" replace />;
    return (
      <Navigate
        to={location.state?.from?.pathname || "/dashboard"}
        replace
      />
    );
  }
  return children;
};

/* ============================
 * NOT FOUND PAGE
 * ============================ */
const NotFound = () => {
  const user = getAuthUser();
  const redirectLink =
    user?.role === "owner" ? "/owner/laporan" : "/dashboard";

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-semibold mb-2">Halaman tidak ditemukan.</h1>
      <a className="text-blue-600" href={redirectLink}>
        Kembali ke dashboard
      </a>
    </div>
  );
};

/* ============================
 * ROUTER
 * ============================ */
const AppRouter = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="p-6">Memuat…</div>}>
        <Routes>
          {/* ---------- AUTH (ADMIN) ---------- */}
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            path="/lupa-password"
            element={
              <PublicOnly>
                <ResetPassword />
              </PublicOnly>
            }
          />
          <Route
            path="/reset/:token"
            element={
              <PublicOnly>
                <ResetNewPassword />
              </PublicOnly>
            }
          />

          {/* ---------- OWNER LOGIN ---------- */}
          <Route
            path="/owner/login"
            element={
              <PublicOnly>
                <OwnerLogin />
              </PublicOnly>
            }
          />

          {/* ---------- ADMIN AREA ---------- */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <MainLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pekerjaan" element={<PekerjaanList />} />
            <Route path="pekerjaan/new" element={<PekerjaanForm />} />
            <Route path="pekerjaan/:id/edit" element={<PekerjaanEdit />} />
            <Route path="ba-opname" element={<BAOpname />} />
            <Route path="pencairan" element={<Pencairan />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="upload-ttf" element={<UploadTTF />} />
            <Route path="cetak-invoice" element={<CetakInvoice />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ---------- OWNER AREA ---------- */}
          <Route
            path="/owner"
            element={
              <RequireAuth>
                <RequireRole role="owner">
                  <OwnerLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/owner/manajemen-admin" replace />} />
            <Route path="manajemen-admin" element={<OwnerAdminManagement />} />
            <Route path="manajemen-admin/new" element={<OwnerAdminAdd />} />
            <Route path="manajemen-admin/:id/edit" element={<OwnerAdminEdit />} />
            <Route path="laporan" element={<OwnerLaporan />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ---------- GLOBAL FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter; 