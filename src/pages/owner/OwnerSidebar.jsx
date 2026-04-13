import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Users, FileText, Crown, Menu, X } from "lucide-react";

export default function OwnerSidebar() {
  const [open, setOpen] = useState(false);

  const menus = [
    {
      to: "/owner/manajemen-admin",
      icon: <Users size={18} />,
      label: "Manajemen Admin",
    },
    {
      to: "/owner/laporan",
      icon: <FileText size={18} />,
      label: "Laporan",
    },
  ];

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow"
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-64
        bg-[#1e3a8a]
        text-white flex flex-col
        shadow-xl z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
              <img
                src="/logoaim1.png"
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="font-semibold text-lg leading-none">
                AIM TEKNIK
              </h1>

              <div className="flex items-center gap-1 text-yellow-300 text-xs mt-1">
                <Crown size={12} />
                Owner Panel
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menus.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all
                ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              {/* ACTIVE BAR */}
              <span className="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-r"></span>

              {m.icon}
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto px-4 py-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()}
          </p>

          <p className="text-[11px] text-white/30 mt-1">
            CV. AIM TEKNIK
          </p>
        </div>
      </aside>
    </>
  );
}