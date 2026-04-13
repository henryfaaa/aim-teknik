import { NavLink } from "react-router-dom";
import { Home, ClipboardList, FileText, BarChart, ListCheck, X } from "lucide-react";

export default function Sidebar({ open, setOpen }) {

  const menus = [
    { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/pekerjaan", icon: <ListCheck size={18} />, label: "Pekerjaan" },
    { to: "/ba-opname", icon: <ClipboardList size={18} />, label: "BA Opname" },
    { to: "/pencairan", icon: <FileText size={18} />, label: "Pencairan" },
    { to: "/laporan", icon: <BarChart size={18} />, label: "Laporan" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-64
        bg-[#0f2a63] text-white
        flex flex-col shadow-lg z-50

        transform transition-transform duration-300 ease-in-out

        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >

        {/* BRAND */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
              <img
                src="/logoaim1.png"
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="font-bold text-lg tracking-wide">
              AIM TEKNIK
            </h1>
          </div>

          {/* close mobile */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

          {menus.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                px-4 py-2.5 rounded-lg
                text-sm font-medium

                transition-colors

                ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >
              {m.icon}
              <span>{m.label}</span>
            </NavLink>
          ))}

        </nav>

        {/* FOOTER */}
        <div className="px-4 py-4 text-[11px] text-white/60 border-t border-white/10">
          © {new Date().getFullYear()} CV. AIM TEKNIK
        </div>

      </aside>
    </>
  );
}