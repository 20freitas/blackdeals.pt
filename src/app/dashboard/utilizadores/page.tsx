"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  created_at: string;
}

export default function UtilizadoresPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      (async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (data?.role !== 'admin') {
          router.push("/");
        }
      })();
    }
  }, [user, loading, router]);

  // Load all profiles
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setProfiles(data);
      setFilteredProfiles(data);
    }
    setLoadingProfiles(false);
  };

  // Filter profiles based on search and role
  useEffect(() => {
    let filtered = profiles;

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(p => p.role === roleFilter);
    }

    // Filter by search term (name or email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term)
      );
    }

    setFilteredProfiles(filtered);
  }, [searchTerm, roleFilter, profiles]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading || loadingProfiles) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Utilizadores</h1>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {filteredProfiles.length}
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                onClick={() => setRoleFilter("all")}
                className="flex-1"
              >
                Todos
              </Button>
              <Button
                variant={roleFilter === "user" ? "default" : "outline"}
                onClick={() => setRoleFilter("user")}
                className="flex-1"
              >
                Utilizadores
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "outline"}
                onClick={() => setRoleFilter("admin")}
                className="flex-1"
              >
                Admins
              </Button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum utilizador encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="hover:bg-gray-50 transition-colors">
                  {/* Main Row */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(profile.id)}
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            profile.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {profile.role === "admin" ? "Admin" : "Utilizador"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Criado em {new Date(profile.created_at).toLocaleDateString("pt-PT")}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedId === profile.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === profile.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 mb-2">Informações de Contacto</h3>
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="text-sm font-medium">{profile.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Telefone</p>
                              <p className="text-sm font-medium">
                                {profile.phone || "Não fornecido"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 mb-2">Morada</h3>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              {profile.address ? (
                                <>
                                  <p className="text-sm font-medium">{profile.address}</p>
                                  <p className="text-sm text-gray-500">
                                    {profile.postal_code && `${profile.postal_code} `}
                                    {profile.city}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">Morada não fornecida</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}