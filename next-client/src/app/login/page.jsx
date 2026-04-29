"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";
import { usePlanStore } from "../../lib/store";

export default function Login() {
  const router = useRouter();
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
      router.replace("/");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4 py-8">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-600/40">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          
          <p className="text-center text-sm text-gray-300 mt-4">
            Don't have an account? <Link href="/signup" className="text-emerald-400 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
