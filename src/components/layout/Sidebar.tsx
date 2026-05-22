import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FolderGit2,
  MessageSquare,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Circle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from "@/lib/utils";

const mainNav = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: FolderGit2, label: "Projects", path: "/projects" },
  { icon: MessageSquare, label: "Hub", path: "/hub" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const fallbackRecent = [
  { id: 'fallback-1', name: "Portfolio projects", status: "active", updated: "2m ago", color: "bg-emerald-400" },
  { id: 'fallback-2', name: "Portfolio web v2", status: "idle", updated: "1h ago", color: "bg-amber-400" },
  { id: 'fallback-3', name: "Clinica dental", status: "building", updated: "3h ago", color: "bg-amber-400" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: (next: boolean) => void;
  overlay?: boolean;
}

export function Sidebar({ collapsed, onToggle, overlay }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const projects = useProjectStore(state => state.projects);
  const setActiveProject = useProjectStore(state => state.setActiveProject);

  return (
    <>
      {overlay && !collapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
          onClick={() => onToggle(true)} 
        />
      )}

      <motion.aside
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 flex flex-col h-screen min-h-screen flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl transition-all duration-300 z-50 pb-4",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo - Lovable style: minimal, just icon when collapsed */}
        <div className="h-14 flex items-center px-3 border-b border-white/[0.06]">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shrink-0 shadow-lg shadow-violet-500/20"
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="ml-3 font-semibold text-[15px] tracking-tight text-white/90"
            >
              Workshop
            </motion.span>
          )}
        </div>

        {/* New Project Button - Lovable pill style */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/workspace')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-[13px] font-medium transition-all border border-white/[0.06] hover:border-white/[0.12]"
            >
              <Plus className="h-4 w-4 text-violet-400" />
              New Project
            </motion.button>
          </div>
        )}

        {/* Main Navigation - Lovable: icon-only with tooltip feel */}
        <nav className="flex-1 p-2 pb-24 space-y-[2px] overflow-y-auto">
          {mainNav.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  location.pathname === item.path ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"
                )} />
                {!collapsed && <span>{item.label}</span>}
                
                {/* Active indicator dot */}
                {location.pathname === item.path && !collapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </NavLink>
            </motion.div>
          ))}

          {/* Recent Projects - Lovable style: minimal list */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <div className="px-3 mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3 text-zinc-600" />
                <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                  Recent
                </span>
              </div>
              <div className="space-y-[2px]">
                {(projects && projects.length > 0 ? projects.slice(0, 5) : fallbackRecent).map((project, index) => (
                  <motion.div
                    key={(project as any).id ?? `recent-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.04 }}
                    whileHover={{ x: 2, backgroundColor: "rgba(255,255,255,0.03)" }}
                    className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                    onClick={() => {
                      if ((project as any).id && projects && projects.length > 0) {
                        setActiveProject((project as any).id);
                      }
                      navigate('/workspace');
                    }}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", (project as any).color ?? 'bg-zinc-600')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-zinc-500 truncate group-hover:text-zinc-300 transition-colors">
                        {(project as any).name}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-700 mr-1">{(project as any).updated ?? ''}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </nav>

        {/* User Profile - Lovable minimal */}
        <div className="absolute inset-x-0 bottom-4 px-3">
          <div className="border-t border-white/[0.06] pt-3">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 via-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-violet-500/20">
                  KM
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-zinc-300 truncate">Kike Mauro</p>
                  <p className="text-[11px] text-zinc-600">Discover Plan</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Collapse Toggle - Lovable floating pill */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/[0.08] text-zinc-500 flex items-center justify-center shadow-xl hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </motion.button>
      </motion.aside>
    </>
  );
}