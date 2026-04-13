// src/pages/owner/OwnerLayout.jsx
import { Outlet } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import Topbar from "../../components/Topbar";
import Footer from "../../components/Footer";

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <OwnerSidebar />

      {/* Konten utama */}
      <div className="flex flex-col flex-1 md:ml-64 min-h-screen">
        <Topbar />

        <main className="flex-1 min-w-0 p-5 md:p-8 bg-gray-100">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}