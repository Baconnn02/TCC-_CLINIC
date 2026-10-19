import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw, X } from "lucide-react";
import api from "../services/api";


function Login() {
    const navigate = useNavigate();

    useLayoutEffect(() => {
        document.documentElement.classList.remove("tcc-dark");
        localStorage.setItem("tcc-theme", "light");
    }, []);

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
            const msg = response.data?.message || `A 6-digit OTP verification code has been sent to ${cleanEmail}.`;
            const returnedDevOtp = response.data?.dev_otp || null;
            setForgotSuccessMessage(msg);
            setDevOtp(returnedDevOtp);
            setForgotOtp(returnedDevOtp || "");
            setForgotStep("otp");
            setResendCooldown(15);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Unable to send verification code. Please check your email.";
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
                response.data?.message || "OTP verified successfully. Now create your new password."
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
            const msg = err.response?.data?.message || "Invalid or expired OTP code. Please try again.";
            setForgotError(msg);
        } finally {
            setForgotLoading(false);
        }
    };





    const handleLogin = async (e) => {
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
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            if (rememberMe) {
                localStorage.setItem("tcc-saved-email", email.trim());
            } else {
                localStorage.removeItem("tcc-saved-email");
            }

            navigate("/dashboard");
        } catch (error) {
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
        <main className="tcc-login-page min-h-screen w-full bg-white">
            <div className="grid min-h-screen w-full lg:grid-cols-2">





                <section className="tcc-login-brand relative hidden min-h-screen overflow-hidden lg:flex">


                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('/clinic-background.jpg')",
                        }}
                    />


                    <div className="absolute inset-0 bg-white/50" />

                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-[#eee4d7]" />






                    <div
                        className="
                            absolute
                            -left-32
                            top-1/4
                            h-[420px]
                            w-[420px]
                            rounded-full
                            border-[45px]
                            border-[#8a6f50]/5
                        "
                    />


                    <div
                        className="
                            absolute
                            -right-28
                            -top-28
                            h-[360px]
                            w-[360px]
                            rounded-full
                            bg-[#8a6f50]/5
                        "
                    />


                    <div
                        className="
                            absolute
                            -bottom-40
                            right-20
                            h-[480px]
                            w-[480px]
                            rounded-full
                            border-[55px]
                            border-[#8a6f50]/5
                        "
                    />


                    <div className="absolute left-14 top-28 grid grid-cols-4 gap-3 opacity-30">
                        {Array.from({ length: 16 }).map((_, index) => (
                            <span
                                key={index}
                                className="h-2 w-2 rounded-full bg-[#8a6f50]"
                            />
                        ))}
                    </div>


                    <div className="absolute right-10 top-28 h-32 w-[3px] rounded-full bg-[#8a6f50]/20" />





                    <div
                        className="
                            relative
                            z-10
                            flex
                            min-h-screen
                            w-full
                            flex-col
                            items-center
                            px-10
                            py-10
                            xl:px-16
                        "
                    >



                        <div className="mt-8 text-center">

                            <h1
                                className="
                                    text-[48px]
                                    font-extrabold
                                    leading-none
                                    tracking-tight
                                    text-[#8a6f50]
                                    xl:text-[58px]
                                "
                            >
                                TCC Clinic
                            </h1>

                            <div className="mx-auto mt-4 flex items-center justify-center gap-3">

                                <span className="h-[2px] w-12 bg-[#8a6f50]" />

                                <p className="text-[21px] font-medium tracking-wide text-[#8a6f50] xl:text-[24px]">
                                    Management System
                                </p>

                                <span className="h-[2px] w-12 bg-[#8a6f50]" />

                            </div>



                            <div
                                className="
                                    mx-auto
                                    mt-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-[#8a6f50]/20
                                    bg-white/70
                                    px-5
                                    py-2
                                    shadow-sm
                                "
                            >

                                <span className="h-2 w-2 rounded-full bg-[#8a6f50]" />

                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6f50]">
                                    Healthcare Management
                                </span>

                            </div>

                        </div>



                        <div className="mt-14 max-w-[650px] text-center">

                            <h2
                                className="
                                    text-[30px]
                                    font-bold
                                    leading-tight
                                    text-[#8a6f50]
                                    xl:text-[36px]
                                "
                            >
                                Better Care.
                                <br />

                                <span className="text-[#8a6f50]">
                                    Healthier Tomorrow.
                                </span>
                            </h2>

                            <p
                                className="
                                    mx-auto
                                    mt-5
                                    max-w-[590px]
                                    text-[16px]
                                    leading-7
                                    text-[#3d3329]
                                    xl:text-[18px]
                                "
                            >
                                TCC Clinic Management System helps you
                                manage patients, consultations, medical
                                records, laboratory services, and more —
                                all in one place.
                            </p>

                        </div>



                        <div
                            className="
                                mt-10
                                grid
                                w-full
                                max-w-[650px]
                                grid-cols-3
                                gap-x-7
                                gap-y-7
                            "
                        >

                            <Feature
                                icon={<UserIcon />}
                                title="Patient"
                                subtitle="Management"
                            />

                            <Feature
                                icon={<StethoscopeIcon />}
                                title="Consultations"
                            />

                            <Feature
                                icon={<MedicalIcon />}
                                title="Medical"
                                subtitle="Records"
                            />

                            <Feature
                                icon={<FlaskIcon />}
                                title="Laboratory"
                            />

                            <Feature
                                icon={<UsersIcon />}
                                title="Doctors / Staff"
                            />

                            <Feature
                                icon={<ChartIcon />}
                                title="Reports"
                            />

                        </div>



                        <div className="mt-auto pb-20 pt-12 text-center">

                            <div className="relative inline-block">

                                <p
                                    className="
                                        font-serif
                                        text-[28px]
                                        font-bold
                                        italic
                                        leading-tight
                                        text-[#8a6f50]
                                        xl:text-[32px]
                                    "
                                >
                                    Quality Healthcare
                                    <br />
                                    for Everyone
                                </p>

                                <div
                                    className="
                                        absolute
                                        -bottom-5
                                        left-1/2
                                        h-[2px]
                                        w-40
                                        -translate-x-1/2
                                        rotate-[-4deg]
                                        bg-[#8a6f50]
                                    "
                                />

                            </div>

                            <p className="mt-8 text-xs tracking-[0.25em] text-[#8a6f50]/60">
                                CARE • SERVICE • EXCELLENCE
                            </p>

                        </div>

                    </div>





                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[95px] overflow-hidden">

                        <div
                            className="
                                absolute
                                -bottom-[75px]
                                -left-[10%]
                                h-[140px]
                                w-[120%]
                                rotate-[-5deg]
                                bg-[#8a6f50]
                            "
                        />

                        <div
                            className="
                                absolute
                                -bottom-[88px]
                                -left-[10%]
                                h-[135px]
                                w-[120%]
                                rotate-[3deg]
                                bg-[#735a40]
                            "
                        />

                        <div
                            className="
                                absolute
                                -bottom-[110px]
                                -left-[5%]
                                h-[140px]
                                w-[115%]
                                rotate-[-2deg]
                                bg-[#735a40]
                            "
                        />

                    </div>

                </section>





                <section
                    className="tcc-login-panel
                        flex
                        min-h-screen
                        w-full
                        items-center
                        justify-center
                        bg-white
                        px-6
                        py-10
                        sm:px-10
                        lg:px-12
                        xl:px-16
                    "
                >

                    <div className="tcc-login-card w-full max-w-[520px] rounded-3xl border border-[#e8dfd4] bg-white p-6 shadow-sm sm:p-9">





                        <div className="mb-12 flex items-center justify-center gap-5">

                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Logo"
                                className="h-[95px] w-[95px] object-contain"
                            />

                            <div className="border-l-[3px] border-[#8a6f50] pl-5">

                                <h1
                                    className="
                                        text-[39px]
                                        font-bold
                                        leading-[0.95]
                                        text-[#8a6f50]
                                    "
                                >
                                    TCC
                                    <br />
                                    Clinic
                                </h1>

                                <p
                                    className="
                                        mt-4
                                        text-[22px]
                                        leading-none
                                        text-[#8a6f50]
                                    "
                                >
                                    Management
                                    <br />
                                    System
                                </p>

                            </div>

                        </div>





                        <div className="mb-8 text-center">

                            <h2
                                className="
                                    text-[34px]
                                    font-bold
                                    text-[#8a6f50]
                                    xl:text-[38px]
                                "
                            >
                                Welcome Back
                            </h2>

                            <p
                                className="
                                    mt-3
                                    text-[16px]
                                    text-[#8a6f50]
                                    xl:text-[17px]
                                "
                            >
                                Sign in to your account to continue
                            </p>

                        </div>





                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                            aria-busy={loading}
                        >



                            <div className="relative">

                                <UserOutlineIcon />

                                <label htmlFor="login-email" className="sr-only">
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                    className="
                                        h-[62px]
                                        w-full
                                        rounded-[12px]
                                        border
                                        border-[#8a6f50]
                                        bg-white
                                        pl-[68px]
                                        pr-5
                                        text-[16px]
                                        text-stone-800
                                        outline-none
                                        placeholder:text-[#887d70]
                                        transition
                                        focus:border-[#8a6f50]
                                        focus:ring-1
                                        focus:ring-[#8a6f50]
                                        disabled:cursor-not-allowed
                                        disabled:bg-stone-50
                                    "
                                />

                            </div>



                            <div className="relative">

                                <LockIcon />

                                <label htmlFor="login-password" className="sr-only">
                                    Password
                                </label>

                                <input
                                    id="login-password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    className="
                                        h-[62px]
                                        w-full
                                        rounded-[12px]
                                        border
                                        border-[#8a6f50]
                                        bg-white
                                        pl-[68px]
                                        pr-[65px]
                                        text-[16px]
                                        text-stone-800
                                        outline-none
                                        placeholder:text-[#887d70]
                                        transition
                                        focus:border-[#8a6f50]
                                        focus:ring-1
                                        focus:ring-[#8a6f50]
                                        disabled:cursor-not-allowed
                                        disabled:bg-stone-50
                                    "
                                />



                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={loading}
                                    aria-pressed={showPassword}
                                    onClick={() =>
                                        setShowPassword(
                                            (value) => !value
                                        )
                                    }
                                    className="
                                        absolute
                                        right-5
                                        top-1/2
                                        -translate-y-1/2
                                        text-[#8a6f50]
                                        transition
                                        hover:text-[#735a40]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <EyeIcon />
                                </button>

                            </div>



                            <div className="flex items-center justify-between px-1">

                                <label
                                    className="
                                        flex
                                        cursor-pointer
                                        items-center
                                        gap-2.5
                                        text-[14px]
                                        text-[#8a6f50]
                                        sm:text-[15px]
                                    "
                                >

                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        disabled={loading}
                                        onChange={(e) =>
                                            setRememberMe(
                                                e.target.checked
                                            )
                                        }
                                        className="
                                            h-5
                                            w-5
                                            cursor-pointer
                                            accent-[#8a6f50]
                                            disabled:cursor-not-allowed
                                        "
                                    />

                                    <span>
                                        Remember my email
                                    </span>

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
                                    className="
                                        rounded
                                        text-[14px]
                                        font-medium
                                        text-[#8a6f50]
                                        underline-offset-4
                                        transition
                                        hover:text-[#6e553c]
                                        hover:underline
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-[#8a6f50]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        sm:text-[15px]
                                    "
                                >
                                    Forgot password?
                                </button>

                            </div>



                            {error && (
                                <div
                                    id="login-error"
                                    role="alert"
                                    aria-live="polite"
                                    className="
                                        tcc-login-error
                                        rounded-lg
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-600
                                    "
                                >
                                    {error}
                                </div>
                            )}





                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    mt-2
                                    flex
                                    h-[60px]
                                    w-full
                                    items-center
                                    justify-center
                                    gap-4
                                    rounded-[11px]
                                    text-[18px]
                                    font-bold
                                    text-white
                                    shadow-sm
                                    transition
                                    ${
                                        loading
                                            ? "cursor-not-allowed bg-[#8f7154]"
                                            : "bg-[#8a6f50] hover:bg-[#8a6f50] active:scale-[0.99]"
                                    }
                                `}
                            >

                                {loading ? (
                                    <>


                                        <span
                                            className="
                                                h-6
                                                w-6
                                                animate-spin
                                                rounded-full
                                                border-[3px]
                                                border-white/30
                                                border-t-white
                                            "
                                        />

                                        <span>
                                            Logging in...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Log In
                                        </span>

                                        <span className="text-[27px] font-normal leading-none">
                                            →
                                        </span>
                                    </>
                                )}

                            </button>

                        </form>





                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                gap-3
                                text-center
                                text-[#8a6f50]
                            "
                        >

                            <HeadsetIcon />

                            <p className="text-[14px]">
                                Need help? Contact our system administrator.
                            </p>

                        </div>





                        <div
                            className="
                                mt-12
                                flex
                                items-center
                                justify-center
                                gap-2
                                text-[#8a6f50]
                            "
                        >

                            <LockSmallIcon />

                            <span className="text-[12px]">
                                TCC Clinic Management System

                                <span className="ml-2">
                                    v1.0
                                </span>
                            </span>

                        </div>

                    </div>

                </section>

            </div>

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
                                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed"
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
function Feature({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
    return (
        <div
            className="
                group
                flex
                flex-col
                items-center
                text-center
            "
        >

            <div
                className="
                    flex
                    h-[68px]
                    w-[82px]
                    items-center
                    justify-center
                    rounded-[16px]
                    border
                    border-[#8a6f50]/10
                    bg-white/75
                    text-[#8a6f50]
                    shadow-[0_8px_25px_rgba(100,0,20,0.08)]
                    backdrop-blur-sm
                    transition
                    duration-300
                    group-hover:-translate-y-1
                    group-hover:bg-[#eee4d7]
                    group-hover:shadow-[0_12px_30px_rgba(100,0,20,0.12)]
                "
            >
                {icon}
            </div>

            <p
                className="
                    mt-3
                    text-[13px]
                    font-medium
                    leading-5
                    text-[#8a6f50]
                    sm:text-[14px]
                "
            >
                {title}

                {subtitle && (
                    <>
                        <br />
                        {subtitle}
                    </>
                )}
            </p>

        </div>
    );
}

function UserIcon() {
    return (
        <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        </svg>
    );
}

function StethoscopeIcon() {
    return (
        <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 3v5a4 4 0 0 0 8 0V3" />
            <path d="M4 3h4" />
            <path d="M14 3h2" />
            <path d="M14 14a3 3 0 1 0 6 0v-1" />
            <circle cx="20" cy="10" r="2" />
            <path d="M17 14v2a5 5 0 0 0 5 5" />
        </svg>
    );
}

function MedicalIcon() {
    return (
        <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 3h8l4 4v14H7z" />
            <path d="M15 3v5h5" />
            <path d="M13 11v6" />
            <path d="M10 14h6" />
        </svg>
    );
}

function FlaskIcon() {
    return (
        <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 3h6" />
            <path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
            <path d="M7 16h10" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
            <path d="M15 14c3 0 5 2 6 5" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 20V10" />
            <path d="M10 20V5" />
            <path d="M16 20v-7" />
            <path d="M3 20h18" />
            <path d="m4 7 5-3 5 2 6-4" />
        </svg>
    );
}





function UserOutlineIcon() {
    return (
        <svg
            className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-[#8a6f50]
            "
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4.3 3.6-7 8-7s8 2.7 8 7" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-[#8a6f50]
            "
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />

            <path d="M12 14v3" />
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

            <circle
                cx="12"
                cy="12"
                r="3"
            />
        </svg>
    );
}

function HeadsetIcon() {
    return (
        <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />

            <path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2z" />

            <path d="M20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" />

            <path d="M17 19c0 1-1 2-3 2h-1" />
        </svg>
    );
}

function LockSmallIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

export default Login;
