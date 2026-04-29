import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";
import { usePlanStore } from "../store";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, setToken } = usePlanStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
     PASSWORD STRENGTH
  ======================================= */
  const getStrength = () => {
    const pass = form.password;
    let score = 0;

    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { text: "Weak", color: "bg-rose-500", w: "25%" };
    if (score === 2) return { text: "Medium", color: "bg-amber-500", w: "55%" };
    if (score === 3) return { text: "Strong", color: "bg-emerald-500", w: "78%" };
    return { text: "Very Strong", color: "bg-cyan-500", w: "100%" };
  };

  const strength = getStrength();

  /* =======================================
     SUBMIT
  ======================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      return setError("Full name is required");
    }

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const data = await signup(form.email, form.password, form.name);

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setToken(data.token);

      setSuccess("Account created successfully 🚀");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,.18),transparent_35%),linear-gradient(135deg,#020617,#0f172a,#111827)]">

      <div className="w-full max-w-md card-glass p-8 md:p-10 shadow-premium">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl shadow-xl floaty">
            🏠
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-white">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Join HomePlanner AI and design smarter spaces
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Devesh Sharma"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

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
                placeholder="Create password"
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

            {/* strength */}
            {form.password && (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${strength.color}`}
                    style={{ width: strength.w }}
                  />
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Strength: {strength.text}
                </p>
              </div>
            )}
          </div>

          {/* CONFIRM */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField("confirmPassword", e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300 bg-transparent p-0"
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-success py-3 text-white font-bold rounded-2xl"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="loader-ring"></span>
                Creating...
              </span>
            ) : (
              "🚀 Create Account"
            )}
          </button>

          {/* LOGIN */}
          <p className="text-center text-sm text-slate-300 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}