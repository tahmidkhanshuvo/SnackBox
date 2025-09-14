// frontend/src/pages/customer/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CustomerTheme,
  SearchBar,
  OfferSlider,
  CategoryStrip,
  ProductCard,
} from "../../components/UI";
import { listMenuItems } from "../../api/api"; // <-- uses our API helper
import { useCart } from "../../context/CartContext.jsx";

// --- hero slides (unchanged) ---
const slides = [
  { img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000", title: "Flat 40% OFF • Weekend Feast", sub: "Grab sizzling deals on your favorites. Limited time only.", cta: "Order now" },
  { img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2000", title: "Fresh & Fit", sub: "Salads and bowls crafted for your goals.", cta: "Explore healthy" },
  { img: "https://images.unsplash.com/photo-1595267836652-65c7a027f256?q=80&w=2000", title: "Sweet Indulgence", sub: "Desserts that make your day.", cta: "Treat yourself" },
];

// --- categories (keys should match your backend categories if you filter there) ---
const categories = [
  { key: "burger", name: "Burgers", icon: "🍔" },
  { key: "pizza",  name: "Pizza",   icon: "🍕" },
  { key: "sushi",  name: "Sushi",   icon: "🍣" },
  { key: "coffee", name: "Coffee",  icon: "☕"  },
  { key: "cake",   name: "Dessert", icon: "🍰" },
  { key: "salad",  name: "Salads",  icon: "🥗"  },
  { key: "bowl",   name: "Bowls",   icon: "🥣"  },
  { key: "wrap",   name: "Wraps",   icon: "🌯"  },
];

// map API resource -> card shape expected by ProductCard
const toCard = (x) => ({
  id: x?.id,
  title: x?.name || x?.item_name || "Menu item",
  img: x?.image_url || x?.image || null,
  price: typeof x?.price === "number" ? x.price : Number(x?.price ?? 0),
  rating: typeof x?.rating === "number" ? x.rating : 4.6,
  time: x?.preparation_time || x?.prep_time || "20–30 min",
  badge: x?.availability === false ? "Unavailable" : undefined,
});

export default function Home({ openProduct, openProfile }) {
  const { addItem } = useCart(); // <-- NEW

  // ------- filters & pagination -------
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  // ------- data state -------
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null); // Laravel paginator meta
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // fetch menu items whenever filters change
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { items, meta } = await listMenuItems({
          page,
          q,
          category: category || undefined, // omit if blank
          per_page: 12,
          sortBy: 'item_name',
          sortDir: 'asc',
        });
        if (!alive) return;
        setItems((items || []).map(toCard));
        setMeta(meta || null);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load menu.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page, q, category]);

  // ------- callbacks -------
  const handleSearch = (text) => { setPage(1); setQ(text.trim()); };
  const handlePick = (key) => { setPage(1); setCategory(key === category ? "" : key); };

  // Quick-add from card (1 qty, no options). If an item needs options, route to details instead from the card's "Details" button.
  const addFromCard = (m) => {
    const id    = m.id;
    const name  = m.title || "Item";
    const img   = m.img || null;
    const price = Number(m.price || 0);

    addItem({
      id, name, img, qty: 1, price,
      unitDelta: 0, unitTotal: price,
      selections: {}, addons: {},
      pricedSelections: [], pricedAddons: [],
      notes: "",
    });
  };

  const details = (item) => openProduct?.(item.id);

  // simple derived label
  const sectionTitle = useMemo(() => {
    if (q) return `Results for “${q}”`;
    if (category) return categories.find(c => c.key === category)?.name || "Popular near you";
    return "Popular near you";
  }, [q, category]);

  const canPrev = (meta?.current_page ?? 1) > 1 && !loading;
  const canNext = meta?.last_page ? (meta.current_page < meta.last_page && !loading) : !loading;

  // ------- UI -------
  return (
    <div className="sb-page">
      <CustomerTheme />

      <main className="sb-shell">
        <OfferSlider slides={slides} onCta={(s) => console.log("CTA:", s)} />
        <SearchBar onSearch={handleSearch} />
        <CategoryStrip categories={categories} onPick={handlePick} activeKey={category} />

        <section style={{ marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "var(--sb-accent)" }}>
              {sectionTitle}
            </h3>

            {/* tiny pager */}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="sb-pill" disabled={!canPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
              <button className="sb-pill" disabled={!canNext} onClick={() => setPage(p => (meta?.last_page ? Math.min(meta.last_page, p + 1) : p + 1))}>Next</button>
            </div>
          </div>

          {/* states */}
          {err ? (
            <div style={{ padding: 16, borderRadius: 12, background: "#fff1f1", color: "#b91c1c", fontWeight: 700 }}>
              {err}
            </div>
          ) : null}

          {loading && !items.length ? (
            <div className="sb-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 260, borderRadius: 16, background: "rgba(15,23,42,0.05)" }} />
              ))}
            </div>
          ) : null}

          {!loading && !err && !items.length ? (
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(15,23,42,.04)", fontWeight: 700 }}>
              No items found.
            </div>
          ) : null}

          {/* product grid */}
          <div className="sb-grid">
            {items.map((m) => (
              <ProductCard key={m.id} item={m} onAdd={addFromCard} onDetails={details} />
            ))}
          </div>

          <style>{`
            .sb-grid {
              display: grid;
              gap: 16px;
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            }
          `}</style>
        </section>
      </main>
    </div>
  );
}
