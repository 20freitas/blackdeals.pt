"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-center">A carregar...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            
            {user.user_metadata?.first_name && (
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-lg">
                  {user.user_metadata.first_name} {user.user_metadata.last_name}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-600">Membro desde</label>
              <p className="text-lg">
                {new Date(user.created_at).toLocaleDateString("pt-PT")}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold h-11"
          >
            Terminar Sessão
          </Button>
        </div>
      </main>
    </div>
  );
}
