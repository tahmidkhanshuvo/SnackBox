import React, { useMemo } from "react";

function resolvePublic(fileName) {
  // Works with Vite base paths and plain root deployments
  const base = import.meta.env.BASE_URL || "/";
  return (base.endsWith("/") ? base : base + "/") + fileName.replace(/^\/+/, "");
}

export default function PrivacyPolicy() {
  const heroSrc = useMemo(() => resolvePublic("ForCommonUse.jpg"), []);

  return (
    <div className="w-full">
      {/* Foodpanda-style Hero Banner */}
      <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden">
        <img
          src={heroSrc}
          alt="Privacy Policy Banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallbacks if base path or server config is different
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
            Privacy Policy | SnackBox
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10 space-y-6 text-gray-700">
        <p>
          This policy explains how <b>SnackBox</b> uses your personal information which you
          provide to us when using our service, including but not limited to our website and
          mobile applications.
        </p>

        <h2 className="text-xl font-semibold">What information we collect about you?</h2>
        <p>
          We collect personal information when you register, place orders, provide feedback,
          or interact with our services. We may also collect technical data (cookies, device
          info, usage analytics) to improve performance.
        </p>

        <h2 className="text-xl font-semibold">How we use your information</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Process orders, payments, and notifications</li>
          <li>Improve menus, operations, and user experience</li>
          <li>Provide promotions and service updates (where permitted)</li>
          <li>Comply with institutional and legal requirements</li>
        </ul>

        <h2 className="text-xl font-semibold">Your rights</h2>
        <p>
          You can update profile information at any time and request deletion of your account/data,
          subject to canteen policy and legal obligations.
        </p>
      </div>
    </div>
  );
}
