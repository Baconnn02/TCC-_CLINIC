import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        const response = await api.post("/login", {
            email,
            password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

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
    const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login submitted");
    };

    return (
        <main className="min-h-screen w-full overflow-hidden bg-white">
            <div className="grid min-h-screen w-full lg:grid-cols-2">

                <section className="relative hidden min-h-screen overflow-hidden lg:flex">

                    {/* Background */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('/clinic-background.jpg')",
                        }}
                    />

                    {/* Main overlay */}
                    <div className="absolute inset-0 bg-white/50" />

    
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-[#f4dce1]/100" />

                    {/* =================================================
                        DECORATIVE BACKGROUND
                    ================================================= */}

                    {/* Large circle */}
                    <div
                        className="
                            absolute
                            -left-32
                            top-1/4
                            h-[420px]
                            w-[420px]
                            rounded-full
                            border-[45px]
                            border-[#820019]/5
                        "
                    />

                    {/* Top right circle */}
                    <div
                        className="
                            absolute
                            -right-28
                            -top-28
                            h-[360px]
                            w-[360px]
                            rounded-full
                            bg-[#820019]/5
                        "
                    />

                    {/* Bottom circle */}
                    <div
                        className="
                            absolute
                            -bottom-40
                            right-20
                            h-[480px]
                            w-[480px]
                            rounded-full
                            border-[55px]
                            border-[#820019]/5
                        "
                    />

                    {/* Decorative dots */}
                    <div className="absolute left-14 top-28 grid grid-cols-4 gap-3 opacity-30">
                        {Array.from({ length: 16 }).map((_, index) => (
                            <span
                                key={index}
                                className="h-2 w-2 rounded-full bg-[#820019]"
                            />
                        ))}
                    </div>

                    {/* Decorative vertical line */}
                    <div className="absolute right-10 top-28 h-32 w-[3px] rounded-full bg-[#820019]/20" />

                    {/* =================================================
                        LEFT CONTENT
                    ================================================= */}

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

                        {/* =================================================
                            CENTERED TITLE
                        ================================================= */}

                        <div className="mt-8 text-center">

                            <h1
                                className="
                                    text-[48px]
                                    font-extrabold
                                    leading-none
                                    tracking-tight
                                    text-[#700014]
                                    xl:text-[58px]
                                "
                            >
                                TCC Clinic
                            </h1>

                            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
                                <span className="h-[2px] w-12 bg-[#820019]" />

                                <p className="text-[21px] font-medium tracking-wide text-[#8b1528] xl:text-[24px]">
                                    Management System
                                </p>

                                <span className="h-[2px] w-12 bg-[#820019]" />
                            </div>

                            {/* Small badge */}
                            <div
                                className="
                                    mx-auto
                                    mt-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-[#820019]/20
                                    bg-white/70
                                    px-5
                                    py-2
                                    shadow-sm
                                "
                            >
                                <span className="h-2 w-2 rounded-full bg-[#820019]" />

                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#820019]">
                                    Healthcare Management
                                </span>
                            </div>

                        </div>


                        {/* =================================================
                            HERO TEXT
                        ================================================= */}

                        <div className="mt-14 max-w-[650px] text-center">

                            <h2
                                className="
                                    text-[30px]
                                    font-bold
                                    leading-tight
                                    text-[#650014]
                                    xl:text-[36px]
                                "
                            >
                                Better Care.
                                <br />

                                <span className="text-[#a71936]">
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
                                    text-[#7f3442]
                                    xl:text-[18px]
                                "
                            >
                                TCC Clinic Management System helps you
                                manage patients, consultations, medical
                                records, laboratory services, and more —
                                all in one place.
                            </p>

                        </div>


                        {/* =================================================
                            FEATURES
                        ================================================= */}

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


                        {/* =================================================
                            MOTTO
                        ================================================= */}

                        <div className="mt-auto pb-20 pt-12 text-center">

                            <div className="relative inline-block">

                                <p
                                    className="
                                        font-serif
                                        text-[28px]
                                        font-bold
                                        italic
                                        leading-tight
                                        text-[#8d1027]
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
                                        bg-[#8d1027]
                                    "
                                />

                            </div>

                            <p className="mt-8 text-xs tracking-[0.25em] text-[#8d1027]/60">
                                CARE • SERVICE • EXCELLENCE
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        BOTTOM DECORATION
                    ================================================= */}

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[95px] overflow-hidden">

                        <div
                            className="
                                absolute
                                -bottom-[75px]
                                -left-[10%]
                                h-[140px]
                                w-[120%]
                                rotate-[-5deg]
                                bg-[#750018]
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
                                bg-[#9f2039]
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
                                bg-[#5c0013]
                            "
                        />

                    </div>

                </section>


                {/* =====================================================
                    RIGHT PANEL - LOGIN
                ===================================================== */}

                <section
                    className="
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

                    <div className="w-full max-w-[520px]">

                        {/* =================================================
                            LOGO + TITLE
                        ================================================= */}

                        <div className="mb-12 flex items-center justify-center gap-5">

                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Logo"
                                className="h-[95px] w-[95px] object-contain"
                            />

                            <div className="border-l-[3px] border-[#7b0018] pl-5">

                                <h1
                                    className="
                                        text-[39px]
                                        font-bold
                                        leading-[0.95]
                                        text-[#700014]
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
                                        text-[#8b1528]
                                    "
                                >
                                    Management
                                    <br />
                                    System
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            WELCOME
                        ================================================= */}

                        <div className="mb-8 text-center">

                            <h2
                                className="
                                    text-[34px]
                                    font-bold
                                    text-[#650014]
                                    xl:text-[38px]
                                "
                            >
                                Welcome Back
                            </h2>

                            <p
                                className="
                                    mt-3
                                    text-[16px]
                                    text-[#8b2436]
                                    xl:text-[17px]
                                "
                            >
                                Sign in to your account to continue
                            </p>

                        </div>


                        {/* =================================================
                            LOGIN FORM
                        ================================================= */}

                        <form onSubmit={handleLogin}
                            className="space-y-5"
                        >

                            {/* USERNAME */}

                            <div className="relative">

                                <UserOutlineIcon />

                                <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
    required

                                    className="
                                        h-[62px]
                                        w-full
                                        rounded-[12px]
                                        border
                                        border-[#b95a6c]
                                        bg-white
                                        pl-[68px]
                                        pr-5
                                        text-[16px]
                                        text-gray-800
                                        outline-none
                                        placeholder:text-[#a96a78]
                                        transition
                                        focus:border-[#780019]
                                        focus:ring-1
                                        focus:ring-[#780019]
                                    "
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="relative">

                                <LockIcon />

                               <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
    required

                                    className="
                                        h-[62px]
                                        w-full
                                        rounded-[12px]
                                        border
                                        border-[#b95a6c]
                                        bg-white
                                        pl-[68px]
                                        pr-[65px]
                                        text-[16px]
                                        text-gray-800
                                        outline-none
                                        placeholder:text-[#a96a78]
                                        transition
                                        focus:border-[#780019]
                                        focus:ring-1
                                        focus:ring-[#780019]
                                    "
                                />

                                {/* SHOW PASSWORD */}

                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
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
                                        text-[#780019]
                                        transition
                                        hover:text-[#5c0013]
                                    "
                                >
                                    <EyeIcon />
                                </button>

                            </div>


                            {/* REMEMBER + FORGOT */}

                            <div className="flex items-center justify-between px-1">

                                <label
                                    className="
                                        flex
                                        cursor-pointer
                                        items-center
                                        gap-2.5
                                        text-[14px]
                                        text-[#780019]
                                        sm:text-[15px]
                                    "
                                >

                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) =>
                                            setRememberMe(
                                                e.target.checked
                                            )
                                        }
                                        className="
                                            h-5
                                            w-5
                                            cursor-pointer
                                            accent-[#780019]
                                        "
                                    />

                                    <span>
                                        Remember me
                                    </span>

                                </label>


                                <button
                                    type="button"
                                    className="
                                        text-[14px]
                                        text-[#780019]
                                        transition
                                        hover:underline
                                        sm:text-[15px]
                                    "
                                >
                                    Forgot password?
                                </button>

                            </div>
{error && (
    <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
    </div>
)}

                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="
                                    mt-2
                                    flex
                                    h-[60px]
                                    w-full
                                    items-center
                                    justify-center
                                    gap-4
                                    rounded-[11px]
                                    bg-[#820019]
                                    text-[18px]
                                    font-bold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#650014]
                                    active:scale-[0.99]
                                "
                            >

                                <span>
                                    Log In
                                </span>

                                <span className="text-[27px] font-normal leading-none">
                                    →
                                </span>

                            </button>

                        </form>


                        {/* =================================================
                            OR
                        ================================================= */}

                        <div className="my-10 flex items-center gap-5">

                            <div className="h-px flex-1 bg-[#d8a0aa]" />

                            <span className="text-[15px] text-[#780019]">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-[#d8a0aa]" />

                        </div>


                        {/* =================================================
                            HELP
                        ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                gap-3
                                text-center
                                text-[#780019]
                            "
                        >

                            <HeadsetIcon />

                            <p className="text-[14px]">
                                Need help? Contact your system administrator.
                            </p>

                        </div>


                        {/* =================================================
                            VERSION
                        ================================================= */}

                        <div
                            className="
                                mt-20
                                flex
                                items-center
                                justify-center
                                gap-2
                                text-[#780019]
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
        </main>
    );
}


/* ================================================================
   FEATURE COMPONENT
================================================================ */

function Feature({ icon, title, subtitle }) {
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
                    border-[#820019]/10
                    bg-white/75
                    text-[#83001b]
                    shadow-[0_8px_25px_rgba(100,0,20,0.08)]
                    backdrop-blur-sm
                    transition
                    duration-300
                    group-hover:-translate-y-1
                    group-hover:bg-[#f8e8eb]
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
                    text-[#820019]
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


/* ================================================================
   FEATURE ICONS
================================================================ */

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


/* ================================================================
   LOGIN ICONS
================================================================ */

function UserOutlineIcon() {
    return (
        <svg
            className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-[#85001b]
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
                text-[#85001b]
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