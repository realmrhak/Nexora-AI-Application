import React from "react";
import { Menu, User, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <Menu size={22} />
          </button>

          <h1 className="hidden md:block text-sm font-semibold text-slate-700">
            
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* Notification */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
              <User size={18} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;