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
    Star,
    Activity,
    FileText,
    Lock,
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
        icon: <Users size={28} />,
        label: "Student Records",
        description:
            "Maintain comprehensive health profiles for every student and faculty member.",
    },
    {
        icon: <ClipboardList size={28} />,
        label: "Clinic Visits",
        description:
            "Log, track, and manage every clinic consultation with detailed visit records.",
    },
    {
        icon: <Pill size={28} />,
        label: "Medicine Inventory",
        description:
            "Monitor medicine stock levels, dispense medications, and receive low-stock alerts.",
    },
    {
        icon: <BarChart3 size={28} />,
        label: "Reports & Analytics",
        description:
            "Generate insightful health trend reports to support informed decisions.",
    },
    {
        icon: <Activity size={28} />,
        label: "Health Monitoring",
        description:
            "Track vital signs, diagnoses, and treatment histories in one place.",
    },
    {
        icon: <FileText size={28} />,
        label: "Medical Certificates",
        description:
            "Issue and manage medical certificates and documentation efficiently.",
    },
    {
        icon: <Shield size={28} />,
        label: "Secure & Private",
        description:
            "Role-based access control keeps sensitive health data protected at all times.",
    },
    {
        icon: <Lock size={28} />,
        label: "Data Integrity",
        description:
            "Transactional updates and audit trails ensure accurate and reliable records.",
    },
];

