import React, { useState, useEffect } from "react";
import { ORG_DATA, loadStoredOrgData, type OrgCategory } from "./Organization";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    ArrowRight,
    MapPin,
    Clock,
    Phone,
    Mail,
    Lock,
    CheckCircle2,
    Users,
    ClipboardList,
    Pill,
    BarChart3,
    Activity,
    FileText,
    Shield,
    Database,
    Sparkles,
} from "lucide-react";

/* ─── Scroll helper ───────────────────────────────────────────────────────── */
function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Landing(): React.JSX.Element {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [orgCategory, setOrgCategory] = useState<OrgCategory>("clinic");
    const [orgData, setOrgData] = useState(() => loadStoredOrgData());

    /* Synchronize in real-time when Organization is edited */
    useEffect(() => {
        const handleOrgSync = () => {
            setOrgData(loadStoredOrgData());
        };
        window.addEventListener("storage", handleOrgSync);
        window.addEventListener("tcc-org-updated", handleOrgSync);
        return () => {
            window.removeEventListener("storage", handleOrgSync);
            window.removeEventListener("tcc-org-updated", handleOrgSync);
        };
    }, []);

    /* Navbar background adjustment on scroll */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const goToLogin = () => navigate("/login");

    /* Safe Initials Helper */
    const getInitials = (name: string) => {
        const parts = (name || "")
            .split(" ")
            .filter((w) => !["Dr.", "Prof.", "MD", "RN", "MAN", "RM", "RPh", "EdD", "PhD"].includes(w))
            .slice(0, 2)
            .map((w) => w[0])
            .join("");
        return (parts || (name || "").slice(0, 2)).toUpperCase() || "TC";
    };

    const currentMembers = (orgData[orgCategory] || ORG_DATA[orgCategory])?.members || [];
    const leadMember = currentMembers.find((m) => m.level === 1) || currentMembers[0];
    const staffMembers = currentMembers.filter((m) => m.id !== leadMember?.id);

    return (
        <div className="min-h-screen bg-[#faf5ee] font-[system-ui,_-apple-system,_sans-serif] text-stone-900 selection:bg-[#e5a93b] selection:text-[#1c080e]">
            {/* ── HEADER / NAVIGATION BAR ────────────────────────────────────── */}
            <header
                className={[
                    "fixed top-0 z-50 w-full transition-all duration-300",
                    scrolled
                        ? "border-b border-white/10 bg-[#1d0309]/95 shadow-xl backdrop-blur-md py-3"
                        : "bg-transparent py-4 sm:py-5",
                ].join(" ")}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
                    {/* Brand */}
                    <div
                        onClick={() => scrollTo("#hero")}
                        className="flex items-center gap-3 cursor-pointer select-none text-left"
                    >
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-[#e5a93b]/70 shadow-md shrink-0"
                        />
                        <div className="leading-tight">
                            <p className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow">
                                Tagoloan Community College
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-medium text-[#fcebe7]/75">
                                College Health Clinic
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7">
                        <button
                            type="button"
                            onClick={() => scrollTo("#about")}
                            className="text-xs font-medium text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200"
                        >
                            About
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#features")}
                            className="text-xs font-medium text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200"
                        >
                            Features
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#team")}
                            className="text-xs font-medium text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200"
                        >
                            Team
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#gallery")}
                            className="text-xs font-medium text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200"
                        >
                            Clinic in Action
                        </button>

                        {/* Gold Pill Sign In Button */}
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="ml-2 rounded-full bg-[#e5a93b] px-5 py-2 text-xs font-bold text-[#1c080e] shadow-md transition duration-200 hover:bg-[#d89c2f] hover:shadow-lg active:scale-95"
                        >
                            Sign In
                        </button>
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Drawer */}
                {menuOpen && (
                    <div className="border-t border-white/10 bg-[#1d0309]/98 px-5 pb-5 pt-4 md:hidden backdrop-blur-xl animate-fadeIn">
                        <div className="flex flex-col space-y-3 text-left">
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#about");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1"
                            >
                                About TCC Clinic
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#features");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1"
                            >
                                Features &amp; Capabilities
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#team");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1"
                            >
                                Meet the Clinic Team
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#gallery");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1"
                            >
                                Clinic in Action
                            </button>
                            <button
                                type="button"
                                onClick={goToLogin}
                                className="mt-2 w-full rounded-full bg-[#e5a93b] py-2.5 text-xs font-bold text-[#1c080e] shadow-md"
                            >
                                Sign In to Portal
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── HERO SECTION ──────────────────────────────────────────────── */}
            <section
                id="hero"
                className="relative overflow-hidden bg-gradient-to-b from-[#24040c] via-[#1c0309] to-[#140206] pt-28 pb-16 sm:pt-36 sm:pb-24 text-white"
            >
                {/* Radial golden glow in upper right */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-500/15 blur-[120px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 rounded-full bg-[#70091f]/25 blur-[100px]"
                />

                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        {/* Left Column: Heading & CTAs */}
                        <div className="flex flex-col items-start text-left lg:col-span-6">
                            {/* Pill Tag */}
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5a93b]/40 bg-[#e5a93b]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f5c358]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f5c358]" />
                                <span>College Health &amp; Wellness Clinic</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                                Your health
                                <br />
                                begins here
                                <br />
                                <span className="text-[#fcebe7] font-serif italic font-normal">
                                    in Tagoloan.
                                </span>
                            </h1>

                            {/* Body Paragraph */}
                            <p className="mt-5 max-w-lg text-xs sm:text-sm leading-relaxed text-[#fcebe7]/75 font-normal">
                                The TCC Clinic serves as the heartbeat of campus well-being, offering complete clinical, first-aid, and health monitoring services to ensure every student, faculty, and staff member thrives in their collegiate journey.
                            </p>

                            {/* Two Buttons */}
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#e5a93b] px-6 py-3 text-xs sm:text-sm font-bold text-[#1c080e] shadow-lg shadow-amber-950/40 transition hover:bg-[#d89c2f] active:scale-95"
                                >
                                    <span>Access Clinic Portal</span>
                                    <ArrowRight size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Arch Cards & Floating Training Box */}
                        <div className="relative flex justify-center lg:justify-end lg:col-span-6">
                            <div className="relative w-full max-w-md h-[400px] sm:h-[440px] flex items-end justify-center gap-3 sm:gap-4">
                                {/* Left Arch Card (Maroon) */}
                                <div className="relative h-[360px] sm:h-[390px] w-1/2 rounded-t-[140px] rounded-b-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#6b081e] to-[#3a0410] shadow-2xl">
                                    <img
                                        src="/tcc-clinic-team.jpg"
                                        alt="Dedicated Care & Healing"
                                        className="h-full w-full object-cover opacity-65 mix-blend-luminosity hover:opacity-85 transition duration-500 scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#26030a] via-transparent to-transparent" />
                                    <span className="absolute bottom-5 inset-x-2 text-center text-[11px] font-bold tracking-wide text-white/90">
                                        Dedicated Care &amp; Healing
                                    </span>
                                </div>

                                {/* Right Arch Card (Gold) */}
                                <div className="relative h-[320px] sm:h-[350px] w-1/2 rounded-t-[140px] rounded-b-3xl overflow-hidden border border-[#e5a93b]/40 bg-gradient-to-b from-[#e5a93b] to-[#b37a1c] shadow-2xl self-end">
                                    <img
                                        src="/tcc-clinic-care.jpg"
                                        alt="Patient Care"
                                        className="h-full w-full object-cover opacity-70 mix-blend-multiply hover:opacity-90 transition duration-500 scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#8a5d14] via-transparent to-transparent" />
                                </div>

                                {/* Floating White Card overlapping arches */}
                                <div className="absolute -bottom-6 left-1 sm:-left-3 right-1 sm:right-auto sm:max-w-sm rounded-2xl bg-white p-4 sm:p-5 shadow-2xl border border-stone-100 text-left z-20">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#70091f]">
                                        Clinical Practice · Baluarte Campus
                                    </p>
                                    <h2 className="mt-1 text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                                        TCC Midwifery &amp; Nursing Students in Clinical Training
                                    </h2>
                                    <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                                        Dedicated healthcare students performing vital sign checkups and maternal health monitoring at the Baluarte Campus Clinic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── GOLDEN MARQUEE TICKER ─────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-[#e5a93b] py-3 border-y border-[#d89c2f]">
                <div className="animate-marquee flex items-center gap-8 text-[#1a040a] text-xs font-black uppercase tracking-widest whitespace-nowrap">
                    <span>Clinical Consultations</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Student Health Records</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>First Aid &amp; Triage</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Medicine Dispensary</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Vital Signs Monitoring</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Medical Certificates</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Campus Wellness</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Preventive Care</span>
                    <span className="text-[#70091f]">✦</span>
                    {/* Duplicate for seamless infinite loop */}
                    <span>Clinical Consultations</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Student Health Records</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>First Aid &amp; Triage</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Medicine Dispensary</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Vital Signs Monitoring</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Medical Certificates</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Campus Wellness</span>
                    <span className="text-[#70091f]">✦</span>
                    <span>Preventive Care</span>
                    <span className="text-[#70091f]">✦</span>
                </div>
            </div>

            {/* ── ABOUT TCC CLINIC ─────────────────────────────────────────── */}
            <section id="about" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-left">
                {/* Header */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#70091f]">
                        Who we are &amp; what we do
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                        About TCC Clinic
                    </h2>
                    <p className="mt-3 max-w-3xl text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                        At TCC Clinic, we believe that education begins with good health. Serving the entire Tagoloan Community College community through immediate, accessible, and dedicated care, we provide routine treatments, preventative guidance, and medical triage for emergencies so that our scholars and mentors can pursue excellence unhindered.
                    </p>
                </div>

                {/* 2-Card Top Grid: Mission & Vision */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Mission Card (Deep Maroon) */}
                    <div className="lg:col-span-7 rounded-3xl bg-[#3d040f] p-7 sm:p-8 text-white shadow-sm flex flex-col justify-between min-h-[220px]">
                        <div>
                            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#fcebe7]">
                                Our Mission
                            </span>
                            <p className="mt-4 text-lg sm:text-xl font-bold leading-snug text-white">
                                A premier community-based institution providing accessible, quality healthcare services to every student and staff of Tagoloan Community College.
                            </p>
                        </div>
                    </div>

                    {/* Vision Card (Warm Gold) */}
                    <div className="lg:col-span-5 rounded-3xl bg-[#e5a93b] p-7 sm:p-8 text-[#1c1005] shadow-sm flex flex-col justify-between min-h-[220px]">
                        <div>
                            <span className="inline-block rounded-full bg-[#1c1005]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1c1005]">
                                Our Vision
                            </span>
                            <p className="mt-3 text-xs sm:text-sm font-semibold leading-relaxed text-[#1c1005]">
                                TCC Clinic envisions a healthy, inclusive, and empowered campus where every member has immediate access to professional care, fostering holistic well-being.
                            </p>
                            <ul className="mt-4 space-y-1.5 text-xs font-medium text-[#1c1005]/90">
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#1c1005]" />
                                    <span>Prompt and compassionate medical attention</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#1c1005]" />
                                    <span>Safe, sanitized, and well-equipped facility</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#1c1005]" />
                                    <span>Accessible guidance and prevention</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Core Values Card (Wide) */}
                <div className="mt-5 rounded-3xl border border-[#e8dfd5] bg-white p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                            Our Core Values
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-stone-700 max-w-xl leading-relaxed">
                            Every service we provide is guided by integrity, patient confidentiality, professional care, and compassionate community responsibility.
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {["Compassion", "Community-based", "Integrity", "Accountability", "Excellence"].map((v) => (
                            <span
                                key={v}
                                className="rounded-full bg-[#560616] px-4 py-1.5 text-xs font-semibold text-[#fcebe7] shadow-xs"
                            >
                                {v}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SYSTEM FEATURES & CAPABILITIES (BENTO GRID 01 - 08) ──────── */}
            <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-left border-t border-stone-200/60">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#70091f]">
                        What our system can do
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                        System features &amp;
                        <br />
                        capabilities
                    </h2>
                    <p className="mt-3 max-w-2xl text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                        Designed to meet every dimension of campus health management, from patient intake to medicine inventory tracking and reporting.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
                    {/* 01: Student Records (Maroon) */}
                    <div className="lg:col-span-5 rounded-3xl bg-[#3d040f] p-6 text-white shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-[#e5a93b]">01</span>
                        <div>
                            <h3 className="text-base font-bold text-white">Student Records</h3>
                            <p className="mt-1 text-xs text-stone-300 leading-relaxed">
                                Comprehensive digital health profiles with history, allergies, and vital tracking.
                            </p>
                        </div>
                    </div>

                    {/* 02: Clinic Visits (White) */}
                    <div className="lg:col-span-4 rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-stone-400">02</span>
                        <div>
                            <h3 className="text-base font-bold text-stone-900">Clinic Visits</h3>
                            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                                Log and track walk-in consultations with diagnosis and nurse notes.
                            </p>
                        </div>
                    </div>

                    {/* 03: Medicine Dispensary (Gold) */}
                    <div className="lg:col-span-3 rounded-3xl bg-[#e5a93b] p-6 text-[#1c1005] shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-[#1c1005]/70">03</span>
                        <div>
                            <h3 className="text-base font-bold text-[#1c1005]">Medicine Dispensary</h3>
                            <p className="mt-1 text-xs text-[#1c1005]/80 leading-relaxed">
                                Monitor current stock, expiration dates, and low-inventory alerts.
                            </p>
                        </div>
                    </div>

                    {/* 04: Reports & Analytics (White) */}
                    <div className="lg:col-span-3 rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-stone-400">04</span>
                        <div>
                            <h3 className="text-base font-bold text-stone-900">Reports &amp; Analytics</h3>
                            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                                Daily, monthly, and yearly reports on consultations and inventory.
                            </p>
                        </div>
                    </div>

                    {/* 05: Health Monitoring (Maroon) */}
                    <div className="lg:col-span-3 rounded-3xl bg-[#3d040f] p-6 text-white shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-[#e5a93b]">05</span>
                        <div>
                            <h3 className="text-base font-bold text-white">Health Monitoring</h3>
                            <p className="mt-1 text-xs text-stone-300 leading-relaxed">
                                Vital sign history, follow-up alerts, and clinical notes in one place.
                            </p>
                        </div>
                    </div>

                    {/* 06: Medical Certificates (Warm Sand) */}
                    <div className="lg:col-span-6 rounded-3xl border border-[#e3d7c5] bg-[#efe6d8] p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-[#70091f]">06</span>
                        <div>
                            <h3 className="text-base font-bold text-stone-900">Medical Certificates</h3>
                            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                                Issue and track valid certificates for academic and clearance needs.
                            </p>
                        </div>
                    </div>

                    {/* 07: Secure & Private (White) */}
                    <div className="lg:col-span-6 rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-stone-400">07</span>
                        <div>
                            <h3 className="text-base font-bold text-stone-900">Secure &amp; Private</h3>
                            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                                Role-based access with encrypted records for patient privacy.
                            </p>
                        </div>
                    </div>

                    {/* 08: Data Integrity (Maroon) */}
                    <div className="lg:col-span-6 rounded-3xl bg-[#3d040f] p-6 text-white shadow-sm flex flex-col justify-between min-h-[170px]">
                        <span className="text-xs font-extrabold text-[#e5a93b]">08</span>
                        <div>
                            <h3 className="text-base font-bold text-white">Data Integrity</h3>
                            <p className="mt-1 text-xs text-stone-300 leading-relaxed">
                                Standardized records ensure audit readiness and reliable statistics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MEET THE CLINIC TEAM ─────────────────────────────────────── */}
            <section id="team" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-left border-t border-stone-200/60">
                {/* Header & Category Switch */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#70091f]">
                            Leadership &amp; Clinical Staff
                        </p>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                            Meet the clinic team
                        </h2>
                        <p className="mt-2 max-w-xl text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                            The healthcare professionals who care for our students, faculty, and staff every day at Tagoloan Community College Clinic.
                        </p>
                    </div>

                    {/* Toggle between Clinic and Admin */}
                    <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setOrgCategory("clinic")}
                            className={[
                                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                                orgCategory === "clinic"
                                    ? "bg-[#70091f] text-white shadow-xs"
                                    : "text-stone-600 hover:text-stone-900",
                            ].join(" ")}
                        >
                            Clinic Team
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrgCategory("admin")}
                            className={[
                                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                                orgCategory === "admin"
                                    ? "bg-[#70091f] text-white shadow-xs"
                                    : "text-stone-600 hover:text-stone-900",
                            ].join(" ")}
                        >
                            Administration
                        </button>
                    </div>
                </div>

                {/* Top Executive Card (Wide Maroon Banner) */}
                {leadMember && (
                    <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#420410] via-[#540615] to-[#36040e] p-6 sm:p-7 text-white shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            {/* Gold Circle Avatar */}
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e5a93b] text-xl font-black text-[#1c080e] shadow-md ring-2 ring-white/20">
                                <span>{getInitials(leadMember.name)}</span>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e5a93b]">
                                    Head Physician / Clinic Director
                                </span>
                                <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">
                                    {leadMember.name}
                                </h3>
                                <p className="mt-0.5 text-xs text-[#fcebe7]/80">
                                    {leadMember.role} · {leadMember.credentials}
                                </p>
                                <p className="mt-1 text-[11px] text-[#fcebe7]/60">
                                    {leadMember.location} · {leadMember.dutyHours}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3-Column Grid for Clinical Staff */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {staffMembers.map((member) => (
                        <div
                            key={member.id}
                            className="rounded-3xl border border-[#e8dfd5] bg-white p-5 shadow-sm hover:border-[#70091f]/40 hover:shadow-md transition flex flex-col justify-between"
                        >
                            {/* Header row: Avatar + Name + Status */}
                            <div>
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#70091f] text-sm font-bold text-white shadow-sm ring-1 ring-white/30">
                                        <span>{getInitials(member.name)}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-stone-900 truncate">
                                            {member.name}
                                        </h4>
                                        <p className="text-xs font-semibold text-[#70091f] truncate mt-0.5">
                                            {member.role}
                                        </p>
                                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                            {member.credentials}
                                        </p>
                                    </div>
                                </div>

                                {/* Location & Hours */}
                                <div className="mt-3.5 space-y-1 text-[11px] text-stone-500 border-t border-stone-100 pt-3">
                                    <p className="truncate flex items-center gap-1.5">
                                        <MapPin size={11} className="text-stone-400 shrink-0" />
                                        <span>{member.location}</span>
                                    </p>
                                    <p className="truncate flex items-center gap-1.5">
                                        <Clock size={11} className="text-stone-400 shrink-0" />
                                        <span>{member.dutyHours}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Badges footer */}
                            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    Level {member.level}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                    {member.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CLINIC IN ACTION (2x2 GALLERY TILES) ─────────────────────── */}
            <section id="gallery" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-left border-t border-stone-200/60">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#70091f]">
                        Photo Gallery &amp; Campus Life
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                        Clinic in action
                    </h2>
                    <p className="mt-3 max-w-2xl text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                        Real moments of compassionate healthcare, clinical consultations, and student wellness services at Tagoloan Community College.
                    </p>
                </div>

                {/* 2x2 Tiles matching screenshot */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Tile 1: TCC Healthcare Team (Maroon overlay) */}
                    <div className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-[#3d040f]">
                        <img
                            src="/tcc-clinic-team.jpg"
                            alt="TCC Healthcare Team"
                            className="h-full w-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#24030a] via-[#3d040f]/60 to-transparent" />
                        <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-[#e5a93b]">
                            Campus Clinic · Baluarte
                        </span>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-lg font-bold text-white">TCC Healthcare Team</h3>
                            <p className="mt-1 text-xs text-[#fcebe7]/80">
                                Clinical staff on duty at Baluarte Campus Clinic.
                            </p>
                        </div>
                    </div>

                    {/* Tile 2: Primary Patient Care (Golden overlay) */}
                    <div className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border border-[#e5a93b]/40 bg-[#e5a93b]">
                        <img
                            src="/tcc-clinic-care.jpg"
                            alt="Primary Patient Care"
                            className="h-full w-full object-cover opacity-65 mix-blend-multiply group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#8a5d14] via-[#e5a93b]/50 to-transparent" />
                        <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-[#1c1005]">
                            Daily Clinic Routine
                        </span>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-lg font-bold text-[#1c1005]">Primary Patient Care</h3>
                            <p className="mt-1 text-xs text-[#1c1005]/80">
                                Routine consultations and vital checkups for students.
                            </p>
                        </div>
                    </div>

                    {/* Tile 3: Maternal & Child Health (Dark Burgundy) */}
                    <div className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-[#2e050e]">
                        <img
                            src="/tcc-clinic-checkup.jpg"
                            alt="Maternal & Child Health"
                            className="h-full w-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1b0308] via-[#2e050e]/60 to-transparent" />
                        <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-[#e5a93b]">
                            Specialized Services
                        </span>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-lg font-bold text-white">Maternal &amp; Child Health</h3>
                            <p className="mt-1 text-xs text-[#fcebe7]/80">
                                Prenatal counseling and maternal wellness assistance.
                            </p>
                        </div>
                    </div>

                    {/* Tile 4: Health Consultations (Warm Cream/Sand) */}
                    <div className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border border-[#e2d5c0] bg-[#e6dbcc]">
                        <img
                            src="/tcc-clinic-consult.jpg"
                            alt="Health Consultations"
                            className="h-full w-full object-cover opacity-65 mix-blend-multiply group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#6e5d48] via-[#d4c5b2]/40 to-transparent" />
                        <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-white drop-shadow">
                            Health &amp; Wellness
                        </span>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-lg font-bold text-white drop-shadow">Health Consultations</h3>
                            <p className="mt-1 text-xs text-white/90 drop-shadow">
                                Daily consultations, medication dispensing &amp; wellness guidance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CALL TO ACTION BANNER ────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#24030a] via-[#1c0207] to-[#120104] py-20 px-4 text-center text-white">
                {/* Central warm gold glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/15 blur-[100px]"
                />

                <div className="relative z-10 mx-auto max-w-2xl">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                        Ready to open your health
                        <br />
                        records?
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-[#fcebe7]/75 leading-relaxed font-normal">
                        Sign in to the clinic portal to access your records, visits, and medical certificates.
                    </p>

                    <div className="mt-7">
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="inline-flex items-center gap-2 rounded-full bg-[#e5a93b] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#1c080e] shadow-xl shadow-amber-950/60 transition hover:bg-[#d89c2f] active:scale-95"
                        >
                            <span>Access Portal</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <footer className="bg-[#120206] text-white/70 py-16 px-4 sm:px-6 border-t border-[#70091f]/40 text-left">
                <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Col 1: TCC Identity */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3">
                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Logo"
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#e5a93b]/70 shrink-0"
                            />
                            <div className="leading-tight">
                                <p className="text-sm font-bold text-white">
                                    Tagoloan Community College
                                </p>
                                <p className="text-xs text-[#e5a93b] font-medium">
                                    Health Services Clinic
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-white/60 leading-relaxed max-w-sm">
                            An institution committed to accessible healthcare, student well-being, and community excellence under Vincit Omnia Veritas.
                        </p>
                    </div>

                    {/* Col 2: Hours & Contact */}
                    <div className="md:col-span-4 text-xs space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#e5a93b]">
                            Hours and Contact
                        </p>
                        <p className="text-white/80">Baluarte Campus Clinic</p>
                        <p className="text-white/60">Baluarte, Tagoloan, Misamis Oriental, Philippines</p>
                        <p className="text-white/60">Mon - Fri · 8:00 AM - 5:00 PM</p>
                        <p className="text-white/60">Emergency Local Ext: +63 (088) 555-0100</p>
                    </div>

                    {/* Col 3: Quick Links */}
                    <div className="md:col-span-3 text-xs space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#e5a93b]">
                            Quick Links
                        </p>
                        <ul className="space-y-1.5 text-white/60">
                            <li>
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="hover:text-[#e5a93b] transition"
                                >
                                    Access Portal
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#features")}
                                    className="hover:text-[#e5a93b] transition"
                                >
                                    System Features
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#team")}
                                    className="hover:text-[#e5a93b] transition"
                                >
                                    Clinic Team
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#hero")}
                                    className="hover:text-[#e5a93b] transition"
                                >
                                    Back to Top ↑
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="mx-auto max-w-6xl mt-12 pt-6 border-t border-white/10 text-center text-[11px] text-white/40">
                    © 2026 Tagoloan Community College Clinic. All rights reserved. Baluarte, Tagoloan, Misamis Oriental.
                </div>
            </footer>
        </div>
    );
}
