"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, Plus, Edit, Trash2, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProductVariant {
  name: string;
  options: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  supplier_price: number;
  discount: number;
  final_price: number;
  stock: number;
  available_units: number;
  variants: ProductVariant[];
  created_at: string;
}

export default function ProdutosPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    price: "",
    supplier_price: "",
    discount: "",
    stock: "",
    available_units: "",
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantOption, setNewVariantOption] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "high-to-low" | "low-to-high">("none");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Filter products based on search and price
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term (name or description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    // Sort by price
    if (priceSort === "high-to-low") {
      filtered.sort((a, b) => b.final_price - a.final_price);
    } else if (priceSort === "low-to-high") {
      filtered.sort((a, b) => a.final_price - b.final_price);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceSort, products]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoadingProducts(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas ficheiros de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert image to base64 for now (or upload to your preferred service)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
        setUploadingImage(false);
      };
      reader.onerror = () => {
        alert('Erro ao carregar a imagem');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
      setUploadingImage(false);
    }
  };

  const calculateFinalPrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const discount = parseFloat(formData.discount) || 0;
    const final_price = calculateFinalPrice(price, discount);

    const productData = {
      name: formData.name,
      description: formData.description,
      image_url: formData.image_url,
      price: parseFloat(formData.price),
      supplier_price: parseFloat(formData.supplier_price) || null,
      discount: discount,
      final_price: final_price,
      stock: parseInt(formData.stock) || 0,
      available_units: parseInt(formData.available_units) || 0,
      variants: variants.length > 0 ? variants : null,
    };

    let result;
    if (editingProduct) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);
    } else {
      result = await supabase
        .from("products")
        .insert([productData]);
    }

    if (!result.error) {
      loadProducts();
      resetForm();
      setShowForm(false);
    } else {
      alert("Erro ao guardar produto: " + result.error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) {
      loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      image_url: product.image_url || "",
      price: product.price.toString(),
      supplier_price: product.supplier_price?.toString() || "",
      discount: product.discount?.toString() || "0",
      stock: product.stock.toString(),
      available_units: product.available_units.toString(),
    });
    setVariants(product.variants || []);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      price: "",
      supplier_price: "",
      discount: "",
      stock: "",
      available_units: "",
    });
    setVariants([]);
    setEditingProduct(null);
  };

  const addVariant = () => {
    if (newVariantName && newVariantOption) {
      const existingVariant = variants.find(v => v.name === newVariantName);
      if (existingVariant) {
        if (!existingVariant.options.includes(newVariantOption)) {
          existingVariant.options.push(newVariantOption);
          setVariants([...variants]);
        }
      } else {
        setVariants([...variants, { name: newVariantName, options: [newVariantOption] }]);
      }
      setNewVariantOption("");
    }
  };

  const removeVariant = (variantName: string) => {
    setVariants(variants.filter(v => v.name !== variantName));
  };

  const removeVariantOption = (variantName: string, option: string) => {
    setVariants(variants.map(v => {
      if (v.name === variantName) {
        return { ...v, options: v.options.filter(o => o !== option) };
      }
      return v;
    }).filter(v => v.options.length > 0));
  };

  if (loading || loadingProducts) {
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Produtos</h1>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {filteredProducts.length}
            </span>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Price Sort */}
            <div className="flex gap-2">
              <Button
                variant={priceSort === "none" ? "default" : "outline"}
                onClick={() => setPriceSort("none")}
                className="flex-1"
              >
                Sem ordenação
              </Button>
              <Button
                variant={priceSort === "high-to-low" ? "default" : "outline"}
                onClick={() => setPriceSort("high-to-low")}
                className="flex-1"
              >
                Mais caro
              </Button>
              <Button
                variant={priceSort === "low-to-high" ? "default" : "outline"}
                onClick={() => setPriceSort("low-to-high")}
                className="flex-1"
              >
                Mais barato
              </Button>
            </div>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nome do Produto *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: T-shirt Premium"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição detalhada do produto"
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent mt-1"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Imagem do Produto</Label>
                    <div className="mt-1 flex items-center gap-4">
                      {formData.image_url ? (
                        <div className="relative">
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/128?text=Erro")}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                            uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {uploadingImage ? "A carregar..." : "Escolher imagem"}
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, GIF até 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Preços</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Preço *</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <Input
                            required
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Preço Fornecedor</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.supplier_price}
                            onChange={(e) => setFormData({ ...formData, supplier_price: e.target.value })}
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Desconto (%)</Label>
                        <div className="relative mt-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {formData.price && parseFloat(formData.price) > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Preço Final: <span className="text-lg">€{calculateFinalPrice(
                            parseFloat(formData.price),
                            parseFloat(formData.discount) || 0
                          ).toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Stock</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Stock Total</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Unidades Disponíveis</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.available_units}
                          onChange={(e) => setFormData({ ...formData, available_units: e.target.value })}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Variantes (Opcional)</h3>
                    
                    <div className="flex gap-3 mb-4">
                      <Input
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        placeholder="Nome (ex: Tamanho)"
                        className="flex-1"
                      />
                      <Input
                        value={newVariantOption}
                        onChange={(e) => setNewVariantOption(e.target.value)}
                        placeholder="Opção (ex: M)"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={addVariant} 
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    {variants.length > 0 && (
                      <div className="space-y-3">
                        {variants.map((variant) => (
                          <div key={variant.name} className="bg-white border border-gray-200 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm font-medium text-gray-900">{variant.name}</strong>
                              <button
                                type="button"
                                onClick={() => removeVariant(variant.name)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {variant.options.map((option) => (
                                <span
                                  key={option}
                                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-gray-200"
                                >
                                  {option}
                                  <button
                                    type="button"
                                    onClick={() => removeVariantOption(variant.name, option)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploadingImage}>
                      {editingProduct ? "Guardar Alterações" : "Criar Produto"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto criado"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Tente ajustar os filtros de pesquisa" 
                  : "Comece por adicionar o seu primeiro produto"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-5">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/80?text=?";
                          }}
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            €{product.final_price.toFixed(2)}
                          </span>
                          {product.discount > 0 && (
                            <>
                              <span className="text-sm line-through text-gray-400">
                                €{product.price.toFixed(2)}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                                -{product.discount}%
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Stock:</span>
                          <span className={`text-base font-semibold ${
                            product.stock === 0 ? "text-red-600" : 
                            product.stock < 10 ? "text-orange-600" : 
                            "text-green-600"
                          }`}>
                            {product.stock}
                          </span>
                        </div>

                        {product.variants && product.variants.length > 0 && (
                          <div className="flex items-center gap-1">
                            {product.variants.map((variant) => (
                              <span key={variant.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                                {variant.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar produto"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar produto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}