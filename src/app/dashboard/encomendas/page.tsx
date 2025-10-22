"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingBag } from "lucide-react";

export default function EncomendasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      (async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (data?.role !== 'admin') {
          router.push("/");
        }
      })();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Encomendas</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Gestão de encomendas em desenvolvimento...</p>
          </div>
        </div>
      </DashboardLayout>
  );
}
