"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const router = useRouter();

  const [others, setOthers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, image_url, images, final_price, price, discount, stock")
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(5);

        if (data) setOthers(data as any[]);
      } catch (e) {
        console.warn("Failed to load related products for cart page", e);
      }
    })();
  }, []);

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      const savings = (item.price - item.final_price) * item.quantity;
      return total + savings;
    }, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                O seu carrinho está vazio
              </h2>
              <p className="text-gray-600 mb-6">
                Adicione produtos ao carrinho para continuar
              </p>
              <Button
                onClick={() => router.push("/catalogo")}
                className="bg-black hover:bg-gray-800"
              >
                Ver Catálogo
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const variantKey = JSON.stringify(item.selectedVariants);
                const uniqueKey = `${item.id}-${variantKey}-${index}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            
                            {/* Variants */}
                            {Object.keys(item.selectedVariants).length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                {Object.entries(item.selectedVariants).map(([key, value]) => (
                                  <span key={key} className="mr-3">
                                    {key}: <span className="font-medium">{value}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Price */}
                            <div className="mt-2">
                              <span className="text-xl font-bold">
                                {item.final_price.toFixed(2)} €
                              </span>
                              {item.price !== item.final_price && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  {item.price.toFixed(2)} €
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedVariants)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedVariants,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedVariants,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {item.quantity >= item.stock && (
                            <span className="text-xs text-red-600 ml-2">
                              Stock máximo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{getSubtotal().toFixed(2)} €</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Desconto</span>
                      <span>-{getTotalSavings().toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Envio</span>
                    <span className="text-green-600 font-semibold">Grátis</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>{getTotalPrice().toFixed(2)} €</span>
                    </div>
                    {getTotalSavings() > 0 && (
                      <div className="text-sm text-green-600 font-semibold mt-1 text-right">
                        Poupa {getTotalSavings().toFixed(2)} €
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-lg font-bold"
                >
                  Finalizar Compra
                </Button>

                <Button
                  onClick={() => router.push("/catalogo")}
                  variant="outline"
                  className="w-full h-12 mt-3"
                >
                  Continuar a Comprar
                </Button>

                {/* Benefits */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Envio grátis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Pagamento contra reembolso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Entrega em 24-48h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outros clientes também compram - produtos relacionados (limit 5) */}
          {others.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Outros clientes também compram</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {others.map((p) => (
                  <a key={p.id} href={`/produto/${p.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div className="relative aspect-square bg-gray-100">
                      {((p.images && p.images[0]) || p.image_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={(p.images && p.images[0]) || p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                      <div className="mt-2 text-black font-bold">€{p.final_price?.toFixed(2)}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
