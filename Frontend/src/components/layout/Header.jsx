import { useState, useRef, useEffect } from "react";
import { Menu, User, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome 🎉",
      message: "Glad to have you here!",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "New Update",
      message: "Dashboard has been upgraded with better performance.",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      title: "Study Tip",
      message: "Consistency beats intensity — study daily for best results.",
      time: "2 days ago",
      read: true,
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* NOTIFICATIONS - MOBILE RESPONSIVE */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition group"
            >
              <Bell
                size={20}
                className="text-slate-600 group-hover:text-slate-900 transition"
              />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* ✅ FIXED: Mobile responsive dropdown */}
            <div
              className={`fixed sm:absolute top-16 sm:top-full left-0 sm:left-auto sm:right-0 w-full sm:w-96 bg-white/95 sm:bg-white/90 backdrop-blur-xl border-b sm:border border-slate-200 rounded-none sm:rounded-2xl shadow-none sm:shadow-2xl overflow-hidden z-50 origin-top-right transition-all duration-300 ease-out ${
                open
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    You have {unreadCount} unread
                  </p>
                </div>

                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                >
                  Mark all
                </button>
              </div>

              <div className="max-h-[70vh] sm:max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`group px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-all hover:bg-slate-50 ${
                      !n.read ? "bg-emerald-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              !n.read ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                            {n.title}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-2">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 bg-slate-50/60 text-center">
                <p className="text-[11px] text-slate-500">
                  Click notifications to mark as read
                </p>
              </div>
            </div>
          </div>

          {/* USER DROPDOWN */}
          <div
            className="relative flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200"
            ref={userRef}
          >
            <button
              onClick={() => setUserOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-3"
            >
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
            </button>

            {/* ✅ FIXED: Mobile responsive user dropdown */}
            <div
              className={`fixed sm:absolute right-0 top-16 sm:top-full mt-0 sm:mt-3 w-full sm:w-48 bg-white border-b sm:border border-slate-200 rounded-none sm:rounded-xl shadow-none sm:shadow-lg overflow-hidden z-50 origin-top-right transition-all duration-300 ease-out ${
                userOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              {/* Mobile: Show user info in dropdown */}
              <div className="sm:hidden px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <button
                onClick={() => {
                  navigate("/profile");
                  setUserOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-2 text-sm hover:bg-slate-50"
              >
                Profile
              </button>

              <button
                className="w-full text-left px-4 py-3 sm:py-2 text-sm text-red-500 hover:bg-red-50"
                onClick={() => {
                  logout();
                  setUserOpen(false);
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;