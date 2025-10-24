"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast";

type SlideConfig = {
  id: number;
  imageUrl?: string; // public url or base64
  productId?: string | null;
};

type ReviewConfig = {
  id: number;
  imageUrl?: string;
  author?: string;
  text?: string;
  rating?: number; // 1-5
};

type FAQ = {
  question: string;
  answer: string;
};

const STORAGE_KEY = "blackdeals_carousel_settings";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [slidesCount, setSlidesCount] = useState(5);
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [reviews, setReviews] = useState<ReviewConfig[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      (async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (data?.role !== "admin") router.push("/");
      })();
    }
  }, [user, loading, router]);

  // Load products for association
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("id, name").order("name", { ascending: true });
      if (data) setProducts(data as any);
    })();
  }, []);

  // Load saved settings from Supabase (preferred) and fallback to localStorage
  useEffect(() => {
    (async () => {
      // try fetch from Supabase table 'carousel_settings' (row id = 'main')
      try {
        const { data, error } = await supabase.from("carousel_settings").select("*").eq("id", "main").single();
        if (error) throw error;
        if (data) {
          // support two possible shapes: { settings: JSON } or flat columns
          let parsed: any = null;
          if (data.settings) {
            try {
              parsed = JSON.parse(data.settings);
            } catch (e) {
              parsed = data.settings;
            }
          } else {
            parsed = {
              enabled: data.enabled ?? true,
              slidesCount: data.slides_count ?? 5,
              slides: data.slides ?? [],
            };
          }

          setEnabled(parsed.enabled ?? true);
          setSlidesCount(parsed.slidesCount ?? 5);
          setSlides(parsed.slides ?? []);
          setReviews(parsed.reviews ?? []);
          setFaqs(parsed.faqs ?? []);
          // mirror to localStorage for offline use
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch (e) {
            console.warn("Failed to mirror carousel settings to localStorage", e);
          }
          return;
        }
      } catch (err) {
        // if Supabase fetch fails (table missing / permissions) fall back to localStorage
        console.warn("Could not load carousel settings from Supabase, falling back to localStorage", err);
      }

      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setEnabled(parsed.enabled ?? true);
          setSlidesCount(parsed.slidesCount ?? 5);
          setSlides(parsed.slides ?? []);
          setReviews(parsed.reviews ?? []);
          setFaqs(parsed.faqs ?? []);
          return;
        }
      } catch (e) {
        console.error("Failed to parse carousel settings from localStorage", e);
      }

      // initialize empty slides
      setSlides(Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })));
      setReviews([]);
    })();
  }, []);

  useEffect(() => {
    // ensure slides array length matches slidesCount (min 1, max 5)
    setSlides((prev) => {
      const next = prev.slice(0, slidesCount);
      while (next.length < slidesCount) next.push({ id: next.length + 1 });
      return next;
    });
  }, [slidesCount]);

  const handleFile = async (file: File, index: number) => {
    // Try upload to Supabase Storage first
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}_${index}.${fileExt}`;
      const { data, error } = await supabase.storage.from('public').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.path}`;
      setSlides((s) => s.map((sl, i) => i === index ? { ...sl, imageUrl: url } : sl));
      setToast({ message: `Imagem carregada (slide ${index + 1})`, type: 'success' });
      return;
    } catch (err) {
      console.warn('Supabase upload failed, falling back to base64', err);
      setToast({ message: `Upload falhou, a usar fallback (slide ${index + 1})`, type: 'error' });
    }

    // Fallback to base64
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setSlides((s) => s.map((sl, i) => i === index ? { ...sl, imageUrl: res } : sl));
      setToast({ message: `Imagem carregada localmente (slide ${index + 1})`, type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleReviewFile = async (file: File, index: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `review_${Date.now()}_${index}.${fileExt}`;
      const { data, error } = await supabase.storage.from('public').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.path}`;
  setReviews((r) => r.map((rv, i) => i === index ? { ...rv, imageUrl: url } : rv));
      setToast({ message: `Review carregada (imagem ${index + 1})`, type: 'success' });
      return;
    } catch (err) {
      console.warn('Supabase upload failed for review, falling back to base64', err);
      setToast({ message: `Upload falhou, a usar fallback (review ${index + 1})`, type: 'error' });
    }

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setReviews((r) => r.map((rv, i) => i === index ? { ...rv, imageUrl: res } : rv));
      setToast({ message: `Review carregada localmente (imagem ${index + 1})`, type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
  const payload = { enabled, slidesCount, slides, reviews, faqs };

    // always write local copy first
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to write carousel settings to localStorage", e);
    }

    // Try to persist to Supabase (upsert into 'carousel_settings' table)
    try {
  const row = { id: "main", settings: JSON.stringify(payload) };
  const { data, error } = await supabase.from("carousel_settings").upsert([row]).select().single();
      if (error) throw error;
      setToast({ message: 'Definições guardadas no servidor', type: 'success' });
      return;
    } catch (err) {
      console.warn('Failed to persist carousel settings to Supabase', err);
      setToast({ message: 'Guardado localmente — erro ao gravar no servidor', type: 'error' });
    }
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSlides(Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })));
    setEnabled(true);
    setSlidesCount(5);
    setReviews([]);
    setFaqs([]);
    setToast({ message: 'Definições repostas', type: 'success' });
  };

  const saveReviews = async () => {
    const payload = { enabled, slidesCount, slides, reviews, faqs };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to write reviews to localStorage", e);
    }

    try {
      const row = { id: "main", settings: JSON.stringify(payload) };
      const { data, error } = await supabase.from("carousel_settings").upsert([row]).select().single();
      if (error) throw error;
      setToast({ message: 'Reviews guardadas no servidor', type: 'success' });
      return;
    } catch (err) {
      console.warn('Failed to persist reviews to Supabase', err);
      setToast({ message: 'Reviews guardadas localmente — erro ao gravar no servidor', type: 'error' });
    }
  };

  const saveFaqs = async () => {
    const payload = { enabled, slidesCount, slides, reviews, faqs };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to write faqs to localStorage", e);
    }

    try {
      const row = { id: "main", settings: JSON.stringify(payload) };
      const { data, error } = await supabase.from("carousel_settings").upsert([row]).select().single();
      if (error) throw error;
      setToast({ message: 'FAQs guardadas no servidor', type: 'success' });
      return;
    } catch (err) {
      console.warn('Failed to persist faqs to Supabase', err);
      setToast({ message: 'FAQs guardadas localmente — erro ao gravar no servidor', type: 'error' });
    }
  };

  if (loading || !user) return null;

  const removeImage = (index: number) => {
    setSlides(s => s.map((x, idx) => idx === index ? { ...x, imageUrl: undefined } : x));
    setToast({ message: `Imagem removida (slide ${index + 1})`, type: 'success' });
  };

  const addReview = () => {
    setReviews(r => [...r, { id: r.length + 1, author: '', text: '', rating: 5 }]);
  };

  // FAQ helpers
  const addFaq = () => {
    setFaqs((f) => [...f, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, q: Partial<FAQ>) => {
    setFaqs((f) => f.map((item, i) => i === index ? { ...item, ...q } : item));
  };

  const removeFaq = (index: number) => {
    setFaqs((f) => f.filter((_, i) => i !== index));
  };

  const removeReview = (index: number) => {
    setReviews(r => r.filter((_, i) => i !== index).map((rv, i) => ({ ...rv, id: i + 1 })));
    setToast({ message: `Review removida (imagem ${index + 1})`, type: 'success' });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type as any}
            onClose={() => setToast(null)}
          />
        )}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Definições do Carousel</h1>
        </div>
        {/* Reviews management - images that will replace the 'Clientes Satisfeitos' section */}
        <div className="p-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reviews (imagens)</h2>
              <div className="flex items-center gap-3">
                <button onClick={addReview} className="bg-white border px-3 py-2 rounded-md">Adicionar review</button>
                <button onClick={saveReviews} className="bg-black text-white px-3 py-2 rounded-md">Guardar reviews</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {reviews.length === 0 && (
                  <div className="text-sm text-gray-500 col-span-full">Sem reviews — adiciona imagens, texto e avaliação.</div>
                )}

                {reviews.map((rv, i) => (
                  <div key={rv.id} className="flex flex-col items-start bg-gray-50 p-4 rounded-lg shadow-sm">
                    <div className="w-full h-44 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                      {rv.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rv.imageUrl} alt={`Review ${i+1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-400">Sem imagem</div>
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <input id={`review-file-${i}`} type="file" accept="image/*" onChange={(e) => e.target.files && handleReviewFile(e.target.files[0], i)} className="hidden" />
                        <label htmlFor={`review-file-${i}`} className="cursor-pointer bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-100">Carregar imagem</label>
                        <button onClick={() => removeReview(i)} className="bg-white border px-3 py-2 rounded-md">Remover</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        <input
                          type="text"
                          placeholder="Autor"
                          value={rv.author || ''}
                          onChange={(e) => setReviews(r => r.map((x, idx) => idx === i ? { ...x, author: e.target.value } : x))}
                          className="w-full border px-3 py-2 rounded"
                        />

                        <div className="flex items-center gap-1 md:col-span-1">
                          {[1,2,3,4,5].map((s) => (
                            <button key={s} onClick={() => setReviews(r => r.map((x, idx) => idx === i ? { ...x, rating: s } : x))} className={`text-yellow-400 ${rv.rating && rv.rating >= s ? '' : 'opacity-40'}`} aria-label={`Set rating ${s}`}>
                              ★
                            </button>
                          ))}
                        </div>

                        <textarea
                          placeholder="Texto da review"
                          value={rv.text || ''}
                          onChange={(e) => setReviews(r => r.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))}
                          className="w-full md:col-span-3 border px-3 py-2 rounded h-24"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-sm text-gray-500">
              Nota: As imagens de reviews serão exibidas publicamente na landing page e substituirão a secção "Clientes Satisfeitos". As imagens são guardadas no servidor quando possível; caso contrário, são mantidas localmente no browser.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
              <span className="font-medium">Ativar Carousel na landing page</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Slides:</span>
              <select value={slidesCount} onChange={(e) => setSlidesCount(Number(e.target.value))} className="border px-3 py-2 rounded-md bg-white">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides.map((sl, i) => (
              <div key={sl.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="relative w-36 h-44 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {sl.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sl.imageUrl} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-gray-400">Sem imagem</div>
                  )}

                  {sl.productId && (
                    <div className="absolute left-2 top-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Produto</div>
                  )}

                  <button onClick={() => removeImage(i)} className="absolute right-2 top-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow">✕</button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Slide {i+1}</div>
                    <label className="inline-flex items-center gap-3">
                      <input id={`file-${i}`} type="file" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0], i)} className="hidden" />
                      <label htmlFor={`file-${i}`} className="cursor-pointer bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-100">Carregar imagem</label>
                    </label>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">Escolher ficheiro</p>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Produto associado (opcional)</label>
                    <select value={sl.productId || ""} onChange={(e) => setSlides(s => s.map((x, idx) => idx === i ? { ...x, productId: e.target.value || null } : x))} className="w-full border px-3 py-2 rounded-md bg-white">
                      <option value="">-- Nenhum --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Nota: se escolheres 1 ou 2 imagens, a landing page ajustará automaticamente o layout para mostrar apenas essas imagens. Com 3+ será usado o efeito coverflow.
          </div>
          {/* FAQ section removed from carousel card — rendered separately below */}

          <div className="flex items-center gap-3 mt-4">
            <button onClick={save} className="bg-black text-white px-4 py-2 rounded-md shadow">Guardar Carousel</button>
            <button onClick={clear} className="bg-white border px-4 py-2 rounded-md">Repor</button>
          </div>
        </div>
      </div>

      {/* Separate FAQ management card */}
      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Perguntas Frequentes (FAQ)</h2>
            <div className="flex items-center gap-3">
              <button onClick={addFaq} className="bg-white border px-3 py-2 rounded-md">Adicionar FAQ</button>
              <button onClick={saveFaqs} className="bg-black text-white px-3 py-2 rounded-md">Guardar FAQs</button>
            </div>
          </div>

          {faqs.length === 0 ? (
            <div className="text-sm text-gray-500">Ainda não existem perguntas frequentes.</div>
          ) : (
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Pergunta"
                        value={f.question}
                        onChange={(e) => updateFaq(i, { question: e.target.value })}
                        className="w-full border px-3 py-2 rounded mb-2"
                      />
                      <textarea
                        placeholder="Resposta"
                        value={f.answer}
                        onChange={(e) => updateFaq(i, { answer: e.target.value })}
                        className="w-full border px-3 py-2 rounded h-24"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => removeFaq(i)} className="bg-white border px-3 py-2 rounded-md">Remover</button>
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
