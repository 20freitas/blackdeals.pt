"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface PlaceholderImage {
  id: number;
  title: string;
  subtitle?: string;
  color?: string;
}

const placeholders: PlaceholderImage[] = [
  { id: 1, title: "Capas e Proteções", subtitle: "Ver tudo", color: "#111827" },
  { id: 2, title: "Câmera Digital", subtitle: "Ver tudo", color: "#1f2937" },
  { id: 3, title: "Produtos Retro", subtitle: "Ver tudo", color: "#111827" },
  { id: 4, title: "Acessórios Carro", subtitle: "Ver tudo", color: "#1f2937" },
  { id: 5, title: "Phones e acessórios", subtitle: "Ver tudo", color: "#111827" },
];

const STORAGE_KEY = "blackdeals_carousel_settings";

function signedDiff(i: number, current: number, length: number) {
  let raw = i - current;
  const half = Math.floor(length / 2);
  if (raw > half) raw -= length;
  if (raw < -half) raw += length;
  return raw;
}

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  const router = useRouter();

  const [enabled, setEnabled] = useState(true);
  const [slidesConfig, setSlidesConfig] = useState<Array<{ imageUrl?: string; productId?: string | null }>>([]);
  const [slidesCount, setSlidesCount] = useState(5);

  const prev = () => setIndex((i) => (i - 1 + slidesCount) % slidesCount);
  const next = () => setIndex((i) => (i + 1) % slidesCount);

  // Autoplay
  useEffect(() => {
    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    if (!isHover) {
      autoplayRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % slidesCount);
      }, 3000) as unknown as number;
    }
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [isHover]);

  // load settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setEnabled(parsed.enabled ?? true);
        setSlidesCount(parsed.slidesCount ?? 5);
        const initial = parsed.slides ?? [];
        // ensure length
        while (initial.length < (parsed.slidesCount ?? 5)) initial.push({});
        setSlidesConfig(initial);
      }
    } catch (e) {
      console.error('Failed to read carousel settings', e);
    }
  }, []);

  // keep slidesConfig length in sync if slidesCount changes
  useEffect(() => {
    setSlidesConfig(prev => {
      const next = [...prev];
      while (next.length < slidesCount) next.push({});
      if (next.length > slidesCount) next.length = slidesCount;
      return next;
    });
  }, [slidesCount]);

  if (!enabled) return null;

  // If 1 or 2 slides, show simplified layout
  if (slidesCount <= 2) {
    const visibleSlides = slidesConfig.slice(0, slidesCount);
    return (
      <section className="py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 justify-center items-center">
            {visibleSlides.map((s, i) => (
              <div key={i} className="w-[320px] h-[400px] rounded-lg overflow-hidden shadow-sm bg-gray-100 cursor-pointer" onClick={() => s.productId && router.push(`/produto/${s.productId}`)}>
                {s.imageUrl ? <img src={s.imageUrl} alt={`slide-${i}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 lg:py-6"> {/* reduced vertical padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-x-visible overflow-y-hidden"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div className="relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-[1000px] h-[480px] flex items-center justify-center"> {/* smaller height */}
              {/* Slides container - allow overflow so side slides are visible */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 10}}>
                {/* Large soft shadow under carousel (elliptical) */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '64%',
                    transform: 'translateX(-50%)',
                    width: 760,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0) 100%)',
                    filter: 'blur(28px)',
                    zIndex: 5,
                    pointerEvents: 'none'
                  }}
                />
                {placeholders.slice(0, slidesCount).map((p, i) => {
                  const diff = signedDiff(i, index, slidesCount);
                  const abs = Math.abs(diff);
                  // Positioning
                  const translateX = diff * 180; // reduced horizontal offset
                  const scale = Math.max(0.65, 1 - abs * 0.14);
                  const rotateY = diff * -18; // degrees
                  const zIndex = 100 - abs;
                  const opacity = abs > 3 ? 0 : 1 - abs * 0.15;

                  // Make side slides more square: reduce height and border radius when not center
                  const isCenter = abs === 0;
                  const slideWidth = isCenter ? 380 : 260;
                  const slideHeight = isCenter ? 480 : 320; // more compact sizes
                  const slideRadius = isCenter ? 16 : 8;

                  return (
                    <div
                      key={p.id}
                      className="pointer-events-auto absolute top-1/2 left-1/2 transform-gpu transition-all duration-700 ease-in-out"
                      style={{
                        transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                        zIndex,
                        opacity,
                        willChange: "transform, opacity",
                        // Softer per-slide shadows; main blur is handled by the big ellipse below
                        boxShadow: abs === 0 ? "0 18px 36px rgba(2,6,23,0.18)" : "0 10px 20px rgba(2,6,23,0.10)",
                        width: slideWidth,
                        height: slideHeight,
                        borderRadius: slideRadius,
                        overflow: "hidden",
                        background: p.color,
                      }}
                      onClick={() => {
                        // if clicked slide has product associated, navigate; otherwise focus
                        const cfg = slidesConfig[i];
                        if (cfg?.productId) {
                          router.push(`/produto/${cfg.productId}`);
                        } else {
                          setIndex(i);
                        }
                      }}
                    >
                      {/* Use SVG placeholder sized 1080x1350 but scaled down */}
                      {slidesConfig[i]?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slidesConfig[i].imageUrl} alt={`slide-${i}`} className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
                          <rect width="100%" height="100%" fill={p.color} />
                          <g fill="#ffffff" opacity="0.95">
                            <text x="50%" y="60%" fontSize="56" fontWeight="700" textAnchor="middle">{p.title}</text>
                            <rect x="430" y="900" width="220" height="56" rx="6" fill="rgba(255,255,255,0.06)" stroke="#ffffff" strokeWidth="2" />
                            <text x="540" y="936" fontSize="20" fontWeight="600" textAnchor="middle">{p.subtitle}</text>
                          </g>
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls */}
          <button
            aria-label="previous"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-40"
          >
            ‹
          </button>
          <button
            aria-label="next"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-40"
          >
            ›
          </button>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-3">
            {placeholders.slice(0, slidesCount).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-black" : "bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
