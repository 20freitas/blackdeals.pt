"use client";

import React from "react";

export default function PartnersStrip() {
  const logos = ["/trustpilot.png", "/google.png", "/facebook.svg"];

  // For card use, show the three logos (can repeat once for balance)
  const items = [...logos, ...logos];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Parceiros verificados</h3>
      </div>

      <div className="flex items-center justify-start gap-8">
        {items.map((src, idx) => (
          <div key={idx} className="partners-item flex-shrink-0 flex items-center justify-center px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Parceiro verificado" className="h-10 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
