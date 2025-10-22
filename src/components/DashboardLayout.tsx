"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, Home, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available, otherwise default to false
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarCollapsed");
      return savedState === "true";
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/produtos", label: "Produtos", icon: Package },
    { href: "/dashboard/encomendas", label: "Encomendas", icon: ShoppingBag },
    { href: "/dashboard/utilizadores", label: "Utilizadores", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm ${
          mounted ? "transition-all duration-300" : ""
        } ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? "px-4" : ""}`}>
          {!isCollapsed ? (
            <>
              <h2 className="text-2xl font-bold">BlackDeals</h2>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </>
          ) : (
            <div className="text-2xl font-bold text-center">BD</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          {/* Back to Home */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Voltar à página principal" : ""}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Página Principal</span>}
          </Link>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Abrir sidebar" : "Fechar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Fechar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={`flex-1 ${
          mounted ? "transition-all duration-300" : ""
        } ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
