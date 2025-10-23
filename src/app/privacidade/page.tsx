import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
              <p>
                A BlackDeals compromete-se a proteger a sua privacidade. Esta política de privacidade explica como 
                recolhemos, usamos, divulgamos e protegemos as suas informações pessoais quando utiliza o nosso website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Recolhemos</h2>
              <p>
                Recolhemos os seguintes tipos de informações:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  <strong>Informações de Conta:</strong> Nome, email, telefone e morada quando cria uma conta
                </li>
                <li>
                  <strong>Informações de Encomenda:</strong> Detalhes de envio, produtos adquiridos e histórico de encomendas
                </li>
                <li>
                  <strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, páginas visitadas e duração da visita
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos as Suas Informações</h2>
              <p>
                Utilizamos as suas informações para:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Processar e entregar as suas encomendas</li>
                <li>Comunicar consigo sobre a sua encomenda</li>
                <li>Melhorar a sua experiência de compra</li>
                <li>Enviar atualizações sobre produtos e ofertas (se consentir)</li>
                <li>Prevenir fraudes e garantir a segurança do website</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partilha de Informações</h2>
              <p>
                Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Com empresas de transporte para entregar as suas encomendas</li>
                <li>Com processadores de pagamento para processar transações</li>
                <li>Quando exigido por lei ou para proteger os nossos direitos legais</li>
                <li>Com o seu consentimento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
              <p>
                Utilizamos cookies para melhorar a sua experiência no nosso website. Os cookies são pequenos ficheiros 
                armazenados no seu dispositivo que nos ajudam a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Manter a sua sessão iniciada</li>
                <li>Lembrar as suas preferências</li>
                <li>Analisar o tráfego do website</li>
                <li>Personalizar conteúdo e anúncios</li>
              </ul>
              <p className="mt-2">
                Pode configurar o seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades 
                do website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger as suas 
                informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
              <p className="mt-2">
                No entanto, nenhum método de transmissão pela Internet é 100% seguro, e não podemos garantir 
                segurança absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Os Seus Direitos (RGPD)</h2>
              <p>
                De acordo com o Regulamento Geral de Proteção de Dados (RGPD), tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Direito de Acesso:</strong> Solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Direito de Retificação:</strong> Corrigir dados imprecisos ou incompletos</li>
                <li><strong>Direito ao Apagamento:</strong> Solicitar a eliminação dos seus dados</li>
                <li><strong>Direito à Portabilidade:</strong> Receber os seus dados num formato estruturado</li>
                <li><strong>Direito de Oposição:</strong> Opor-se ao processamento dos seus dados</li>
                <li><strong>Direito de Limitação:</strong> Solicitar a limitação do processamento</li>
              </ul>
              <p className="mt-3">
                Para exercer estes direitos, contacte-nos através do email: suporte@blackdeals.pt
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retenção de Dados</h2>
              <p>
                Conservamos as suas informações pessoais apenas pelo tempo necessário para cumprir os fins para os 
                quais foram recolhidas, incluindo requisitos legais, contabilísticos ou de relatório.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Links para Outros Websites</h2>
              <p>
                O nosso website pode conter links para websites de terceiros. Não somos responsáveis pelas práticas 
                de privacidade desses websites. Recomendamos que leia as políticas de privacidade de cada website 
                que visita.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
              <p>
                O nosso serviço não se destina a menores de 18 anos. Não recolhemos intencionalmente informações 
                pessoais de menores. Se tomar conhecimento de que recolhemos dados de um menor, tomaremos medidas 
                para eliminar essas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações a Esta Política</h2>
              <p>
                Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre alterações 
                significativas através do email ou de um aviso proeminente no nosso website.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto</h2>
              <p>
                Para questões sobre esta Política de Privacidade ou para exercer os seus direitos, contacte-nos:
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
