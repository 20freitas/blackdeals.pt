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
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum produto disponível
            </h3>
            <p className="text-gray-500">
              Volte mais tarde para ver as novidades
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400?text=Sem+Imagem";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg">
                        <span className="text-sm font-bold">
                          Desconto {Math.round(product.discount)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        Últimas unidades!
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-black transition-colors">
                    {product.name}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-black">
                      €{product.final_price.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-lg line-through text-gray-400 font-medium">
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {product.discount > 0 && (
                    <div className="mt-3 text-green-600 font-semibold text-sm">
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
