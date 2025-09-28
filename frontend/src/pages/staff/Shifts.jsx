import React, { useEffect, useMemo, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient, { getMe } from "../../api/api";

/* ---------- config ---------- */
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHIFT_STATUSES = {
  assigned: { label: "Assigned", bg: "var(--sb-green-100)", fg: "var(--sb-green-600)", br: "#bbf7d0" },
  accepted: { label: "Accepted", bg: "#dcfce7", fg: "#065f46", br: "#bbf7d0" },
  requested_change: { label: "Change Requested", bg: "#ffedd5", fg: "#9a3412", br: "#fed7aa" },
  cancelled: { label: "Cancelled", bg: "#ffe4e6", fg: "#9f1239", br: "#fecdd3" },
  late: { label: "Late", bg: "#fef3c7", fg: "#92400e", br: "#fde68a" },
  absent: { label: "Absent", bg: "#fecdd3", fg: "#881337", br: "#fda4af" }
};

/* ---------- icons ---------- */
const Icon = {
  Check: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="20 6 9 17 4 12" /></svg>,
  X: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" /></svg>,
  Clock: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Calendar: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
};

/* ---------- utility functions ---------- */
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getWeekDates = (startDate) => {
  const dates = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay());
  for (let i = 0; i < 7; i++) {
    const date = new Date(current);
    dates.push(date);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/* ---------- small UI bits ---------- */
function IconBtn({ kind = "ghost", title, ariaLabel, onClick, disabled = false, children }) {
  const base = {
    width: 34, height: 34, minWidth: 34,
    borderRadius: 999, display: "grid", placeItems: "center",
    border: "1px solid transparent", cursor: "pointer", transition: "transform .12s ease",
  };
  const map = {
    primary: { ...base, background: "var(--sb-green-500)", borderColor: "var(--sb-green-500)", color: "#fff", boxShadow: "0 4px 12px -6px rgba(34,197,94,.7)" },
    danger: { ...base, background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" },
    outline: { ...base, background: "var(--sb-surface)", borderColor: "var(--sb-border)", color: "var(--sb-green-600)" },
    ghost: { ...base, background: "var(--sb-surface)", borderColor: "var(--sb-border)", color: "#0f172a" },
  };
  const style = { ...map[kind], opacity: disabled ? .55 : 1, pointerEvents: disabled ? "none" : "auto" };
  return (
    <button
      style={style}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const st = SHIFT_STATUSES[status] || SHIFT_STATUSES.assigned;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: st.bg, color: st.fg, border: `1px solid ${st.br}`,
      fontWeight: 900, fontSize: 12, textTransform: "capitalize", whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: st.fg, opacity: .5 }} />
      {st.label}
    </span>
  );
}

/* ---------- main component ---------- */
export default function StaffShifts() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [shiftTemplates, setShiftTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null); // will hold the whole shift object

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  useEffect(() => {
    fetchShiftData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  async function fetchShiftData() {
    setLoading(true);
    setError("");
    try {
      // Shift templates (paginate shape supported)
      const templatesResponse = await apiClient.get("/api/shifts");
      const incomingTemplates = Array.isArray(templatesResponse.data)
        ? templatesResponse.data
        : (templatesResponse.data?.data || []);
      setShiftTemplates(incomingTemplates);

      // Current user (via correct endpoint)
      const userData = await getMe();
      if (!userData) throw new Error("Unauthenticated.");
      const staffId = userData.staff?.id || userData.id;

      // Assignments for the week
      const weekStart = weekDates[0].toISOString().split("T")[0];
      const assignmentsResponse = await apiClient.get(`/api/staff/${staffId}/shifts`, {
        params: { week: weekStart }
      });
      const raw = Array.isArray(assignmentsResponse.data)
        ? assignmentsResponse.data
        : (assignmentsResponse.data?.data || []);

      // Normalize data we render
      const transformed = raw.map((s) => {
        let dateStr;
        if (typeof s.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(s.date)) {
          // keep as returned to avoid TZ shifts
          dateStr = s.date;
        } else if (s.date instanceof Date) {
          dateStr = s.date.toISOString().split("T")[0];
        } else {
          // graceful fallback (shouldn't happen)
          dateStr = new Date().toISOString().split("T")[0];
        }
        return {
          id: s.id,
          date: dateStr,
          shift_id: s.shift_id,
          shift_name: s.shift?.name || s.shift_name || "Unnamed Shift",
          start_time: s.shift?.starts_at || s.start_time || "00:00:00",
          end_time: s.shift?.ends_at || s.end_time || "00:00:00",
          status: s.status || "assigned",
        };
      });

      setShifts(transformed);
    } catch (e) {
      console.error("Failed to load shift data:", e);
      setError(`Failed to load shift data: ${e?.response?.data?.message || e.message}`);
      setShifts(generateSampleShifts(weekDates, shiftTemplates));
    } finally {
      setLoading(false);
    }
  }

  /* Attendance actions now operate on StaffShift ID only (no date/staff_id payload) */
  async function acceptShift(staffShiftId) {
    try {
      await apiClient.patch(`/api/shifts/${staffShiftId}/accept`, {});
      fetchShiftData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to accept shift.");
    }
  }

  async function requestShiftChange(staffShiftId, reason) {
    try {
      await apiClient.patch(`/api/shifts/${staffShiftId}/request-change`, { reason });
      setShowRequestModal(false);
      setSelectedShift(null);
      fetchShiftData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to request change.");
    }
  }

  async function markLate(staffShiftId) {
    try {
      await apiClient.patch(`/api/shifts/${staffShiftId}/mark-late`, {});
      fetchShiftData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to mark shift as late.");
    }
  }

  async function markAbsent(staffShiftId) {
    try {
      await apiClient.patch(`/api/shifts/${staffShiftId}/mark-absent`, {});
      fetchShiftData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to mark shift as absent.");
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const shiftsByDate = useMemo(() => {
    const grouped = {};
    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split("T")[0];
      grouped[dateStr] = shifts.filter((s) => s.date === dateStr);
    });
    return grouped;
  }, [shifts, weekDates]);

  return (
    <StaffLayout title="My Shifts">
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h2 className="stf-title">My Shift Schedule</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
          <IconBtn kind="outline" onClick={() => navigateWeek(-1)} title="Previous Week" ariaLabel="Previous Week">
            <Icon.Calendar />
          </IconBtn>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--sb-muted)" }}>
            {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <IconBtn kind="outline" onClick={() => navigateWeek(1)} title="Next Week" ariaLabel="Next Week">
            <Icon.Calendar />
          </IconBtn>
          <IconBtn kind="outline" onClick={fetchShiftData} title="Refresh" ariaLabel="Refresh Data">
            <Icon.Refresh />
          </IconBtn>
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ height: 20, width: 20, border: "3px solid var(--sb-green-600)", borderTop: "3px solid transparent", borderRadius: 999, animation: "spin 1s linear infinite" }} />
        </div>
      )}
      {error && (
        <div style={{ marginTop: 10, padding: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span><strong>Note:</strong> {error}</span>
          <IconBtn kind="danger" onClick={fetchShiftData} title="Retry" ariaLabel="Retry Loading Data">
            <Icon.Refresh />
          </IconBtn>
        </div>
      )}

      {/* Weekly Calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
        {weekDates.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const dayShifts = shiftsByDate[dateStr] || [];
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={index}
              style={{
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${isToday ? "var(--sb-green-100)" : "var(--sb-border)"}`,
                background: isToday ? "var(--sb-green-100)" : "var(--sb-surface)",
                transition: "all .2s ease"
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sb-muted)" }}>{DAYS_OF_WEEK[date.getDay()]}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isToday ? "var(--sb-green-600)" : "#0f172a" }}>
                  {date.getDate()}
                </div>
              </div>

              {dayShifts.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--sb-muted)", fontSize: 12, padding: 10 }}>
                  No shifts scheduled
                </div>
              ) : (
                dayShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onAccept={() => acceptShift(shift.id)}
                    onRequestChange={() => {
                      setSelectedShift(shift); // keep whole shift
                      setShowRequestModal(true);
                    }}
                    onMarkLate={() => markLate(shift.id)}
                    onMarkAbsent={() => markAbsent(shift.id)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Request Change Modal */}
      {showRequestModal && selectedShift && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} role="dialog" aria-labelledby="modal-title">
          <div style={{ background: "var(--sb-surface)", borderRadius: 12, padding: 20, width: 400, boxShadow: "var(--sb-shadow)" }}>
            <h3 id="modal-title" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Request Shift Change</h3>
            <p style={{ color: "var(--sb-muted)", marginBottom: 10 }}>
              Requesting change for <strong>{selectedShift.shift_name}</strong> on <strong>{selectedShift.date}</strong>
            </p>

            <textarea
              placeholder="Reason for change request..."
              style={{ width: "100%", padding: 10, border: "1px solid var(--sb-border)", borderRadius: 8, marginBottom: 10, fontSize: 14, outline: "none" }}
              rows={4}
              id="changeRequest"
              aria-label="Reason for change"
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <IconBtn kind="outline" onClick={() => setShowRequestModal(false)} title="Cancel" ariaLabel="Cancel Change Request">
                <Icon.X />
              </IconBtn>
              <IconBtn
                kind="primary"
                onClick={() => {
                  const reason = document.getElementById("changeRequest").value.trim();
                  if (reason) {
                    requestShiftChange(selectedShift.id, reason);
                  } else {
                    alert("Please provide a reason for the change request.");
                  }
                }}
                title="Request Change"
                ariaLabel="Submit Change Request"
              >
                <Icon.Check />
              </IconBtn>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

function ShiftCard({ shift, onAccept, onRequestChange, onMarkLate, onMarkAbsent }) {
  const status = SHIFT_STATUSES[shift.status] || SHIFT_STATUSES.assigned;

  return (
    <div
      style={{
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        border: "1px solid var(--sb-border)",
        background: "var(--sb-surface)",
        transition: "all .2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <StatusPill status={shift.status} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sb-muted)" }}>
          <Icon.Clock style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 12 }}>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
        {shift.shift_name}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {shift.status === "assigned" && (
          <>
            <IconBtn kind="primary" onClick={onAccept} title="Accept Shift" ariaLabel="Accept Shift">
              <Icon.Check />
            </IconBtn>
            <IconBtn kind="outline" onClick={onRequestChange} title="Request Change" ariaLabel="Request Change">
              <Icon.Refresh />
            </IconBtn>
          </>
        )}
        {shift.status === "accepted" && (
          <>
            <IconBtn kind="outline" onClick={onMarkLate} title="Mark Late" ariaLabel="Mark Late">
              <Icon.Clock />
            </IconBtn>
            <IconBtn kind="danger" onClick={onMarkAbsent} title="Mark Absent" ariaLabel="Mark Absent">
              <Icon.X />
            </IconBtn>
          </>
        )}
        {shift.status === "requested_change" && (
          <span style={{ fontSize: 12, color: "#9a3412", fontWeight: 700 }}>Change requested</span>
        )}
        {shift.status === "late" && (
          <span style={{ fontSize: 12, color: "#92400e", fontWeight: 700 }}>Late</span>
        )}
        {shift.status === "absent" && (
          <span style={{ fontSize: 12, color: "#881337", fontWeight: 700 }}>Absent</span>
        )}
      </div>
    </div>
  );
}

// Sample data generator (fallback only)
function generateSampleShifts(weekDates, templates) {
  if (!Array.isArray(templates) || templates.length === 0) return [];
  return weekDates
    .map((date, index) => ({
      id: index + 1,
      date: date.toISOString().split("T")[0],
      shift_id: templates[index % templates.length].id,
      shift_name: templates[index % templates.length].name,
      start_time: templates[index % templates.length].starts_at,
      end_time: templates[index % templates.length].ends_at,
      status:
        index % 5 === 0
          ? "assigned"
          : index % 5 === 1
          ? "accepted"
          : index % 5 === 2
          ? "requested_change"
          : index % 5 === 3
          ? "late"
          : "absent",
    }))
    .filter((_, index) => index % 2 === 0);
}
