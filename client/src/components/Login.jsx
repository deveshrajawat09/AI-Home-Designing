import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import { usePlanStore } from "../store";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = usePlanStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setToken(data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hp-auth-bg px-4 py-12">
      {/* Background decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md hp-fade-in">
        {/* Card */}
        <div className="hp-glass rounded-2xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                <polyline points="9 21 9 12 15 12 15 21"/>
              </svg>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-indigo-500 mb-1">HomePlanner AI</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="hp-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="hp-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 text-center hp-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="hp-hover-lift w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-55 shadow-lg shadow-indigo-500/25 transition-all mt-2"
            >
              {loading ? (
                <><span className="hp-spinner" /> Signing in…</>
              ) : "Sign in →"}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
              No account?{" "}
              <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Create one free
              </Link>
            </p>
          </form>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-5">
          Secure login · Your designs stay private
        </p>
      </div>
    </div>
  );
}
