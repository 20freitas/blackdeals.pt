"use client";

import { useEffect, useState, useRef } from "react";

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

  const prev = () => setIndex((i) => (i - 1 + placeholders.length) % placeholders.length);
  const next = () => setIndex((i) => (i + 1) % placeholders.length);

  // Autoplay
  useEffect(() => {
    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    if (!isHover) {
      autoplayRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % placeholders.length);
      }, 3000) as unknown as number;
    }
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [isHover]);

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-visible"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div className="relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-[1200px] h-[calc(1200px*1.25)] flex items-center justify-center">
              {/* Slides container - allow overflow so side slides are visible */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {placeholders.map((p, i) => {
                  const diff = signedDiff(i, index, placeholders.length);
                  const abs = Math.abs(diff);
                  // Positioning
                  const translateX = diff * 220; // px offset between slides
                  const scale = Math.max(0.6, 1 - abs * 0.15);
                  const rotateY = diff * -18; // degrees
                  const zIndex = 100 - abs;
                  const opacity = abs > 3 ? 0 : 1 - abs * 0.15;

                  // Make side slides more square: reduce height and border radius when not center
                  const isCenter = abs === 0;
                  const slideWidth = isCenter ? 420 : 300;
                  const slideHeight = isCenter ? 525 : 360; // make sides closer to square
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
                        boxShadow: abs === 0 ? "0 20px 40px rgba(0,0,0,0.35)" : "0 8px 20px rgba(0,0,0,0.15)",
                        width: slideWidth,
                        height: slideHeight,
                        borderRadius: slideRadius,
                        overflow: "hidden",
                        background: p.color,
                      }}
                      onClick={() => setIndex(i)}
                    >
                      {/* Use SVG placeholder sized 1080x1350 but scaled down */}
                      <svg viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
                        <rect width="100%" height="100%" fill={p.color} />
                        <g fill="#ffffff" opacity="0.95">
                          <text x="50%" y="60%" fontSize="56" fontWeight="700" textAnchor="middle">{p.title}</text>
                          <rect x="430" y="900" width="220" height="56" rx="6" fill="rgba(255,255,255,0.06)" stroke="#ffffff" strokeWidth="2" />
                          <text x="540" y="936" fontSize="20" fontWeight="600" textAnchor="middle">{p.subtitle}</text>
                        </g>
                      </svg>
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
            {placeholders.map((_, i) => (
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
