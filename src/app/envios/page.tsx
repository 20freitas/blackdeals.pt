import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Truck, Package, Clock, MapPin, CheckCircle } from "lucide-react";

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Política de Envios
          </h1>
          
          <div className="space-y-8 text-gray-700">
            {/* Highlight Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Envio Grátis para Todo o País!</h2>
              </div>
              <p className="text-gray-700">
                Oferecemos envio gratuito para todas as encomendas em Portugal Continental, 
                sem valor mínimo de compra.
              </p>
            </div>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Prazo de Entrega</h2>
              </div>
              <p>
                O prazo de entrega é de <strong>24 a 48 horas úteis</strong> após a confirmação da encomenda.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Encomendas confirmadas até às 15h00 são processadas no mesmo dia</li>
                <li>Encomendas confirmadas após às 15h00 são processadas no dia útil seguinte</li>
                <li>Não entregamos aos fins de semana e feriados</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Zonas de Entrega</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Portugal Continental</h3>
                  <p>Envio gratuito em 24-48h úteis</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ilhas (Açores e Madeira)</h3>
                  <p>
                    Atualmente não enviamos para as Ilhas. Estamos a trabalhar para disponibilizar 
                    este serviço em breve.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Processamento da Encomenda</h2>
              </div>
              <p className="mb-3">
                Após a confirmação da sua encomenda, seguem-se os seguintes passos:
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmação</h4>
                    <p className="text-sm">Recebe um email de confirmação com os detalhes da encomenda</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Preparação</h4>
                    <p className="text-sm">A sua encomenda é preparada e embalada com cuidado</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Envio</h4>
                    <p className="text-sm">A encomenda é entregue à transportadora</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Entrega</h4>
                    <p className="text-sm">Recebe a encomenda na morada indicada</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Pagamento Contra Reembolso</h2>
              </div>
              <p>
                Todas as encomendas são enviadas com <strong>pagamento contra reembolso</strong>. 
                Isto significa que:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Paga apenas quando recebe a encomenda</li>
                <li>Pode inspecionar a encomenda antes de pagar</li>
                <li>Pagamento em dinheiro ao estafeta</li>
                <li>Maior segurança e confiança na sua compra</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rastreamento da Encomenda</h2>
              <p>
                Pode acompanhar o estado da sua encomenda através da sua conta, na secção 
                "Histórico de Encomendas". Os estados possíveis são:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Pendente:</strong> Encomenda confirmada e em preparação</li>
                <li><strong>Enviada:</strong> Encomenda entregue à transportadora</li>
                <li><strong>Concluída:</strong> Encomenda entregue com sucesso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Problemas com a Entrega</h2>
              <p className="mb-3">
                Se houver algum problema com a sua entrega:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifique se a morada de entrega está correta na sua conta</li>
                <li>Certifique-se de que alguém estará presente para receber a encomenda</li>
                <li>Em caso de ausência, a transportadora deixará um aviso</li>
                <li>Se a encomenda não chegar no prazo previsto, contacte-nos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Embalagem</h2>
              <p>
                Todas as encomendas são cuidadosamente embaladas para garantir que chegam em perfeitas condições. 
                Utilizamos materiais de embalagem adequados para proteger os produtos durante o transporte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Devoluções</h2>
              <p>
                Se não estiver satisfeito com a sua encomenda, tem 14 dias para devolver os produtos. 
                Consulte os nossos Termos e Condições para mais informações sobre o processo de devolução.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Precisa de Ajuda?</h2>
              <p>
                Se tiver questões sobre envios ou sobre a sua encomenda, não hesite em contactar-nos:
              </p>
              <p className="mt-2">
                Email: <a href="mailto:suporte@blackdeals.pt" className="text-blue-600 hover:underline">suporte@blackdeals.pt</a>
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Última atualização: 23 de outubro de 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
