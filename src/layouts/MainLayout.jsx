import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Content */}
      <div className="lg:ml-64 flex min-h-screen flex-col">

        <Topbar setOpen={setSidebarOpen} />

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>

        <Footer />

      </div>

    </div>
  );
}