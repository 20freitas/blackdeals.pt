"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (!error && data) {
          setProfile(data);
          setForm({
            firstName: data.first_name || user.user_metadata?.first_name || "",
            lastName: data.last_name || user.user_metadata?.last_name || "",
            phone: data.phone || "",
            address: data.address || "",
            postalCode: data.postal_code || "",
            city: data.city || "",
          });
        } else {
          // Se não existe perfil, usar dados do user_metadata
          setForm({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            phone: "",
            address: "",
            postalCode: "",
            city: "",
          });
        }
      })();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'Meu Perfil'}
              </h1>
              <p className="text-gray-300 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {!editing ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Nome</label>
                      <p className="text-base font-medium mt-1">{form.firstName || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Sobrenome</label>
                      <p className="text-base font-medium mt-1">{form.lastName || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Telemóvel</label>
                    <p className="text-base font-medium mt-1">{form.phone || '—'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Morada</label>
                    <p className="text-base font-medium mt-1">{form.address || '—'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Código Postal</label>
                      <p className="text-base font-medium mt-1">{form.postalCode || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Cidade</label>
                      <p className="text-base font-medium mt-1">{form.city || '—'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-sm text-gray-600">Membro desde</label>
                    <p className="text-base font-medium mt-1">
                      {new Date(user.created_at).toLocaleDateString("pt-PT", { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={form.firstName} 
                      onChange={(e) => setForm({...form, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={form.lastName} 
                      onChange={(e) => setForm({...form, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telemóvel</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="+351 912 345 678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input 
                    id="address" 
                    value={form.address} 
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    placeholder="Rua, número, andar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input 
                      id="postalCode" 
                      value={form.postalCode} 
                      onChange={(e) => setForm({...form, postalCode: e.target.value})}
                      placeholder="1000-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={form.city} 
                      onChange={(e) => setForm({...form, city: e.target.value})}
                      placeholder="Lisboa"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              {editing ? (
                <>
                  <Button 
                    className="flex-1 bg-black hover:bg-gray-800"
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await supabase.from('profiles').upsert({
                          id: user.id,
                          first_name: form.firstName,
                          last_name: form.lastName,
                          email: user.email,
                          phone: form.phone,
                          address: form.address,
                          postal_code: form.postalCode,
                          city: form.city,
                        });
                        setProfile({...profile, ...form});
                        setEditing(false);
                      } catch (e) {
                        console.error('Erro ao atualizar perfil', e);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? 'A guardar...' : 'Guardar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { 
                      setEditing(false); 
                      setForm({
                        firstName: profile?.first_name || user.user_metadata?.first_name || '',
                        lastName: profile?.last_name || user.user_metadata?.last_name || '',
                        phone: profile?.phone || '',
                        address: profile?.address || '',
                        postalCode: profile?.postal_code || '',
                        city: profile?.city || '',
                      });
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditing(true)} 
                    className="flex-1 bg-black hover:bg-gray-800"
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Terminar Sessão
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
