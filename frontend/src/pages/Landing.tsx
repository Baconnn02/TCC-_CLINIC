import React, { useState, useEffect } from "react";
import { ORG_DATA, loadStoredOrgData, type OrgCategory } from "./Organization";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    ArrowRight,
    ArrowUpRight,
    MapPin,
    Clock,
    Heart,
    HeartPulse,
    ShieldCheck,
    Award,
    Building2,
    CheckCircle2,
    Users,
    ClipboardList,
    Pill,
    BarChart3,
    Activity,
    FileText,
    FileCheck,
    Database,
    Sparkles,
    Maximize2,
} from "lucide-react";

/* ─── Smooth Scroll Helper ─────────────────────────────────────────────────── */
function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

interface GalleryItem {
    id: string;
    title: string;
    subtitle: string;
    tag: string;
    src: string;
    overlayGradient: string;
    badgeStyle: string;
    textColor: string;
    subtextColor: string;
}

export default function Landing(): React.JSX.Element {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [orgCategory, setOrgCategory] = useState<OrgCategory>("clinic");
    const [orgData, setOrgData] = useState(() => loadStoredOrgData());
    const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

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

    const goToLogin = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/login");
        }, 450);
    };

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

    /* Gallery Items Data */
    const galleryItems: GalleryItem[] = [
        {
            id: "team",
            title: "TCC Healthcare Team",
            subtitle: "Clinical staff and duty nurses ensuring health security at Baluarte Campus.",
            tag: "Campus Clinic · Baluarte",
            src: "/tcc-clinic-team.jpg",
            overlayGradient: "from-[#24030a] via-[#3d040f]/60 to-transparent",
            badgeStyle: "text-[#e5a93b] bg-black/40 backdrop-blur-xs border border-[#e5a93b]/30",
            textColor: "text-white",
            subtextColor: "text-[#fcebe7]/80",
        },
        {
            id: "care",
            title: "Primary Patient Care",
            subtitle: "Routine consultations, diagnostic assessments, and vital checkups for students.",
            tag: "Daily Clinic Routine",
            src: "/tcc-clinic-care.jpg",
            overlayGradient: "from-[#6e460b] via-[#e5a93b]/50 to-transparent",
            badgeStyle: "text-[#1c1005] bg-white/60 backdrop-blur-xs border border-white/40",
            textColor: "text-[#1c1005]",
            subtextColor: "text-[#1c1005]/85",
        },
        {
            id: "maternal",
            title: "Maternal & Child Health",
            subtitle: "Dedicated health counseling, reproductive education, and maternal wellness guidance.",
            tag: "Specialized Services",
            src: "/tcc-clinic-checkup.jpg",
            overlayGradient: "from-[#1b0308] via-[#2e050e]/60 to-transparent",
            badgeStyle: "text-[#e5a93b] bg-black/40 backdrop-blur-xs border border-[#e5a93b]/30",
            textColor: "text-white",
            subtextColor: "text-[#fcebe7]/80",
        },
        {
            id: "consult",
            title: "Health Consultations",
            subtitle: "Confidential walk-in consultations, free medicine dispensary, and personalized care.",
            tag: "Health & Wellness",
            src: "/tcc-clinic-consult.jpg",
            overlayGradient: "from-[#574837] via-[#cfc0ac]/40 to-transparent",
            badgeStyle: "text-white bg-black/40 backdrop-blur-xs border border-white/30",
            textColor: "text-white",
            subtextColor: "text-white/90",
        },
    ];

    return (
        <div className="min-h-screen bg-[#140206] font-[system-ui,_-apple-system,_sans-serif] text-white selection:bg-[#e5a93b] selection:text-[#1c080e]">
            {/* ── HEADER / FLOATING PILL NAVBAR ─────────────────────────── */}
            <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
                <div
                    className={[
                        "pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-4 sm:px-6 py-2 sm:py-2.5 transition-all duration-300",
                        scrolled
                            ? "bg-[#180307]/95 border border-[#70091f]/70 shadow-2xl shadow-black/60 backdrop-blur-md text-white"
                            : "bg-[#1d0309]/85 border border-[#70091f]/60 shadow-xl shadow-black/40 backdrop-blur-md text-white",
                    ].join(" ")}
                >
                    {/* Brand */}
                    <div
                        onClick={() => scrollTo("#hero")}
                        className="flex items-center gap-2.5 cursor-pointer select-none text-left group"
                    >
                        <div className="relative">
                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Logo"
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-[#e5a93b]/50 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-[#e5a93b] transition-colors">
                                Tagoloan Community College
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-medium text-[#e5a93b]">
                                Clinic Management System
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        <button
                            type="button"
                            onClick={() => scrollTo("#about")}
                            className="text-xs font-semibold text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200 cursor-pointer"
                        >
                            About
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#features")}
                            className="text-xs font-semibold text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200 cursor-pointer"
                        >
                            Features
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#team")}
                            className="text-xs font-semibold text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200 cursor-pointer"
                        >
                            Team
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#gallery")}
                            className="text-xs font-semibold text-[#fcebe7]/85 hover:text-[#e5a93b] transition duration-200 cursor-pointer"
                        >
                            Clinic in Action
                        </button>

                        {/* Sign In Button */}
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#e5a93b] px-5 py-2 text-xs font-bold text-[#1c080e] shadow-md shadow-amber-950/40 hover:bg-[#f0b445] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Sign In</span>
                            <ArrowRight size={13} />
                        </button>
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-full p-2 text-white hover:bg-white/10 md:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Drawer */}
                {menuOpen && (
                    <div className="pointer-events-auto absolute top-16 inset-x-4 max-w-md mx-auto rounded-3xl border border-[#70091f]/60 bg-[#1d0309]/98 p-5 shadow-2xl md:hidden backdrop-blur-xl animate-fadeIn text-left text-white">
                        <div className="flex flex-col space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#about");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1 text-left"
                            >
                                About TCC Clinic
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#features");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1 text-left"
                            >
                                Features &amp; Capabilities
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#team");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1 text-left"
                            >
                                Meet the Clinic Team
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollTo("#gallery");
                                    setMenuOpen(false);
                                }}
                                className="text-sm font-semibold text-[#fcebe7] hover:text-[#e5a93b] py-1 text-left"
                            >
                                Clinic in Action
                            </button>
                            <button
                                type="button"
                                onClick={goToLogin}
                                className="mt-2 w-full rounded-full bg-[#e5a93b] py-2.5 text-xs font-bold text-[#1c080e] shadow-md hover:bg-[#d89c2f]"
                            >
                                Sign In to Portal
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── HERO SECTION (RICH ILLUMINATED MAROON) ───────────────────── */}
            <section
                id="hero"
                className="relative overflow-hidden bg-gradient-to-b from-[#24040c] via-[#1c0309] to-[#140206] pt-28 sm:pt-36 pb-20 text-center text-white"
            >
                {/* Ambient Glowing Orbs */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -left-24 h-[440px] w-[440px] rounded-full bg-[#70091f]/40 blur-[130px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-12 -right-24 h-[460px] w-[460px] rounded-full bg-amber-500/18 blur-[140px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[320px] w-[640px] rounded-full bg-amber-400/10 blur-[120px]"
                />

                {/* TCC Logo Watermark Background Overlay */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0"
                >
                    <img
                        src="/tcc-logo.jpg"
                        alt=""
                        className="h-[500px] w-[500px] sm:h-[640px] sm:w-[640px] lg:h-[760px] lg:w-[760px] rounded-full object-cover opacity-[0.08] mix-blend-screen filter contrast-125"
                    />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16">
                    {/* Top Accreditation Pill with Live Pulse Dot */}
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5a93b]/40 bg-[#e5a93b]/10 px-4 py-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#f5c358] shadow-xs backdrop-blur-md">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>ALCUCOA-Accredited · Baluarte Campus · Est. 2003</span>
                    </div>

                    {/* Central Headline with Floating Orbiting Badges */}
                    <div className="relative mx-auto max-w-4xl py-2">
                        {/* Orbiting Badges (Desktop/Tablet) */}
                        <div className="hidden sm:block pointer-events-none">
                            {/* Student Records (Top Left) */}
                            <span className="animate-float-slow absolute -top-3 left-0 lg:-left-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-black/25 backdrop-blur-md">
                                <ClipboardList className="h-3.5 w-3.5 text-[#e5a93b]" />
                                <span>Student Records</span>
                            </span>

                            {/* Clinic Visits (Mid Left) */}
                            <span className="animate-float-reverse absolute top-18 left-4 lg:-left-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-black/25 backdrop-blur-md">
                                <Activity className="h-3.5 w-3.5 text-[#e5a93b]" />
                                <span>Clinic Visits</span>
                            </span>

                            {/* Medicine Inventory (Top Right) */}
                            <span className="animate-float-slow absolute -top-1 right-2 lg:-right-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-black/25 backdrop-blur-md">
                                <Pill className="h-3.5 w-3.5 text-[#e5a93b]" />
                                <span>Medicine Inventory</span>
                            </span>

                            {/* Medical Certificates (Mid Right) */}
                            <span className="animate-float-reverse absolute top-20 right-4 lg:right-0 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-black/25 backdrop-blur-md">
                                <FileCheck className="h-3.5 w-3.5 text-[#e5a93b]" />
                                <span>Medical Certificates</span>
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.06]">
                            Your health begins
                            <br />
                            <span className="bg-gradient-to-r from-[#e5a93b] via-[#f7b944] to-[#f49342] bg-clip-text text-transparent">
                                here in Tagoloan.
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle description */}
                    <p className="mt-5 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed text-[#fcebe7]/85 font-normal">
                        The TCC Clinic cares for the health and well-being of every student, faculty and staff member, with accessible records, primary consultations and trusted healthcare on campus.
                    </p>

                    {/* Action buttons */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="group inline-flex items-center gap-2 rounded-full bg-[#e5a93b] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#1c080e] shadow-xl shadow-amber-950/60 transition-all duration-200 hover:bg-[#f0b445] hover:shadow-2xl hover:scale-[1.03] active:scale-95 cursor-pointer"
                        >
                            <span>Access Clinic Portal</span>
                            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#about")}
                            className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs backdrop-blur-xs transition hover:bg-white/20 active:scale-95 cursor-pointer"
                        >
                            Explore Services
                        </button>
                    </div>

                    {/* 3-Card Bottom Layout (Maroon, Tall Center Gold Arch, Deep Wine) */}
                    <div className="mt-14 relative mx-auto max-w-4xl flex items-end justify-center gap-3 sm:gap-6">
                        {/* Left Card: Rounded Maroon */}
                        <div className="group relative h-56 sm:h-64 lg:h-72 w-1/3 rounded-3xl overflow-hidden shadow-lg border border-white/15 bg-gradient-to-br from-[#9c182f] to-[#70091f]">
                            <img
                                src="/tcc-clinic-team.jpg"
                                alt="Campus Clinical Training"
                                className="h-full w-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-110 group-hover:opacity-80 transition duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#5c0819] via-transparent to-transparent" />
                            <span className="absolute bottom-4 inset-x-2 text-center text-[10px] sm:text-[11px] font-bold text-white/90">
                                Campus clinical training
                            </span>
                        </div>

                        {/* Center Card: Tall Arch in Warm Gold */}
                        <div className="group relative h-72 sm:h-84 lg:h-96 w-1/3 rounded-t-[140px] rounded-b-3xl overflow-hidden shadow-2xl border-2 border-[#e5a93b]/70 bg-gradient-to-b from-[#f3a83b] to-[#d48b1c]">
                            <img
                                src="/tcc-clinic-care.jpg"
                                alt="Primary Care"
                                className="h-full w-full object-cover opacity-75 mix-blend-multiply group-hover:scale-110 group-hover:opacity-95 transition duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#8a5d14]/75 via-transparent to-transparent" />
                            <div className="absolute top-4 inset-x-0 flex justify-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-[#1c1005] shadow-sm backdrop-blur-xs">
                                    <Sparkles size={11} className="text-amber-600" />
                                    <span>Primary Care</span>
                                </span>
                            </div>
                        </div>

                        {/* Right Card: Rounded Deep Wine Maroon */}
                        <div className="group relative h-56 sm:h-64 lg:h-72 w-1/3 rounded-3xl overflow-hidden shadow-lg border border-white/15 bg-gradient-to-br from-[#520514] to-[#36030c]">
                            <img
                                src="/tcc-clinic-checkup.jpg"
                                alt="Clinic Consultations"
                                className="h-full w-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-110 group-hover:opacity-80 transition duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2e030c] via-transparent to-transparent" />
                            <span className="absolute bottom-4 inset-x-2 text-center text-[10px] sm:text-[11px] font-bold text-white/90">
                                Photo: clinic consultation
                            </span>
                        </div>
                    </div>

                    {/* Floating Glass Featured Story Card */}
                    <div className="relative mx-auto -mt-10 sm:-mt-14 max-w-xl rounded-2xl bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-black/25 border border-white text-left z-20 text-stone-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#70091f]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Featured Clinic Story · Clinical Practice</span>
                            </div>
                            <span className="text-[10px] font-bold text-stone-400">Baluarte Campus</span>
                        </div>
                        <h2 className="mt-1.5 text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                            TCC Midwifery &amp; Nursing Students in Clinical Training
                        </h2>
                        <p className="mt-1 text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                            Dedicated healthcare students performing vital sign checkups and maternal health monitoring at the Baluarte Campus Clinic.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── GOLDEN MARQUEE TICKER ─────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-[#e5a93b] py-3.5 border-y border-[#d89c2f] marquee-mask">
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
                    {/* Duplicate for seamless loop */}
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
            <section id="about" className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 py-20 text-left bg-[#140206] text-white">
                {/* Header */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#e5a93b]">
                        Who we are &amp; what we do
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-4xl font-black text-white tracking-tight">
                        About TCC Clinic
                    </h2>
                    <p className="mt-3 max-w-4xl text-xs sm:text-sm md:text-base text-[#fcebe7]/80 leading-relaxed font-normal">
                        At TCC Clinic, we believe that education begins with good health. Serving the entire Tagoloan Community College community through immediate, accessible, and dedicated care, we provide routine treatments, preventative guidance, and medical triage for emergencies so that our scholars and mentors can pursue excellence unhindered.
                    </p>
                </div>

                {/* 2-Card Top Grid: Mission & Vision */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Mission Card (Deep Maroon) */}
                    <div className="group lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#450512] to-[#250309] p-7 sm:p-9 text-white shadow-xl border border-[#70091f]/60 hover:shadow-2xl hover:border-[#e5a93b]/50 transition-all duration-300 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
                        <div
                            className="pointer-events-none absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-2xl"
                            aria-hidden="true"
                        />
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#fcebe7] border border-white/15">
                                <Sparkles size={11} className="text-[#e5a93b]" />
                                <span>Our Mission</span>
                            </span>
                            <p className="mt-5 text-lg sm:text-2xl font-bold leading-snug text-white">
                                A premier community-based institution providing accessible, quality healthcare services to every student and staff of Tagoloan Community College.
                            </p>
                        </div>
                    </div>

                    {/* Vision Card (Warm Gold) */}
                    <div className="group lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#f0b144] to-[#d89324] p-7 sm:p-9 text-[#1c1005] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[240px]">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c1005]/10 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1c1005] border border-[#1c1005]/15">
                                <Award size={11} />
                                <span>Our Vision</span>
                            </span>
                            <p className="mt-4 text-xs sm:text-sm font-semibold leading-relaxed text-[#1c1005]">
                                TCC Clinic envisions a healthy, inclusive, and empowered campus where every member has immediate access to professional care, fostering holistic well-being.
                            </p>
                            <ul className="mt-4 space-y-2 text-xs font-medium text-[#1c1005]/95">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-[#1c1005] shrink-0" />
                                    <span>Prompt and compassionate medical attention</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-[#1c1005] shrink-0" />
                                    <span>Safe, sanitized, and well-equipped facility</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-[#1c1005] shrink-0" />
                                    <span>Accessible guidance and prevention</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Core Values Card (Wide with Visual Icon Badges) */}
                <div className="mt-5 rounded-3xl border border-[#70091f]/60 bg-[#1d0309] p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#e5a93b]">
                            Guiding Principles
                        </p>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                            Our Core Institutional Values
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-[#fcebe7]/80 max-w-xl leading-relaxed">
                            Every service we provide is guided by integrity, patient confidentiality, professional care, and compassionate community responsibility.
                        </p>
                    </div>

                    {/* Interactive Value Badges */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70091f] px-4 py-2 text-xs font-semibold text-[#fcebe7] border border-[#e5a93b]/30 shadow-xs hover:bg-[#850b25] transition">
                            <Heart size={12} className="text-rose-300" />
                            <span>Compassion</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70091f] px-4 py-2 text-xs font-semibold text-[#fcebe7] border border-[#e5a93b]/30 shadow-xs hover:bg-[#850b25] transition">
                            <Building2 size={12} className="text-amber-300" />
                            <span>Community-based</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70091f] px-4 py-2 text-xs font-semibold text-[#fcebe7] border border-[#e5a93b]/30 shadow-xs hover:bg-[#850b25] transition">
                            <ShieldCheck size={12} className="text-emerald-300" />
                            <span>Integrity</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70091f] px-4 py-2 text-xs font-semibold text-[#fcebe7] border border-[#e5a93b]/30 shadow-xs hover:bg-[#850b25] transition">
                            <CheckCircle2 size={12} className="text-sky-300" />
                            <span>Accountability</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#70091f] px-4 py-2 text-xs font-semibold text-[#fcebe7] border border-[#e5a93b]/30 shadow-xs hover:bg-[#850b25] transition">
                            <Award size={12} className="text-amber-300" />
                            <span>Excellence</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* ── SYSTEM FEATURES & CAPABILITIES (BENTO GRID 01 - 08) ──────── */}
            <section id="features" className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 py-20 text-left border-t border-[#70091f]/40 bg-[#160207] text-white">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#e5a93b]">
                        What our system can do
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-4xl font-black text-white tracking-tight">
                        System features &amp; capabilities
                    </h2>
                    <p className="mt-3 max-w-3xl text-xs sm:text-sm md:text-base text-[#fcebe7]/80 leading-relaxed font-normal">
                        Designed to meet every dimension of campus health management, from patient intake to medicine inventory tracking, clinical consultations, and reporting.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
                    {/* 01: Student Records (Maroon) */}
                    <div className="group lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#3d040f] to-[#250209] border border-[#70091f]/60 p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">01</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#e5a93b] backdrop-blur-xs">
                                <ClipboardList size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Student Records
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Comprehensive digital health profiles with history, allergies, emergency contacts, and vital sign history.
                            </p>
                        </div>
                    </div>

                    {/* 02: Clinic Visits (Maroon Card) */}
                    <div className="group lg:col-span-4 rounded-3xl border border-[#70091f]/60 bg-[#1e0309] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">02</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#70091f]/40 text-[#e5a93b]">
                                <Activity size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Clinic Visits
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Fast walk-in logging, symptom triage, diagnosis recording, and instant clinical nurse notes.
                            </p>
                        </div>
                    </div>

                    {/* 03: Medicine Dispensary (Gold) */}
                    <div className="group lg:col-span-3 rounded-3xl bg-gradient-to-br from-[#e5a93b] to-[#d69527] p-6 sm:p-7 text-[#1c1005] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#1c1005]/70">03</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1c1005]/10 text-[#1c1005]">
                                <Pill size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1c1005]">
                                Medicine Dispensary
                            </h3>
                            <p className="mt-1.5 text-xs text-[#1c1005]/85 leading-relaxed">
                                Monitor real-time stocks, batch expiry tracking, and automated low-inventory alerts.
                            </p>
                        </div>
                    </div>

                    {/* 04: Reports & Analytics (Maroon Card) */}
                    <div className="group lg:col-span-3 rounded-3xl border border-[#70091f]/60 bg-[#1e0309] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">04</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#70091f]/40 text-[#e5a93b]">
                                <BarChart3 size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Reports &amp; Analytics
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Daily, monthly, and yearly reports on consultations, demographics, and medication usage.
                            </p>
                        </div>
                    </div>

                    {/* 05: Health Monitoring (Maroon) */}
                    <div className="group lg:col-span-3 rounded-3xl bg-gradient-to-br from-[#3d040f] to-[#250209] border border-[#70091f]/60 p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">05</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#e5a93b]">
                                <HeartPulse size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Health Monitoring
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Continuous vital sign history, follow-up flags, and personalized health guidance.
                            </p>
                        </div>
                    </div>

                    {/* 06: Medical Certificates (Warm Crimson) */}
                    <div className="group lg:col-span-6 rounded-3xl border border-[#70091f]/60 bg-[#2a040e] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">06</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#70091f]/40 text-[#e5a93b]">
                                <FileCheck size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Medical Certificates
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Issue, print, and track authenticated medical clearances for student academic and institutional requirements.
                            </p>
                        </div>
                    </div>

                    {/* 07: Secure & Private (Maroon Card) */}
                    <div className="group lg:col-span-6 rounded-3xl border border-[#70091f]/60 bg-[#1e0309] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">07</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#70091f]/40 text-[#e5a93b]">
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Secure &amp; Private
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Role-based access control with encrypted health records enforcing strict student privacy and data integrity.
                            </p>
                        </div>
                    </div>

                    {/* 08: Data Integrity (Maroon) */}
                    <div className="group lg:col-span-6 rounded-3xl bg-gradient-to-br from-[#3d040f] to-[#250209] border border-[#70091f]/60 p-6 sm:p-7 text-white shadow-xl hover:shadow-2xl hover:border-[#e5a93b]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#e5a93b]">08</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#e5a93b]">
                                <Database size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e5a93b] transition-colors">
                                Data Integrity
                            </h3>
                            <p className="mt-1.5 text-xs text-[#fcebe7]/75 leading-relaxed">
                                Standardized clinical ledgers ensure full audit readiness, compliance, and accurate health statistics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MEET THE CLINIC TEAM ─────────────────────────────────────── */}
            <section id="team" className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 py-20 text-left border-t border-[#70091f]/40 bg-[#140206] text-white">
                {/* Header & Category Switch */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#e5a93b]">
                            Leadership &amp; Clinical Staff
                        </p>
                        <h2 className="mt-1 text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Meet the clinic team
                        </h2>
                        <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#fcebe7]/80 leading-relaxed font-normal">
                            The healthcare professionals who care for our students, faculty, and staff every day at Tagoloan Community College Clinic.
                        </p>
                    </div>

                    {/* Toggle between Clinic and Admin */}
                    <div className="inline-flex rounded-full border border-[#70091f]/60 bg-[#1e0309] p-1.5 shadow-md">
                        <button
                            type="button"
                            onClick={() => setOrgCategory("clinic")}
                            className={[
                                "rounded-full px-4 py-1.5 text-xs font-bold transition duration-200 cursor-pointer",
                                orgCategory === "clinic"
                                    ? "bg-[#e5a93b] text-[#1c080e] shadow-xs"
                                    : "text-[#fcebe7]/75 hover:text-white",
                            ].join(" ")}
                        >
                            Clinic Team
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrgCategory("admin")}
                            className={[
                                "rounded-full px-4 py-1.5 text-xs font-bold transition duration-200 cursor-pointer",
                                orgCategory === "admin"
                                    ? "bg-[#e5a93b] text-[#1c080e] shadow-xs"
                                    : "text-[#fcebe7]/75 hover:text-white",
                            ].join(" ")}
                        >
                            Administration
                        </button>
                    </div>
                </div>

                {/* Top Executive Card (Lead Physician Banner) */}
                {leadMember && (
                    <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#440511] via-[#540716] to-[#36040d] p-6 sm:p-8 text-white shadow-2xl border border-[#70091f]/60 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 relative z-10">
                            {/* Gold Circle Avatar */}
                            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fcd34d] via-[#e5a93b] to-[#b45309] text-2xl font-black text-[#1c080e] shadow-xl ring-4 ring-[#e5a93b]/40">
                                <span>{getInitials(leadMember.name)}</span>
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e5a93b] border border-[#e5a93b]/30">
                                        Head Physician / Clinic Director
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        Active On Duty
                                    </span>
                                </div>
                                <h3 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    {leadMember.name}
                                </h3>
                                <p className="mt-0.5 text-xs sm:text-sm text-[#fcebe7]/90 font-medium">
                                    {leadMember.role} · {leadMember.credentials}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#fcebe7]/70">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={12} className="text-[#e5a93b]" />
                                        <span>{leadMember.location}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-[#e5a93b]" />
                                        <span>{leadMember.dutyHours}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3-Column Grid for Clinical Staff */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {staffMembers.map((member) => (
                        <div
                            key={member.id}
                            className="group rounded-3xl border border-[#70091f]/50 bg-[#1e0309] p-5 sm:p-6 shadow-xl hover:border-[#e5a93b]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-white"
                        >
                            {/* Header row: Avatar + Name + Status */}
                            <div>
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#70091f] to-[#92102b] text-base font-bold text-white shadow-sm ring-2 ring-[#e5a93b]/30 group-hover:scale-105 transition-transform">
                                        <span>{getInitials(member.name)}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#e5a93b] transition-colors">
                                            {member.name}
                                        </h4>
                                        <p className="text-xs font-semibold text-[#e5a93b] truncate mt-0.5">
                                            {member.role}
                                        </p>
                                        <p className="text-[11px] text-[#fcebe7]/60 truncate mt-0.5">
                                            {member.credentials}
                                        </p>
                                    </div>
                                </div>

                                {/* Location & Hours */}
                                <div className="mt-4 space-y-1.5 text-[11px] text-[#fcebe7]/75 border-t border-[#70091f]/30 pt-3.5">
                                    <p className="truncate flex items-center gap-1.5">
                                        <MapPin size={12} className="text-[#e5a93b] shrink-0" />
                                        <span>{member.location}</span>
                                    </p>
                                    <p className="truncate flex items-center gap-1.5">
                                        <Clock size={12} className="text-[#e5a93b] shrink-0" />
                                        <span>{member.dutyHours}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Badges footer */}
                            <div className="mt-4 flex items-center justify-between border-t border-[#70091f]/30 pt-3 text-xs">
                                <span className="text-[10px] font-bold text-[#fcebe7]/50 uppercase tracking-widest">
                                    Level {member.level}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/40">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {member.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CLINIC IN ACTION (GALLERY TILES WITH LIGHTBOX) ────────────── */}
            <section id="gallery" className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 py-20 text-left border-t border-[#70091f]/40 bg-[#160207] text-white">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#e5a93b]">
                            Photo Gallery &amp; Campus Life
                        </p>
                        <h2 className="mt-1 text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Clinic in action
                        </h2>
                        <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[#fcebe7]/80 leading-relaxed font-normal">
                            Real moments of compassionate healthcare, clinical consultations, and student wellness services at Tagoloan Community College.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-[#e5a93b]/70">
                        Click any photo to preview
                    </span>
                </div>

                {/* 2x2 Gallery Grid */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {galleryItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedPhoto(item)}
                            className="group relative h-72 sm:h-80 lg:h-92 rounded-3xl overflow-hidden shadow-2xl border border-[#70091f]/50 hover:border-[#e5a93b]/60 transition-all duration-500 cursor-pointer"
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${item.overlayGradient}`} />
                            
                            {/* Top Badge */}
                            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${item.badgeStyle}`}>
                                    {item.tag}
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={14} />
                                </div>
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className={`text-lg sm:text-xl font-bold ${item.textColor} drop-shadow-xs`}>
                                    {item.title}
                                </h3>
                                <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${item.subtextColor} drop-shadow-xs line-clamp-2`}>
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PHOTO LIGHTBOX MODAL ──────────────────────────────────────── */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-stone-900 text-white shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            aria-label="Close"
                            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                        >
                            <X size={18} />
                        </button>
                        <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
                            <img
                                src={selectedPhoto.src}
                                alt={selectedPhoto.title}
                                className="w-full h-full object-contain max-h-[70vh]"
                            />
                        </div>
                        <div className="p-6 bg-stone-950 text-left">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e5a93b]">
                                {selectedPhoto.tag}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                                {selectedPhoto.title}
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-stone-300 leading-relaxed">
                                {selectedPhoto.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CAMPUS WALK-IN & FIRST-AID CALLOUT BANNER ─────────────────── */}
            <section className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 py-8">
                <div className="rounded-3xl border border-[#e5a93b]/40 bg-gradient-to-r from-[#32060f] via-[#24040c] to-[#1a0308] p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl text-white">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#70091f] text-white shadow-md border border-[#e5a93b]/30">
                            <HeartPulse size={22} className="text-[#e5a93b]" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base sm:text-lg font-bold text-white">
                                Need Immediate First-Aid or Consultation on Campus?
                            </h3>
                            <p className="mt-0.5 text-xs sm:text-sm text-[#fcebe7]/80">
                                Walk-ins are always welcomed at Baluarte Campus Clinic (Ground Floor Main Building).
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="inline-flex items-center gap-2 rounded-full bg-[#e5a93b] px-6 py-2.5 text-xs font-bold text-[#1c080e] shadow-md hover:bg-[#d89c2f] transition active:scale-95 cursor-pointer"
                        >
                            <span>Access Portal</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── CALL TO ACTION SECTION ───────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#24030a] via-[#1c0207] to-[#120104] py-24 px-4 text-center text-white">
                {/* Central warm gold glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-500/20 blur-[110px]"
                />

                {/* TCC Logo Watermark Background Overlay */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0"
                >
                    <img
                        src="/tcc-logo.jpg"
                        alt=""
                        className="h-[420px] w-[420px] sm:h-[540px] sm:w-[540px] rounded-full object-cover opacity-[0.06] mix-blend-screen filter contrast-125"
                    />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-3xl px-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e5a93b] backdrop-blur-xs">
                        <Sparkles size={12} />
                        <span>Empowering Student Health</span>
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                        Ready to open your health
                        <br />
                        records?
                    </h2>
                    <p className="mt-4 text-xs sm:text-sm md:text-base text-[#fcebe7]/80 leading-relaxed font-normal max-w-xl mx-auto">
                        Sign in to the clinic portal to access your records, clinical visits, vital histories, and medical certificates anytime.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="inline-flex items-center gap-2 rounded-full bg-[#e5a93b] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#1c080e] shadow-xl shadow-amber-950/60 transition hover:bg-[#d89c2f] hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <span>Access Clinic Portal</span>
                            <ArrowRight size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo("#hero")}
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 active:scale-95 cursor-pointer"
                        >
                            <span>Back to Top</span>
                            <ArrowUpRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <footer className="bg-[#120206] text-white/70 py-16 px-4 sm:px-6 border-t border-[#70091f]/40 text-left">
                <div className="mx-auto w-full max-w-[1700px] grid grid-cols-1 md:grid-cols-12 gap-10 px-6 sm:px-10 lg:px-16">
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
                                    className="hover:text-[#e5a93b] transition cursor-pointer"
                                >
                                    Access Portal
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#features")}
                                    className="hover:text-[#e5a93b] transition cursor-pointer"
                                >
                                    System Features
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#team")}
                                    className="hover:text-[#e5a93b] transition cursor-pointer"
                                >
                                    Clinic Team
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("#hero")}
                                    className="hover:text-[#e5a93b] transition cursor-pointer"
                                >
                                    Back to Top ↑
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="mx-auto w-full max-w-[1700px] mt-12 pt-6 border-t border-white/10 text-center text-[11px] text-white/40 px-6 sm:px-10 lg:px-16">
                    © 2026 Tagoloan Community College Clinic. All rights reserved. Baluarte, Tagoloan, Misamis Oriental.
                </div>
            </footer>

            {/* ── PORTAL TRANSITION OVERLAY ────────────────────────────── */}
            {isTransitioning && (
                <div
                    aria-live="polite"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#190308]/95 backdrop-blur-xl tcc-portal-overlay"
                >
                    <div className="relative flex flex-col items-center text-center tcc-portal-logo-glow">
                        {/* Glowing radial light behind logo */}
                        <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-r from-[#d4a017]/40 to-[#70091f]/60 blur-3xl animate-pulse" />

                        {/* Animated TCC Logo with glowing golden ring */}
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#70091f] shadow-2xl ring-4 ring-[#e5a93b]/90 transition-transform duration-500 scale-105">
                            <img
                                src="/tcc-logo.jpg"
                                alt="TCC Logo"
                                className="h-20 w-20 rounded-full object-cover shadow-inner"
                            />
                        </div>

                        {/* Text */}
                        <h3 className="mt-5 text-base font-bold tracking-tight text-white sm:text-lg">
                            Entering Clinic Portal
                        </h3>
                        <p className="mt-1 text-xs text-[#fcebe7]/75">
                            Tagoloan Community College · Health Services
                        </p>

                        {/* Animated loading dots */}
                        <div className="mt-5 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#e5a93b] animate-bounce" />
                            <span className="h-2 w-2 rounded-full bg-[#e5a93b] animate-bounce [animation-delay:0.15s]" />
                            <span className="h-2 w-2 rounded-full bg-[#e5a93b] animate-bounce [animation-delay:0.3s]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
