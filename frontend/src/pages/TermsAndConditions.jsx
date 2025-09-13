import React, { useMemo } from "react";

function resolvePublic(fileName) {
  const base = import.meta.env.BASE_URL || "/";
  return (base.endsWith("/") ? base : base + "/") + fileName.replace(/^\/+/, "");
}

export default function TermsAndConditions() {
  const heroSrc = useMemo(() => resolvePublic("ForCommonUse.jpg"), []);

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden">
        <img
          src={heroSrc}
          alt="Terms & Conditions Banner"
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
            Terms &amp; Conditions
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10 space-y-6 text-gray-700">
        <p>
          By using <b>SnackBox</b>, you agree to these terms. Orders placed via the platform are
          subject to availability, pricing, and canteen policies.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Ordering &amp; Payments</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Prices are shown in local currency and may change without notice.</li>
            <li>Orders may be cancelled if items are unavailable or for operational reasons.</li>
            <li>Supported payments (e.g., COD, bKash, Nagad) depend on canteen settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">User Responsibilities</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Provide accurate account and contact information.</li>
            <li>Follow campus policies and do not misuse the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Liability</h2>
          <p>
            SnackBox is provided “as-is”. We are not liable for indirect damages or third-party
            failures beyond reasonable control.
          </p>
        </section>
      </div>
    </div>
  );
}
