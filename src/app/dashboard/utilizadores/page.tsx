"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, MapPin, ShoppingBag, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_code: string;
  total: number;
  status: string;
  created_at: string;
}

export default function UtilizadoresPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [userOrders, setUserOrders] = useState<Record<string, Order[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null);

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

  // Load all profiles
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      console.log("Perfis carregados:", data);
      setProfiles(data);
      // Forçar mostrar todos os perfis, sem filtro
      setFilteredProfiles(data);
    }
    setLoadingProfiles(false);
  };

  // Filter profiles based on search and role
  useEffect(() => {
    let filtered = profiles;

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(p => p.role === roleFilter);
    }

    // Filter by search term (name or email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term)
      );
    }

    setFilteredProfiles(filtered);
  }, [searchTerm, roleFilter, profiles]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const loadUserOrders = async (userId: string) => {
    // Se já carregamos as encomendas deste user, não carregar novamente
    if (userOrders[userId]) return;

    setLoadingOrders(userId);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_code, total, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUserOrders(prev => ({ ...prev, [userId]: data }));
      }
    } catch (error) {
      console.error("Error loading user orders:", error);
    } finally {
      setLoadingOrders(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
      shipped: { label: "Enviada", color: "bg-blue-100 text-blue-800" },
      delivered: { label: "Concluída", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading || loadingProfiles) {
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
          <Users className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Utilizadores</h1>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {filteredProfiles.length}
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                onClick={() => setRoleFilter("all")}
                className="flex-1"
              >
                Todos
              </Button>
              <Button
                variant={roleFilter === "user" ? "default" : "outline"}
                onClick={() => setRoleFilter("user")}
                className="flex-1"
              >
                Utilizadores
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "outline"}
                onClick={() => setRoleFilter("admin")}
                className="flex-1"
              >
                Admins
              </Button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum utilizador encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="hover:bg-gray-50 transition-colors">
                  {/* Main Row */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(profile.id)}
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            profile.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {profile.role === "admin" ? "Admin" : "Utilizador"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Criado em {new Date(profile.created_at).toLocaleDateString("pt-PT")}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedId === profile.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === profile.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {/* Left: Contact & Address */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-2">Informações de Contacto</h3>
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-sm font-medium">{profile.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Telefone</p>
                                <p className="text-sm font-medium">
                                  {profile.phone || "Não fornecido"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-2">Morada</h3>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                {profile.address ? (
                                  <>
                                    <p className="text-sm font-medium">{profile.address}</p>
                                    <p className="text-sm text-gray-500">
                                      {profile.postal_code && `${profile.postal_code} `}
                                      {profile.city}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">Morada não fornecida</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Order History */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              Histórico de Encomendas
                            </h3>
                            {!userOrders[profile.id] && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadUserOrders(profile.id)}
                                disabled={loadingOrders === profile.id}
                              >
                                {loadingOrders === profile.id ? "A carregar..." : "Ver Encomendas"}
                              </Button>
                            )}
                          </div>

                          {loadingOrders === profile.id ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                          ) : userOrders[profile.id] ? (
                            userOrders[profile.id].length === 0 ? (
                              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">
                                  Ainda não fez nenhuma encomenda
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {userOrders[profile.id].map((order) => (
                                  <div
                                    key={order.id}
                                    className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/encomendas`)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-mono text-sm font-bold">
                                        {order.order_code}
                                      </span>
                                      {getStatusBadge(order.status)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                      <span>
                                        {new Date(order.created_at).toLocaleDateString("pt-PT")}
                                      </span>
                                      <span className="font-bold text-gray-900">
                                        {order.total.toFixed(2)} €
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                              <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                              <p className="text-sm text-gray-500 mb-3">
                                Clica para ver o histórico
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}