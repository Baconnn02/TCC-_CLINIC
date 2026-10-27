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
    MapPin,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Sparkles,
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

interface ClinicStory {
    tag: string;
    title: string;
    description: string;
    ctaText: string;
    href: string;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const NAV_LINKS: NavLink[] = [
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Clinic in Action", href: "#gallery" },
];

const CLINIC_STORIES: ClinicStory[] = [
    {
        tag: "Clinical Practice",
        title: "TCC Midwifery & Nursing Students in Clinical Training",
        description:
            "Dedicated healthcare students performing vital sign checkups and maternal health monitoring at the Baluarte Campus Clinic.",
        ctaText: "Explore Healthcare Programs",
        href: "#about",
    },
    {
        tag: "Student Wellness",
        title: "Free Consultations & Primary Care for All TCC Students",
        description:
            "From routine examinations to medical certificates and first aid, our clinic provides accessible care across all departments.",
        ctaText: "View Clinic Services",
        href: "#features",
    },
    {
        tag: "Digital Healthcare",
        title: "Modernized Clinic Records & Fast Visit Tracking",
        description:
            "Secure electronic health management ensures instant record access, safe consultations, and real-time medical monitoring.",
        ctaText: "Learn About System",
        href: "#features",
    },
    {
        tag: "Campus Community",
        title: "Compassionate Healthcare Serving Tagoloan Community",
        description:
            "Upholding Vincit Omnia Veritas with holistic care, professional staff, and student-focused medical services.",
        ctaText: "Discover Our Mission",
        href: "#about",
    },
];

const PHOTO_CAPSULES = [
    {
        img: "/tcc-clinic-team.jpg",
        alt: "TCC Clinic Team",
        height: "h-56 sm:h-72 lg:h-80",
        translate: "translate-y-4",
        border: "border-white/25",
        label: "Clinic Team",
    },
    {
        img: "/tcc-clinic-care.jpg",
        alt: "Patient Care at TCC Clinic",
        height: "h-64 sm:h-80 lg:h-92",
        translate: "-translate-y-2",
        border: "border-[#d4a017]/40",
        label: "Patient Care",
    },
    {
        img: "/tcc-clinic-checkup.jpg",
        alt: "Clinical Examination and Doppler",
        height: "h-72 sm:h-92 lg:h-[400px]",
        translate: "translate-y-1",
        border: "border-white/30",
        label: "Checkup & Doppler",
    },
    {
        img: "/tcc-clinic-consult.jpg",
        alt: "Student Consultation",
        height: "h-64 sm:h-80 lg:h-92",
        translate: "-translate-y-3",
        border: "border-[#d4a017]/40",
        label: "Consultation",
    },
    {
        img: "/tcc-clinic-team.jpg",
        alt: "Healthcare Staff & Students",
        height: "h-56 sm:h-72 lg:h-80",
        translate: "translate-y-3",
        border: "border-white/25",
        label: "Wellness Staff",
    },
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
    const [activeStory, setActiveStory] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    /* Auto-rotate featured story every 5 seconds (pauses on hover) */
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setActiveStory((prev) => (prev + 1) % CLINIC_STORIES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered]);

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
                        : "border-b border-white/10 bg-black/40 backdrop-blur-md",
                ].join(" ")}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#d4a017]/50 shadow-md"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-wide text-white drop-shadow">
                                TCC Clinic Management System
                            </p>
                            <p className="text-[10px] text-[#fcebe7]/80">
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
                                className="text-sm font-medium text-white/90 drop-shadow transition-colors hover:text-[#d4a017]"
                            >
                                {l.label}
                            </button>
                        ))}
                        <button
                            onClick={goToLogin}
                            className="flex items-center gap-1.5 rounded-full bg-[#70091f] px-5 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 transition-all hover:bg-[#8b1505] hover:shadow-xl active:scale-[0.99]"
                        >
                            Sign In <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
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
                                className="block w-full py-2 text-left text-sm font-medium text-white/90 hover:text-[#d4a017]"
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

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative flex min-h-[95vh] items-center overflow-hidden pt-20 pb-12 sm:min-h-screen"
            >
                {/* Clean Clinic Background Picture */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                    style={{ backgroundImage: "url('/clinic-background.jpg')" }}
                    aria-hidden="true"
                />

                {/* TCC Maroon overlay keeping the background clear while ensuring high contrast */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-[#1d0309]/92 via-[#480613]/75 to-[#160408]/85"
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#160408] to-transparent"
                    aria-hidden="true"
                />

                {/* Content Grid */}
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-12">
                        {/* Left Column: Heading, Subtitle, Actions, Location */}
                        <div className="flex flex-col items-start text-left lg:col-span-6 xl:col-span-6">
                            {/* Tagline */}
                            <div className="mb-4 inline-flex items-center gap-2">
                                <span className="h-0.5 w-6 bg-[#d4a017]" />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#d4a017] drop-shadow">
                                    Tagoloan Community College
                                </span>
                            </div>

                            {/* Headline matching TCC display typography */}
                            <h1 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl leading-[1.1]">
                                Your Health Begins
                                <br />
                                Here in{" "}
                                <span className="text-[#f38a7c] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                    Tagoloan
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.85)] sm:text-base font-normal">
                                Tagoloan Community College Clinic ensures education succeeds by nurturing the health and well-being of every student, faculty, and staff member — providing accessible records, primary consultations, and trusted healthcare on campus.
                            </p>

                            {/* CTA Action Buttons */}
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={goToLogin}
                                    className="flex items-center gap-2 rounded-full bg-[#d4a017] px-6 py-3 text-sm font-bold text-[#140307] shadow-2xl transition-all hover:bg-[#e5ae20] hover:shadow-amber-500/20 active:scale-[0.99]"
                                >
                                    <span>Access Clinic Portal</span>
                                    <ArrowRight size={16} />
                                </button>

                                <button
                                    onClick={() => scrollTo("#about")}
                                    className="flex items-center gap-2 rounded-full border border-white/30 bg-black/50 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/70"
                                >
                                    <span>Explore</span>
                                    <BookOpen size={16} />
                                </button>
                            </div>

                            {/* Location Pin */}
                            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                                <MapPin size={15} className="text-[#d4a017]" />
                                <span>Tagoloan, Misamis Oriental, Philippines</span>
                            </div>
                        </div>

                        {/* Right Column: TCC Vertical Pill Photo Capsules & Moving Text Box */}
                        <div
                            className="mt-8 flex flex-col items-center lg:col-span-6 xl:col-span-6 lg:mt-0 lg:items-end"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {/* Staggered Vertical Pill Photo Capsules */}
                            <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-3">
                                {PHOTO_CAPSULES.map((cap, i) => (
                                    <div
                                        key={i}
                                        className={[
                                            "group relative w-12 sm:w-16 md:w-20 overflow-hidden rounded-full border-2 shadow-2xl transition-all duration-500 hover:scale-105 hover:z-20 hover:border-[#d4a017] hover:shadow-amber-500/30",
                                            cap.height,
                                            cap.translate,
                                            cap.border,
                                        ].join(" ")}
                                        title={cap.label}
                                    >
                                        <img
                                            src={cap.img}
                                            alt={cap.alt}
                                            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-115"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-70 transition-opacity group-hover:opacity-20" />
                                        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 group-hover:ring-[#d4a017]/60" />
                                    </div>
                                ))}
                            </div>

                            {/* Upgraded Moving Text Box (Featured Clinic Story) */}
                            <div className="relative mt-3 w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-[#24060d]/95 via-[#1a0409]/95 to-[#120205]/95 p-5 text-left shadow-2xl backdrop-blur-md transition-all hover:border-[#d4a017]/60">
                                {/* Header with Live Indicator, Tag, and Controls */}
                                <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a017] opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4a017]" />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4a017]">
                                            Featured Clinic Story
                                        </span>
                                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-[#fcebe7]/90">
                                            {CLINIC_STORIES[activeStory].tag}
                                        </span>
                                    </div>

                                    {/* Prev/Next arrows */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveStory((prev) =>
                                                    prev === 0 ? CLINIC_STORIES.length - 1 : prev - 1
                                                )
                                            }
                                            aria-label="Previous story"
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
                                        >
                                            <ChevronLeft size={13} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveStory((prev) => (prev + 1) % CLINIC_STORIES.length)
                                            }
                                            aria-label="Next story"
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
                                        >
                                            <ChevronRight size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Animated Text Box Body */}
                                <div className="mt-3 min-h-[62px] transition-all duration-300">
                                    <h3 className="text-sm font-bold text-white leading-snug">
                                        {CLINIC_STORIES[activeStory].title}
                                    </h3>
                                    <p className="mt-1 text-xs text-white/80 leading-relaxed line-clamp-2">
                                        {CLINIC_STORIES[activeStory].description}
                                    </p>
                                </div>

                                {/* Footer CTA and Story Dot Indicators */}
                                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                                    <button
                                        type="button"
                                        onClick={() => scrollTo(CLINIC_STORIES[activeStory].href)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4a017] transition-colors hover:text-[#f0c040]"
                                    >
                                        <span>{CLINIC_STORIES[activeStory].ctaText}</span>
                                        <ArrowRight size={12} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {CLINIC_STORIES.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveStory(idx)}
                                                aria-label={`Go to story ${idx + 1}`}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    activeStory === idx
                                                        ? "w-5 bg-[#d4a017]"
                                                        : "w-1.5 bg-white/25 hover:bg-white/50"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <button
                    onClick={() => scrollTo("#about")}
                    aria-label="Scroll down"
                    className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/70 drop-shadow transition-colors hover:text-white"
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

            {/* ── CLINIC IN ACTION (Photo Gallery) ───────────────────── */}
            <section id="gallery" className="border-t border-[#70091f]/40 bg-[#120205] px-4 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a017]/40 bg-[#70091f]/30 px-3.5 py-1 text-xs font-semibold text-[#d4a017]">
                            <Sparkles size={14} />
                            <span>Campus Life &amp; Healthcare</span>
                        </div>
                        <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl">
                            Clinic in Action
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-xs text-white/70 sm:text-sm">
                            Real moments of compassionate healthcare, clinical training, and dedicated patient service at Tagoloan Community College.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                img: "/tcc-clinic-team.jpg",
                                title: "TCC Healthcare Team",
                                subtitle: "Clinical instructors and students committed to campus wellness",
                                tag: "Dedicated Staff",
                            },
                            {
                                img: "/tcc-clinic-care.jpg",
                                title: "Primary Patient Care",
                                subtitle: "Hands-on medical assistance and bedside support",
                                tag: "Clinical Care",
                            },
                            {
                                img: "/tcc-clinic-checkup.jpg",
                                title: "Maternal & Child Health",
                                subtitle: "Fetal Doppler monitoring and routine health assessment",
                                tag: "Checkup",
                            },
                            {
                                img: "/tcc-clinic-consult.jpg",
                                title: "Health Consultations",
                                subtitle: "Comprehensive physical exams and health monitoring",
                                tag: "Consultation",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-[#1e050b] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d4a017]/60 hover:shadow-2xl"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                                    <span className="inline-block rounded-full bg-[#70091f]/90 px-2.5 py-0.5 text-[10px] font-bold text-[#fcebe7] ring-1 ring-white/20">
                                        {item.tag}
                                    </span>
                                    <h4 className="mt-1.5 text-sm font-bold text-white drop-shadow">
                                        {item.title}
                                    </h4>
                                    <p className="mt-0.5 text-xs text-white/75 drop-shadow leading-snug">
                                        {item.subtitle}
                                    </p>
                                </div>
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
                                    { label: "Clinic in Action", href: "#gallery" },
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
