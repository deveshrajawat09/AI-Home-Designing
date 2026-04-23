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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4 py-8">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-600/40 transition-all">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-xl font-bold text-white">📐</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">HomePlanner AI</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to continue to your designs</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                📧 Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-800 sm:text-sm font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                🔑 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-800 sm:text-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm px-4 py-3 text-center font-medium animate-error-pulse">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-md"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Sign in</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors underline underline-offset-2">
              Create one now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
