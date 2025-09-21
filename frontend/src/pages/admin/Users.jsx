// src/pages/admin/Users.jsx
import React, { useEffect, useMemo, useState } from "react";
// If your AdminLayout lives at src/components/UI/AdminLayout.jsx, keep this import.
// If it's elsewhere, adjust the path only here.
import AdminLayout from "../../components/AdminLayout";
import apiClient from "../../api/api";

// Small helper to handle Laravel paginator or plain arrays
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

export default function Users() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [q, setQ] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/api/admin/pending-users", {
        withCredentials: true,
      });
      setPendingUsers(normalizeList(data));
    } catch (err) {
      setError("Failed to load pending users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return pendingUsers;
    return pendingUsers.filter((u) =>
      [u.name, u.email, u.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [pendingUsers, q]);

  const approveUser = async (userId) => {
    setError("");
    setBanner("");
    setApprovingId(userId);
    // optimistic UI
    const prev = pendingUsers;
    setPendingUsers((list) => list.filter((u) => u.id !== userId));
    try {
      await apiClient.post(`/api/admin/approve-user/${userId}`, null, {
        withCredentials: true,
      });
      setBanner("User approved successfully.");
      setTimeout(() => setBanner(""), 2200);
    } catch (err) {
      // rollback if failed
      setPendingUsers(prev);
      setError("Approval failed. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const approveAll = async () => {
    if (pendingUsers.length === 0) return;
    const ids = pendingUsers.map((u) => u.id);
    setApprovingId(-1);
    try {
      // Optional batch endpoint; if you don't have one, fall back individually
      await Promise.all(
        ids.map((id) =>
          apiClient.post(`/api/admin/approve-user/${id}`, null, {
            withCredentials: true,
          })
        )
      );
      setPendingUsers([]);
      setBanner("All pending users approved.");
      setTimeout(() => setBanner(""), 2200);
    } catch {
      setError("Batch approval failed. Try approving individually.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <AdminLayout title="Users">
      <main className="relative">
        {/* Soft gradient background (Aceternity vibe) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <section className="mb-6 flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Pending Staff Approvals
          </h2>
          <p className="text-sm text-neutral-300">
            Staff cannot log in until an admin approves their account.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, or role…"
                className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-3 pl-10 text-sm text-white outline-none ring-cyan-400/40 transition focus:ring-2"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.1-4.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                />
              </svg>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchPending}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/10"
                disabled={loading}
              >
                Refresh
              </button>
              <button
                onClick={approveAll}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60"
                disabled={loading || approvingId !== null || pendingUsers.length === 0}
              >
                {approvingId === -1 ? "Approving…" : "Approve All"}
              </button>
            </div>
          </div>
        </section>

        {banner && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {banner}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 w-2/5 animate-pulse rounded-xl bg-white/10" />
              <div className="h-16 w-full animate-pulse rounded-xl bg-white/10" />
              <div className="h-16 w-full animate-pulse rounded-xl bg-white/10" />
              <div className="h-16 w-full animate-pulse rounded-xl bg-white/10" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-white/10">
              {filtered.map((u) => (
                <li
                  key={u.id}
                  className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-5">
                    <div className="font-medium text-white">{u.name}</div>
                    <div className="text-sm text-neutral-300">{u.email}</div>
                  </div>

                  <div className="sm:col-span-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
                      <svg
                        className="h-4 w-4 opacity-70"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 1.79-8 4v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.21-3.582-4-8-4z"
                        />
                      </svg>
                      {u.role || "staff"}
                    </span>
                  </div>

                  <div className="sm:col-span-2 text-sm text-neutral-400">
                    {u.created_at ? (
                      <time dateTime={u.created_at}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </time>
                    ) : (
                      <span className="opacity-60">—</span>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex justify-start sm:justify-end">
                    <button
                      onClick={() => approveUser(u.id)}
                      disabled={approvingId === u.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60"
                    >
                      {approvingId === u.id ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M6.757 8.757 4.636 6.636m0 10.728 2.121-2.121M17.657 6.343l-2.121 2.121"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <svg
        className="h-12 w-12 text-neutral-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-11a4 4 0 10-8 0 4 4 0 008 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-white">No pending users</h3>
      <p className="max-w-md text-sm text-neutral-400">
        New staff accounts will appear here awaiting admin approval.
      </p>
    </div>
  );
}
