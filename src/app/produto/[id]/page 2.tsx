"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RefreshCw,
  Clock,
  Check,
  Tag
} from "lucide-react";

interface ProductVariant {
  name: string;
  options: string[];
}

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
  variants: ProductVariant[];
  created_at: string;
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Package, Shield, RefreshCw, Clock, ChevronDown } from "lucide-react";

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
  variants: Array<{ name: string; options: string[] }>;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      if (!data) {
        router.push("/catalogo");
        return;
      }

      setProduct(data);
      
      // Initialize selected variants with first option
      if (data.variants && data.variants.length > 0) {
        const initialVariants: Record<string, string> = {};
        data.variants.forEach((variant: any) => {
          if (variant.options && variant.options.length > 0) {
            initialVariants[variant.name] = variant.options[0];
          }
        });
        setSelectedVariants(initialVariants);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      router.push("/catalogo");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Como funciona o pagamento?",
      answer: "Aceitamos pagamento contra reembolso. Pague apenas quando receber o produto em casa."
    },
    {
      question: "Quanto tempo demora a entrega?",
      answer: "A entrega é feita em 24-48 horas após a confirmação do pedido. Se encomendar antes das 17:00, recebe no dia seguinte."
    },
    {
      question: "Qual é o custo de envio?",
      answer: "O envio é totalmente gratuito para todas as encomendas em Portugal Continental."
    },
    {
      question: "Posso devolver o produto?",
      answer: "Sim! Tem 30 dias para devolver o produto sem qualquer custo caso não fique satisfeito."
    }
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl font-bold">A carregar...</div>
        </div>
      </>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.push("/catalogo")}
            className="mb-6 text-gray-600 hover:text-black font-medium flex items-center gap-2"
          >
            ← Voltar ao catálogo
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-5"
