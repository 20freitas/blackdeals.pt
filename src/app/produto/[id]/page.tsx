"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Package, Shield, RefreshCw, Clock, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast";

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
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

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

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
      final_price: product.final_price,
      quantity: quantity,
      selectedVariants: selectedVariants,
    });

    // Show toast notification
    setShowToast(true);
    
    // Reset quantity to 1 after adding
    setQuantity(1);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Calculate delivery dates (skip weekends)
  const getDeliveryDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
      }
      
      dates.push(date);
    }
    
    return dates;
  };

  const deliveryDates = getDeliveryDates();
  
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day}. ${months[date.getMonth()]}`;
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
      answer: "Não aceitamos devoluções. Por favor, verifique todos os detalhes do produto antes de finalizar a compra."
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
      {showToast && (
        <Toast
          message="Produto adicionado ao carrinho!"
          onClose={() => setShowToast(false)}
        />
      )}
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
            {/* Left Column - Image and Description */}
            <div className="space-y-6">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
              </div>
              
              {/* Description */}
              {product.description && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <h2 className="text-xl font-bold mb-3">Descrição do Produto</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-5">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black">{product.name}</h1>

              {/* Price Section */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-black">
                  {product.final_price.toFixed(2)} €
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl line-through text-gray-400">
                      {product.price.toFixed(2)} €
                    </span>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Desconto {product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Alert - Always visible */}
              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-900">
                    {product.stock < 10 
                      ? `ATENÇÃO: ÚLTIMAS ${product.stock} UNIDADES`
                      : `${product.stock} UNIDADES DISPONÍVEIS`
                    }
                  </span>
                </div>
                <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.name}>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {variant.name}
                      </label>
                      <div className="flex gap-2">
                        {variant.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`px-6 py-2 border-2 font-medium transition-all ${
                              selectedVariants[variant.name] === option
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector and Add to Cart */}
              <div className="flex items-end gap-4">
                {/* Quantity Selector */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border-2 border-gray-300 rounded font-bold text-xl hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 border-2 border-gray-300 rounded font-bold text-xl hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 h-[42px] text-base font-bold bg-black hover:bg-gray-800"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Encomende antes das 17:00 para receber amanhã
              </div>

              {/* Benefits Cards */}
              <div className="space-y-3 pt-2">
                <div className="bg-black text-white p-4 flex items-start gap-3">
                  <Truck className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-base">Entrega expressa</div>
                    <div className="text-sm text-gray-300">
                      As suas peças em 24/48 horas - sem esperas, sem desculpas.
                    </div>
                  </div>
                </div>

                <div className="bg-black text-white p-4 flex items-start gap-3">
                  <Shield className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-base">Pague ao receber</div>
                    <div className="text-sm text-gray-300">
                      Faça o pagamento somente quando tiver o seu pedido em mãos.
                    </div>
                  </div>
                </div>

                <div className="bg-black text-white p-4 flex items-start gap-3">
                  <RefreshCw className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-base">Sem devoluções</div>
                    <div className="text-sm text-gray-300">
                      Não aceitamos devoluções. Verifique todos os detalhes antes de comprar.
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-center text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-black rounded-full p-3 mb-2">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-bold">{formatDate(deliveryDates[0])}</div>
                    <div className="text-xs font-medium">ENCOMENDA</div>
                    <div className="text-xs font-medium">EFETUADA</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-black mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="bg-black rounded-full p-3 mb-2">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-bold">{formatDate(deliveryDates[1])}</div>
                    <div className="text-xs font-medium">PREPARADO</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-black mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="bg-black rounded-full p-3 mb-2">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-bold">{formatDate(deliveryDates[2])}</div>
                    <div className="text-xs font-medium">ENTREGUE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold mb-6">Perguntas frequentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
