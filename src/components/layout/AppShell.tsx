import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export function AppShell() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hideSidebarOn = ["/workspace"];
  const showSidebar = !hideSidebarOn.some((p) => location.pathname.startsWith(p));
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden relative">
      {/* Ultra-subtle ambient glows */}
      <div className="absolute inset-0 grid-pattern opacity-[0.15] pointer-events-none" />
      <div className="absolute top-[-10%] left-[30%] h-[600px] w-[600px] rounded-full bg-orange-500/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] h-[500px] w-[500px] rounded-full bg-orange-600/[0.02] blur-[130px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {showSidebar && (
          <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {isHome && (
          <div
            className={cn(
              "fixed top-0 right-0 z-50",
              showSidebar ? (sidebarCollapsed ? "left-[68px]" : "left-[240px]") : "left-0"
            )}
            style={{ width: showSidebar ? `calc(100% - ${sidebarCollapsed ? 68 : 240}px)` : '100%' }}
          >
            <Header />
          </div>
        )}

        <main
          className={cn(
            "flex-1 relative z-10 w-full min-h-screen",
            showSidebar && (sidebarCollapsed ? "pl-[68px]" : "pl-[240px]"),
            isHome && "pt-14",
            isHome && "flex items-center justify-center",
            !showSidebar ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
          )}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}