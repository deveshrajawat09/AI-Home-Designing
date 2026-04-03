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

function PlannerView() {
  const navigate = useNavigate();
  const { plan, setPlan, loading, setLoading, error, setError, saved, setSaved, user, token, logout } = usePlanStore();
  const [land, setLand] = useState(defaultLand);
  const [editable, setEditable] = useState(false);
  const [show3d, setShow3d] = useState(false);
  const [dark, setDark] = useState(false);
  const [saveName, setSaveName] = useState("My Layout");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (user && token) {
      listPlans().then(setSaved).catch(() => {});
    }
  }, [setSaved, user, token]);

  const area = useMemo(() => land.length * land.width, [land]);
  const cost = area * 1000;

  const handleGenerate = async (landInput = land) => {
    setLoading(true);
    setError(null);
    try {
      const points = landInput.shape === "irregular" ? parsePoints(landInput.pointsText) : [];
      const generated = await generatePlan({
        length: Number(landInput.length),
        width: Number(landInput.width),
        shape: landInput.shape,
        points
      });
      setPlan(generated);
    } catch (e) {
      setError(e.message || "Failed");
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
    if (!plan) return;
    const record = await savePlan({ name: saveName || "Untitled", plan, land });
    const fresh = await listPlans();
    setSaved(fresh);
    setSaveName(record.name);
  };

  const handleLoad = async (rec) => {
    setPlan(rec.plan);
    setLand(rec.land || land);
  };

  const handleDelete = async (id) => {
    await deletePlan(id);
    setSaved(await listPlans());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-gray-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),transparent_55%)]" />

      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/40">
              <span className="text-xs font-semibold tracking-tight">HP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">HomePlanner AI</h1>
              <p className="text-[11px] text-slate-400">Interactive floor & 3D layout studio</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 ml-6 text-xs rounded-full border border-white/10 bg-slate-900/60 px-1 py-1">
            <span className="px-3 py-1 rounded-full bg-indigo-500 text-white shadow-sm shadow-indigo-500/40">Design</span>
            <span className="px-3 py-1 rounded-full text-slate-400 hover:text-slate-100 cursor-default">Saved plans</span>
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs md:text-sm">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-slate-200 font-medium">{user?.email}</span>
              <span className="text-[11px] text-slate-400">Signed in</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center text-[11px] font-semibold text-slate-900 shadow-md shadow-emerald-400/40">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-medium hover:bg-rose-400 shadow-sm shadow-rose-500/40"
            >
              Logout
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <span>Dark</span>
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

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-10 pt-4 space-y-6">
        <section className="grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-4 md:gap-6 items-start">
          <div className="md:col-span-1 rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl shadow-black/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-indigo-500/15 via-transparent to-emerald-500/10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Canvas</p>
                <p className="text-sm text-slate-100">Draw & preview your layout</p>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-200">
                  {editable ? "Edit mode" : "Locked"}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-200">
                  {show3d ? "3D on" : "2D view"}
                </span>
              </div>
            </div>
            <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-0 lg:gap-4 p-3 lg:p-4">
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
                <CanvasView plan={plan} editable={editable} land={land} />
              </div>
              <div className="mt-3 lg:mt-0 rounded-xl bg-slate-900/60 border border-slate-800/80 min-h-[180px] flex items-center justify-center">
                <ThreePreview plan={plan} visible={show3d} />
              </div>
            </div>
          </div>

          <aside className="space-y-4 md:space-y-5">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-black/40">
              <h3 className="font-semibold mb-1 text-slate-50 flex items-center justify-between">
                Measurements
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Plot {land.length}m × {land.width}m
                </span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Define your land size and shape. Use irregular mode for custom plots.
              </p>
              <div className="space-y-3 text-sm">
                <label className="flex flex-col">
                  Length (m)
                  <input
                    type="number"
                    min="5"
                    className="mt-1 rounded border px-2 py-1 bg-white dark:bg-gray-900"
                    value={land.length}
                    onChange={(e) => setLand({ ...land, length: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col">
                  Width (m)
                  <input
                    type="number"
                    min="5"
                    className="mt-1 rounded border px-2 py-1 bg-white dark:bg-gray-900"
                    value={land.width}
                    onChange={(e) => setLand({ ...land, width: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col">
                  Shape
                  <select
                    className="mt-1 rounded border px-2 py-1 bg-white dark:bg-gray-900"
                    value={land.shape}
                    onChange={(e) => setLand({ ...land, shape: e.target.value })}
                  >
                    <option>rectangle</option>
                    <option>L-shape</option>
                    <option>irregular</option>
                  </select>
                </label>
                {land.shape === "irregular" && (
                  <label className="flex flex-col text-xs gap-1">
                    Polygon points (x,y;...)
                    <textarea
                      className="rounded border px-2 py-1 bg-white dark:bg-gray-900"
                      placeholder="0,0;10,0;10,15;0,15"
                      value={land.pointsText}
                      onChange={(e) => setLand({ ...land, pointsText: e.target.value })}
                    />
                    <span className="text-gray-500">Meters, separated by semicolons.</span>
                  </label>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 shadow-md shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    {loading ? "Generating…" : "Generate plan"}
                  </button>
                  <button
                    onClick={loadSample}
                    className="inline-flex items-center justify-center py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-100 text-sm hover:bg-slate-800"
                  >
                    Use sample 10×15
                  </button>
                </div>
                {error && <p className="text-rose-400 text-xs mt-1">Error: {error}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <h3 className="font-semibold mb-2 text-slate-50">Edit & view</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editable} onChange={() => setEditable((v) => !v)} />
                  Edit mode (drag/resize)
                </label>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={show3d} onChange={() => setShow3d((v) => !v)} />
                  3D preview (lazy load)
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
              <h3 className="font-semibold text-slate-50">Save & load</h3>
              <div className="flex gap-2 text-sm">
                <input
                  className="flex-1 rounded-xl border border-slate-700 px-3 py-2 bg-slate-900/80 text-sm"
                  placeholder="Plan name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  disabled={!plan}
                  className="px-3 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-auto text-sm">
                {saved.length === 0 && <p className="text-slate-400 text-xs">No saved layouts yet.</p>}
                {saved.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2 border border-slate-800">
                    <button
                      className="flex-1 text-left underline"
                      onClick={() => handleLoad(rec)}
                    >
                      {rec.name}
                    </button>
                    <button
                      className="text-xs text-red-500"
                      onClick={() => handleDelete(rec.id)}
                    >
                      delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-slate-950 to-slate-950 p-4">
              <h3 className="font-semibold mb-1 text-emerald-200">Cost estimate</h3>
              <p className="text-xs text-emerald-200/80 mb-1">Quick rough build budget</p>
              <p className="text-sm text-slate-200">Area: {area} m²</p>
              <p className="text-2xl font-semibold text-emerald-300 mt-1">
                ~ ${cost.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-100/80 mt-1">Assuming $1000 per m² • For reference only</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const { user, setUser, setToken } = usePlanStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const payload = decodeJwtPayload(storedToken);
      if (payload?.email) {
        setUser({ id: payload.id, email: payload.email });
      }
    }
    setHydrated(true);
  }, [setToken, setUser]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading…</p>
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
