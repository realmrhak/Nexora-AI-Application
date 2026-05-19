import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService.js";
import {
    BrainCircuit,
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff,
    User,
} from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await authService.register(
                username.trim(),
                email.trim(),
                password
            );

            setLoading(false); // ✅ move BEFORE navigate
            toast.success("Registration successful! Please login.");
            navigate("/login");

        } catch (err) {
            setLoading(false);
            setError(err.message || "Failed to register.");
            toast.error(err.message || "Failed to register");
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-100 px-4">

            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

            <div className="relative w-full max-w-md">

                {/* Glow */}
                <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 to-teal-500 rounded-3xl blur opacity-10"></div>

                {/* Card */}
                <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_2px_10px_rgba(0,0,0,0.04)]">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-5">
                            <BrainCircuit
                                className="w-7 h-7 text-white"
                                strokeWidth={2}
                            />
                        </div>

                        <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
                            Create an account
                        </h1>

                        <p className="text-slate-500 text-sm">
                            Start your AI-powered learning experience
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Username
                            </label>

                            <div className="relative">
                                <div
                                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "username"
                                            ? "text-emerald-500"
                                            : "text-slate-400"
                                        }`}
                                >
                                    <User
                                        className="h-5 w-5"
                                        strokeWidth={2}
                                    />
                                </div>

                                <input
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    onFocus={() =>
                                        setFocusedField("username")
                                    }
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="yourusername"
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Email
                            </label>

                            <div className="relative">
                                <div
                                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "email"
                                            ? "text-emerald-500"
                                            : "text-slate-400"
                                        }`}
                                >
                                    <Mail
                                        className="h-5 w-5"
                                        strokeWidth={2}
                                    />
                                </div>

                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Password
                            </label>

                            <div className="relative">
                                {/* Left icon */}
                                <div
                                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === "password"
                                            ? "text-emerald-500"
                                            : "text-slate-400"
                                        }`}
                                >
                                    <Lock
                                        className="h-5 w-5"
                                        strokeWidth={2}
                                    />
                                </div>

                                {/* Input */}
                                <input
                                    type={
                                        showPassword ? "text" : "password"
                                    }
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onFocus={() =>
                                        setFocusedField("password")
                                    }
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="**********"
                                    className="w-full h-12 pl-12 pr-12 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                />

                                {/* Toggle Password */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                                <p className="text-xs text-red-600 font-medium text-center">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !username ||
                                !email ||
                                !password
                            }
                            className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account

                                        <ArrowRight
                                            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                                            strokeWidth={2.5}
                                        />
                                    </>
                                )}
                            </span>

                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom Text */}
                <p className="text-center text-xs text-slate-400 mt-4">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;