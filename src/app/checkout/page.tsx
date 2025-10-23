"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Truck, CreditCard, MapPin } from "lucide-react";

interface ShippingInfo {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasProfileAddress, setHasProfileAddress] = useState(false);
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Portugal",
  });

  const [profileAddress, setProfileAddress] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    if (items.length === 0) {
      router.push("/carrinho");
      return;
    }

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    loadUserProfile();
  }, [user, items, authLoading]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data && data.address && data.city && data.postal_code) {
        // User has address saved
        const savedAddress: ShippingInfo = {
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          country: data.country || "Portugal",
        };
        
        setProfileAddress(savedAddress);
        setShippingInfo(savedAddress);
        setHasProfileAddress(true);
      } else {
        // No address saved, pre-fill email
        setShippingInfo({
          ...shippingInfo,
          email: user.email || "",
        });
        setHasProfileAddress(false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setToast(null);

    try {
      // Validate stock before creating order
      for (const item of items) {
        const { data: product, error: stockError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (stockError) {
          throw new Error("Erro ao verificar stock disponível.");
        }

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `O produto "${item.name}" não tem stock suficiente. Stock disponível: ${product?.stock || 0}`
          );
        }
      }

      // If user wants to save address to profile
      if (saveToProfile || (!hasProfileAddress && !useDifferentAddress)) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: shippingInfo.full_name,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            postal_code: shippingInfo.postal_code,
            country: shippingInfo.country,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Continue even if profile update fails
        }
      }

      // Generate order code
      const orderCode = `BD${Date.now().toString().slice(-8)}`;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_code: orderCode,
          total: getTotalPrice(),
          status: "pending",
          shipping_name: shippingInfo.full_name,
          shipping_email: shippingInfo.email,
          shipping_phone: shippingInfo.phone,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_postal_code: shippingInfo.postal_code,
          shipping_country: shippingInfo.country,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order error:", orderError);
        throw new Error("Erro ao criar encomenda. Por favor, tente novamente.");
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.final_price,
        variants: item.selectedVariants,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        throw new Error("Erro ao adicionar produtos à encomenda.");
      }

      // Clear cart
      clearCart();

      // Show success message
      setToast({ message: "Encomenda criada com sucesso!", type: "success" });

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/encomenda/${orderData.id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating order:", error);
      setToast({ 
        message: error.message || "Erro ao criar encomenda. Por favor, tente novamente.", 
        type: "error" 
      });
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl font-bold">A carregar...</div>
        </div>
      </>
    );
  }

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      const savings = (item.price - item.final_price) * item.quantity;
      return total + savings;
    }, 0);
  };

  const shouldShowAddressForm = !hasProfileAddress || useDifferentAddress;

  return (
    <>
      <Navbar />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Morada de Envio</h2>
                </div>

                {hasProfileAddress && !useDifferentAddress && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold mb-2">{profileAddress?.full_name}</div>
                    <div className="text-sm text-gray-700">
                      {profileAddress?.address}<br />
                      {profileAddress?.postal_code} {profileAddress?.city}<br />
                      {profileAddress?.country}<br />
                      Tel: {profileAddress?.phone}<br />
                      Email: {profileAddress?.email}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setUseDifferentAddress(true)}
                    >
                      Usar morada diferente
                    </Button>
                  </div>
                )}

                {shouldShowAddressForm && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Morada *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Código Postal *</Label>
                        <Input
                          id="postal_code"
                          name="postal_code"
                          value={shippingInfo.postal_code}
                          onChange={handleInputChange}
                          placeholder="0000-000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">País *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {!hasProfileAddress && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="save"
                          checked={saveToProfile}
                          onCheckedChange={(checked) => setSaveToProfile(checked as boolean)}
                        />
                        <label
                          htmlFor="save"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Guardar esta morada para futuras compras
                        </label>
                      </div>
                    )}

                    {useDifferentAddress && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="save-different"
                          checked={saveToProfile}
                          onCheckedChange={(checked) => setSaveToProfile(checked as boolean)}
                        />
                        <label
                          htmlFor="save-different"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Guardar esta morada no meu perfil
                        </label>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Método de Pagamento</h2>
                </div>
                <div className="p-4 bg-black text-white rounded-lg">
                  <div className="font-bold mb-2">Pagamento Contra Reembolso</div>
                  <p className="text-sm text-gray-300">
                    Pague em dinheiro quando receber a encomenda. Sem custos adicionais.
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Informação de Entrega</h2>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Entrega em 24-48 horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Envio grátis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rastreamento disponível</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Resumo da Encomenda</h2>

                {/* Products */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          Qtd: {item.quantity} × {item.final_price.toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{(getTotalPrice() + getTotalSavings()).toFixed(2)} €</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Desconto</span>
                      <span>-{getTotalSavings().toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Envio</span>
                    <span className="text-green-600 font-semibold">Grátis</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>{getTotalPrice().toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-lg font-bold"
                >
                  <Package className="h-5 w-5 mr-2" />
                  {submitting ? "A processar..." : "Confirmar Encomenda"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Ao confirmar, aceita os nossos termos e condições
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
