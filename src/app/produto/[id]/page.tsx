"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Package, Shield, RefreshCw, Clock, ChevronDown, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  images?: string[];
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Array<{ id?: number; imageUrl?: string }>>([]);
  const STORAGE_KEY = "blackdeals_carousel_settings";

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("carousel_settings").select("*").eq("id", "main").single();
        if (!error && data) {
          let parsed: any = null;
          if (data.settings) {
            try {
              parsed = JSON.parse(data.settings);
            } catch (e) {
              parsed = data.settings;
            }
          } else {
            parsed = { reviews: data.reviews ?? [] };
          }
          setReviews(parsed.reviews ?? []);
          return;
        }
      } catch (err) {
        console.warn("Could not load reviews from Supabase, falling back to localStorage", err);
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setReviews(parsed.reviews ?? []);
          return;
        }
      } catch (e) {
        console.error("Failed to parse reviews from localStorage", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
    // load some related / other products
    (async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, image_url, final_price, price, discount, stock")
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(8);
        if (data) setRelated(data as any);
      } catch (e) {
        console.warn("Failed to load related products", e);
      }
    })();
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

    const mainImage = (product.images && product.images[selectedImageIndex]) || product.image_url;

    addToCart({
      id: product.id,
      name: product.name,
      image_url: mainImage,
      price: product.price,
      final_price: product.final_price,
      quantity: quantity,
      stock: product.stock,
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
      answer: "A entrega é feita em 24-48 horas após a confirmação do pedido. Se encomendar antes das 15:00, recebe no dia seguinte."
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
      <div className="min-h-screen bg-white py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/catalogo")}
            className="mb-4 sm:mb-6 text-gray-600 hover:text-black font-medium flex items-center gap-2 text-sm sm:text-base"
          >
            ← Voltar ao catálogo
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Image and Description */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={(product.images && product.images[selectedImageIndex]) || product.image_url}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                    {product.images.map((img, i) => (
                      <button key={i} onClick={() => setSelectedImageIndex(i)} className={`h-16 w-16 rounded-md overflow-hidden border ${i === selectedImageIndex ? 'border-black' : 'border-gray-200'}`}>
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Description */}
              {product.description && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl">
                  <h2 className="text-lg sm:text-xl font-bold mb-3">Descrição do Produto</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4 sm:space-y-5">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{product.name}</h1>

              {/* Price Section */}
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
                  {product.final_price.toFixed(2)} €
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg sm:text-xl lg:text-2xl line-through text-gray-400">
                      {product.price.toFixed(2)} €
                    </span>
                    <span className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      -{Math.round(product.discount)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Alert - Always visible */}
              <div className="bg-red-50 border-l-4 border-red-600 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                  <span className="font-bold text-red-900 text-xs sm:text-sm">
                    {product.stock < 10 
                      ? `ÚLTIMAS ${product.stock} UNIDADES`
                      : `${product.stock} DISPONÍVEIS`
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
                <div className="space-y-3 sm:space-y-4">
                  {product.variants.map((variant) => (
                    <div key={variant.name}>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {variant.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`px-4 sm:px-6 py-2 border-2 font-medium transition-all text-sm sm:text-base ${
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                {/* Quantity Selector */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded font-bold text-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl sm:text-2xl font-bold min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded font-bold text-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 h-14 sm:h-16 px-6 py-4 text-base sm:text-lg font-extrabold bg-black hover:bg-gray-800 whitespace-nowrap rounded-xl shadow-lg transition-all duration-150"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span className="hidden xs:inline">Adicionar ao Carrinho</span>
                  <span className="xs:hidden">Adicionar</span>
                </Button>
              </div>

              <div className="text-center text-xs sm:text-sm text-gray-600">
                Encomende antes das 15:00 para receber amanhã
              </div>

              {/* Benefits Cards */}
              <div className="space-y-2 sm:space-y-3 pt-2">
                <div className="bg-green-600 text-white p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-lg">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm sm:text-base">Entrega expressa</div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      Em 24/48 horas - sem esperas.
                    </div>
                  </div>
                </div>

                <div className="bg-green-600 text-white p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm sm:text-base">Pague ao receber</div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      Pagamento quando tiver o pedido em mãos.
                    </div>
                  </div>
                </div>

                <div className="bg-green-600 text-white p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-lg">
                  <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm sm:text-base">Sem devoluções</div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      Verifique todos os detalhes antes de comprar.
                    </div>
                  </div>
                </div>
                {/* Nova frase/benefit card */}
                <div className="bg-green-600 text-white p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-lg">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm sm:text-base">Pagamento contra reembolso</div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      Receba gratuitamente em 24/48 horas
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 p-4 sm:p-6">
                <div className="flex justify-between items-center text-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-black rounded-full p-2 sm:p-3 mb-2">
                      <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold">{formatDate(deliveryDates[0])}</div>
                    <div className="text-[9px] sm:text-xs font-medium">ENCOMENDA</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-black mx-1 sm:mx-2 max-w-[60px]"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-black rounded-full p-2 sm:p-3 mb-2">
                      <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold">{formatDate(deliveryDates[1])}</div>
                    <div className="text-[9px] sm:text-xs font-medium">PREPARADO</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-black mx-1 sm:mx-2 max-w-[60px]"></div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-black rounded-full p-2 sm:p-3 mb-2">
                      <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold">{formatDate(deliveryDates[2])}</div>
                    <div className="text-[9px] sm:text-xs font-medium">ENTREGUE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Perguntas frequentes</h2>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-sm sm:text-base pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section (same as landing page) */}
          <div className="py-12 bg-gray-50 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Clientes Satisfeitos</h2>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-600">Milhares de clientes já confiam na BlackDeals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews && reviews.length > 0 ? (
                  reviews.map((rv, i) => (
                    <div key={i} className="rounded-2xl p-0 overflow-hidden">
                      {rv.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rv.imageUrl} alt={`Review ${i + 1}`} className="w-full h-64 object-cover" />
                      ) : (
                        <div className="p-6">Sem imagem</div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="rounded-2xl p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">"Excelente serviço! Recebi a encomenda super rápido e o produto é de óptima qualidade. Recomendo!"</p>
                      <p className="font-semibold text-gray-900">Maria Silva</p>
                      <p className="text-sm text-gray-500">Lisboa</p>
                    </div>

                    <div className="rounded-2xl p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">"Adorei os preços e a rapidez na entrega. Já fiz várias encomendas e nunca tive problemas."</p>
                      <p className="font-semibold text-gray-900">João Santos</p>
                      <p className="text-sm text-gray-500">Porto</p>
                    </div>

                    <div className="rounded-2xl p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">"Produtos com excelente relação qualidade-preço. Voltarei a comprar com certeza!"</p>
                      <p className="font-semibold text-gray-900">Ana Costa</p>
                      <p className="text-sm text-gray-500">Braga</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Products Section (below FAQ) */}
          <div className="max-w-7xl mx-auto mt-12 sm:mt-16">
            {related.length === 0 ? (
              <div className="text-gray-500">Não foram encontrados outros produtos.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.filter(p => p.id !== product?.id).slice(0,4).map((p) => (
                  <a key={p.id} href={`/produto/${p.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div className="relative aspect-square bg-gray-100">
                      {((p as any).images && (p as any).images[0]) || p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={((p as any).images && (p as any).images[0]) || p.image_url} alt={p.name} className="w-full h-full object-cover" />
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
