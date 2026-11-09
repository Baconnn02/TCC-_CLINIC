import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Eye,
    EyeOff,
    FileText,
    FlaskConical,
    Headphones,
    KeyRound,
    Lock,
    Mail,
    RefreshCw,
    Shield,
    Stethoscope,
    User,
    Users,
    X,
} from "lucide-react";
import api from "../services/api";

export default function Login(): React.JSX.Element {
    const navigate = useNavigate();

    const [email, setEmail] = useState(() =>
        localStorage.getItem("tcc-saved-email") || ""
    );
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() =>
        Boolean(localStorage.getItem("tcc-saved-email"))
    );

    /* ─── Forgot Password State ───────────────────────────────────────────── */
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState<"email" | "otp" | "new_password" | "success">("email");
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotOtp, setForgotOtp] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotPasswordConfirm, setForgotPasswordConfirm] = useState("");
    const [forgotShowPassword, setForgotShowPassword] = useState(false);
    const [forgotError, setForgotError] = useState("");
    const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const closeForgotModal = () => {
        setShowForgotPassword(false);
        setForgotStep("email");
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotPasswordConfirm("");
        setForgotError("");
        setForgotSuccessMessage("");
        setDevOtp(null);
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const cleanEmail = forgotEmail.trim().toLowerCase();
        if (!cleanEmail) {
            setForgotError("Please enter your registered clinic email.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setForgotError("Please enter a valid email address.");
            return;
        }

        setForgotError("");
        setForgotLoading(true);

        try {
            const response = await api.post("/forgot-password/send-otp", {
                email: cleanEmail,
            });
            const msg =
                response.data?.message ||
                `A 6-digit OTP verification code has been sent to ${cleanEmail}.`;
            const returnedDevOtp = response.data?.dev_otp || null;
            setForgotSuccessMessage(msg);
            setDevOtp(returnedDevOtp);
            setForgotOtp(returnedDevOtp || "");
            setForgotStep("otp");
            setResendCooldown(15);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Unable to send verification code. Please check your email.";
            setForgotError(msg);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanOtp = forgotOtp.trim();
        if (!cleanOtp || cleanOtp.length !== 6) {
            setForgotError("Please enter the complete 6-digit verification code.");
            return;
        }

        setForgotError("");
        setForgotLoading(true);

        try {
            const response = await api.post("/forgot-password/verify-otp", {
                email: forgotEmail.trim().toLowerCase(),
                otp: cleanOtp,
            });
            setForgotSuccessMessage(
                response.data?.message ||
                    "OTP verified successfully. Now create your new password."
            );
            setForgotStep("new_password");
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Invalid or expired OTP code. Please check your email and try again.";
            setForgotError(msg);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanOtp = forgotOtp.trim();
        if (!cleanOtp || cleanOtp.length !== 6) {
            setForgotError("Verification code is missing. Please re-verify your OTP.");
            setForgotStep("otp");
            return;
        }
        if (!forgotNewPassword || forgotNewPassword.length < 8) {
            setForgotError("New password must be at least 8 characters long.");
            return;
        }
        if (forgotNewPassword !== forgotPasswordConfirm) {
            setForgotError("New password and confirmation password do not match.");
            return;
        }

        setForgotError("");
        setForgotLoading(true);

        try {
            const response = await api.post("/forgot-password/reset", {
                email: forgotEmail.trim().toLowerCase(),
                otp: cleanOtp,
                password: forgotNewPassword,
                password_confirmation: forgotPasswordConfirm,
            });
            setForgotSuccessMessage(
                response.data?.message || "Password has been reset successfully."
            );
            setForgotStep("success");
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Invalid or expired OTP code. Please try again.";
            setForgotError(msg);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/login", {
                email,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (rememberMe) {
                localStorage.setItem("tcc-saved-email", email.trim());
            } else {
                localStorage.removeItem("tcc-saved-email");
            }

            navigate("/dashboard");
        } catch (error: any) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center bg-[#dfe3ea] p-4 sm:p-6 lg:p-10 font-[system-ui,_-apple-system,_sans-serif] text-stone-900">
            {/* Ambient Background Glow */}
            <div
                className="pointer-events-none absolute inset-0 bg-radial from-white/40 via-transparent to-stone-400/20"
                aria-hidden="true"
            />

            {/* Back Button to Landing Page */}
            <div className="absolute left-4 top-4 z-30 sm:left-8 sm:top-8">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/90 px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-md transition hover:bg-stone-50 hover:text-[#70091f] sm:text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </button>
            </div>

            {/* Centered Modal Card Container (2-Column Layout) */}
            <div className="tcc-login-entrance relative z-10 w-full max-w-[1040px] rounded-3xl bg-white shadow-[0_24px_70px_-15px_rgba(20,20,30,0.18)] border border-stone-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                
                {/* ── LEFT COLUMN: Branding & Features Showcase ── */}
                <div className="relative lg:col-span-6 flex flex-col justify-between p-7 sm:p-9 lg:p-10 bg-gradient-to-br from-[#fdf7f8] via-[#f7edf0] to-[#f3e3e7] overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200/80">
                    
                    {/* Background Watermark 1: TCC Seal */}
                    <div
                        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]"
                        aria-hidden="true"
                    >
                        <img
                            src="/tcc-logo.jpg"
                            alt=""
                            className="w-[420px] h-[420px] rounded-full object-cover filter grayscale contrast-150"
                        />
                    </div>

                    {/* Background Watermark 2: Institutional Slogan */}
                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center justify-center opacity-[0.06] select-none text-center font-black tracking-widest text-[#70091f]"
                        aria-hidden="true"
                    >
                        <span className="text-3xl sm:text-4xl leading-tight uppercase font-serif">TRULY WE REMAIN!</span>
                        <span className="text-xs sm:text-sm tracking-[0.3em] uppercase">TAGOLOAN COMMUNITY COLLEGE</span>
                    </div>

                    {/* Bottom Dark Maroon Wave */}
                    <div className="pointer-events-none absolute -bottom-1 -left-1 w-full overflow-hidden leading-none z-0">
                        <svg
                            viewBox="0 0 500 80"
                            preserveAspectRatio="none"
                            className="w-full h-16 fill-[#70091f]"
                        >
                            <path d="M0,45 C140,80 240,15 500,50 L500,80 L0,80 Z" />
                        </svg>
                    </div>

                    {/* Top Section */}
                    <div className="relative z-10">
                        {/* Dot Matrix Pattern */}
                        <div className="grid grid-cols-4 gap-1.5 w-max opacity-40">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#70091f]" />
                            ))}
                        </div>

                        {/* Title & Healthcare Management Badge */}
                        <div className="flex flex-col items-center text-center mt-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                                TCC Clinic
                            </h1>
                            <div className="mt-1 flex items-center justify-center gap-3 w-full">
                                <span className="h-[1.5px] w-8 bg-[#70091f]/60" />
                                <span className="text-xs font-bold tracking-wider text-[#70091f]">
                                    Management System
                                </span>
                                <span className="h-[1.5px] w-8 bg-[#70091f]/60" />
                            </div>
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/80 px-3.5 py-1 text-[10px] font-bold tracking-wider text-stone-700 shadow-xs backdrop-blur-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#70091f]" />
                                <span>HEALTHCARE MANAGEMENT</span>
                            </div>
                        </div>

                        {/* Better Care. Healthier Tomorrow. */}
                        <div className="text-center mt-6">
                            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
                                Better Care.
                                <br />
                                <span className="text-[#70091f]">Healthier Tomorrow.</span>
                            </h2>
                            <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-stone-600 max-w-sm mx-auto">
                                TCC Clinic Management System helps you manage patients, consultations, medical records, laboratory services, and more — all in one place.
                            </p>
                        </div>

                        {/* 6 Feature Tiles Grid (3 cols x 2 rows) */}
                        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto w-full">
                            {/* 1: Patient Management */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Patient<br />Management
                                </span>
                            </div>

                            {/* 2: Consultations */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <Stethoscope className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Consultations
                                </span>
                            </div>

                            {/* 3: Medical Records */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Medical<br />Records
                                </span>
                            </div>

                            {/* 4: Laboratory */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <FlaskConical className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Laboratory
                                </span>
                            </div>

                            {/* 5: Doctors / Staff */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Doctors / Staff
                                </span>
                            </div>

                            {/* 6: Reports */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200/70 text-[#70091f] transition group-hover:scale-105 group-hover:shadow-md">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <span className="mt-1.5 text-[10px] font-semibold text-stone-700 leading-tight">
                                    Reports
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tagline & Slogan */}
                    <div className="relative z-10 mt-8 pt-4 pb-4 text-center">
                        <h3 className="font-serif text-lg sm:text-xl font-bold italic text-[#70091f]">
                            Quality Healthcare
                            <br />
                            for Everyone
                        </h3>
                        <p className="mt-1 text-[9px] font-extrabold tracking-[0.25em] text-stone-500 uppercase">
                            CARE • SERVICE • EXCELLENCE
                        </p>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Sign In Form ── */}
                <div className="relative lg:col-span-6 flex flex-col justify-between p-7 sm:p-10 lg:p-12 bg-white">
                    
                    {/* Top Logo & Header */}
                    <div>
                        <div className="flex items-center gap-3">
                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Seal"
                                className="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-amber-500/30"
                            />
                            <div className="h-10 w-[1.5px] bg-stone-300" />
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 leading-none">
                                    <span className="text-xl font-extrabold text-stone-900 tracking-tight">TCC</span>
                                    <span className="text-xl font-extrabold text-stone-900 tracking-tight">Clinic</span>
                                </div>
                                <span className="text-[11px] font-medium text-stone-500 mt-0.5">
                                    Management System
                                </span>
                            </div>
                        </div>

                        {/* Welcome Back */}
                        <div className="mt-7 text-left">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                                Welcome Back
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-stone-500">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Sign In Form */}
                        <form onSubmit={handleLogin} className="mt-6 space-y-4" aria-busy={loading}>
                            {/* Email or ID Input */}
                            <div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@tcc.edu.ph"
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-[#70091f] focus:ring-2 focus:ring-[#70091f]/15 disabled:cursor-not-allowed disabled:bg-stone-50"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-11 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-[#70091f] focus:ring-2 focus:ring-[#70091f]/15 disabled:cursor-not-allowed disabled:bg-stone-50"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        disabled={loading}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password Row */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex cursor-pointer items-center gap-2 text-stone-700 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        disabled={loading}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-stone-300 text-[#70091f] focus:ring-[#70091f] accent-[#70091f]"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setForgotEmail(email.trim());
                                        setForgotStep("email");
                                        setForgotOtp("");
                                        setForgotNewPassword("");
                                        setForgotPasswordConfirm("");
                                        setForgotError("");
                                        setForgotSuccessMessage("");
                                        setShowForgotPassword(true);
                                    }}
                                    className="text-xs text-stone-600 hover:text-[#70091f] font-medium transition hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#70091f] text-sm font-bold text-white shadow-md shadow-[#70091f]/20 transition-all hover:bg-[#850b25] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Log In</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* OR Divider */}
                        <div className="mt-6">
                            <div className="relative flex items-center justify-center">
                                <div className="w-full border-t border-stone-200" />
                                <span className="absolute bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                                    OR
                                </span>
                            </div>

                            {/* Help & System Info */}
                            <div className="mt-6 text-center space-y-3.5">
                                <p className="inline-flex items-center justify-center gap-1.5 text-xs text-stone-600">
                                    <Headphones size={13} className="text-[#70091f]" />
                                    <span>Need help? Contact your system administrator.</span>
                                </p>
                                <p className="inline-flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                                    <Shield size={12} className="text-stone-400" />
                                    <span>TCC Clinic Management System v1.0</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Right Copyright */}
                    <div className="mt-8 text-center sm:text-right">
                        <span className="text-[11px] text-stone-400">
                            © TCC Clinic 2024
                        </span>
                    </div>

                    {/* Decorative Floating Arrow Pill */}
                    <div
                        className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl border border-stone-200 text-stone-700 hover:text-[#70091f] hover:scale-105 transition cursor-pointer z-30"
                        title="TCC Clinic Portal"
                    >
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>

            {/* ─── Forgot Password Modal ────────────────────────────────────── */}
            {showForgotPassword && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="forgot-password-modal-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !forgotLoading) {
                            closeForgotModal();
                        }
                    }}
                >
                    <div
                        className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-2xl transition-all sm:p-7"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label="Close"
                            disabled={forgotLoading}
                            onClick={closeForgotModal}
                            className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#70091f] text-white shadow-xs">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h2
                                    id="forgot-password-modal-title"
                                    className="text-lg font-bold text-stone-900"
                                >
                                    {forgotStep === "email" && "Reset Password"}
                                    {forgotStep === "otp" && "Verify OTP Code"}
                                    {forgotStep === "new_password" && "Set New Password"}
                                    {forgotStep === "success" && "Password Reset Complete"}
                                </h2>
                                <p className="text-xs text-stone-500">
                                    {forgotStep === "email" && "Step 1 of 3: Enter Clinic Email"}
                                    {forgotStep === "otp" && "Step 2 of 3: Verify OTP Code"}
                                    {forgotStep === "new_password" && "Step 3 of 3: Set New Password"}
                                    {forgotStep === "success" && "Account access restored"}
                                </p>
                            </div>
                        </div>

                        {forgotError && (
                            <div
                                role="alert"
                                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700"
                            >
                                {forgotError}
                            </div>
                        )}

                        {forgotStep === "email" && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
                                    Enter your registered clinic email address. A 6-digit OTP verification code will be sent to your Gmail inbox.
                                </p>

                                <div>
                                    <label
                                        htmlFor="forgot-email"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                                    >
                                        Clinic Email
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            required
                                            autoFocus
                                            disabled={forgotLoading}
                                            value={forgotEmail}
                                            onChange={(e) => {
                                                setForgotEmail(e.target.value);
                                                if (forgotError) setForgotError("");
                                            }}
                                            placeholder="e.g. nurse@tcc.edu.ph"
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/15 disabled:bg-stone-100"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl bg-[#70091f]/5 border border-[#70091f]/10 p-3 text-xs leading-relaxed text-stone-600">
                                    The OTP code will be sent to your inbox and remains valid for 15 minutes.
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        disabled={forgotLoading}
                                        onClick={closeForgotModal}
                                        className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#70091f] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#850b25] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {forgotLoading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                <span>Sending Code...</span>
                                            </>
                                        ) : (
                                            <span>Send OTP Code</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === "otp" && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs">
                                    <span className="truncate text-stone-600">
                                        Code sent to:{" "}
                                        <strong className="font-semibold text-stone-900">
                                            {forgotEmail}
                                        </strong>
                                    </span>
                                    <button
                                        type="button"
                                        disabled={forgotLoading}
                                        onClick={() => {
                                            setForgotStep("email");
                                            setForgotError("");
                                        }}
                                        className="ml-2 whitespace-nowrap text-xs font-semibold text-[#70091f] hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>

                                {forgotSuccessMessage && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                                        {forgotSuccessMessage}
                                    </div>
                                )}

                                {devOtp && (
                                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                <strong>OTP Code:</strong>{" "}
                                                <span className="font-mono text-sm font-bold tracking-widest text-[#70091f]">
                                                    {devOtp}
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setForgotOtp(devOtp)}
                                                className="rounded-lg bg-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
                                            >
                                                Auto-filled
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="forgot-otp"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                                    >
                                        6-Digit OTP Code
                                    </label>
                                    <input
                                        id="forgot-otp"
                                        type="text"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        disabled={forgotLoading}
                                        value={forgotOtp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setForgotOtp(val);
                                            if (forgotError) setForgotError("");
                                        }}
                                        placeholder="123456"
                                        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 text-center font-mono text-xl tracking-[0.4em] text-stone-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/15 disabled:bg-stone-100"
                                    />
                                    <p className="mt-1.5 text-center text-xs text-stone-500">
                                        Please enter the 6-digit code received in your email.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs">
                                    <span className="text-stone-500">
                                        Didn't receive the email?
                                    </span>
                                    {resendCooldown > 0 ? (
                                        <span className="font-medium text-stone-400">
                                            Resend in {resendCooldown}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={forgotLoading}
                                            onClick={() => handleSendOtp()}
                                            className="inline-flex items-center gap-1 font-semibold text-[#70091f] transition hover:underline disabled:opacity-50"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            <span>Resend OTP</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        disabled={forgotLoading}
                                        onClick={() => {
                                            setForgotStep("email");
                                            setForgotError("");
                                        }}
                                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading || forgotOtp.length !== 6}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#70091f] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#850b25] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {forgotLoading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Verify Code</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === "new_password" && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs">
                                    <span className="truncate text-emerald-800">
                                        OTP code verified for:{" "}
                                        <strong className="font-semibold text-stone-900">
                                            {forgotEmail}
                                        </strong>
                                    </span>
                                </div>

                                {forgotSuccessMessage && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                                        {forgotSuccessMessage}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="forgot-new-password"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                                    >
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="forgot-new-password"
                                            type={forgotShowPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            autoFocus
                                            disabled={forgotLoading}
                                            value={forgotNewPassword}
                                            onChange={(e) => {
                                                setForgotNewPassword(e.target.value);
                                                if (forgotError) setForgotError("");
                                            }}
                                            placeholder="Minimum 8 characters"
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/15 disabled:bg-stone-100"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setForgotShowPassword(!forgotShowPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-700"
                                        >
                                            {forgotShowPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="forgot-password-confirm"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                                    >
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="forgot-password-confirm"
                                            type={forgotShowPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            disabled={forgotLoading}
                                            value={forgotPasswordConfirm}
                                            onChange={(e) => {
                                                setForgotPasswordConfirm(e.target.value);
                                                if (forgotError) setForgotError("");
                                            }}
                                            placeholder="Re-enter new password"
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#70091f] focus:outline-none focus:ring-2 focus:ring-[#70091f]/15 disabled:bg-stone-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        disabled={forgotLoading}
                                        onClick={() => {
                                            setForgotStep("otp");
                                            setForgotError("");
                                        }}
                                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#70091f] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#850b25] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {forgotLoading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <span>Reset Password</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === "success" && (
                            <div className="py-2 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <CheckCircle2 className="h-7 w-7" />
                                </div>
                                <h3 className="text-base font-semibold text-stone-900">
                                    Password Reset Successful!
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                                    Your password has been securely updated. You can now log into your TCC Clinic account using your new password.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail(forgotEmail.trim());
                                        setPassword("");
                                        closeForgotModal();
                                    }}
                                    className="mt-6 w-full rounded-xl bg-[#70091f] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#850b25]"
                                >
                                    Proceed to Log In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
