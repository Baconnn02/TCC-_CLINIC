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
        <div className="min-h-screen bg-[#faf7f2] font-[system-ui,_-apple-system,_sans-serif] text-[#3d3329]">
            {/* ── NAVBAR ──────────────────────────────────────────────── */}
            <nav
                className={[
                    "fixed top-0 z-50 w-full transition-all duration-300",
                    scrolled
                        ? "border-b border-[#e8dfd4] bg-white/95 shadow-sm backdrop-blur-md"
                        : "border-b border-[#e8dfd4]/60 bg-[#faf7f2]/90 backdrop-blur-sm",
                ].join(" ")}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#8a6f50]/30"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-wide text-[#8a6f50]">
                                TCC Clinic Management System
                            </p>
                            <p className="text-[10px] text-[#8a6f50]/80">
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
                                className="text-sm font-medium text-[#3d3329]/80 transition-colors hover:text-[#8a6f50]"
                            >
                                {l.label}
                            </button>
                        ))}
                        <button
                            onClick={goToLogin}
                            className="flex items-center gap-1.5 rounded-full bg-[#8a6f50] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#735a40] hover:shadow-md active:scale-[0.99]"
                        >
                            Sign In <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-[#8a6f50] hover:bg-[#8a6f50]/10 md:hidden"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile drawer */}
                {menuOpen && (
                    <div className="border-t border-[#e8dfd4] bg-white px-4 pb-4 pt-2 md:hidden">
                        {NAV_LINKS.map((l) => (
                            <button
                                key={l.label}
                                onClick={() => {
                                    scrollTo(l.href);
                                    setMenuOpen(false);
                                }}
                                className="block w-full py-2 text-left text-sm font-medium text-[#3d3329] hover:text-[#8a6f50]"
                            >
                                {l.label}
                            </button>
                        ))}
                        <button
                            onClick={goToLogin}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#8a6f50] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#735a40]"
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
                {/* Background image + warm cream overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/clinic-background.jpg)" }}
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/95 via-white/85 to-[#f3ecdf]/95"
                    aria-hidden="true"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-6 pt-16">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#8a6f50]/30 bg-[#8a6f50]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#8a6f50]">
                        <Star size={12} fill="currentColor" />
                        Tagoloan Community College · Est. 2003
                    </span>

                    {/* TCC Seal */}
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Seal"
                        className="h-28 w-28 rounded-full object-cover shadow-xl ring-4 ring-[#8a6f50]/30 sm:h-36 sm:w-36"
                    />

                    {/* Headline */}
                    <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#3d3329] sm:text-5xl lg:text-6xl">
                        TCC Clinic{" "}
                        <span className="text-[#8a6f50]">Management</span>{" "}
                        System
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-xl text-base text-[#6e553c] sm:text-lg">
                        Tagoloan Community College · Vincit Omnia Veritas
                        <br />
                        <span className="text-sm italic text-[#8a6f50]/80">
                            (Truth Conquers All)
                        </span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={goToLogin}
                            className="flex items-center justify-center gap-2 rounded-full bg-[#8a6f50] px-7 py-3 font-semibold text-white shadow-md shadow-[#8a6f50]/20 transition-all hover:bg-[#735a40] hover:shadow-lg active:scale-[0.99]"
                        >
                            Access Clinic Portal <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => scrollTo("#about")}
                            className="flex items-center justify-center gap-2 rounded-full border border-[#8a6f50]/30 bg-white/80 px-7 py-3 font-semibold text-[#8a6f50] shadow-sm backdrop-blur-sm transition-all hover:border-[#8a6f50] hover:bg-white"
                        >
                            About TCC
                        </button>
                    </div>
                </div>

                {/* Scroll indicator */}
                <button
                    onClick={() => scrollTo("#about")}
                    aria-label="Scroll down"
                    className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-[#8a6f50]/70 transition-colors hover:text-[#8a6f50]"
                >
                    <span className="uppercase tracking-widest">Explore</span>
                    <ChevronDown size={18} className="animate-bounce" />
                </button>
            </section>

            {/* ── ABOUT ───────────────────────────────────────────────── */}
            <section id="about" className="bg-[#f7f2ea] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#8a6f50]">
                        Vincit Omnia Veritas · Established 2003
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-[#3d3329] sm:text-4xl">
                        About TCC Clinic
                    </h2>
                    <p className="mx-auto mb-14 max-w-2xl text-center text-sm leading-relaxed text-[#6e553c] sm:text-base">
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
                                className="flex flex-col rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-sm transition-all hover:border-[#8a6f50]/40 hover:shadow-md"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8a6f50]/10 text-[#8a6f50]">
                                    {card.icon}
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-[#3d3329]">
                                    {card.title}
                                </h3>
                                <p className="mb-4 text-sm leading-relaxed text-[#6e553c]">
                                    {card.body}
                                </p>
                                {/* Mission bullet list */}
                                {card.extra && (
                                    <ul className="space-y-1.5">
                                        {card.extra.map((item, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2 text-xs text-[#6e553c]"
                                            >
                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a6f50]" />
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
                                                className="rounded-md border border-[#8a6f50]/20 bg-[#8a6f50]/10 px-3 py-1 text-xs font-medium text-[#8a6f50]"
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
            <section id="features" className="bg-[#faf7f2] py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section label */}
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#8a6f50]">
                        Member: ALCUCOA — Commission on Accreditation
                    </p>
                    <h2 className="mb-4 text-center text-3xl font-extrabold text-[#3d3329] sm:text-4xl">
                        System Features &amp; Capabilities
                    </h2>
                    <p className="mx-auto mb-14 max-w-xl text-center text-sm leading-relaxed text-[#6e553c]">
                        Built to streamline every aspect of campus health management —
                        from patient intake to medicine dispensing and reporting.
                    </p>

                    {/* Feature grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((feat, i) => (
                            <div
                                key={i}
                                className="group flex flex-col gap-3 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-all hover:border-[#8a6f50] hover:shadow-md"
                            >
                                {/* Label chip */}
                                <span className="w-fit rounded-md bg-[#8a6f50]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#8a6f50]">
                                    Feature
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="text-[#8a6f50] transition-transform group-hover:scale-105">
                                        {feat.icon}
                                    </div>
                                    <h3 className="font-semibold text-[#3d3329]">
                                        {feat.label}
                                    </h3>
                                </div>
                                <p className="text-xs leading-relaxed text-[#6e553c]">
                                    {feat.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="border-t border-[#e8dfd4] bg-[#f3ece0] px-4 pt-14 pb-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Brand column */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/tcc-logo.jpg"
                                    alt="TCC Logo"
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#8a6f50]/30"
                                />
                                <div>
                                    <p className="font-bold text-[#3d3329]">
                                        Tagoloan Community College
                                    </p>
                                    <p className="text-xs text-[#8a6f50]">
                                        Vincit Omnia Veritas · Est. 2003
                                    </p>
                                </div>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-[#6e553c]">
                                A premier community-based tertiary institution forming holistic
                                individuals and providing quality, accessible healthcare.
                            </p>
                        </div>

                        {/* Accreditation column */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold text-[#3d3329]">
                                Institutional Accreditation
                            </h4>
                            <p className="text-xs leading-relaxed text-[#6e553c]">
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
                            <h4 className="mb-3 text-sm font-semibold text-[#3d3329]">
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
                                            className="text-xs text-[#6e553c] hover:text-[#8a6f50] transition-colors"
                                        >
                                            {l.label}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={goToLogin}
                                        className="text-xs font-semibold text-[#8a6f50] hover:text-[#735a40] transition-colors"
                                    >
                                        Sign In to Portal
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-10 border-t border-[#e8dfd4] pt-6 text-center text-xs text-[#8a6f50]/80">
                        © {new Date().getFullYear()} Tagoloan Community College (TCC). All
                        rights reserved. Vincit Omnia Veritas.
                    </div>
                </div>
            </footer>
        </div>
    );
}
