// src/pages/customer/Home.jsx
import React from "react";
import {
  CustomerTheme,
  Topbar,
  SearchBar,
  OfferSlider,
  CategoryStrip,
  ProductCard,
} from "../../components/UI";

const slides = [
  { img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000", title: "Flat 40% OFF • Weekend Feast", sub: "Grab sizzling deals on your favorites. Limited time only.", cta: "Order now" },
  { img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2000", title: "Fresh & Fit", sub: "Salads and bowls crafted for your goals.", cta: "Explore healthy" },
  { img: "https://images.unsplash.com/photo-1526312426976-593c8372c1b1?q=80&w=2000", title: "Sweet Indulgence", sub: "Desserts that make your day.", cta: "Treat yourself" },
];

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

const mockMenu = [
  { id: 1, title: "Classic Beef Burger",  price: 320, rating: 4.7, time: "25–35 min", img: "https://images.unsplash.com/photo-1551782450-17144c3a8f53?q=80&w=2000", badge: "Bestseller" },
  { id: 2, title: "Pepperoni Pizza",      price: 790, rating: 4.6, time: "30–40 min", img: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=2000", badge: "-20% Today" },
  { id: 3, title: "Rainbow Sushi Set",    price: 950, rating: 4.9, time: "35–45 min", img: "https://images.unsplash.com/photo-1542736667-069246bdbc1d?q=80&w=2000", badge: "Chef’s pick" },
  { id: 4, title: "Caesar Salad",         price: 280, rating: 4.5, time: "20–30 min", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=2000", badge: "New" },
  { id: 5, title: "Iced Caramel Latte",   price: 220, rating: 4.4, time: "15–20 min", img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2000", badge: "2 for 1" },
  { id: 6, title: "Chocolate Lava Cake",  price: 260, rating: 4.8, time: "30–35 min", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=2000", badge: "Hot" },
];

export default function Home({ onLogout, openProduct, openProfile }) {
  const handleSearch = (q) => console.log("search:", q);
  const handlePick   = (key) => console.log("category:", key);
  const addToCart    = (item) => console.log("add:", item);
  const details      = (item) => openProduct?.(item.id);

  return (
    <div className="sb-page">
      <CustomerTheme />
      <Topbar onLogout={onLogout} onProfileClick={openProfile} onBrandClick={() => window.history.replaceState({}, '', '/')} />

      <main className="sb-shell">
        <OfferSlider slides={slides} onCta={(s) => console.log("CTA:", s)} />
        <SearchBar onSearch={handleSearch} />
        <CategoryStrip categories={categories} onPick={handlePick} />

        <section style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--sb-accent)' }}>Popular near you</h3>
            <button className="sb-pill">See all</button>
          </div>

          <div className="sb-grid">
            {mockMenu.map((m) => (
              <ProductCard key={m.id} item={m} onAdd={addToCart} onDetails={details} />
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
