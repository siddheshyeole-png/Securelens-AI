import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  UploadCloud,
  FileText,
  History,
  User,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Common/Button";

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/upload", label: "Upload", icon: UploadCloud },
    { path: "/dashboard/reports", label: "Reports", icon: FileText },
    { path: "/dashboard/history", label: "History", icon: History },
    { path: "/dashboard/profile", label: "Profile", icon: User },
    { path: "/dashboard/settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-[#09090B] text-zinc-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#09090B] border-r border-zinc-800 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-800">
          <Link to="/" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-extrabold text-white tracking-tight truncate">
                SecureLens <span className="text-blue-400 font-mono text-xs">AI</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-zinc-400"} shrink-0`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-3 border-t border-zinc-800">
          <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3 p-2 bg-zinc-900/80 rounded-xl border border-zinc-800"}`}>
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-blue-500/40 shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name || user?.email || "Analyst"}</p>
                <p className="text-[10px] text-blue-400 font-mono truncate font-medium">{user?.role || "Lead Digital Media Forensic Analyst"}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="p-1 rounded text-zinc-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-20 bg-[#09090B]/80 border-b border-zinc-800 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Quick Search */}
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deepfake reports, media files, detection IDs..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-4">
            <Button variant="primary" size="sm" icon={UploadCloud} onClick={() => navigate("/dashboard/upload")}>
              Upload Media
            </Button>
            
            {/* Notifications Button */}
            <button className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white shadow-sm hover:bg-zinc-800 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </button>

            {/* Top Bar User Profile Badge */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-zinc-800">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt="User Profile Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/40"
              />
              <div className="text-left leading-tight hidden lg:block">
                <p className="text-xs font-bold text-white">{user?.name || user?.email || "Analyst"}</p>
                <p className="text-[10px] text-blue-400 font-mono font-semibold">{user?.tier || "Enterprise Tier"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
