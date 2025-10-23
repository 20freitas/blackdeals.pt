"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: string;
  order_code: string;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!error && data) {
      setProfile(data);
      setForm({
        firstName: data.first_name || user.user_metadata?.first_name || "",
        lastName: data.last_name || user.user_metadata?.last_name || "",
        phone: data.phone || "",
        address: data.address || "",
        postalCode: data.postal_code || "",
        city: data.city || "",
      });
    } else {
      setForm({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: "",
        address: "",
        postalCode: "",
        city: "",
      });
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          products (
            name,
            image_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendente",
          icon: Clock,
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        };
      case "processing":
        return {
          label: "A Processar",
          icon: Package,
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "shipped":
        return {
          label: "Enviada",
          icon: Truck,
          color: "text-purple-600 bg-purple-50 border-purple-200",
        };
      case "delivered":
        return {
          label: "Concluída",
          icon: CheckCircle,
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case "cancelled":
        return {
          label: "Cancelada",
          icon: XCircle,
          color: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: "text-gray-600 bg-gray-50 border-gray-200",
        };
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
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
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'Meu Perfil'}
              </h1>
              <p className="text-gray-300 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === "profile"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === "orders"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Histórico de Encomendas
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {activeTab === "profile" ? (
              <>
                {!editing ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Nome</label>
                      <p className="text-base font-medium mt-1">{form.firstName || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Sobrenome</label>
                      <p className="text-base font-medium mt-1">{form.lastName || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Telemóvel</label>
                    <p className="text-base font-medium mt-1">{form.phone || '—'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Morada</label>
                    <p className="text-base font-medium mt-1">{form.address || '—'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Código Postal</label>
                      <p className="text-base font-medium mt-1">{form.postalCode || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Cidade</label>
                      <p className="text-base font-medium mt-1">{form.city || '—'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-sm text-gray-600">Membro desde</label>
                    <p className="text-base font-medium mt-1">
                      {new Date(user.created_at).toLocaleDateString("pt-PT", { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={form.firstName} 
                      onChange={(e) => setForm({...form, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={form.lastName} 
                      onChange={(e) => setForm({...form, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telemóvel</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="+351 912 345 678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input 
                    id="address" 
                    value={form.address} 
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    placeholder="Rua, número, andar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input 
                      id="postalCode" 
                      value={form.postalCode} 
                      onChange={(e) => setForm({...form, postalCode: e.target.value})}
                      placeholder="1000-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={form.city} 
                      onChange={(e) => setForm({...form, city: e.target.value})}
                      placeholder="Lisboa"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              {editing ? (
                <>
                  <Button 
                    className="flex-1 bg-black hover:bg-gray-800"
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await supabase.from('profiles').upsert({
                          id: user.id,
                          first_name: form.firstName,
                          last_name: form.lastName,
                          email: user.email,
                          phone: form.phone,
                          address: form.address,
                          postal_code: form.postalCode,
                          city: form.city,
                        });
                        setProfile({...profile, ...form});
                        setEditing(false);
                      } catch (e) {
                        console.error('Erro ao atualizar perfil', e);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? 'A guardar...' : 'Guardar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { 
                      setEditing(false); 
                      setForm({
                        firstName: profile?.first_name || user.user_metadata?.first_name || '',
                        lastName: profile?.last_name || user.user_metadata?.last_name || '',
                        phone: profile?.phone || '',
                        address: profile?.address || '',
                        postalCode: profile?.postal_code || '',
                        city: profile?.city || '',
                      });
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditing(true)} 
                    className="flex-1 bg-black hover:bg-gray-800"
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Terminar Sessão
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          // Orders Tab
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ainda não tens encomendas
                </h3>
                <p className="text-gray-600 mb-6">
                  Explora o nosso catálogo e faz a tua primeira encomenda
                </p>
                <Button
                  onClick={() => router.push("/catalogo")}
                  className="bg-black hover:bg-gray-800"
                >
                  Ver Catálogo
                </Button>
              </div>
            ) : (
              orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">
                              {order.order_code}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}
                            >
                              <StatusIcon className="h-4 w-4" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString(
                              "pt-PT",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Total</div>
                            <div className="font-bold text-lg">
                              {order.total.toFixed(2)} €
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="font-semibold mb-3">Produtos</h4>
                        <div className="space-y-3">
                          {order.order_items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-white p-3 rounded-lg"
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={item.products.image_url}
                                  alt={item.products.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {item.products.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Quantidade: {item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button
                            onClick={() => router.push(`/encomenda/${order.id}`)}
                            variant="outline"
                            className="flex-1"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
      </main>
    </div>
  );
}
