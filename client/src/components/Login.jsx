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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4 hp-auth-bg">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">HomePlanner AI</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Use your email and password to continue</p>
        </div>

        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hp-hover-lift w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-900 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            No account?{" "}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
