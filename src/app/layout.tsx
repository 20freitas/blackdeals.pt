import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlackDeals - Os Melhores Produtos aos Melhores Preços",
  description: "Descobre ofertas exclusivas com até 70% de desconto. Envio grátis e entrega rápida em toda Portugal.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#000000",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://blackdeals.pt",
    title: "BlackDeals - Os Melhores Produtos aos Melhores Preços",
    description: "Descobre ofertas exclusivas com até 70% de desconto. Envio grátis e entrega rápida em toda Portugal.",
    siteName: "BlackDeals",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
