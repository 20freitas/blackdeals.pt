import Navbar from "@/components/Navbar";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Contacto</h1>
          <p className="text-gray-600 text-lg">
            Estamos aqui para ajudar. Entre em contacto connosco.
          </p>
        </div>

        <div className="flex justify-center gap-8 max-w-4xl mx-auto">
          {/* Email Card */}
          <a 
            href="mailto:contacto@blackdeals.pt"
            className="flex-1 border border-gray-200 rounded-lg p-8 text-center hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 transition-all duration-300 cursor-pointer"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6 group-hover:bg-gray-200 transition-colors">
              <Mail className="h-8 w-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Email</h2>
            <p className="text-gray-600 hover:text-gray-900 transition-colors">
              contacto@blackdeals.pt
            </p>
          </a>

          {/* WhatsApp Card */}
          <a 
            href="https://wa.me/351910000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-gray-200 rounded-lg p-8 text-center hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 transition-all duration-300 cursor-pointer"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6 group-hover:bg-gray-200 transition-colors">
              <MessageCircle className="h-8 w-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold mb-4">WhatsApp</h2>
            <p className="text-gray-600 hover:text-gray-900 transition-colors">
              +351 910 000 000
            </p>
          </a>
        </div>

        <div className="text-center mt-12 text-gray-600 max-w-2xl mx-auto">
          <p className="mb-2">Respondemos a todas as mensagens no prazo de 24 horas.</p>
          <p>Para questões urgentes, contacte-nos via WhatsApp.</p>
        </div>
      </main>
    </div>
  );
}
