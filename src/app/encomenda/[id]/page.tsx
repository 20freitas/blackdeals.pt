"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck, MapPin, Phone, Mail } from "lucide-react";

interface Order {
  id: string;
  order_code: string;
  total: number;
  status: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: string;
  tracking_code?: string | null;
  carrier?: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  variants: Record<string, string>;
  products: {
    name: string;
    image_url: string;
  };
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      fetchOrder();
    }
  }, [user, authLoading, params.id]);

  const fetchOrder = async () => {
    if (!params.id) return;

    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (orderError) throw orderError;

      // Check if order belongs to user
      if (orderData.user_id !== user?.id) {
        router.push("/");
        return;
      }

      setOrder(orderData);

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .eq("order_id", params.id);

      if (itemsError) throw itemsError;

      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl font-bold">A carregar...</div>
        </div>
      </>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Encomenda Confirmada!</h1>
            <p className="text-gray-600 mb-4">
              Obrigado pela sua compra. A sua encomenda foi registada com sucesso.
            </p>
            <div className="inline-block bg-black text-white px-6 py-3 rounded-lg">
              <div className="text-sm text-gray-300 mb-1">Código da Encomenda</div>
              <div className="text-2xl font-bold">{order.order_code}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-bold">Morada de Envio</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-semibold">{order.shipping_name}</div>
                <div className="text-gray-700">{order.shipping_address}</div>
                <div className="text-gray-700">
                  {order.shipping_postal_code} {order.shipping_city}
                </div>
                <div className="text-gray-700">{order.shipping_country}</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5" />
                <h2 className="text-lg font-bold">Informação de Contacto</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{order.shipping_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{order.shipping_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <h2 className="text-lg font-bold">Produtos Encomendados</h2>
            </div>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.products.name}</div>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {Object.entries(item.variants).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      Quantidade: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.price.toFixed(2)} €</div>
                    <div className="text-sm text-gray-500">
                      Total: {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-black text-white rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-6 w-6" />
              <h2 className="text-lg font-bold">Informação de Entrega</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>✓ A sua encomenda será processada nas próximas 24 horas</p>
              <p>✓ Receberá um email de confirmação com os detalhes de rastreamento</p>
              <p>✓ Entrega estimada: 24-48 horas úteis</p>
              <p>✓ Pagamento contra reembolso na entrega</p>
            </div>

            {order?.tracking_code && (
              <div className="mt-4 bg-white text-black p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Transportadora</div>
                    <div className="font-semibold">{order.carrier || "CTT"}</div>
                    <div className="text-sm text-gray-600 mt-2">Número de Rastreio</div>
                    <div className="font-mono mt-1">{order.tracking_code}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(order.tracking_code || "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="bg-black text-white px-4 py-2 rounded-md"
                    >
                      {copied ? "Copiado" : "Copiar"}
                    </button>

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent((order.carrier || "CTT") + " " + (order.tracking_code || ""))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      Abrir rastreio
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="px-8"
            >
              Voltar à Página Inicial
            </Button>
            <Button
              onClick={() => router.push("/catalogo")}
              className="bg-black hover:bg-gray-800 px-8"
            >
              Continuar a Comprar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
