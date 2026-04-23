import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { generatePlan, listPlans, savePlan, deletePlan } from "./api";
import { usePlanStore } from "./store";
import { decodeJwtPayload } from "./authUtils";
import CanvasView from "./components/CanvasView";
import ThreePreview from "./components/ThreePreview";
import Login from "./components/Login";
import Signup from "./components/Signup";

const defaultLand = { length: 10, width: 15, shape: "rectangle", pointsText: "" };

const parsePoints = (text) =>
  text
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
      return null;
    })
    .filter(Boolean);

// ── Toast Notification Component ──────────────────────────────
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = {
    info: "bg-indigo-500/90",
    success: "bg-emerald-500/90",
    warning: "bg-amber-500/90",
    error: "bg-rose-500/90",
  };
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl backdrop-blur animate-slide-up ${colors[type]}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// ── Stats Badge ───────────────────────────────────────────────
function StatBadge({ label, value }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-slate-800/60 border border-white/5">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function PlannerView() {
  const navigate = useNavigate();
  const { plan, setPlan, loading, setLoading, error, setError, saved, setSaved, user, token, logout } =
    usePlanStore();
  const [land, setLand] = useState(defaultLand);
  const [editable, setEditable] = useState(false);
  const [show3d, setShow3d] = useState(false);
  const [dark, setDark] = useState(false);
  const [saveName, setSaveName] = useState("My Layout");
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("design"); // 'design' | 'saved'

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (user && token) {
      listPlans().then(setSaved).catch(() => setSaved([]));
    }
  }, [setSaved, user, token]);

  const showToast = (message, type = "info") => setToast({ message, type });

  const area = useMemo(() => land.length * land.width, [land]);
  const cost = area * 1000;

  const handleGenerate = async (landInput = land) => {
    setLoading(true);
    setError(null);
    try {
      const points = landInput.shape === "irregular" ? parsePoints(landInput.pointsText) : [];
      const result = await generatePlan({
        length: Number(landInput.length),
        width: Number(landInput.width),
        shape: landInput.shape,
        points,
      });
      setPlan(result.plan);
      if (result.warning) showToast(result.warning, "warning");
      else showToast("Floor plan generated!", "success");
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Generation failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const preset = { length: 10, width: 15, shape: "rectangle", pointsText: "" };
    setLand(preset);
    setPlan(null);
    handleGenerate(preset);
  };

  const handleSave = async () => {
    if (!plan) return showToast("Generate a plan first!", "warning");
    try {
      await savePlan({ name: saveName || "Untitled", plan, land });
      const fresh = await listPlans();
      setSaved(fresh);
      showToast(`"${saveName}" saved successfully!`, "success");
    } catch (e) {
      showToast(e.response?.data?.error || "Save failed", "error");
    }
  };

  const handleLoad = (rec) => {
    setPlan(rec.plan);
    setLand(rec.land || land);
    setActiveTab("design");
    showToast(`Loaded: "${rec.name}"`, "info");
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deletePlan(id);
      setSaved(await listPlans());
      showToast("Plan deleted.", "info");
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-gray-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),transparent_55%)]" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/40">
              <span className="text-xs font-bold tracking-tight">HP</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">HomePlanner AI</h1>
              <p className="text-[10px] text-slate-400">Interactive floor & 3D layout studio</p>
            </div>
          </div>

          {/* ── Nav Tabs ── */}
          <div className="hidden md:flex items-center gap-1 ml-6 text-xs rounded-full border border-white/10 bg-slate-900/60 px-1 py-1">
            {["design", "saved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full capitalize font-medium transition-all ${
                  activeTab === tab
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/40"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {tab === "saved" ? `Saved (${saved.length})` : tab}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs md:text-sm">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-slate-200 font-medium">{user?.email}</span>
              <span className="text-[10px] text-emerald-400">● Online</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-md shadow-emerald-400/40">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 hover:border-rose-500/80 text-rose-300 hover:text-rose-100 text-xs font-medium transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-rose-500/50"
            >
              Logout
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <span>{dark ? "🌙" : "☀️"}</span>
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-700">
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    dark ? "translate-x-4" : "translate-x-1"
                  }`}
                />
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark((d) => !d)}
                />
              </div>
            </label>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-10 pt-5 space-y-6">

        {/* ── Design Tab ── */}
        {activeTab === "design" && (
          <section className="grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] gap-5 items-start">
            {/* Canvas Area */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-indigo-500/15 via-transparent to-emerald-500/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Canvas</p>
                  <p className="text-sm text-slate-100">Draw & preview your layout</p>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${editable ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "bg-slate-900/80 border-white/10 text-slate-400"}`}>
                    {editable ? "✏️ Edit mode" : "🔒 Locked"}
                  </span>
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${show3d ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" : "bg-slate-900/80 border-white/10 text-slate-400"}`}>
                    {show3d ? "3D on" : "2D view"}
                  </span>
                </div>
              </div>
              <div className={`grid gap-0 p-3 ${show3d ? "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-4 lg:p-4" : ""}`}>
                <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
                  <CanvasView plan={plan} editable={editable} land={land} />
                </div>
                {show3d && (
                  <div className="mt-3 lg:mt-0 rounded-xl bg-slate-900/60 border border-slate-800/80 min-h-[180px] flex items-center justify-center">
                    <ThreePreview plan={plan} visible={show3d} />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {/* Stats Row */}
              {plan && (
                <div className="grid grid-cols-3 gap-2">
                  <StatBadge label="Rooms" value={plan.rooms?.length || 0} />
                  <StatBadge label="Area m²" value={area} />
                  <StatBadge label="Saved" value={saved.length} />
                </div>
              )}

              {/* Measurements */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-black/40">
                <h3 className="font-semibold mb-1 text-slate-50 flex items-center justify-between">
                  <span>🏗️ Measurements</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {land.length}m × {land.width}m
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mb-3">Define your land size and shape.</p>
                <div className="space-y-3 text-sm">
                  <label className="flex flex-col gap-1">
                    <span className="text-slate-300 text-xs font-medium">Length (m)</span>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      value={land.length}
                      onChange={(e) => setLand({ ...land, length: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-slate-300 text-xs font-medium">Width (m)</span>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      value={land.width}
                      onChange={(e) => setLand({ ...land, width: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-slate-300 text-xs font-medium">Shape</span>
                    <select
                      className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={land.shape}
                      onChange={(e) => setLand({ ...land, shape: e.target.value })}
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="L-shape">L-Shape</option>
                      <option value="irregular">Irregular</option>
                    </select>
                  </label>
                  {land.shape === "irregular" && (
                    <label className="flex flex-col gap-1">
                      <span className="text-slate-300 text-xs font-medium">Polygon points (x,y;...)</span>
                      <textarea
                        className="rounded-lg border border-slate-700 px-3 py-2 bg-slate-900/80 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={3}
                        placeholder="0,0;10,0;10,15;0,15"
                        value={land.pointsText}
                        onChange={(e) => setLand({ ...land, pointsText: e.target.value })}
                      />
                      <span className="text-slate-500 text-[10px]">Meters, separated by semicolons.</span>
                    </label>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleGenerate()}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 focus:ring-2 focus:ring-indigo-400"
                      disabled={loading}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${loading ? "bg-yellow-300 animate-ping" : "bg-emerald-300 animate-pulse"}`} />
                      {loading ? "Generating…" : "Generate"}
                    </button>
                    <button
                      onClick={loadSample}
                      disabled={loading}
                      className="inline-flex items-center justify-center py-2.5 rounded-xl border-2 border-slate-600 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-slate-100 text-sm font-semibold hover:text-white shadow-md hover:shadow-lg disabled:opacity-60 transition-all active:scale-95 focus:ring-2 focus:ring-slate-400"
                      disabled={loading}
                    >
                      Sample 10×15
                    </button>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-2">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit & View */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
                <h3 className="font-semibold text-slate-50">⚙️ Options</h3>
                {[
                  { label: "Edit mode (drag/resize)", state: editable, toggle: () => setEditable((v) => !v) },
                  { label: "3D preview", state: show3d, toggle: () => setShow3d((v) => !v) },
                ].map(({ label, state, toggle }) => (
                  <label key={label} className="flex items-center justify-between cursor-pointer text-sm text-slate-300 hover:text-slate-100 transition-colors">
                    <span>{label}</span>
                    <div
                      onClick={toggle}
                      className={`relative w-10 h-5 rounded-full transition-colors ${state ? "bg-indigo-500" : "bg-slate-700"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${state ? "translate-x-5" : ""}`} />
                    </div>
                  </label>
                ))}
              </div>

              {/* Save */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
                <h3 className="font-semibold text-slate-50">💾 Save Plan</h3>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border-2 border-slate-600 px-3 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-slate-500"
                    placeholder="Plan name…"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <button
                    onClick={handleSave}
                    disabled={!plan}
                    className="px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-emerald-400"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-4">
                <h3 className="font-semibold mb-1 text-emerald-200 flex items-center gap-2">
                  <span>💰 Cost Estimate</span>
                </h3>
                <p className="text-xs text-emerald-200/60 mb-2">Quick rough build budget</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Area: <span className="text-slate-200">{area} m²</span></p>
                    <p className="text-2xl font-bold text-emerald-300 mt-1">~${cost.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] text-emerald-100/50 text-right">$1,000/m²<br/>Reference only</span>
                </div>
              </div>
            </aside>
          </section>
        )}

        {/* ── Saved Plans Tab ── */}
        {activeTab === "saved" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Saved Plans</h2>
              <span className="text-sm text-slate-400">{saved.length} plan{saved.length !== 1 ? "s" : ""}</span>
            </div>
            {saved.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-12 text-center">
                <p className="text-4xl mb-3">🏠</p>
                <p className="text-slate-300 font-medium">No saved plans yet</p>
                <p className="text-slate-500 text-sm mt-1">Generate and save a floor plan to see it here.</p>
                <button onClick={() => setActiveTab("design")} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-indigo-400">
                  🚀 Start Designing
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.map((rec) => (
                  <div key={rec.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{rec.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {rec.land ? `${rec.land.length}m × ${rec.land.width}m` : "Unknown size"}
                          {" · "}
                          {rec.plan?.rooms?.length || 0} rooms
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rec.savedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Mini room preview */}
                    <div className="flex flex-wrap gap-1 mb-3 min-h-[28px]">
                      {rec.plan?.legend?.slice(0, 5).map((l) => (
                        <span key={l.label} className="flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800/60 rounded-full px-2 py-0.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />
                          {l.label}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(rec)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border-2 border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-indigo-100 text-xs font-semibold hover:from-indigo-500/40 hover:to-indigo-600/40 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-indigo-400"
                      >
                        📁 Load
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id, rec.name)}
                        className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 border-2 border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-200 text-xs font-semibold transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-rose-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default function App() {
  const { user, setUser, setToken } = usePlanStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        setToken(storedToken);
        const payload = decodeJwtPayload(storedToken);
        // Check if token is expired
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
        } else if (payload?.email) {
          setUser({ id: payload.id, email: payload.email });
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
    setHydrated(true);
  }, [setToken, setUser]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-sm font-bold">HP</span>
          </div>
          <p className="text-slate-400 text-sm">Loading HomePlanner AI…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={user ? <PlannerView /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
