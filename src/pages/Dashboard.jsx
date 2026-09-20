import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
    Users,
    Stethoscope,
    FileText,
    Search,
    Bell,
    CalendarDays,
    ClipboardList,
    UserPlus,
    UserRound,
    Activity,
    ChevronRight,
    Settings,
    LogOut,
    HeartPulse,
    ArrowUp,
    ArrowDown,
    Pencil,
    PieChart as PieIcon,
    MessageCircle,
    Send,
    X,
    RotateCcw,
    AlertCircle,
} from "lucide-react";

const MAROON = "#8b1505";

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1505]/40";

const ACCENTS = {
    maroon: { icon: "#8b1505", bg: "#fcebe7", line: "#8b1505" },
    rose: { icon: "#a81e3c", bg: "#fbe7ec", line: "#d33a5c" },
    clay: { icon: "#9a3412", bg: "#fcefe6", line: "#ea7c3c" },
    plum: { icon: "#6d2b4e", bg: "#f7e9f0", line: "#9d3f6f" },
};

const DONUT_COLORS = [
    "#8b1505",
    "#b91c1c",
    "#d1603d",
    "#e08f6a",
    "#a1554b",
    "#c9a8a0",
];

const QUICK_ACTIONS = [
    {
        to: "/clinic-visits",
        icon: Stethoscope,
        title: "Log a clinic visit",
        description: "Record a student who came to the clinic",
        primary: true,
    },
    {
        to: "/students",
        icon: UserPlus,
        title: "Register a student",
        description: "Add a new student profile",
    },
    {
        to: "/medical-records",
        icon: FileText,
        title: "Medical records",
        description: "Look up a student's health history",
    },
    {
        to: "/reports",
        icon: ClipboardList,
        title: "Reports",
        description: "View clinic summaries",
    },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getLastMonths = (count) => {
    const now = new Date();
    const months = [];

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        months.push({
            label: date.toLocaleDateString("en-US", { month: "short" }),
            month: date.getMonth(),
            year: date.getFullYear(),
        });
    }

    return months;
};

// Local YYYY-MM-DD (toISOString() uses UTC, which gives the wrong day
// in the early morning for timezones ahead of UTC).
const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const visitDateKey = (raw) => {
    if (!raw) {
        return null;
    }

    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : toDateKey(date);
};

const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) {
        return path;
    }

    return `http://127.0.0.1:8000${path}`;
};

const getName = (student) =>
    student?.name ||
    `${student?.first_name || ""} ${student?.last_name || ""}`.trim() ||
    "Unknown Student";

