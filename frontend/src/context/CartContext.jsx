// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import apiClient, { ensureCsrf } from "../api/api";

/**
 * Cart line (frontend)
 * {
 *   id: string|number, name: string, img?: string|null,
 *   price: number,              // base price per unit (no options/addons)
 *   qty: number,
 *   selections?: object,        // { groupKey: choiceKey }  (single-choice)
 *   addons?: object,            // { groupKey: [choiceKey] } (multi-choice)
 *   notes?: string,
 *   unitDelta?: number,         // (options + addons) extra per unit
 *   // NEW: priced breakdown for displaying amounts in the cart:
 *   pricedSelections?: Array<{ groupKey: string, title?: string, choiceKey: string, label?: string, price?: number }>,
 *   pricedAddons?: Array<{ groupKey: string, title?: string, choiceKey: string, label?: string, price?: number }>,
 * }
 */

const CartCtx = createContext(null);
const STORAGE_KEY = "sb.cart.v1";

/* ---------- utilities ---------- */
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
function sumPriced(arr) {
  return (arr || []).reduce((s, x) => s + Number(x?.price || 0), 0);
}
export function lineUnitTotal(line) {
  const base = Number(line?.price || 0);
  const delta = Number(line?.unitDelta || 0);
  return base + delta;
}
export function lineRowTotal(line) {
  return lineUnitTotal(line) * clampQty(line?.qty);
}
function computeTotals(lines) {
  const items = lines || [];
  const subtotal = items.reduce((s, l) => s + lineRowTotal(l), 0);
  const taxes = 0;
  const fees = 0;
  const total = subtotal + taxes + fees;
  const count = items.reduce((c, l) => c + clampQty(l.qty), 0);
  return { count, subtotal, taxes, fees, total };
}

/* ---------- provider ---------- */
export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const firstLoad = useRef(true);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(parsed.map((l) => ({
            ...l,
            qty: clampQty(l.qty),
          })));
        }
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

  /* ---------- actions ---------- */

  /**
   * addItem(partial, { merge = true })
   * Accepts optional priced breakdown arrays so the Cart page can show amounts.
   */
  const addItem = (partial, { merge = true } = {}) => {
    const pricedSelections = Array.isArray(partial.pricedSelections) ? partial.pricedSelections : [];
    const pricedAddons = Array.isArray(partial.pricedAddons) ? partial.pricedAddons : [];

    // derive delta if not explicitly supplied
    const derivedDelta =
      partial.unitDelta != null
        ? Number(partial.unitDelta)
        : (sumPriced(pricedSelections) + sumPriced(pricedAddons));

    const line = {
      id: partial.id,
      name: partial.name || "Item",
      img: partial.img || null,
      price: Number(partial.price || 0),
      qty: clampQty(partial.qty || 1),
      selections: partial.selections || {},
      addons: partial.addons || {},
      notes: partial.notes || "",
      unitDelta: Number.isFinite(derivedDelta) ? derivedDelta : 0,
      pricedSelections,
      pricedAddons,
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
   * If your controller expects a different payload, tell me and I’ll adjust.
   */
  const checkout = async ({ order_note = "" } = {}) => {
    if (!lines.length) {
      const err = new Error("Your cart is empty.");
      err.code = "CART_EMPTY";
      throw err;
    }

    const items = lines.map((l) => ({
      menu_item_id: l.id,
      quantity: clampQty(l.qty),
      unit_price: lineUnitTotal(l),      // base + options/addons
      base_price: Number(l.price || 0),  // optional for server
      selections: l.selections || {},
      addons: l.addons || {},
      notes: l.notes || "",
    }));

    const payload = { items, note: order_note };

    try {
      await ensureCsrf();
      const { data } = await apiClient.post("/api/orders", payload);
      return data;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        const err = new Error("Please sign in to place your order.");
        err.code = "UNAUTHENTICATED";
        throw err;
      }
      throw e;
    }
  };

  const value = {
    lines,
    totals,
    addItem,
    updateQty,
    removeItem,
    clear,
    checkout,
    // helpers (handy in Cart UI)
    lineUnitTotal,
    lineRowTotal,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
