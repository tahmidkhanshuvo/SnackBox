import React, { useEffect, useMemo, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient, { post } from "../../api/api.js";

/* ---------- Config & Helpers ---------- */
const DEFAULT_IMAGE = "https://via.placeholder.com/80x80.png?text=No+Image";
const STOCK_REASONS = ["Stock In", "Correction", "Damaged", "Promotion", "Other"];

/* ---------- Icons ---------- */
const Icon = {
  Search: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Next: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Prev: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

/* ---------- UI Atoms (reusable components) ---------- */
function PrimaryBtn({ onClick, disabled=false, children, type="button" }) {
  const style = { padding:"8px 16px", background:"#16a34a", color:"#fff", border:0, borderRadius:999, display:"inline-flex", alignItems:"center", gap:8, fontWeight:900, cursor:"pointer", opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return ( <button type={type} style={style} onClick={onClick} disabled={disabled}>{children}</button> );
}

/* ---------- Page Component ---------- */
export default function StaffInventory() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    fetchItems();
  }, [page, debouncedQ]);

  async function fetchItems() {
    setLoading(true);
    setError("");
    try {
      const params = { per_page: perPage, page, sortBy: 'stock', sortDir: 'asc' };
      if (debouncedQ.trim()) params.q = debouncedQ.trim();
      const { data } = await apiClient.get("/api/menu-items", { params });
      setItems(data?.data ?? []);
      setMeta(data?.meta ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }
  
  return (
    <StaffLayout title="Inventory Management">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ position:"relative", flexGrow:1, maxWidth:300 }}>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search items…" style={{ padding:"8px 32px 8px 30px", width:"100%", borderRadius:10, border:"1px solid #e5e7eb", outline:"none" }} />
          <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", opacity:.65 }}><Icon.Search/></span>
        </div>
      </div>

      <div style={{ border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#fff" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Item", "Category", "Current Stock", ""].map(h=>(<th key={h} style={{ padding:10, textAlign:"left", fontSize:12, color:"#6b7280", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({length:5}).map((_,i)=><Sk key={i}/>)}
              {!loading && items.length === 0 && (<tr><td colSpan={4} style={{ padding:24, textAlign:"center", color:"#64748b" }}>No items found.</td></tr>)}
              {!loading && items.map(item => (
                <tr key={item.id} style={{ borderTop:"1px solid #eef2f7" }}>
                  <td style={{ padding:10, display:"flex", alignItems:"center", gap:12 }}>
                    <img src={item.image_url || DEFAULT_IMAGE} alt={item.name} width={48} height={48} style={{ borderRadius:8, objectFit:"cover" }} />
                    <span style={{ fontWeight:800 }}>{item.name}</span>
                  </td>
                  <td style={{ padding:10, textTransform:"capitalize" }}>{item.category || "—"}</td>
                  <td style={{ padding:10, fontWeight:900, fontSize:18, color: (item.stock < 10 ? '#ef4444' : '#16a34a') }}>
                    {item.stock ?? 0}
                  </td>
                  <td style={{ padding:8, whiteSpace:"nowrap" }}>
                    <PrimaryBtn onClick={() => handleOpenModal(item)}>Adjust Stock</PrimaryBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta && (<div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:12, color:"#6b7280" }}>Page {meta.current_page} of {meta.last_page}</div><div style={{ display:"flex", gap:6 }}><button onClick={()=>setPage(p=>p-1)} disabled={meta.current_page <= 1 || loading} title="Previous" style={{background:'transparent', border:0, cursor:'pointer'}}><Icon.Prev/></button><button onClick={()=>setPage(p=>p+1)} disabled={meta.current_page >= meta.last_page || loading} title="Next" style={{background:'transparent', border:0, cursor:'pointer'}}><Icon.Next/></button></div></div>)}
      {isModalOpen && <AdjustStockModal item={selectedItem} onClose={handleCloseModal} onSave={() => { fetchItems(); handleCloseModal(); }} />}
      {error && <div style={{ marginTop:10, padding:10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius:10 }}>{error}</div>}
    </StaffLayout>
  );
}

/* ---------- Adjust Stock Modal Component ---------- */
function AdjustStockModal({ item, onClose, onSave }) {
  const [deltaQty, setDeltaQty] = useState("");
  const [reason, setReason] = useState(STOCK_REASONS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(deltaQty);
    if (!qty || qty === 0) {
      setFormError("Please enter a non-zero quantity.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      // ✅ FIX: Send the payload in the exact format the backend expects.
      const payload = {
        reason: reason.toLowerCase().replace(" ", "_"),
      };
      
      if (qty > 0) {
        payload.type = 'in';
        payload.quantity = qty;
      } else {
        payload.type = 'out';
        payload.quantity = Math.abs(qty); // Quantity is always positive for 'out' type
      }

      await post(`/api/menu-items/${item.id}/inventory/move`, payload);
      onSave();
    } catch (err) {
      setFormError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontWeight: 700, marginBottom: 4, display: "block", fontSize: 14 };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div style={{ background: "white", padding: 24, borderRadius: 16, width: "100%", maxWidth: 450, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: 0, cursor: "pointer", padding: 4 }}><Icon.X/></button>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Adjust Stock</h3>
        <p style={{ margin:0, marginBottom:20, fontWeight:800, color:"#16a34a" }}>{item.name}</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div><div style={labelStyle}>Current Stock: {item.stock ?? 0}</div></div>
          <div>
            <label style={labelStyle} htmlFor="deltaQty">Quantity to Add / Remove</label>
            <input style={inputStyle} type="number" id="deltaQty" name="deltaQty" value={deltaQty} onChange={(e) => setDeltaQty(e.target.value)} placeholder="e.g., 50 or -10" required />
          </div>
          <div>
            <label style={labelStyle} htmlFor="reason">Reason</label>
            <select style={inputStyle} id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {STOCK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {formError && <div style={{ padding: 10, background:"#fff1f2", border:"1px solid #fecdd3", color:"#9f1239", borderRadius: 10 }}>{formError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <PrimaryBtn type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Adjustment"}</PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- compact skeleton for loading ---------- */
function Sk(){
  return (
    <tr style={{ borderTop:"1px solid #eef2f7" }}>
      {Array.from({length:4}).map((_,i)=>(<td key={i} style={{ padding:10 }}><div style={{ height: i===0 ? 48 : 12, width: '80%', background:"#eef2f7", borderRadius: i===0 ? 8 : 999 }} /></td>))}
    </tr>
  );
}

/* ---------- Debounce Hook for search input ---------- */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}