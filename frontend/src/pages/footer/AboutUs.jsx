import React, { useMemo } from "react";

// Base-aware path builder for images in /public
function resolvePublic(fileName) {
  const base = import.meta.env.BASE_URL || "/";
  return (base.endsWith("/") ? base : base + "/") + fileName.replace(/^\/+/, "");
}

export default function AboutUs() {
  const heroSrc = useMemo(() => resolvePublic("ForCommonUse.jpg"), []);

  return (
    <div className="w-full">
      {/* Hero Banner (Foodpanda style) */}
      <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden">
        <img
          src={heroSrc}
          alt="About SnackBox Banner"
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
            About SnackBox
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10 space-y-8 text-gray-700">
        <p className="text-lg">
          SnackBox is a smart canteen platform that streamlines campus food ordering,
          live order tracking, inventory, and analytics for students and staff.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border bg-white">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p>
              Reduce waiting time, digitize operations, and improve customer experience with
              QR ordering, live order tracking, and data-driven insights.
            </p>
          </div>
          <div className="p-5 rounded-2xl border bg-white">
            <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Online &amp; QR-based ordering</li>
              <li>Smart inventory &amp; stock alerts</li>
              <li>Staff &amp; admin dashboards</li>
              <li>Sales analytics and reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
