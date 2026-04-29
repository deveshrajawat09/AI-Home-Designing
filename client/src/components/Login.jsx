import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import { usePlanStore } from "../store";

export default function Login() {
    const navigate = useNavigate();
    const { setUser, setToken } = usePlanStore();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* =======================================
       HANDLE INPUT
    ======================================= */
    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
    };

    /* =======================================
       SUBMIT LOGIN
    ======================================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.email.trim()) {
            return setError("Email is required");
        }

        if (!form.password.trim()) {
            return setError("Password is required");
        }

        try {
            setLoading(true);

            const data = await login(form.email, form.password);

            if (remember) {
                localStorage.setItem("token", data.token);
            } else {
                sessionStorage.setItem("token", data.token);
            }

            setUser(data.user);
            setToken(data.token);

            setSuccess("Login successful 🚀");

            setTimeout(() => {
                navigate("/", { replace: true });
            }, 1000);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.error ||
                err?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,.18),transparent_35%),linear-gradient(135deg,#020617,#0f172a,#111827)]">

            <div className="w-full max-w-md card-glass p-8 md:p-10 shadow-premium">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl shadow-xl floaty">
                        🔐
                    </div>

                    <h1 className="mt-5 text-3xl font-extrabold text-white">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm text-slate-300">
                        Login to continue using HomePlanner AI
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Enter password"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300 bg-transparent p-0"
                            >
                                {showPass ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {/* REMEMBER + FORGOT */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                className="w-4 h-4"
                            />
                            Remember me
                        </label>

                        <Link
                            to="/forgot-password"
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="toast-modern border border-rose-500/30 text-rose-200">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="toast-modern border border-emerald-500/30 text-emerald-200">
                            ✅ {success}
                        </div>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-white font-bold rounded-2xl"
                    >
                        {loading ? (
                            <span className="flex justify-center items-center gap-2">
                                <span className="loader-ring"></span>
                                Signing In...
                            </span>
                        ) : (
                            "🚀 Login Now"
                        )}
                    </button>

                    {/* SIGNUP */}
                    <p className="text-center text-sm text-slate-300 pt-2">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                            Create Account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}