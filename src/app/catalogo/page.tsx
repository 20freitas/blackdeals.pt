"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  supplier_price: number;
  discount: number;
  final_price: number;
  stock: number;
  available_units: number;
  variants: any[];
  created_at: string;
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .gt("stock", 0) // Only show products with stock
      .order("created_at", { ascending: false });

    if (data && !error) {
      setProducts(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Catálogo
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {products.length} {products.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhum produto disponível
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Volte mais tarde para ver as novidades
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {((product as any).images && (product as any).images[0]) || product.image_url ? (
                    <img
                      src={((product as any).images && (product as any).images[0]) || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400?text=Sem+Imagem";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      <div className="bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg">
                        <span className="text-xs sm:text-sm font-bold">
                          -{Math.round(product.discount)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <div className="bg-orange-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg animate-pulse">
                        Últimas!
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-black transition-colors">
                    {product.name}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-black">
                      €{product.final_price.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm sm:text-base lg:text-lg line-through text-gray-400 font-medium">
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {product.discount > 0 && (
                    <div className="mt-2 sm:mt-3 text-green-600 font-semibold text-xs sm:text-sm">
                      Poupa €{(product.price - product.final_price).toFixed(2)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
