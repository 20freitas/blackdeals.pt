import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Termos e Condições
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao aceder e utilizar o website BlackDeals, você concorda em cumprir e estar vinculado aos seguintes 
                termos e condições de uso. Se não concordar com qualquer parte destes termos, não deverá utilizar o nosso website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Produtos e Serviços</h2>
              <p>
                A BlackDeals reserva-se o direito de modificar ou descontinuar qualquer produto ou serviço sem aviso prévio. 
                Os preços dos produtos estão sujeitos a alterações sem aviso prévio.
              </p>
              <p className="mt-2">
                Fazemos todos os esforços para exibir com precisão as cores e imagens dos nossos produtos. No entanto, 
                não podemos garantir que a exibição de qualquer cor no seu monitor seja precisa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Encomendas e Pagamento</h2>
              <p>
                Ao fazer uma encomenda, você garante que:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Tem capacidade legal para celebrar contratos vinculativos</li>
                <li>As informações fornecidas são verdadeiras e completas</li>
                <li>Aceita pagar o preço indicado no momento da encomenda</li>
              </ul>
              <p className="mt-3">
                Aceitamos pagamento contra reembolso. O pagamento deve ser efetuado no momento da entrega.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Envio e Entrega</h2>
              <p>
                Oferecemos envio gratuito para todas as encomendas em Portugal Continental. O prazo estimado de 
                entrega é de 24 a 48 horas úteis após a confirmação da encomenda.
              </p>
              <p className="mt-2">
                A BlackDeals não se responsabiliza por atrasos causados por transportadoras ou circunstâncias fora 
                do nosso controlo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Direito de Devolução</h2>
              <p>
                De acordo com a legislação portuguesa, tem o direito de devolver produtos no prazo de 14 dias após 
                a receção, sem necessidade de justificação.
              </p>
              <p className="mt-2">
                Os produtos devolvidos devem estar no seu estado original, não utilizados e com todas as etiquetas 
                e embalagens originais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Garantias</h2>
              <p>
                Todos os produtos vendidos pela BlackDeals estão cobertos pela garantia legal de 2 anos, conforme 
                estabelecido pela legislação portuguesa e europeia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p>
                A BlackDeals não será responsável por quaisquer danos indiretos, incidentais, especiais ou 
                consequenciais resultantes do uso ou incapacidade de usar os nossos produtos ou serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do website BlackDeals, incluindo textos, gráficos, logos, ícones e imagens, 
                é propriedade da BlackDeals e está protegido pelas leis de direitos de autor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Alterações aos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos e condições a qualquer momento. As alterações 
                entrarão em vigor imediatamente após a sua publicação no website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Lei Aplicável</h2>
              <p>
                Estes termos e condições são regidos e interpretados de acordo com as leis de Portugal. Qualquer 
                litígio será submetido à jurisdição exclusiva dos tribunais portugueses.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto</h2>
              <p>
                Para questões sobre estes Termos e Condições, por favor contacte-nos:
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