const getInitials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatRelative = (date) => {
    if (!date) {
        return "—";
    }

    const difference = Date.now() - new Date(date).getTime();
    const minutes = Math.round(difference / 60000);

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${Math.round(hours / 24)}d ago`;
};

// Returns null when there is nothing to compare against.
const percentChange = (trend) => {
    if (!trend || trend.length < 2) {
        return null;
    }

    const previous = trend[trend.length - 2];
    const current = trend[trend.length - 1];

    if (!previous) {
        return null;
    }

    return Math.round(((current - previous) / previous) * 100);
};

function useOutsideClick(ref, onOutside, active) {
    useEffect(() => {
        if (!active) {
            return undefined;
        }

        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onOutside();
            }
        };

        document.addEventListener("mousedown", handler);

        return () => document.removeEventListener("mousedown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, active]);
}

/* ------------------------------------------------------------------ */
/* Clinic assistant                                                    */
/* ------------------------------------------------------------------ */

const ASSISTANT_QUICK_REPLIES = [
    "Register a student",
    "Log a clinic visit",
    "View medical records",
    "View reports",
];

const ASSISTANT_GREETING =
    "Hello! I'm the clinic dashboard assistant. I can help you find your way around — for example, registering a student, logging a clinic visit, or pulling up records and reports. What would you like to do?";

const ASSISTANT_MENU =
    "Here's what I can help with:\n• Register a new student\n• Log a clinic visit\n• Look up medical records\n• View reports\n\nJust tell me which one, or tap a suggestion below.";

const ASSISTANT_MEDICAL_DISCLAIMER =
    "I'm not able to recommend or suggest any medicine, dosage, or treatment — that has to come from clinic staff or a physician. I can help you log a clinic visit so a nurse or doctor can take a look. Would you like me to point you there?";

const MEDICINE_KEYWORDS = [
    "medicine",
    "medication",
    "gamot",
    "paracetamol",
    "biogesic",
    "ibuprofen",
    "antibiotic",
    "dosage",
    "dose",
    "tablet",
    "capsule",
    "syrup",
    "prescription",
    "inumin",
    "gamutin",
];

const GREETING_KEYWORDS = [
    "hi",
    "hello",
    "hey",
    "kumusta",
    "kamusta",
    "good morning",
    "good afternoon",
    "good evening",
];

function matchesAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
}

function getAssistantReply(rawText) {
    const text = rawText.toLowerCase().trim();

    if (matchesAny(text, MEDICINE_KEYWORDS)) {
        return {
            message: ASSISTANT_MEDICAL_DISCLAIMER,
            action: { label: "Log a clinic visit", to: "/clinic-visits" },
        };
    }

    if (matchesAny(text, GREETING_KEYWORDS)) {
        return { message: ASSISTANT_GREETING };
    }

    if (
        text.includes("register") ||
        text.includes("enroll") ||
        text.includes("new student")
    ) {
        return {
            message:
                "Sure — you can register a new student from the Students page. Tap below to go there.",
            action: { label: "Go to Students", to: "/students" },
        };
    }

    if (
        text.includes("visit") ||
        text.includes("checkup") ||
        text.includes("check-up") ||
        text.includes("sick") ||
        text.includes("sakit") ||
        text.includes("appointment")
    ) {
        return {
            message:
                "I can take you to the Clinic Visits page to log a new visit. Remember, only clinic staff can advise on treatment.",
            action: { label: "Go to Clinic Visits", to: "/clinic-visits" },
        };
    }

    if (text.includes("record") || text.includes("history")) {
        return {
            message:
                "You can find a student's medical history on the Medical Records page.",
            action: { label: "Go to Medical Records", to: "/medical-records" },
        };
    }

    if (text.includes("report")) {
        return {
            message: "Reports and summaries are available on the Reports page.",
            action: { label: "Go to Reports", to: "/reports" },
        };
    }

    if (text.includes("thank")) {
        return {
            message:
                "You're welcome! Let me know if there's anything else I can help you find.",
        };
    }

    return { message: ASSISTANT_MENU };
}

function ClinicAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { id: "greeting", from: "bot", text: ASSISTANT_GREETING },
    ]);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        }
    }, [open]);

    const pushMessage = (message) => {
        setMessages((previous) => [
            ...previous,
            { id: `${Date.now()}-${previous.length}`, ...message },
        ]);
    };

    const handleSend = (text) => {
        const value = (text ?? input).trim();

        if (!value) {
            return;
        }

        pushMessage({ from: "user", text: value });
        setInput("");

        const reply = getAssistantReply(value);

        // Slight delay so the reply doesn't feel instantaneous/robotic.
        setTimeout(() => {
            pushMessage({
                from: "bot",
                text: reply.message,
                action: reply.action,
            });
        }, 300);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open && (
                <div className="mb-3 flex h-[440px] w-[320px] flex-col overflow-hidden rounded-2xl border border-[#f0ded9] bg-white shadow-2xl">
                    <div className="flex items-center justify-between bg-[#8b1505] px-4 py-3">
                        <div className="flex items-center gap-2 text-white">
                            <MessageCircle size={18} />
                            <span className="text-sm font-semibold">
                                Clinic Assistant
                            </span>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/80 hover:text-white"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        role="log"
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-[#fdf8f7] px-3 py-3"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.from === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                                        message.from === "user"
                                            ? "bg-[#8b1505] text-white"
                                            : "border border-[#f0ded9] bg-white text-[#1c0f0c]"
                                    }`}
                                >
                                    {message.text}

                                    {message.action && (
                                        <Link
                                            to={message.action.to}
                                            className="mt-2 block rounded-lg bg-[#fcebe7] px-2.5 py-1.5 text-center text-xs font-semibold text-[#8b1505] hover:bg-[#f7d9d1]"
                                        >
                                            {message.action.label}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-t border-[#f0ded9] bg-white px-3 py-2">
                        {ASSISTANT_QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => handleSend(reply)}
                                className="rounded-full border border-[#f0ded9] px-2.5 py-1 text-[11px] font-medium text-[#6b5551] hover:border-[#8b1505] hover:text-[#8b1505]"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSend();
                        }}
                        className="flex items-center gap-2 border-t border-[#f0ded9] bg-white p-2.5"
                    >
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border border-[#f0ded9] bg-[#fdf8f7] px-3 py-2 text-sm outline-none focus:border-[#8b1505]"
                        />

                        <button
                            type="submit"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b1505] text-white hover:bg-[#6f1004]"
                            aria-label="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setOpen((previous) => !previous)}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#8b1505] text-white shadow-xl hover:bg-[#6f1004] ${FOCUS_RING}`}
                aria-label={open ? "Close clinic assistant chat" : "Open clinic assistant chat"}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function Dashboard() {
    const navigate = useNavigate();

    const searchInputRef = useRef(null);
    const searchBoxRef = useRef(null);
    const bellRef = useRef(null);
    const profileRef = useRef(null);

    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [bellSeen, setBellSeen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [selectedDate, setSelectedDate] = useState(() =>
        toDateKey(new Date())
    );

    useEffect(() => {
        const saved = localStorage.getItem("user");

        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                setUser(null);
            }
        }

        loadDashboard();
    }, []);

    // Press "/" anywhere to jump to the student search.
    useEffect(() => {
        const onKeyDown = (event) => {
            const target = event.target;
            const typing =
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable;

            if (event.key === "/" && !typing) {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useOutsideClick(searchBoxRef, () => setSearch(""), Boolean(search));
    useOutsideClick(bellRef, () => setBellOpen(false), bellOpen);
    useOutsideClick(profileRef, () => setProfileOpen(false), profileOpen);

    const loadDashboard = async () => {
        setLoading(true);
        setError(false);

        try {
            const [dashboardResponse, studentsResponse] = await Promise.all([
                api.get("/dashboard"),
                api.get("/students"),
            ]);

            setDashboard(dashboardResponse.data);

            const data = studentsResponse.data;

            setStudents(Array.isArray(data) ? data : data?.data || []);
        } catch (loadError) {
            console.error("Dashboard loading error:", loadError);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (logoutError) {
            console.error("Logout error:", logoutError);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const firstName = useMemo(() => {
        const fullName = (user?.name || "").trim();

        if (!fullName) {
            return "Clinic Staff";
        }

        return fullName.split(" ")[0];
    }, [user]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    }, []);

    const filteredStudents = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            return [];
        }

        return students
            .filter((student) => {
                const name = getName(student).toLowerCase();
                const id = String(
                    student.student_id || student.id || ""
                ).toLowerCase();

                return name.includes(value) || id.includes(value);
            })
            .slice(0, 6);
    }, [search, students]);

    const totalStudents = dashboard?.total_students ?? students.length;
    const totalVisits = dashboard?.total_visits ?? 0;
    const totalRecords = dashboard?.total_records ?? totalVisits;
    const recentVisits = dashboard?.recent_visits || [];

    /* ---------- Visits per month ---------- */

    const visitMonths = useMemo(() => getLastMonths(8), []);

    const monthlySeries =
        dashboard?.monthly_visits || dashboard?.visits_per_month;

    const hasMonthlySeries =
        Array.isArray(monthlySeries) && monthlySeries.length > 0;

    const visitsOverview = useMemo(() => {
        if (hasMonthlySeries) {
            return visitMonths.map(({ label, month, year }) => {
                const match = monthlySeries.find((row) => {
                    const raw = row.month ?? row.period ?? row.date;

                    if (raw == null) {
                        return false;
                    }

                    if (typeof raw === "string" && raw.includes("-")) {
                        const [rowYear, rowMonth] = raw.split("-").map(Number);

                        return rowMonth - 1 === month && rowYear === year;
                    }

                    return Number(raw) - 1 === month && Number(row.year) === year;
                });

                return {
                    label,
                    value: Number(
                        match?.total ?? match?.count ?? match?.visits ?? 0
                    ),
                };
            });
        }

        return visitMonths.map(({ label, month, year }) => {
            const count = recentVisits.filter((visit) => {
                const raw = visit.visit_date || visit.created_at;

                if (!raw) {
                    return false;
                }

                const date = new Date(raw);

                return date.getMonth() === month && date.getFullYear() === year;
            }).length;

            return { label, value: count };
        });
    }, [visitMonths, monthlySeries, hasMonthlySeries, recentVisits]);

    const isEstimated = !hasMonthlySeries;

    /* ---------- Stat cards ---------- */

    // Only the visits card has real month-by-month data, so it is the only
    // one that shows a trend. The others show a plain caption instead of an
    // invented "vs last month" figure.
    const overview = [
        {
            label: "Total Patients",
            value: totalStudents,
            caption: "Registered students",
            icon: Users,
            accent: ACCENTS.maroon,
        },
        {
            label: "Clinic Visits",
            value: totalVisits,
            caption: "All recorded visits",
            icon: CalendarDays,
            accent: ACCENTS.rose,
            trend: hasMonthlySeries
                ? visitsOverview.map((month) => month.value)
                : null,
        },
        {
            label: "Medical Records",
            value: totalRecords,
            caption: "Records on file",
            icon: FileText,
            accent: ACCENTS.clay,
        },
        {
            label: "Recent Activity",
            value: recentVisits.length,
            caption: "Latest visits shown",
            icon: Activity,
            accent: ACCENTS.plum,
        },
    ];

    /* ---------- Selected day ---------- */

    const todayKey = toDateKey(new Date());
    const isToday = selectedDate === todayKey;
    const displayDate = new Date(`${selectedDate}T00:00:00`);

    const selectedVisits = useMemo(
        () =>
            recentVisits.filter(
                (visit) =>
                    visitDateKey(visit.visit_date || visit.created_at) ===
                    selectedDate
            ),
        [recentVisits, selectedDate]
    );

    /* ---------- Charts ---------- */

    const reasons = useMemo(() => {
        const count = {};

        recentVisits.forEach((visit) => {
            const reason = visit.reason?.trim() || "Other";

            count[reason] = (count[reason] || 0) + 1;
        });

        return Object.entries(count)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((item, index) => ({
                ...item,
                color: DONUT_COLORS[index % DONUT_COLORS.length],
            }));
    }, [recentVisits]);

    const reasonsTotal =
        reasons.reduce((sum, reason) => sum + reason.value, 0) || 1;

    const countBySex = (value) =>
        students.filter(
            (student) =>
                String(student.sex || student.gender || "").toLowerCase() ===
                value
        ).length;

    const male = countBySex("male");
    const female = countBySex("female");

    const gender = [
        { label: "Male", value: male, color: "#8b1505" },
        { label: "Female", value: female, color: "#d9776b" },
    ];

    const maxGender = Math.max(male, female, 1);

    /* ---------- Lists ---------- */

    const recentStudents = useMemo(
        () =>
            [...students]
                .sort((a, b) => {
                    const dateA = new Date(a.created_at || a.date_registered || 0);
                    const dateB = new Date(b.created_at || b.date_registered || 0);

                    return dateB - dateA;
                })
                .slice(0, 5),
        [students]
    );

    const activityFeed = useMemo(() => {
        const visitItems = recentVisits.map((visit) => ({
            key: `visit-${visit.id}`,
            icon: Stethoscope,
            color: "bg-[#fbe7ec] text-[#a81e3c]",
            title: "New clinic visit recorded",
            description: `${getName(visit.student)} · ${visit.reason || "Other"}`,
            date: visit.visit_date,
        }));

        const studentItems = students
            .filter((student) => student.created_at || student.date_registered)
            .map((student) => ({
                key: `student-${student.id}`,
                icon: UserPlus,
                color: "bg-[#fcefe6] text-[#9a3412]",
                title: "New student registered",
                description: getName(student),
                date: student.created_at || student.date_registered,
            }));

        return [...visitItems, ...studentItems]
            .filter((item) => item.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [recentVisits, students]);

    return (
        <div className="min-h-screen bg-[#fbf6f5] text-[#1c0f0c]">
            {/* ---------------------------------------------------- */}
            {/* Header                                               */}
            {/* ---------------------------------------------------- */}
            <header className="sticky top-0 z-40 flex h-[72px] items-center gap-5 border-b border-[#f0ded9] bg-white px-7">
                <div ref={searchBoxRef} className="relative w-full max-w-xl">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8918c]"
                    />

                    <input
                        ref={searchInputRef}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                setSearch("");
                                event.currentTarget.blur();
                            }
                        }}
                        placeholder="Search students by name or ID..."
                        aria-label="Search students"
                        className="w-full rounded-xl border border-[#f0ded9] bg-[#fdf8f7] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#8b1505] focus:bg-white focus:ring-4 focus:ring-[#8b1505]/10"
                    />

                    {!search && (
                        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#f0ded9] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#a8918c] sm:block">
                            /
                        </kbd>
                    )}

                    {search && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">
                            {filteredStudents.length ? (
                                filteredStudents.map((student) => (
                                    <Link
                                        key={student.id}
                                        to="/students"
                                        onClick={() => setSearch("")}
                                        className="flex items-center gap-3 border-b border-[#f6eae7] px-4 py-3 last:border-b-0 hover:bg-[#fdf5f3]"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                            {getInitials(getName(student))}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {getName(student)}
                                            </p>

                                            <p className="text-xs text-[#a8918c]">
                                                ID: {student.student_id || student.id}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={16}
                                            className="shrink-0 text-[#d9c4bf]"
                                        />
                                    </Link>
                                ))
                            ) : (
                                <p className="px-4 py-5 text-center text-sm text-[#a8918c]">
                                    No student matches "{search.trim()}".
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-4">
                    {/* Notifications */}
                    <div ref={bellRef} className="relative">
                        <button
                            onClick={() => {
                                setBellOpen((open) => !open);
                                setProfileOpen(false);
                                setBellSeen(true);
                            }}
                            aria-label="Notifications"
                            aria-expanded={bellOpen}
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#6b5551] hover:bg-[#fcebe7] hover:text-[#8b1505] ${FOCUS_RING}`}
                        >
                            <Bell size={21} />

                            {activityFeed.length > 0 && !bellSeen && (
                                <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#d33a5c] ring-2 ring-white" />
                            )}
                        </button>

                        {bellOpen && (
                            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">
                                <div className="border-b border-[#f0ded9] px-4 py-3">
                                    <p className="text-sm font-semibold">
                                        Notifications
                                    </p>
                                </div>

                                {activityFeed.length ? (
                                    <ul className="max-h-80 overflow-y-auto">
                                        {activityFeed.map((item) => (
                                            <li
                                                key={item.key}
                                                className="flex items-center gap-3 border-b border-[#f6eae7] px-4 py-3 last:border-b-0"
                                            >
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color}`}
                                                >
                                                    <item.icon size={15} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">
                                                        {item.title}
                                                    </p>

                                                    <p className="truncate text-xs text-[#8a736e]">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-[11px] text-[#a8918c]">
                                                    {formatRelative(item.date)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="px-4 py-6 text-center text-sm text-[#a8918c]">
                                        You're all caught up.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-[#f0ded9]" />

                    {/* Profile menu */}
                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => {
                                setProfileOpen((open) => !open);
                                setBellOpen(false);
                            }}
                            aria-expanded={profileOpen}
                            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#fdf5f3] ${FOCUS_RING}`}
                        >
                            <Avatar user={user} size={40} iconSize={21} />

                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold">
                                    {user?.name || "Clinic Staff"}
                                </p>

                                <p className="text-xs text-[#8a736e]">
                                    {user?.role || "Clinic Staff"}
                                </p>
                            </div>

                            <ChevronRight
                                size={16}
                                className={`rotate-90 transition ${
                                    profileOpen ? "rotate-[270deg]" : ""
                                }`}
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">
                                <div className="border-b border-[#f0ded9] px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar user={user} size={40} iconSize={20} />

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {user?.name || "Clinic Staff"}
                                            </p>

                                            <p className="text-xs text-[#8a736e]">
                                                {user?.role || "Clinic Staff"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        navigate("/profile");
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#fdf5f3]"
                                >
                                    <Pencil size={18} className="text-[#8b1505]" />
                                    Edit Profile
                                </button>

                                <Link
                                    to="/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fdf5f3]"
                                >
                                    <Settings size={18} className="text-[#8b1505]" />
                                    Settings
                                </Link>

                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 border-t border-[#f0ded9] px-4 py-3 text-left text-sm text-[#a81e3c] hover:bg-[#fbe7ec]"
                                >
                                    <LogOut size={18} />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="w-full p-6 lg:p-7">
                {/* ---------------------------------------------------- */}
                {/* Welcome banner (profile picture removed)             */}
                {/* ---------------------------------------------------- */}
                <div className="relative mb-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#fdece8] to-[#f8d5cd] px-7 py-7">
                    <HeartPulse
                        size={200}
                        className="pointer-events-none absolute -right-8 -top-10 text-[#f0bdb2] opacity-60"
                    />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-left">
                            <p className="text-sm font-semibold text-[#8b1505]">
                                {greeting}
                            </p>

                            <h1 className="mt-1 text-[34px] font-bold leading-tight tracking-tight text-[#1c0f0c]">
                                Welcome back, {firstName}!
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-[#8b1505] ring-1 ring-white/70">
                                    {user?.role || "Clinic Staff"}
                                </span>

                                <span className="text-[15px] text-[#7c625d]">
                                    Here's what's happening at the clinic.
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 self-start rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:self-auto">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcebe7] text-[#8b1505]">
                                <CalendarDays size={21} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    {displayDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>

                                <p className="text-xs text-[#8a736e]">
                                    {displayDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                    })}
                                    {" — "}
                                    {selectedVisits.length}{" "}
                                    {selectedVisits.length === 1 ? "visit" : "visits"}
                                </p>
                            </div>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) => {
                                    if (event.target.value) {
                                        setSelectedDate(event.target.value);
                                    }
                                }}
                                className="ml-1 w-9 cursor-pointer rounded-lg border-0 bg-transparent text-transparent outline-none"
                                title="Pick a date"
                                aria-label="Pick a date"
                            />

                            {!isToday && (
                                <button
                                    onClick={() => setSelectedDate(todayKey)}
                                    className={`flex items-center gap-1.5 rounded-lg bg-[#8b1505] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#6f1004] ${FOCUS_RING}`}
                                >
                                    <RotateCcw size={13} />
                                    Back to today
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-center gap-3 rounded-xl border border-[#f3c9c1] bg-[#fdeeea] px-4 py-3 text-sm text-[#8b1505]"
                    >
                        <AlertCircle size={18} className="shrink-0" />

                        <p className="flex-1">
                            Couldn't load the dashboard data, so the numbers below may be incomplete.
                        </p>

                        <button
                            onClick={loadDashboard}
                            className={`rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#8b1505] ring-1 ring-[#f3c9c1] hover:bg-[#fdf5f3] ${FOCUS_RING}`}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* Stat cards                                           */}
                {/* ---------------------------------------------------- */}
                <section className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
                    {overview.map((item) => {
                        const Icon = item.icon;
                        const change = percentChange(item.trend);

                        return (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: item.accent.bg,
                                            color: item.accent.icon,
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <span className="text-sm font-bold text-[#1c0f0c]">
                                        {item.label}
                                    </span>
                                </div>

                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <p className="text-3xl font-bold leading-none">
                                        {item.value}
                                    </p>
                                )}

                                <div className="mt-3 flex items-end justify-between gap-3">
                                    {change !== null ? (
                                        <p
                                            className={`flex items-center gap-1 text-xs font-semibold ${
                                                change < 0
                                                    ? "text-[#b91c1c]"
                                                    : "text-[#3f7d52]"
                                            }`}
                                        >
                                            {change < 0 ? (
                                                <ArrowDown size={12} />
                                            ) : (
                                                <ArrowUp size={12} />
                                            )}

                                            {Math.abs(change)}%

                                            <span className="font-normal text-[#a8918c]">
                                                vs last month
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-[#a8918c]">
                                            {item.caption}
                                        </p>
                                    )}

                                    {item.trend && (
                                        <Sparkline
                                            values={item.trend}
                                            color={item.accent.line}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* ---------------------------------------------------- */}
                {/* Day view + quick actions                             */}
                {/* ---------------------------------------------------- */}
                <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-7">
                        <SectionHeader
                            icon={Stethoscope}
                            title={isToday ? "Today's visits" : "Visits on this day"}
                            subtitle={
                                isToday
                                    ? "Students seen at the clinic today"
                                    : `Students seen on ${formatDate(displayDate)}`
                            }
                            link="/clinic-visits"
                            linkLabel="All visits"
                        />

                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        ) : selectedVisits.length ? (
                            <ul>
                                {selectedVisits.slice(0, 6).map((visit, index) => (
                                    <li
                                        key={visit.id ?? index}
                                        className="flex items-center gap-3 border-t border-[#f6eae7] py-3 first:border-t-0 first:pt-0"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                            {getInitials(getName(visit.student))}
                                        </div>

                                        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                                            {getName(visit.student)}
                                        </p>

                                        <span className="shrink-0 rounded-full bg-[#fdf1ee] px-2.5 py-1 text-xs font-medium text-[#8b1505]">
                                            {visit.reason?.trim() || "Other"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center py-8 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505]">
                                    <Stethoscope size={22} />
                                </div>

                                <p className="text-sm font-semibold">
                                    No visits logged {isToday ? "today" : "for this date"}
                                </p>

                                <p className="mt-1 text-xs text-[#a8918c]">
                                    Visits will show up here as soon as they are recorded.
                                </p>

                                <Link
                                    to="/clinic-visits"
                                    className={`mt-4 rounded-lg bg-[#8b1505] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#6f1004] ${FOCUS_RING}`}
                                >
                                    Log a clinic visit
                                </Link>
                            </div>
                        )}

                        <p className="mt-4 border-t border-[#f6eae7] pt-3 text-[11px] text-[#a8918c]">
                            Based on the latest visits the dashboard loads. Open All visits for the full history.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-5">
                        <SectionHeader
                            icon={Activity}
                            title="Quick actions"
                            subtitle="Things you do most often"
                        />

                        <div className="space-y-2.5">
                            {QUICK_ACTIONS.map((action) => (
                                <QuickAction key={action.to} {...action} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* ---------------------------------------------------- */}
                {/* Charts                                               */}
                {/* ---------------------------------------------------- */}
                <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-5">
                        <SectionHeader
                            icon={CalendarDays}
                            title="Clinic Visits Overview"
                            subtitle={
                                isEstimated
                                    ? "Based on the latest visits only"
                                    : "Number of visits per month"
                            }
                        />

                        <LineAreaChart data={visitsOverview} color={MAROON} />
                    </div>

                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-4">
                        <SectionHeader
                            icon={PieIcon}
                            title="Visit Reasons"
                            subtitle="Most common consultation reasons"
                        />

                        {reasons.length ? (
                            <div className="flex items-center gap-5">
                                <DonutChart
                                    data={reasons}
                                    total={reasonsTotal}
                                    centerLabel="Total Visits"
                                    centerValue={totalVisits}
                                />

                                <div className="flex-1 space-y-2.5">
                                    {reasons.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />

                                                <span className="text-xs text-[#6b5551]">
                                                    {item.label}
                                                </span>
                                            </div>

                                            <span className="text-xs font-bold text-[#1c0f0c]">
                                                {Math.round(
                                                    (item.value / reasonsTotal) * 100
                                                )}
                                                %
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-[#a8918c]">
                                No visit reasons recorded yet.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-3">
                        <SectionHeader
                            icon={Users}
                            title="Gender Distribution"
                            subtitle="Registered students by gender"
                        />

                        <div className="flex h-[170px] items-end justify-around border-b border-[#f0ded9] px-6">
                            {gender.map((item) => {
                                const height = (item.value / maxGender) * 130;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex h-full flex-1 flex-col items-center justify-end"
                                    >
                                        <span className="mb-2 text-sm font-bold">
                                            {item.value}
                                        </span>

                                        <div
                                            className="w-12 rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${Math.max(
                                                    height,
                                                    item.value ? 15 : 5
                                                )}px`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-around pt-3">
                            {gender.map((item) => (
                                <div key={item.label} className="flex-1 text-center">
                                    <p className="text-xs font-semibold">{item.label}</p>

                                    <p className="mt-1 text-[11px] text-[#a8918c]">
                                        {totalStudents
                                            ? Math.round((item.value / totalStudents) * 100)
                                            : 0}
                                        %
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------------------------------------------------- */}
                {/* Recent students + activity                           */}
                {/* ---------------------------------------------------- */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-7">
                        <SectionHeader
                            icon={Users}
                            title="Recent Students"
                            subtitle="Latest registrations"
                            link="/students"
                        />

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[380px]">
                                <thead>
                                    <tr className="text-left">
                                        {["Name", "ID", "Date Registered"].map((title) => (
                                            <th
                                                key={title}
                                                className="px-2 py-2 text-xs font-semibold text-[#8a736e]"
                                            >
                                                {title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentStudents.length ? (
                                        recentStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="border-t border-[#f6eae7] hover:bg-[#fdf5f3]"
                                            >
                                                <td className="px-2 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                                            {getInitials(getName(student))}
                                                        </div>

                                                        <span className="text-sm font-semibold">
                                                            {getName(student)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-3 text-sm text-[#8a736e]">
                                                    {student.student_id || student.id}
                                                </td>

                                                <td className="px-2 py-3 text-sm text-[#8a736e]">
                                                    {formatDate(
                                                        student.created_at ||
                                                            student.date_registered
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="py-10 text-center text-sm text-[#a8918c]"
                                            >
                                                No students registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-5">
                        <SectionHeader
                            icon={Activity}
                            title="Latest Activities"
                            subtitle="System activities and updates"
                        />

                        <div className="space-y-4">
                            {activityFeed.length ? (
                                activityFeed.map((item) => (
                                    <div key={item.key} className="flex items-center gap-3">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.color}`}
                                        >
                                            <item.icon size={16} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {item.title}
                                            </p>

                                            <p className="truncate text-xs text-[#8a736e]">
                                                {item.description} · {formatRelative(item.date)}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={16}
                                            className="shrink-0 text-[#d9c4bf]"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="py-10 text-center text-sm text-[#a8918c]">
                                    No recent activity.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <ClinicAssistant />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = 40, iconSize = 20 }) {
    const src = getImageUrl(user?.profile_picture);

    return (
        <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fcebe7] text-[#8b1505]"
            style={{ width: size, height: size }}
        >
            {src ? (
                <img src={src} alt="Profile" className="h-full w-full object-cover" />
            ) : (
                <UserRound size={iconSize} />
            )}
        </div>
    );
}

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-[#f6eae7] motion-reduce:animate-none ${className}`}
        />
    );
}

function Sparkline({ values, color }) {
    const width = 90;
    const height = 34;

    if (!values || values.length < 2) {
        return null;
    }

    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * height;

        return [x, y];
    });

    const path = points
        .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`)
        .join(" ");

    const [lastX, lastY] = points[points.length - 1];

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="shrink-0"
            aria-hidden="true"
        >
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
        </svg>
    );
}

function LineAreaChart({ data, color }) {
    const width = 560;
    const height = 200;
    const padding = 24;

    const values = data.map((item) => item.value);

    const max = Math.max(...values, 4);
    const ceiling = max * 1.15;

    const points = data.map((item, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y =
            height -
            padding -
            (item.value / ceiling) * (height - padding * 2);

        return { x, y, ...item };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
        .join(" ");

    const areaPath = `${linePath} L${points[points.length - 1].x},${
        height - padding
    } L${points[0].x},${height - padding} Z`;

    const gridLines = [0.25, 0.5, 0.75, 1];

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            role="img"
            aria-label="Clinic visits per month"
        >
            <defs>
                <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {gridLines.map((gridLine) => {
                const y = height - padding - gridLine * (height - padding * 2);

                return (
                    <line
                        key={gridLine}
                        x1={padding}
                        x2={width - padding}
                        y1={y}
                        y2={y}
                        stroke="#f8ecea"
                        strokeWidth="1"
                    />
                );
            })}

            <path d={areaPath} fill="url(#visitsFill)" stroke="none" />

            <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {points.map((point, index) => (
                <g key={index}>
                    <circle
                        cx={point.x}
                        cy={point.y}
                        r={index === points.length - 1 ? 4 : 3}
                        fill={color}
                    />

                    {point.value > 0 && (
                        <text
                            x={point.x}
                            y={point.y - 9}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill={color}
                        >
                            {point.value}
                        </text>
                    )}
                </g>
            ))}

            {points.map((point, index) => (
                <text
                    key={`label-${index}`}
                    x={point.x}
                    y={height - 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#a8918c"
                    fontWeight="500"
                >
                    {point.label}
                </text>
            ))}
        </svg>
    );
}

function DonutChart({ data, total, centerLabel, centerValue }) {
    const size = 140;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulative = 0;

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f8ecea"
                    strokeWidth={strokeWidth}
                />

                {data.map((item) => {
                    const fraction = item.value / total;
                    const dash = fraction * circumference;
                    const offset = cumulative * circumference;

                    cumulative += fraction;

                    return (
                        <circle
                            key={item.label}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                        />
                    );
                })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#1c0f0c]">{centerValue}</span>
                <span className="text-[10px] text-[#a8918c]">{centerLabel}</span>
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, subtitle, link, linkLabel = "View all" }) {
    const Icon = icon;

    return (
        <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505]">
                    <Icon size={18} />
                </div>

                <div>
                    <h2 className="text-[17px] font-bold">{title}</h2>
                    <p className="mt-0.5 text-xs text-[#8a736e]">{subtitle}</p>
                </div>
            </div>

            {link && (
                <Link
                    to={link}
                    className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#8b1505] hover:underline"
                >
                    {linkLabel}
                    <ChevronRight size={14} />
                </Link>
            )}
        </div>
    );
}

function QuickAction({ to, icon, title, description, primary = false }) {
    const Icon = icon;

    return (
        <Link
            to={to}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-colors ${FOCUS_RING} ${
                primary
                    ? "border-[#8b1505] bg-[#8b1505] text-white hover:bg-[#6f1004]"
                    : "border-[#f5e4e0] bg-[#fdf8f7] hover:border-[#f0bdb2] hover:bg-[#fdf1ee]"
            }`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    primary
                        ? "bg-white/15 text-white"
                        : "bg-[#fcebe7] text-[#8b1505] group-hover:bg-[#8b1505] group-hover:text-white"
                }`}
            >
                <Icon size={19} />
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className={`text-sm font-semibold ${
                        primary ? "text-white" : "text-[#1c0f0c]"
                    }`}
                >
                    {title}
                </p>

                <p
                    className={`truncate text-xs ${
                        primary ? "text-white/75" : "text-[#8a736e]"
                    }`}
                >
                    {description}
                </p>
            </div>

            <ChevronRight
                size={16}
                className={`shrink-0 ${primary ? "text-white/70" : "text-[#d9c4bf]"}`}
            />
        </Link>
    );
}

export default Dashboard;