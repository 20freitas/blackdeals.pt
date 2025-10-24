"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  Euro,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    order_code: string;
    total: number;
    status: string;
    created_at: string;
    shipping_name: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dateRange, setDateRange] = useState<string>("since_forever");

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
          loadDashboardStats();
        }
      })();
    }
  }, [user, loading, router]);

  const loadDashboardStats = async (range: string = dateRange) => {
    setLoadingStats(true);
    try {
      // Determine date filter based on selected range
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (range === "last_24h") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (range === "yesterday") {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        y.setHours(0, 0, 0, 0);
        startDate = y;
        const yEnd = new Date(y);
        yEnd.setHours(23, 59, 59, 999);
        endDate = yEnd;
      } else if (range === "last_7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (range === "last_30d") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = null; // since forever
      }

      // Fetch orders with optional date filters
      let ordersQuery: any = supabase
        .from("orders")
        .select("*, order_items(quantity, price, product_id, products(name, supplier_price))");

      if (startDate) {
        ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());
      }

      const { data: orders } = await ordersQuery;

      // Fetch products
      const { data: products } = await supabase
        .from("products")
        .select("*");

      // Fetch users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id");

      if (!orders) return;

      // Exclude cancelled orders from dashboard aggregates
      const activeOrders = orders.filter((o: any) => o.status !== "cancelled");

      // Calculate stats using only active orders
      const totalRevenue = activeOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      
      // Calculate profit (revenue - supplier costs)
      let totalProfit = 0;
      activeOrders.forEach((order: any) => {
        if (order.order_items) {
          order.order_items.forEach((item: any) => {
            const supplierCost = item.products?.supplier_price || 0;
            const itemProfit = (item.price - supplierCost) * item.quantity;
            totalProfit += itemProfit;
          });
        }
      });

      const completedOrders = activeOrders.filter((o: any) => o.status === "delivered");
      const pendingOrders = activeOrders.filter((o: any) => o.status === "pending");

      // Get recent active orders (last 5)
      const recentOrders = activeOrders
        .slice() // copy
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((o: any) => ({
          id: o.id,
          order_code: o.order_code,
          total: o.total,
          status: o.status,
          created_at: o.created_at,
          shipping_name: o.shipping_name,
        }));

      // Calculate top products by sales from active orders
      const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
      activeOrders.forEach((order: any) => {
        if (order.order_items) {
          order.order_items.forEach((item: any) => {
            const productId = item.product_id;
            const productName = item.products?.name || "Produto Desconhecido";
            if (!productSales[productId]) {
              productSales[productId] = { name: productName, sales: 0, revenue: 0 };
            }
            productSales[productId].sales += item.quantity;
            productSales[productId].revenue += item.price * item.quantity;
          });
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalProfit,
        totalOrders: activeOrders.length,
        totalProducts: products?.length || 0,
        totalUsers: profiles?.length || 0,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        averageOrderValue: activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0,
        recentOrders,
        topProducts,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // reload when dateRange changes
  useEffect(() => {
    if (user) loadDashboardStats(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

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

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleTimeString("pt-PT")}
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-2">Período:</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border px-2 py-1 rounded">
                <option value="since_forever">Desde sempre</option>
                <option value="last_24h">Último dia</option>
                <option value="yesterday">Ontem</option>
                <option value="last_7d">Última semana</option>
                <option value="last_30d">Último mês</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Stats - Revenue & Profit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600">Receita Total</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalRevenue.toFixed(2)} €</p>
            <p className="text-sm text-gray-500">
              De {stats.totalOrders} encomendas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600">Lucro Total</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalProfit.toFixed(2)} €</p>
            <p className="text-sm text-gray-500">
              Margem: {stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500">Pendentes</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500">Concluídas</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500">Produtos</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500">Utilizadores</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Encomendas Recentes</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma encomenda ainda
                </div>
              ) : (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push("/dashboard/encomendas")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {order.order_code}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{order.shipping_name}</span>
                      <span className="font-semibold text-gray-900">{order.total.toFixed(2)} €</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleString("pt-PT")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Top Produtos</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.topProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum produto vendido ainda
                </div>
              ) : (
                stats.topProducts.map((product, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} vendidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {product.revenue.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Valor Médio por Encomenda
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.averageOrderValue.toFixed(2)} €
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Encomendas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
