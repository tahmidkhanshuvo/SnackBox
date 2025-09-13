import React, { useMemo } from "react";

function resolvePublic(fileName) {
  const base = import.meta.env.BASE_URL || "/";
  return (base.endsWith("/") ? base : base + "/") + fileName.replace(/^\/+/, "");
}

export default function FAQ() {
  const heroSrc = useMemo(() => resolvePublic("ForCommonUse.jpg"), []);
  const faqs = [
    { q: "How do I place an order?", a: "Open Menu, view an item, add to cart, then proceed to Checkout." },
    { q: "Which payment methods are supported?", a: "Depending on your canteen: COD, bKash, and Nagad may be available." },
    { q: "How do I track my order?", a: "Go to Orders to see real-time status from kitchen to pickup/delivery." },
    { q: "Who do I contact for an issue?", a: "Use the Feedback page or contact the counter staff directly." }
  ];

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden">
        <img
          src={heroSrc}
          alt="FAQ Banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            if (e.currentTarget.dataset.fallback === "0") {
              e.currentTarget.dataset.fallback = "1";
              e.currentTarget.src = "/ForCommonUse.jpg";
            } else if (e.currentTarget.dataset.fallback === "1") {
              e.currentTarget.dataset.fallback = "2";
              e.currentTarget.src = "ForCommonUse.jpg";
            }
          }}
          data-fallback="0"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center uppercase tracking-wide">
            Frequently Asked Questions
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10 space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="bg-white border rounded-2xl p-4">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-gray-700">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
