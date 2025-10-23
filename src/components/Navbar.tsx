"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { getTotalItems } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setIsAdmin(data?.role === 'admin');
      })();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Left side - Navigation links (Desktop) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 z-10">
            <Link 
              href="/" 
              className="text-gray-800 hover:text-black text-sm lg:text-[15px] font-medium transition-colors relative group whitespace-nowrap"
            >
              Início
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/catalogo" 
              className="text-gray-800 hover:text-black text-sm lg:text-[15px] font-medium transition-colors relative group"
            >
              Catálogo
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-800 hover:text-black text-sm lg:text-[15px] font-medium transition-colors relative group"
            >
              Contacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-0">
            <Link href="/" className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.1em] lg:tracking-[0.15em] text-black hover:text-gray-800 transition-colors">
              BLACKDEALS
            </Link>
          </div>

          {/* Right side - Auth buttons and cart */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 z-10">
            {!loading && !user && (
              <Button 
                size="sm"
                className="md:hidden bg-black hover:bg-gray-800 text-white font-semibold text-xs px-3 py-2 h-9 transition-all duration-200"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
            {!loading && (
              <>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link 
                        href="/dashboard" 
                        className="hidden md:flex hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        title="Dashboard"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                      </Link>
                    )}
                    <Link 
                      href="/perfil" 
                      className="hidden md:flex hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                      title="Perfil"
                    >
                      <User className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hidden md:flex border-2 border-black hover:bg-gray-50 font-semibold text-xs lg:text-sm px-3 lg:px-5 py-2 h-9 lg:h-10 transition-all duration-200"
                      asChild
                    >
                      <Link href="/criar-conta">Criar Conta</Link>
                    </Button>
                    <Button 
                      size="sm"
                      className="hidden md:flex bg-black hover:bg-gray-800 text-white font-semibold text-xs lg:text-sm px-3 lg:px-5 py-2 h-9 lg:h-10 transition-all duration-200"
                      asChild
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                  </>
                )}
              </>
            )}
            <Link 
              href="/carrinho" 
              className="hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0 -right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Página Inicial
              </Link>
              <Link 
                href="/catalogo" 
                className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                href="/contacto" 
                className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              {user && !loading && (
                <>
                  {isAdmin && (
                    <Link 
                      href="/dashboard" 
                      className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link 
                    href="/perfil" 
                    className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                </>
              )}
              {!user && !loading && (
                <Link 
                  href="/criar-conta" 
                  className="text-gray-800 hover:text-black font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors sm:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Criar Conta
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
