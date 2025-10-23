"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Footer() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">BlackDeals</h3>
            <p className="text-sm mb-4">
              Os melhores produtos aos melhores preços.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Email:</span>
              <a href="mailto:suporte@blackdeals.pt" className="hover:text-white transition-colors">
                suporte@blackdeals.pt
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Comprar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => router.push("/catalogo")}
                  className="hover:text-white transition-colors"
                >
                  Catálogo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/carrinho")}
                  className="hover:text-white transition-colors"
                >
                  Carrinho
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/checkout")}
                  className="hover:text-white transition-colors"
                >
                  Checkout
                </button>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Conta</h3>
            <ul className="space-y-2 text-sm">
              {user ? (
                <li>
                  <button 
                    onClick={() => router.push("/perfil")}
                    className="hover:text-white transition-colors"
                  >
                    Meu Perfil
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <button 
                      onClick={() => router.push("/login")}
                      className="hover:text-white transition-colors"
                    >
                      Entrar
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => router.push("/criar-conta")}
                      className="hover:text-white transition-colors"
                    >
                      Criar Conta
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informações</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => router.push("/contacto")}
                  className="hover:text-white transition-colors"
                >
                  Contacto
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/termos")}
                  className="hover:text-white transition-colors"
                >
                  Termos e Condições
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/privacidade")}
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/envios")}
                  className="hover:text-white transition-colors"
                >
                  Política de Envios
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 BlackDeals. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500">Aceitamos:</span>
            <span className="text-white font-semibold">Pagamento Contra Reembolso</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
