import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    ArrowRight,
    ChevronDown,
    Users,
    Pill,
    ClipboardList,
    BarChart3,
    Shield,
    Heart,
    Eye,
    Target,
    Activity,
    FileText,
    Lock,
    Play,
    MapPin,
    BookOpen,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Feature {
    icon: React.ReactNode;
    label: string;
    description: string;
}

interface NavLink {
    label: string;
    href: string;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const NAV_LINKS: NavLink[] = [
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
];

const FEATURES: Feature[] = [
    {
        icon: <Users size={26} />,
        label: "Student Records",
        description:
            "Maintain comprehensive health profiles for every student and faculty member.",
    },
    {
        icon: <ClipboardList size={26} />,
        label: "Clinic Visits",
        description:
            "Log, track, and manage every clinic consultation with detailed visit records.",
    },
    {
        icon: <Pill size={26} />,
        label: "Medicine Inventory",
        description:
            "Monitor medicine stock levels, dispense medications, and receive low-stock alerts.",
    },
    {
        icon: <BarChart3 size={26} />,
        label: "Reports & Analytics",
        description:
            "Generate insightful health trend reports to support informed decisions.",
    },
    {
        icon: <Activity size={26} />,
        label: "Health Monitoring",
        description:
            "Track vital signs, diagnoses, and treatment histories in one place.",
    },
    {
        icon: <FileText size={26} />,
        label: "Medical Certificates",
        description:
            "Issue and manage medical certificates and documentation efficiently.",
    },
    {
        icon: <Shield size={26} />,
        label: "Secure & Private",
        description:
            "Role-based access control keeps sensitive health data protected at all times.",
    },
    {
        icon: <Lock size={26} />,
        label: "Data Integrity",
        description:
            "Transactional updates and audit trails ensure accurate and reliable records.",
    },
];

const ABOUT_CARDS = [
    {
        icon: <Eye size={26} />,
        title: "Vision",
        body: "A premier community-based institution providing accessible, quality healthcare services to every student and staff of Tagoloan Community College.",
        extra: null as string[] | null,
    },
    {
        icon: <Target size={26} />,
        title: "Mission",
        body: "TCC Clinic provides quality, compassionate, and efficient health services to support the academic journey of students and the well-being of staff.",
        extra: [
            "Quality first-aid and primary healthcare",
            "Timely medicine dispensing",
            "Accurate health record management",
            "Health education and promotion",
        ],
    },
    {
        icon: <Heart size={26} />,
        title: "Core Values",
        body: '"Education is a success if and when the people live a decent and prosperous life through adherence to standards of morality and competent practice."',
        extra: null,
        badges: [
            "Compassion",
            "Community-Based",
            "Integrity",
            "Accountability",
            "Excellence",
        ],
    },
];

/* ─── Scroll helper ───────────────────────────────────────────────────────── */
function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function Landing(): React.JSX.Element {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    /* Navbar shadow on scroll */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close mobile menu on resize */
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const goToLogin = () => navigate("/login");

    return (
        <div className="min-h-screen bg-[#160408] font-[system-ui,_-apple-system,_sans-serif] text-white">
            {/* ── NAVBAR ──────────────────────────────────────────────── */}
            <nav
                className={[
                    "fixed top-0 z-50 w-full transition-all duration-300",
                    scrolled
                        ? "border-b border-[#70091f]/40 bg-[#1e050b]/95 shadow-lg backdrop-blur-md"
                        : "border-b border-white/10 bg-[#160408]/75 backdrop-blur-md",
                ].join(" ")}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#d4a017]/50"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-wide text-white">
                                TCC Clinic Management System
                            </p>
                            <p className="text-[10px] text-[#fcebe7]/70">
                                Baluarte, Tagoloan · Misamis Oriental
                            </p>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-6 md:flex">
                        {NAV_LINKS.map((l) => (
                            <button
                                key={l.label}
                                onClick={() => scrollTo(l.href)}
                                className="text-sm font-medium text-white/80 transition-colors hover:text-[#d4a017]"
                            >
                                {l.label}
                            </button>
                        ))}
                        <button
                            onClick={goToLogin}
                            className="flex items-center gap-1.5 rounded-full bg-[#70091f] px-5 py-2 text-sm font-semibold text-white shadow-md ring-1 ring-white/20 transition-all hover:bg-[#8b1505] hover:shadow-lg active:scale-[0.99]"
                        >
                            Sign In <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile drawer */}
                {menuOpen && (
                    <div className="border-t border-[#70091f]/30 bg-[#1e050b] px-4 pb-4 pt-2 md:hidden">
                        {NAV_LINKS.map((l) => (
                            <button
                                key={l.label}
                                onClick={() => {
                                    scrollTo(l.href);
                                    setMenuOpen(false);
                                }}
                                className="block w-full py-2 text-left text-sm font-medium text-white/80 hover:text-[#d4a017]"
                            >
                                {l.label}
                            </button>
                        ))}
                        <button
                            onClick={goToLogin}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#70091f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b1505]"
                        >
                            Sign In <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </nav>

            {/* ── HERO (TCC Campus Background & Composition) ──────────── */}
            <section
                ref={heroRef}
                className="relative flex min-h-[92vh] items-center overflow-hidden pt-20 pb-12 sm:min-h-screen"
            >
                {/* Real TCC Building Photo Background */}
                <div
                    className="absolute inset-0 bg-cover bg-right sm:bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/tcc-hero-bg.png')" }}
                    aria-hidden="true"
                />

                {/* Gradient Overlay: Deep maroon on left for readability, fading to reveal sunny campus & student collage on right */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-[#140307] via-[#140307]/92 sm:via-[#140307]/85 to-[#140307]/40 lg:to-transparent"
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-[#160408] via-transparent to-black/30"
                    aria-hidden="true"
                />

                {/* Content Grid */}
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-8 lg:grid-cols-12">
                        {/* Left Column: Heading, Subtitle, Actions, Location */}
                        <div className="flex flex-col items-start text-left lg:col-span-7">
                            {/* Tagline */}
                            <div className="mb-4 inline-flex items-center gap-2">
                                <span className="h-0.5 w-6 bg-[#d4a017]" />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#d4a017]">
                                    Tagoloan Community College
                                </span>
                            </div>

                            {/* Headline matching TCC display typography */}
                            <h1 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl leading-[1.1]">
                                Your Health Begins
                                <br />
                                Here in{" "}
                                <span className="text-[#f38a7c] drop-shadow-sm">
                                    Tagoloan
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base drop-shadow">
                                Tagoloan Community College Clinic ensures education succeeds by nurturing the health and well-being of every student, faculty, and staff member — providing accessible records, primary consultations, and trusted healthcare on campus.
                            </p>

                            {/* CTA Action Buttons */}
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    aria-label="Access video or portal"
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#70091f]/90 text-white shadow-lg transition-all hover:scale-105 hover:bg-[#8b1505]"
                                >
                                    <Play size={18} fill="currentColor" className="ml-0.5" />
                                </button>

                                <button
                                    onClick={goToLogin}
                                    className="flex items-center gap-2 rounded-full bg-[#d4a017] px-6 py-3 text-sm font-bold text-[#140307] shadow-xl transition-all hover:bg-[#e5ae20] hover:shadow-2xl active:scale-[0.99]"
                                >
                                    <span>Access Clinic Portal</span>
                                    <ArrowRight size={16} />
                                </button>

                                <button
                                    onClick={() => scrollTo("#about")}
                                    className="flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-black/60"
                                >
                                    <span>Explore</span>
                                    <BookOpen size={16} />
                                </button>
                            </div>

                            {/* Location Pin */}
                            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-white/75">
                                <MapPin size={15} className="text-[#d4a017]" />
                                <span>Tagoloan, Misamis Oriental, Philippines</span>
                            </div>
                        </div>

                        {/* Right Column: Featured Clinic Advisory badge */}
                        <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:items-end lg:justify-end">
                            <div className="max-w-sm rounded-2xl border border-white/20 bg-black/60 p-5 text-left shadow-2xl backdrop-blur-md transition-all hover:border-[#d4a017]/40">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a017]">
                                    Featured Clinic Advisory
                                </p>
                                <h3 className="mt-1.5 text-sm font-bold text-white leading-snug">
                                    Quality healthcare services, medical consultations &amp; wellness programs for all TCC students.
                                </h3>
                                <p className="mt-1 text-xs text-white/70 leading-relaxed">
                                    Baluarte Campus Clinic is open Monday to Friday to assist your healthcare needs.
                                </p>
                                <button
                                    onClick={() => scrollTo("#features")}
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#d4a017] hover:underline"
                                >
                                    <span>Explore capabilities</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <button
                    onClick={() => scrollTo("#about")}
                    aria-label="Scroll down"
                    className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/60 transition-colors hover:text-white"
                >
                    <span className="uppercase tracking-widest text-[10px]">Explore</span>
                    <ChevronDown size={16} className="animate-bounce" />
                </button>
            </section>

            {/* ── ABOUT ───────────────────────────────────────────────── */}
            <section id="about" className="bg-[#1c050a] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#d4a017]">
                        Vincit Omnia Veritas · Established 2003
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-white sm:text-4xl">
                        About TCC Clinic
                    </h2>
                    <p className="mx-auto mb-14 max-w-2xl text-center text-sm leading-relaxed text-white/70 sm:text-base">
                        The TCC Clinic is an ALCUCOA-accredited health service unit of
                        Tagoloan Community College in Baluarte, Tagoloan, Misamis Oriental,
                        dedicated to providing quality, compassionate, and accessible
                        healthcare to its students and staff.
                    </p>

                    {/* Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {ABOUT_CARDS.map((card, i) => (
                            <div
                                key={i}
                                className="flex flex-col rounded-2xl border border-[#70091f]/40 bg-[#2b0811]/70 p-6 shadow-md backdrop-blur-sm transition-all hover:border-[#d4a017]/40 hover:bg-[#340b15]"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#70091f] text-[#d4a017] shadow-inner">
                                    {card.icon}
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    {card.title}
                                </h3>
                                <p className="mb-4 text-sm leading-relaxed text-white/70">
                                    {card.body}
                                </p>
                                {/* Mission bullet list */}
                                {card.extra && (
                                    <ul className="space-y-1.5">
                                        {card.extra.map((item, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2 text-xs text-white/65"
                                            >
                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a017]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {/* Core Values badges */}
                                {"badges" in card && card.badges && (
                                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                        {(card.badges as string[]).map((badge, j) => (
                                            <span
                                                key={j}
                                                className="rounded-md border border-[#70091f] bg-[#70091f]/60 px-3 py-1 text-xs font-medium text-[#fcebe7]"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ────────────────────────────────────────────── */}
            <section id="features" className="bg-[#160408] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#d4a017]">
                        Member: ALCUCOA — Commission on Accreditation
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-white sm:text-4xl">
                        System Features &amp; Capabilities
                    </h2>
                    <p className="mx-auto mb-14 max-w-xl text-center text-sm leading-relaxed text-white/65">
                        Built to streamline every aspect of campus health management —
                        from patient intake to medicine dispensing and reporting.
                    </p>

                    {/* Feature grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((feat, i) => (
                            <div
                                key={i}
                                className="group flex flex-col gap-3 rounded-2xl border border-[#70091f]/35 bg-[#25070f]/80 p-5 shadow-sm transition-all hover:border-[#d4a017]/40 hover:bg-[#320a14]"
                            >
                                {/* Label chip */}
                                <span className="w-fit rounded-md bg-[#70091f]/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#fcebe7]">
                                    Feature
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="text-[#d4a017] transition-transform group-hover:scale-105">
                                        {feat.icon}
                                    </div>
                                    <h3 className="font-semibold text-white">
                                        {feat.label}
                                    </h3>
                                </div>
                                <p className="text-xs leading-relaxed text-white/60">
                                    {feat.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="border-t border-[#70091f]/40 bg-[#100205] px-4 pt-14 pb-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Brand column */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/tcc-logo.jpg"
                                    alt="TCC Logo"
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#d4a017]/40"
                                />
                                <div>
                                    <p className="font-bold text-white">
                                        Tagoloan Community College
                                    </p>
                                    <p className="text-xs text-[#d4a017]">
                                        Vincit Omnia Veritas · Est. 2003
                                    </p>
                                </div>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-white/60">
                                A premier community-based tertiary institution forming holistic
                                individuals and providing quality, accessible healthcare.
                            </p>
                        </div>

                        {/* Accreditation column */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold text-white">
                                Institutional Accreditation
                            </h4>
                            <p className="text-xs leading-relaxed text-white/60">
                                Member: Association of Local Colleges and Universities — Commission
                                on Accreditation (ALCUCOA)
                                <br />
                                <br />
                                Baluarte, Tagoloan, Misamis Oriental, Philippines
                                <br />
                                <br />
                                College Programs: CIT · CED · CAS · CCJPS · CBA · CHM · COM ·
                                CLIS
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold text-white">
                                Quick Links
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    { label: "About TCC Clinic", href: "#about" },
                                    { label: "System Features", href: "#features" },
                                ].map((l) => (
                                    <li key={l.label}>
                                        <button
                                            onClick={() => scrollTo(l.href)}
                                            className="text-xs text-white/60 hover:text-white transition-colors"
                                        >
                                            {l.label}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={goToLogin}
                                        className="text-xs font-semibold text-[#d4a017] hover:text-[#f0c040] transition-colors"
                                    >
                                        Sign In to Portal
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-10 border-t border-[#70091f]/30 pt-6 text-center text-xs text-white/40">
                        © {new Date().getFullYear()} Tagoloan Community College (TCC). All
                        rights reserved. Vincit Omnia Veritas.
                    </div>
                </div>
            </footer>
        </div>
    );
}