const ABOUT_CARDS = [
    {
        icon: <Eye size={28} />,
        title: "Vision",
        body: "A premier community-based institution providing accessible, quality healthcare services to every student and staff of Tagoloan Community College.",
        extra: null as string[] | null,
    },
    {
        icon: <Target size={28} />,
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
        icon: <Heart size={28} />,
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
        <div className="min-h-screen bg-[#100508] font-[system-ui,_-apple-system,_sans-serif] text-white">
            {/* ── NAVBAR ──────────────────────────────────────────────── */}
            <nav
                className={[
                    "fixed top-0 z-50 w-full transition-all duration-300",
                    scrolled
                        ? "bg-[#1a0810]/95 shadow-lg backdrop-blur-md"
                        : "bg-[#1a0810]/80 backdrop-blur-sm",
                ].join(" ")}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#d4a017]/40"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-wide text-white">
                                TCC Clinic Management System
                            </p>
                            <p className="text-[10px] text-[#d4a017]/80">
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
                            className="flex items-center gap-1.5 rounded-full bg-[#d4a017] px-4 py-1.5 text-sm font-semibold text-[#100508] transition-all hover:bg-[#f0c040] hover:shadow-md hover:shadow-[#d4a017]/30"
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
                    <div className="border-t border-white/10 bg-[#1a0810] px-4 pb-4 pt-2 md:hidden">
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
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#d4a017] px-4 py-2 text-sm font-semibold text-[#100508] hover:bg-[#f0c040]"
                        >
                            Sign In <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </nav>

            {/* ── HERO ────────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
            >
                {/* Background image + overlays */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/clinic-background.jpg)" }}
                    aria-hidden="true"
                />
                {/* dark maroon overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#70091f]/85 via-[#3d0511]/80 to-[#100508]/95"
                    aria-hidden="true"
                />
                {/* subtle vignette */}
                <div
                    className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent to-[#100508]/60"
                    aria-hidden="true"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Gold pill badge */}
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4a017]">
                        <Star size={12} fill="currentColor" />
                        Tagoloan Community College · Est. 2003
                    </span>

                    {/* TCC Seal */}
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Seal"
                        className="h-28 w-28 rounded-full object-cover shadow-2xl ring-4 ring-[#d4a017]/50 sm:h-36 sm:w-36"
                    />

                    {/* Headline */}
                    <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                        TCC Clinic{" "}
                        <span className="text-[#d4a017]">Management</span>{" "}
                        System
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-xl text-base text-white/75 sm:text-lg">
                        Tagoloan Community College · Vincit Omnia Veritas
                        <br />
                        <span className="text-sm italic text-white/50">
                            (Truth Conquers All)
                        </span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={goToLogin}
                            className="flex items-center justify-center gap-2 rounded-full bg-[#d4a017] px-7 py-3 font-semibold text-[#100508] shadow-lg shadow-[#d4a017]/30 transition-all hover:bg-[#f0c040] hover:shadow-xl hover:shadow-[#d4a017]/40"
                        >
                            Access Clinic Portal <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => scrollTo("#about")}
                            className="flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
                        >
                            About TCC
                        </button>
                    </div>
                </div>

                {/* Scroll indicator */}
                <button
                    onClick={() => scrollTo("#about")}
                    aria-label="Scroll down"
                    className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/50 transition-colors hover:text-white/80"
                >
                    <span className="uppercase tracking-widest">Explore</span>
                    <ChevronDown size={18} className="animate-bounce" />
                </button>
            </section>

            {/* ── ABOUT ───────────────────────────────────────────────── */}
            <section id="about" className="bg-[#160709] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#d4a017]">
                        Vincit Omnia Veritas · Established 2003
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-white sm:text-4xl">
                        About TCC Clinic
                    </h2>
                    <p className="mx-auto mb-14 max-w-2xl text-center text-sm leading-relaxed text-white/60 sm:text-base">
                        The TCC Clinic is an Al.CUCOA-accredited health service unit of
                        Tagoloan Community College in Baluarte, Tagoloan, Misamis Oriental,
                        dedicated to providing quality, compassionate, and accessible
                        healthcare to its students and staff.
                    </p>

                    {/* Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {ABOUT_CARDS.map((card, i) => (
                            <div
                                key={i}
                                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#d4a017]/30 hover:bg-white/8"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4a017]/20 text-[#d4a017]">
                                    {card.icon}
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    {card.title}
                                </h3>
                                <p className="mb-4 text-sm leading-relaxed text-white/65">
                                    {card.body}
                                </p>
                                {/* Mission bullet list */}
                                {card.extra && (
                                    <ul className="space-y-1.5">
                                        {card.extra.map((item, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2 text-xs text-white/55"
                                            >
                                                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a017]" />
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
                                                className="rounded-md bg-[#70091f]/60 px-3 py-1 text-xs font-medium text-[#f5c6c6]"
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
            <section id="features" className="bg-[#1f0a0e] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#d4a017]">
                        Member: Al.CUCOA — Commission on Accreditation
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-white sm:text-4xl">
                        System Features &amp; Capabilities
                    </h2>
                    <p className="mx-auto mb-14 max-w-xl text-center text-sm leading-relaxed text-white/60">
                        Built to streamline every aspect of campus health management —
                        from patient intake to medicine dispensing and reporting.
                    </p>

                    {/* Feature grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((feat, i) => (
                            <div
                                key={i}
                                className="group flex flex-col gap-3 rounded-xl border border-[#d4a017]/15 bg-[#2d0f15]/60 p-5 transition-all hover:border-[#d4a017]/40 hover:bg-[#3a1219]/80"
                            >
                                {/* Label chip */}
                                <span className="w-fit rounded-md bg-[#d4a017]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#d4a017]">
                                    {/* First letters as abbrev if needed */}
                                    Feature
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="text-[#d4a017]/80 group-hover:text-[#d4a017] transition-colors">
                                        {feat.icon}
                                    </div>
                                    <h3 className="font-semibold text-white">{feat.label}</h3>
                                </div>
                                <p className="text-xs leading-relaxed text-white/55">
                                    {feat.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="border-t border-white/10 bg-[#100508] px-4 pt-14 pb-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Brand column */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/tcc-logo.jpg"
                                    alt="TCC Logo"
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#d4a017]/30"
                                />
                                <div>
                                    <p className="font-bold text-white">
                                        Tagoloan Community College
                                    </p>
                                    <p className="text-xs text-[#d4a017]/70">
                                        Vincit Omnia Veritas · Est. 2003
                                    </p>
                                </div>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-white/50">
                                A premier community-based tertiary institution forming holistic
                                individuals and providing quality, accessible healthcare.
                            </p>
                        </div>

                        {/* Accreditation column */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold text-white">
                                Institutional Accreditation
                            </h4>
                            <p className="text-xs leading-relaxed text-white/50">
                                Member: Association of Local Colleges and Universities — Commission
                                on Accreditation (Al.CUCOA)
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
                                            className="text-xs text-white/50 hover:text-white/80 transition-colors"
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
                    <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
                        © {new Date().getFullYear()} Tagoloan Community College (TCC). All
                        rights reserved. Vincit Omnia Veritas.
                    </div>
                </div>
            </footer>
        </div>
    );
}

