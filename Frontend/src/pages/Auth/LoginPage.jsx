import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService.js";
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      const msg = "Email and password are required";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await authService.login(email.trim(), password);
      const token = res.token;
      const user = res.user;

      login(user, token);

      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Login failed";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-100 px-3 sm:px-4">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:16px_16px] opacity-30" />

      <div className="relative w-full max-w-sm sm:max-w-md">

        {/* Glow */}
        <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 to-teal-500 rounded-2xl sm:rounded-3xl blur opacity-10"></div>

        {/* Card */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_2px_10px_rgba(0,0,0,0.04)]">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4 sm:mb-5">
              <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
            </div>

            <h1 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight mb-1 sm:mb-2">
              Welcome back
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Email
              </label>

              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 border-2 border-slate-200 rounded-lg sm:rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Password
              </label>

              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="**********"
                  className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-10 sm:pr-12 border-2 border-slate-200 rounded-lg sm:rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 sm:p-3">
                <p className="text-xs text-red-600 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="group relative w-full h-10 sm:h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Signing in...</span>
                    <span className="sm:hidden">Signing in</span>
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>

              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/60">
            <p className="text-center text-xs sm:text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-slate-400 mt-3 sm:mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;