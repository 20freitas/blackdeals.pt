"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Left side - Navigation links */}
          <div className="flex items-center gap-8 z-10">
            <Link 
              href="/" 
              className="text-gray-800 hover:text-black text-[15px] font-medium transition-colors relative group"
            >
              Página Inicial
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/catalogo" 
              className="text-gray-800 hover:text-black text-[15px] font-medium transition-colors relative group"
            >
              Catálogo
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-800 hover:text-black text-[15px] font-medium transition-colors relative group"
            >
              Contacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-0">
            <Link href="/" className="text-3xl font-bold tracking-[0.15em] text-black hover:text-gray-800 transition-colors">
              BLACKDEALS
            </Link>
          </div>

          {/* Right side - Auth buttons and cart */}
          <div className="flex items-center gap-4 z-10">
            {!loading && (
              <>
                {user ? (
                  // Usuário autenticado - mostrar ícone de perfil
                  <>
                    {isAdmin && (
                      <Link 
                        href="/dashboard" 
                        className="hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        title="Dashboard"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                      </Link>
                    )}
                    <Link 
                      href="/perfil" 
                      className="hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                      title="Perfil"
                    >
                      <User className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  // Usuário não autenticado - mostrar botões de login/criar conta
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-2 border-black hover:bg-gray-50 font-semibold text-[14px] px-5 py-2 h-10 transition-all duration-200"
                      asChild
                    >
                      <Link href="/criar-conta">Criar Conta</Link>
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white font-semibold text-[14px] px-5 py-2 h-10 transition-all duration-200"
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
              className="hover:text-gray-600 transition-colors ml-2 p-2 hover:bg-gray-100 rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
