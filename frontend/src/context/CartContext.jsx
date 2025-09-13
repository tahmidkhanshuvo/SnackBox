import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import apiClient, { ensureCsrf } from "../api/api";

/**
 * Cart line shape (frontend):
 * {
 *   id: string|number,          // menu item id
 *   name: string,
 *   img?: string|null,
 *   price: number,              // unit base price (without options/addons)
 *   qty: number,
 *   selections?: object,        // { groupKey: choiceKey }  (single-choice options)
 *   addons?: object,            // { groupKey: [choiceKey, ...] }  (multi-choice)
 *   notes?: string,
 *   unitDelta?: number,         // optional: (options + addons) extra per unit (computed by Product)
 * }
 *
 * We generate a stable lineId so the SAME config merges quantities.
 */

const CartCtx = createContext(null);
const STORAGE_KEY = "sb.cart.v1";

function serializeConfig(line) {
  const selPairs = Object.entries(line?.selections || {}).sort(([a],[b]) => a.localeCompare(b));
  const addPairs = Object.entries(line?.addons || {})
    .map(([k, arr]) => [k, [...(arr || [])].sort()])
    .sort(([a],[b]) => a.localeCompare(b));
  return JSON.stringify({ s: selPairs, a: addPairs });
}

function makeLineId(line) {
  return `${line.id}::${serializeConfig(line)}`;
}

function clampQty(n) {
  n = Number(n || 0);
  if (!Number.isFinite(n)) n = 1;
  return Math.max(1, Math.min(99, Math.round(n)));
}

function lineUnitTotal(line) {
  const base = Number(line.price || 0);
  const delta = Number(line.unitDelta || 0);
  return base + delta;
}

function computeTotals(lines) {
  const items = lines || [];
  const subtotal = items.reduce((s, l) => s + lineUnitTotal(l) * clampQty(l.qty), 0);
  // keep taxes/fees optional for now
  const taxes = 0;
  const fees = 0;
  const total = subtotal + taxes + fees;
  const count = items.reduce((c, l) => c + clampQty(l.qty), 0);
  return { count, subtotal, taxes, fees, total };
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const firstLoad = useRef(true);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed.map((l) => ({ ...l, qty: clampQty(l.qty) })));
      }
    } catch {}
    firstLoad.current = false;
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (firstLoad.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  // Derived totals
  const totals = useMemo(() => computeTotals(lines), [lines]);

  // Actions
  const addItem = (partial, { merge = true } = {}) => {
    const line = {
      id: partial.id,
      name: partial.name || "Item",
      img: partial.img || null,
      price: Number(partial.price || 0),
      qty: clampQty(partial.qty || 1),
      selections: partial.selections || {},
      addons: partial.addons || {},
      notes: partial.notes || "",
      unitDelta: Number(partial.unitDelta || partial.unitTotal ? Number(partial.unitTotal) - Number(partial.price || 0) : 0),
    };
    const lineId = makeLineId(line);

    setLines((prev) => {
      if (!merge) return [{ ...line, lineId }, ...prev];
      const idx = prev.findIndex((l) => l.lineId === lineId);
      if (idx === -1) return [{ ...line, lineId }, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: clampQty(next[idx].qty + line.qty) };
      return next;
    });
  };

  const updateQty = (lineId, qty) => {
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty: clampQty(qty) } : l)));
  };

  const removeItem = (lineId) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const clear = () => setLines([]);

  /**
   * Place order with backend.
   * Backend routes available: POST /api/orders (then add items, etc.),
   * but we’ll send everything in one go to /api/orders.
   * If your OrderController needs a different shape, send it to me and I’ll adjust.
   */
  const checkout = async ({ order_note = "" } = {}) => {
    // Map cart lines -> backend expectations
    const items = lines.map((l) => ({
      menu_item_id: l.id,
      quantity: clampQty(l.qty),
      unit_price: lineUnitTotal(l),          // base + options/addons
      base_price: Number(l.price || 0),      // optional, useful server-side
      selections: l.selections || {},        // keep full config
      addons: l.addons || {},
      notes: l.notes || "",
    }));

    const payload = {
      items,
      note: order_note,
      // You can add: payment_method, address_id, etc. later
    };

    await ensureCsrf();
    const { data } = await apiClient.post("/api/orders", payload);
    return data;
  };

  const value = {
    lines,
    totals,
    addItem,
    updateQty,
    removeItem,
    clear,
    checkout,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
