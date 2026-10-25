import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    Headphones,
    KeyRound,
    Lock,
    Mail,
    RefreshCw,
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

    /* ─── Forgot Password State ────────────────────────────────────────── */
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
        <main className="relative flex min-h-screen w-full items-center justify-center bg-[#faf7f2] px-4 py-12 font-[system-ui,_-apple-system,_sans-serif] text-[#3d3329]">
            {/* Subtle background decoration */}
            <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.035]"
                style={{ backgroundImage: "url('/clinic-background.jpg')" }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#faf7f2] via-white/80 to-[#f3ecdf]"
                aria-hidden="true"
            />

            {/* Back to Home Button */}
            <div className="absolute left-4 top-4 z-20 sm:left-8 sm:top-8">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#8a6f50]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#8a6f50] shadow-sm backdrop-blur-sm transition-all hover:border-[#8a6f50] hover:bg-white hover:text-[#735a40] sm:text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </button>
            </div>

            {/* Centered Login Card */}
            <div className="relative z-10 w-full max-w-[460px] rounded-3xl border border-[#e8dfd4] bg-white p-7 shadow-sm sm:p-9">
                {/* Brand Logo & Header */}
                <div className="mb-8 flex items-center justify-center gap-4">
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Logo"
                        className="h-20 w-20 object-contain sm:h-[86px] sm:w-[86px]"
                    />

                    <div className="border-l-[3px] border-[#8a6f50] pl-4">
                        <h1 className="text-2xl font-bold leading-none text-[#8a6f50] sm:text-[32px]">
                            TCC
                            <br />
                            Clinic
                        </h1>
                        <p className="mt-2 text-sm font-medium leading-tight text-[#8a6f50] sm:text-base">
                            Management
                            <br />
                            System
                        </p>
                    </div>
                </div>

                {/* Welcome Back title */}
                <div className="mb-7 text-center">
                    <h2 className="text-2xl font-bold text-[#8a6f50] sm:text-[28px]">
                        Welcome Back
                    </h2>
                    <p className="mt-1.5 text-xs text-[#8a6f50]/80 sm:text-sm">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4" aria-busy={loading}>
                    {/* Email Input */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#8a6f50]">
                            <Mail className="h-5 w-5" />
                        </div>
                        <label htmlFor="login-email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                            className="h-12 w-full rounded-xl border border-[#8a6f50] bg-white pl-12 pr-4 text-sm text-[#3d3329] outline-none placeholder:text-[#887d70] transition focus:border-[#8a6f50] focus:ring-1 focus:ring-[#8a6f50] disabled:cursor-not-allowed disabled:bg-stone-50"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#8a6f50]">
                            <Lock className="h-5 w-5" />
                        </div>
                        <label htmlFor="login-password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                            className="h-12 w-full rounded-xl border border-[#8a6f50] bg-white pl-12 pr-12 text-sm text-[#3d3329] outline-none placeholder:text-[#887d70] transition focus:border-[#8a6f50] focus:ring-1 focus:ring-[#8a6f50] disabled:cursor-not-allowed disabled:bg-stone-50"
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={loading}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8a6f50] transition hover:text-[#735a40] disabled:cursor-not-allowed"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between px-1 text-xs sm:text-sm">
                        <label className="flex cursor-pointer items-center gap-2 text-[#8a6f50]">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                disabled={loading}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 cursor-pointer rounded border-[#8a6f50] accent-[#8a6f50] disabled:cursor-not-allowed"
                            />
                            <span>Remember my email</span>
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
                            className="font-medium text-[#8a6f50] transition hover:text-[#6e553c] hover:underline disabled:opacity-50"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    {/* Log In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#8a6f50] text-base font-bold text-white shadow-sm transition hover:bg-[#785f43] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#8f7154]"
                    >
                        {loading ? (
                            <>
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Log In</span>
                                <span className="text-xl leading-none">→</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Need help note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#8a6f50]">
                    <Headphones size={15} />
                    <span>Need help? Contact our system administrator.</span>
                </div>

                {/* Version footer */}
                <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-[#e8dfd4] pt-4 text-[11px] text-[#8a6f50]/70">
                    <Lock size={12} />
                    <span>TCC Clinic Management System v1.0</span>
                </div>
            </div>

            {/* ─── Forgot Password Modal ────────────────────────────────────── */}
            {showForgotPassword && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
                        className="relative w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-2xl transition-all sm:p-7"
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
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8a6f50]/10 text-[#8a6f50]">
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
                                <p className="text-sm leading-relaxed text-stone-600">
                                    Enter your registered clinic email address. A 6-digit OTP verification code will be sent to your Gmail inbox via SMTP.
                                </p>

                                <div>
                                    <label
                                        htmlFor="forgot-email"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
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
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#8a6f50] focus:outline-none focus:ring-2 focus:ring-[#8a6f50]/20 disabled:bg-stone-50"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-500">
                                    The OTP code will be sent to your inbox using Gmail SMTP and remains valid for 15 minutes.
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        disabled={forgotLoading}
                                        onClick={closeForgotModal}
                                        className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:bg-[#8f7154]"
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
                                <div className="flex items-center justify-between rounded-xl border border-[#e8dfd4] bg-[#faf8f5] px-3.5 py-2 text-xs">
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
                                        className="ml-2 whitespace-nowrap text-xs font-semibold text-[#8a6f50] hover:underline"
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
                                                <span className="font-mono text-sm font-bold tracking-widest text-[#d96502]">
                                                    {devOtp}
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setForgotOtp(devOtp)}
                                                className="rounded-lg bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-300"
                                            >
                                                Auto-filled
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="forgot-otp"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
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
                                        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 text-center font-mono text-xl tracking-[0.4em] text-stone-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-stone-400 focus:border-[#8a6f50] focus:outline-none focus:ring-2 focus:ring-[#8a6f50]/20 disabled:bg-stone-50"
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
                                            className="inline-flex items-center gap-1 font-semibold text-[#8a6f50] transition hover:text-[#6e553c] hover:underline disabled:opacity-50"
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
                                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading || forgotOtp.length !== 6}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:bg-[#8f7154]"
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
                                        <strong className="font-semibold text-emerald-900">
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
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
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
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#8a6f50] focus:outline-none focus:ring-2 focus:ring-[#8a6f50]/20 disabled:bg-stone-50"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setForgotShowPassword(!forgotShowPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-600"
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
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
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
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#8a6f50] focus:outline-none focus:ring-2 focus:ring-[#8a6f50]/20 disabled:bg-stone-50"
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
                                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:bg-[#8f7154]"
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
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
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
                                    className="mt-6 w-full rounded-xl bg-[#8a6f50] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40]"
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
