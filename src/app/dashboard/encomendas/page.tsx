"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Toast from "@/components/Toast";

interface Order {
  id: string;
  order_code: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  order_items: Array<{
    quantity: number;
    price: number;
    variants: any;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

export default function EncomendasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      (async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (data?.role !== 'admin') {
          router.push("/");
        } else {
          fetchOrders();
        }
      })();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price,
            variants,
            products (
              name,
              image_url
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setToast({ message: "Erro ao carregar encomendas", type: "error" });
    } finally {
      setLoadingOrders(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_code.toLowerCase().includes(term) ||
          order.shipping_name.toLowerCase().includes(term) ||
          order.shipping_email.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setToast({ message: "Estado atualizado com sucesso!", type: "success" });
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({ message: "Erro ao atualizar estado", type: "error" });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendente",
          icon: Clock,
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
          badgeColor: "bg-yellow-100 text-yellow-800",
        };
      case "shipped":
        return {
          label: "Enviada",
          icon: Truck,
          color: "text-blue-600 bg-blue-50 border-blue-200",
          badgeColor: "bg-blue-100 text-blue-800",
        };
      case "delivered":
        return {
          label: "Concluída",
          icon: CheckCircle,
          color: "text-green-600 bg-green-50 border-green-200",
          badgeColor: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          label: "Cancelada",
          icon: XCircle,
          color: "text-red-600 bg-red-50 border-red-200",
          badgeColor: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: "text-gray-600 bg-gray-50 border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800",
        };
    }
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Encomendas</h1>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-900">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold">{stats.shipped}</div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por código, nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">Todos os estados</option>
                <option value="pending">Pendente</option>
                <option value="shipped">Enviada</option>
                <option value="delivered">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          {loadingOrders ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">A carregar encomendas...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma encomenda encontrada
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Tenta ajustar os filtros"
                  : "Ainda não existem encomendas"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="p-4">
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Order Code */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Código
                            </div>
                            <div className="font-bold">{order.order_code}</div>
                          </div>

                          {/* Customer */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Cliente
                            </div>
                            <div className="font-medium">
                              {order.shipping_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.shipping_email}
                            </div>
                          </div>

                          {/* Date */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Data
                            </div>
                            <div className="text-sm">
                              {new Date(order.created_at).toLocaleDateString(
                                "pt-PT"
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleTimeString(
                                "pt-PT",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>

                          {/* Total */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Total
                            </div>
                            <div className="font-bold text-lg">
                              {order.total.toFixed(2)} €
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Estado
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.badgeColor}`}
                            >
                              <StatusIcon className="h-4 w-4" />
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left: Products & Shipping */}
                          <div className="space-y-4">
                            {/* Products */}
                            <div>
                              <h4 className="font-semibold mb-3">Produtos</h4>
                              <div className="space-y-2">
                                {order.order_items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0">
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
                                      {item.variants &&
                                        Object.keys(item.variants).length >
                                          0 && (
                                          <div className="text-xs text-gray-600">
                                            {Object.entries(item.variants).map(
                                              ([key, value]) => (
                                                <span key={key} className="mr-2">
                                                  {key}: {String(value)}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        )}
                                      <div className="text-sm text-gray-600">
                                        Qtd: {item.quantity} × {item.price.toFixed(2)} €
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Info */}
                            <div>
                              <h4 className="font-semibold mb-2">
                                Morada de Envio
                              </h4>
                              <div className="text-sm text-gray-700 space-y-1">
                                <div>{order.shipping_name}</div>
                                <div>{order.shipping_phone}</div>
                                <div>{order.shipping_address}</div>
                                <div>
                                  {order.shipping_postal_code}{" "}
                                  {order.shipping_city}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Status Update */}
                          <div>
                            <h4 className="font-semibold mb-3">
                              Alterar Estado
                            </h4>
                            <div className="space-y-2">
                              {[
                                "pending",
                                "shipped",
                                "delivered",
                                "cancelled",
                              ].map((status) => {
                                const info = getStatusInfo(status);
                                const InfoIcon = info.icon;
                                return (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      updateOrderStatus(order.id, status)
                                    }
                                    disabled={order.status === status}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                      order.status === status
                                        ? `${info.color} border-current`
                                        : "bg-white border-gray-200 hover:border-gray-400"
                                    } disabled:cursor-not-allowed`}
                                  >
                                    <InfoIcon className="h-5 w-5" />
                                    <span className="font-medium">
                                      {info.label}
                                    </span>
                                    {order.status === status && (
                                      <CheckCircle className="h-5 w-5 ml-auto" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
