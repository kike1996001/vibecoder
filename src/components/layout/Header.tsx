import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Share2, LogOut, Settings as SettingsIcon, CreditCard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userInitials = (user?.name || user?.email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-14 flex items-center justify-between px-5 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        {!isHome && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[13px] text-zinc-500"
          >
            <span className="text-zinc-300 font-medium">Workspace</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-500">Portfolio projects</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[12px] font-medium hover:bg-violet-500/15 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Boost</span>
        </motion.button>

        <div className="h-4 w-px bg-white/[0.08]" />

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#0a0a0a]" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </motion.button>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 via-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            title={user?.email}
          >
            {userInitials}
          </motion.button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900/95 backdrop-blur border border-slate-700/50 shadow-xl z-50"
                onClick={() => setUserMenuOpen(false)}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-700/30">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => navigate("/billing")}
                    className="w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2 transition-colors border-t border-slate-700/30 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}