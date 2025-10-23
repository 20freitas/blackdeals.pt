"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Percent, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Os Melhores Produtos
                <span className="block mt-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  aos Melhores Preços
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Descobre ofertas exclusivas com até <span className="font-bold text-gray-900">70% de desconto</span>. 
                Envio grátis e entrega rápida em toda a Portugal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => router.push("/catalogo")}
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  Ver Produtos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => router.push("/catalogo")}
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50 px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  Explorar Ofertas
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Envio Grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Pagamento Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Entrega 24-48h</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Illustration */}
            <div className="relative hidden lg:block">
              <svg viewBox="0 0 500 500" className="w-full h-auto">
                {/* Shopping bags */}
                <g>
                  {/* Bag 1 - Black */}
                  <rect x="80" y="180" width="140" height="180" rx="8" fill="#1f2937" />
                  <rect x="80" y="180" width="140" height="40" rx="8" fill="#111827" />
                  <path d="M 120 180 Q 120 150 150 150 Q 180 150 180 180" stroke="#4b5563" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  <circle cx="150" cy="250" r="30" fill="#fbbf24" opacity="0.9"/>
                  <text x="150" y="260" fontSize="24" fontWeight="bold" fill="#1f2937" textAnchor="middle">%</text>
                </g>

                {/* Bag 2 - Gray */}
                <g>
                  <rect x="260" y="140" width="160" height="200" rx="8" fill="#374151" />
                  <rect x="260" y="140" width="160" height="45" rx="8" fill="#1f2937" />
                  <path d="M 305 140 Q 305 105 340 105 Q 375 105 375 140" stroke="#6b7280" strokeWidth="7" fill="none" strokeLinecap="round"/>
                  <rect x="290" y="200" width="100" height="20" rx="4" fill="#fbbf24"/>
                  <text x="340" y="215" fontSize="14" fontWeight="bold" fill="#1f2937" textAnchor="middle">OFERTA</text>
                </g>

                {/* Floating elements */}
                <circle cx="100" cy="120" r="15" fill="#fbbf24" opacity="0.6"/>
                <circle cx="420" cy="180" r="20" fill="#fbbf24" opacity="0.4"/>
                <circle cx="380" cy="80" r="12" fill="#fbbf24" opacity="0.5"/>
                
                {/* Star shapes */}
                <path d="M 440 280 l 6 18 l 19 0 l -15 11 l 6 18 l -16 -11 l -16 11 l 6 -18 l -15 -11 l 19 0 z" fill="#fbbf24" opacity="0.7"/>
                <path d="M 60 320 l 4 12 l 13 0 l -10 7 l 4 12 l -11 -7 l -11 7 l 4 -12 l -10 -7 l 13 0 z" fill="#fbbf24" opacity="0.6"/>

                {/* Delivery box */}
                <g transform="translate(150, 380)">
                  <rect x="0" y="0" width="100" height="80" rx="4" fill="#4b5563" stroke="#1f2937" strokeWidth="3"/>
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#1f2937" strokeWidth="3"/>
                  <line x1="50" y1="0" x2="50" y2="80" stroke="#1f2937" strokeWidth="3"/>
                  <circle cx="50" cy="40" r="8" fill="#fbbf24"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Porquê Escolher a BlackDeals?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos a melhor experiência de compra online com garantia de qualidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="#f3f4f6" className="group-hover:fill-gray-200 transition-colors"/>
                  {/* Truck illustration */}
                  <rect x="50" y="90" width="70" height="40" rx="5" fill="#1f2937"/>
                  <rect x="40" y="100" width="30" height="30" rx="3" fill="#374151"/>
                  <circle cx="65" cy="135" r="10" fill="#111827"/>
                  <circle cx="105" cy="135" r="10" fill="#111827"/>
                  <rect x="85" y="75" width="35" height="15" rx="3" fill="#fbbf24"/>
                  <path d="M 130 100 L 150 110 L 150 130 L 130 130 Z" fill="#4b5563"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Envio Grátis
              </h3>
              <p className="text-gray-600">
                Envio gratuito para todas as encomendas em Portugal Continental
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="#f3f4f6" className="group-hover:fill-gray-200 transition-colors"/>
                  {/* Discount tag */}
                  <path d="M 60 70 L 120 70 L 140 100 L 120 130 L 60 130 Z" fill="#1f2937"/>
                  <circle cx="90" cy="100" r="25" fill="#fbbf24"/>
                  <text x="90" y="110" fontSize="24" fontWeight="bold" fill="#1f2937" textAnchor="middle">%</text>
                  <text x="135" y="108" fontSize="20" fontWeight="bold" fill="#fbbf24">70</text>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Descontos Exclusivos
              </h3>
              <p className="text-gray-600">
                Ofertas especiais com descontos até 70% em produtos selecionados
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="#f3f4f6" className="group-hover:fill-gray-200 transition-colors"/>
                  {/* Clock illustration */}
                  <circle cx="100" cy="100" r="45" fill="#1f2937" stroke="#fbbf24" strokeWidth="4"/>
                  <line x1="100" y1="100" x2="100" y2="70" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="100" y1="100" x2="125" y2="100" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="100" cy="100" r="6" fill="#fbbf24"/>
                  <text x="100" y="170" fontSize="18" fontWeight="bold" fill="#1f2937" textAnchor="middle">24-48h</text>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Entrega Rápida
              </h3>
              <p className="text-gray-600">
                Recebe os teus produtos em 24-48h após confirmação da encomenda
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="#f3f4f6" className="group-hover:fill-gray-200 transition-colors"/>
                  {/* Shield illustration */}
                  <path d="M 100 50 L 140 70 L 140 110 Q 140 140 100 150 Q 60 140 60 110 L 60 70 Z" fill="#1f2937"/>
                  <path d="M 80 95 L 95 110 L 120 80" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Compra Segura
              </h3>
              <p className="text-gray-600">
                Pagamento contra reembolso para maior segurança e confiança
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Clientes Satisfeitos
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-lg text-gray-600">
              Milhares de clientes já confiam na BlackDeals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Excelente serviço! Recebi a encomenda super rápido e o produto é de óptima qualidade. Recomendo!"
              </p>
              <p className="font-semibold text-gray-900">Maria Silva</p>
              <p className="text-sm text-gray-500">Lisboa</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Adorei os preços e a rapidez na entrega. Já fiz várias encomendas e nunca tive problemas."
              </p>
              <p className="font-semibold text-gray-900">João Santos</p>
              <p className="text-sm text-gray-500">Porto</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Produtos com excelente relação qualidade-preço. Voltarei a comprar com certeza!"
              </p>
              <p className="font-semibold text-gray-900">Ana Costa</p>
              <p className="text-sm text-gray-500">Braga</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">10K+</p>
              <p className="text-gray-400">Produtos Vendidos</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">5K+</p>
              <p className="text-gray-400">Clientes Satisfeitos</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">24h</p>
              <p className="text-gray-400">Entrega Rápida</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">100%</p>
              <p className="text-gray-400">Garantia de Qualidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Illustration */}
            <div className="relative order-2 lg:order-1">
              <svg viewBox="0 0 500 400" className="w-full h-auto">
                {/* Shopping cart */}
                <g>
                  {/* Cart body */}
                  <path d="M 100 150 L 120 150 L 150 280 L 350 280 L 380 150 L 140 150" stroke="#1f2937" strokeWidth="8" fill="none" strokeLinejoin="round"/>
                  <line x1="120" y1="150" x2="140" y2="150" stroke="#1f2937" strokeWidth="8"/>
                  
                  {/* Cart wheels */}
                  <circle cx="180" cy="310" r="20" fill="#1f2937"/>
                  <circle cx="320" cy="310" r="20" fill="#1f2937"/>
                  
                  {/* Products in cart */}
                  <rect x="160" y="200" width="60" height="70" rx="4" fill="#374151"/>
                  <rect x="240" y="190" width="60" height="80" rx="4" fill="#4b5563"/>
                  <rect x="320" y="210" width="50" height="60" rx="4" fill="#6b7280"/>
                  
                  {/* Discount starburst */}
                  <g transform="translate(380, 100)">
                    <circle cx="0" cy="0" r="40" fill="#fbbf24"/>
                    <text x="0" y="-8" fontSize="16" fontWeight="bold" fill="#1f2937" textAnchor="middle">-70%</text>
                    <text x="0" y="12" fontSize="12" fontWeight="bold" fill="#1f2937" textAnchor="middle">OFF</text>
                  </g>

                  {/* Floating coins */}
                  <circle cx="80" cy="200" r="15" fill="#fbbf24" opacity="0.7"/>
                  <text x="80" y="207" fontSize="16" fontWeight="bold" fill="#1f2937" textAnchor="middle">€</text>
                  <circle cx="420" cy="220" r="12" fill="#fbbf24" opacity="0.6"/>
                  <text x="420" y="226" fontSize="13" fontWeight="bold" fill="#1f2937" textAnchor="middle">€</text>
                  
                  {/* Sparkles */}
                  <path d="M 440 170 l 3 9 l 9 0 l -7 5 l 3 9 l -8 -5 l -8 5 l 3 -9 l -7 -5 l 9 0 z" fill="#fbbf24" opacity="0.8"/>
                  <path d="M 60 260 l 2 6 l 6 0 l -5 3 l 2 6 l -5 -3 l -5 3 l 2 -6 l -5 -3 l 6 0 z" fill="#fbbf24" opacity="0.7"/>
                </g>
              </svg>
            </div>

            {/* Right: CTA Content */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Pronto para Começar a Poupar?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Descobre milhares de produtos com descontos incríveis. 
                Não percas as nossas ofertas exclusivas!
              </p>
              <Button
                onClick={() => router.push("/catalogo")}
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-12 py-6 text-lg font-semibold rounded-xl"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar Catálogo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
