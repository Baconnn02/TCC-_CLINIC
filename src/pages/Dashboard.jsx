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
} from "lucide-react";

const MAROON = "#8b1505";

const ACCENTS = {
    maroon: {
        icon: "#8b1505",
        bg: "#fcebe7",
        line: "#8b1505",
    },
    rose: {
        icon: "#a81e3c",
        bg: "#fbe7ec",
        line: "#d33a5c",
    },
    clay: {
        icon: "#9a3412",
        bg: "#fcefe6",
        line: "#ea7c3c",
    },
    plum: {
        icon: "#6d2b4e",
        bg: "#f7e9f0",
        line: "#9d3f6f",
    },
};

const DONUT_COLORS = [
    "#8b1505",
    "#b91c1c",
    "#d1603d",
    "#e08f6a",
    "#a1554b",
    "#c9a8a0",
];

const getLastMonths = (count) => {
    const now = new Date();
    const months = [];

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        months.push({
            label: date.toLocaleDateString("en-US", {
                month: "short",
            }),
            month: date.getMonth(),
            year: date.getFullYear(),
        });
    }

    return months;
};
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

    if (text.includes("register") || text.includes("enroll") || text.includes("new student")) {
        return {
            message: "Sure — you can register a new student from the Students page. Tap below to go there.",
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
            message: "I can take you to the Clinic Visits page to log a new visit. Remember, only clinic staff can advise on treatment.",
            action: { label: "Go to Clinic Visits", to: "/clinic-visits" },
        };
    }

    if (text.includes("record") || text.includes("history")) {
        return {
            message: "You can find a student's medical history on the Medical Records page.",
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
        return { message: "You're welcome! Let me know if there's anything else I can help you find." };
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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

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
            pushMessage({ from: "bot", text: reply.message, action: reply.action });
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
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8b1505] text-white shadow-xl hover:bg-[#6f1004]"
                aria-label="Open clinic assistant chat"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [dropdown, setDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
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

    const loadDashboard = async () => {
        try {
            const [dashboardResponse, studentsResponse] =
                await Promise.all([
                    api.get("/dashboard"),
                    api.get("/students"),
                ]);

            setDashboard(dashboardResponse.data);

            const data = studentsResponse.data;

            setStudents(
                Array.isArray(data)
                    ? data
                    : data?.data || []
            );
        } catch (error) {
            console.error(
                "Dashboard loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const getImageUrl = (path) => {
        if (!path) return null;

        if (path.startsWith("http")) {
            return path;
        }

        return `http://127.0.0.1:8000${path}`;
    };

    const getName = (student) => {
        return (
            student?.name ||
            `${student?.first_name || ""} ${
                student?.last_name || ""
            }`.trim() ||
            "Unknown Student"
        );
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
                    student.student_id ||
                        student.id ||
                        ""
                ).toLowerCase();

                return (
                    name.includes(value) ||
                    id.includes(value)
                );
            })
            .slice(0, 6);
    }, [search, students]);

    const totalStudents =
        dashboard?.total_students ??
        students.length;

    const totalVisits =
        dashboard?.total_visits ?? 0;

    const totalRecords =
        dashboard?.total_records ??
        totalVisits;

    const recentVisits =
        dashboard?.recent_visits || [];

    const buildTrend = (value) => {
        const base = Math.max(
            Number(value) || 0,
            1
        );

        const fractions = [
            0.35,
            0.5,
            0.62,
            0.75,
            0.88,
            1,
        ];

        return fractions.map(
            (fraction, index) =>
                index === fractions.length - 1
                    ? Number(value) || 0
                    : Math.max(
                          Math.round(
                              base * fraction
                          ),
                          1
                      )
        );
    };

    const percentChange = (trend) => {
        const previous =
            trend[trend.length - 2];

        const current =
            trend[trend.length - 1];

        if (!previous) {
            return 0;
        }

        return Math.round(
            ((current - previous) / previous) *
                100
        );
    };

    const overview = [
        {
            label: "Total Patients",
            value: totalStudents,
            icon: Users,
            accent: ACCENTS.maroon,
        },
        {
            label: "Clinic Visits",
            value: totalVisits,
            icon: CalendarDays,
            accent: ACCENTS.rose,
        },
        {
            label: "Medical Records",
            value: totalRecords,
            icon: FileText,
            accent: ACCENTS.clay,
        },
        {
            label: "Recent Activity",
            value: recentVisits.length,
            icon: Activity,
            accent: ACCENTS.plum,
        },
    ];

    const visitMonths = useMemo(
        () => getLastMonths(8),
        []
    );

    const monthlySeries =
        dashboard?.monthly_visits ||
        dashboard?.visits_per_month;

    const hasMonthlySeries =
        Array.isArray(monthlySeries) &&
        monthlySeries.length > 0;

    const visitsOverview = useMemo(() => {
        if (hasMonthlySeries) {
            return visitMonths.map(
                ({ label, month, year }) => {
                    const match =
                        monthlySeries.find(
                            (row) => {
                                const raw =
                                    row.month ??
                                    row.period ??
                                    row.date;

                                if (raw == null) {
                                    return false;
                                }

                                if (
                                    typeof raw ===
                                        "string" &&
                                    raw.includes("-")
                                ) {
                                    const [
                                        rowYear,
                                        rowMonth,
                                    ] =
                                        raw
                                            .split(
                                                "-"
                                            )
                                            .map(
                                                Number
                                            );

                                    return (
                                        rowMonth -
                                            1 ===
                                            month &&
                                        rowYear ===
                                            year
                                    );
                                }

                                return (
                                    Number(raw) -
                                        1 ===
                                        month &&
                                    Number(
                                        row.year
                                    ) === year
                                );
                            }
                        );

                    return {
                        label,
                        value: Number(
                            match?.total ??
                                match?.count ??
                                match?.visits ??
                                0
                        ),
                    };
                }
            );
        }

        return visitMonths.map(
            ({ label, month, year }) => {
                const count =
                    recentVisits.filter(
                        (visit) => {
                            const raw =
                                visit.visit_date ||
                                visit.created_at;

                            if (!raw) {
                                return false;
                            }

                            const date =
                                new Date(raw);

                            return (
                                date.getMonth() ===
                                    month &&
                                date.getFullYear() ===
                                    year
                            );
                        }
                    ).length;

                return {
                    label,
                    value: count,
                };
            }
        );
    }, [
        visitMonths,
        monthlySeries,
        hasMonthlySeries,
        recentVisits,
    ]);

    const isEstimated =
        !hasMonthlySeries;

    const reasons = useMemo(() => {
        const count = {};

        recentVisits.forEach((visit) => {
            const reason =
                visit.reason?.trim() ||
                "Other";

            count[reason] =
                (count[reason] || 0) + 1;
        });

        return Object.entries(count)
            .map(([label, value]) => ({
                label,
                value,
            }))
            .sort(
                (a, b) => b.value - a.value
            )
            .slice(0, 6)
            .map((item, index) => ({
                ...item,
                color:
                    DONUT_COLORS[
                        index %
                            DONUT_COLORS.length
                    ],
            }));
    }, [recentVisits]);

    const reasonsTotal =
        reasons.reduce(
            (sum, reason) =>
                sum + reason.value,
            0
        ) || 1;

    const male = students.filter(
        (student) =>
            String(
                student.sex ||
                    student.gender ||
                    ""
            ).toLowerCase() === "male"
    ).length;

    const female = students.filter(
        (student) =>
            String(
                student.sex ||
                    student.gender ||
                    ""
            ).toLowerCase() === "female"
    ).length;

    const gender = [
        {
            label: "Male",
            value: male,
            color: "#8b1505",
        },
        {
            label: "Female",
            value: female,
            color: "#d9776b",
        },
    ];

    const maxGender = Math.max(
        male,
        female,
        1
    );

    const recentStudents = useMemo(() => {
        return [...students]
            .sort((a, b) => {
                const dateA = new Date(
                    a.created_at ||
                        a.date_registered ||
                        0
                );

                const dateB = new Date(
                    b.created_at ||
                        b.date_registered ||
                        0
                );

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [students]);

    const activityFeed = useMemo(() => {
        const visitItems =
            recentVisits.map((visit) => ({
                key: `visit-${visit.id}`,
                icon: Stethoscope,
                color:
                    "bg-[#fbe7ec] text-[#a81e3c]",
                title:
                    "New clinic visit recorded",
                description: `${getName(
                    visit.student
                )} · ${
                    visit.reason || "Other"
                }`,
                date: visit.visit_date,
            }));

        const studentItems = students
            .filter(
                (student) =>
                    student.created_at ||
                    student.date_registered
            )
            .map((student) => ({
                key: `student-${student.id}`,
                icon: UserPlus,
                color:
                    "bg-[#fcefe6] text-[#9a3412]",
                title:
                    "New student registered",
                description:
                    getName(student),
                date:
                    student.created_at ||
                    student.date_registered,
            }));

        return [
            ...visitItems,
            ...studentItems,
        ]
            .filter((item) => item.date)
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);
    }, [recentVisits, students]);

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatRelative = (date) => {
        if (!date) {
            return "—";
        }

        const difference =
            Date.now() -
            new Date(date).getTime();

        const minutes = Math.round(
            difference / 60000
        );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours = Math.round(
            minutes / 60
        );

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.round(
            hours / 24
        );

        return `${days}d ago`;
    };

    const displayDate = new Date(
        `${selectedDate}T00:00:00`
    );

    return (
        <div className="min-h-screen bg-[#fbf6f5] text-[#1c0f0c]">
            <header className="sticky top-0 z-40 flex h-[72px] items-center gap-5 border-b border-[#f0ded9] bg-white px-7">
                <div className="relative w-full max-w-xl">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8918c]"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search students by name or ID..."
                        className="w-full rounded-xl border border-[#f0ded9] bg-[#fdf8f7] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#8b1505] focus:bg-white focus:ring-4 focus:ring-[#8b1505]/10"
                    />

                    {search && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">
                            {filteredStudents.length ? (
                                filteredStudents.map(
                                    (student) => (
                                        <Link
                                            key={
                                                student.id
                                            }
                                            to="/students"
                                            onClick={() =>
                                                setSearch(
                                                    ""
                                                )
                                            }
                                            className="flex items-center gap-3 border-b border-[#f6eae7] px-4 py-3 last:border-b-0 hover:bg-[#fdf5f3]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505]">
                                                <UserRound
                                                    size={
                                                        16
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {getName(
                                                        student
                                                    )}
                                                </p>

                                                <p className="text-xs text-[#a8918c]">
                                                    ID:{" "}
                                                    {student.student_id ||
                                                        student.id}
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                )
                            ) : (
                                <p className="px-4 py-5 text-center text-sm text-[#a8918c]">
                                    No student found.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-5">
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6b5551] hover:bg-[#fcebe7] hover:text-[#8b1505]">
                        <Bell size={21} />

                        <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#d33a5c] ring-2 ring-white" />
                    </button>

                    <div className="h-8 w-px bg-[#f0ded9]" />

                    <div className="relative">
                        <button
                            onClick={() =>
                                setDropdown(
                                    !dropdown
                                )
                            }
                            className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#fdf5f3]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#fcebe7] text-[#8b1505]">
                                {user?.profile_picture ? (
                                    <img
                                        src={getImageUrl(
                                            user.profile_picture
                                        )}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound
                                        size={
                                            21
                                        }
                                    />
                                )}
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold">
                                    {user?.name ||
                                        "Clinic Staff"}
                                </p>

                                <p className="text-xs text-[#8a736e]">
                                    {user?.role ||
                                        "Clinic Staff"}
                                </p>
                            </div>

                            <ChevronRight
                                size={16}
                                className={`rotate-90 transition ${
                                    dropdown
                                        ? "rotate-[270deg]"
                                        : ""
                                }`}
                            />
                        </button>

                        {dropdown && (
                            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">
                                <div className="border-b border-[#f0ded9] px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#fcebe7] text-[#8b1505]">
                                            {user?.profile_picture ? (
                                                <img
                                                    src={getImageUrl(
                                                        user.profile_picture
                                                    )}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound
                                                    size={
                                                        20
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold">
                                                {user?.name ||
                                                    "Clinic Staff"}
                                            </p>

                                            <p className="text-xs text-[#8a736e]">
                                                {user?.role ||
                                                    "Clinic Staff"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setDropdown(
                                            false
                                        );
                                        navigate(
                                            "/profile"
                                        );
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#fdf5f3]"
                                >
                                    <Pencil
                                        size={18}
                                        className="text-[#8b1505]"
                                    />

                                    Edit Profile
                                </button>

                                <Link
                                    to="/settings"
                                    onClick={() =>
                                        setDropdown(
                                            false
                                        )
                                    }
                                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fdf5f3]"
                                >
                                    <Settings
                                        size={18}
                                        className="text-[#8b1505]"
                                    />

                                    Settings
                                </Link>

                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 border-t border-[#f0ded9] px-4 py-3 text-left text-sm text-[#a81e3c] hover:bg-[#fbe7ec]"
                                >
                                    <LogOut
                                        size={18}
                                    />

                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="w-full p-6 lg:p-7">
                <div className="relative mb-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#fdece8] to-[#f8d5cd] px-7 py-7">
                    <HeartPulse
                        size={200}
                        className="pointer-events-none absolute -right-8 -top-10 text-[#f0bdb2] opacity-60"
                    />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/70 text-[#8b1505] shadow-sm ring-1 ring-white/60">
                                {user?.profile_picture ? (
                                    <img
                                        src={getImageUrl(
                                            user.profile_picture
                                        )}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound
                                        size={
                                            30
                                        }
                                    />
                                )}
                            </div>

                            <div className="text-left">
                                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#8b1505]">
                                    {greeting}
                                </p>

                                <h1 className="mt-1 text-[34px] font-bold leading-tight tracking-tight text-[#1c0f0c]">
                                    Welcome back,{" "}
                                    {firstName}!
                                </h1>

                                <p className="mt-1 text-[15px] text-[#7c625d]">
                                    {user?.role ||
                                        "Clinic Staff"}{" "}
                                    · Here's what's
                                    happening at the
                                    clinic today.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-start rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:self-auto">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcebe7] text-[#8b1505]">
                                <CalendarDays
                                    size={21}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    {displayDate.toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        }
                                    )}
                                </p>

                                <p className="text-xs text-[#8a736e]">
                                    {displayDate.toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday:
                                                "long",
                                        }
                                    )}
                                </p>
                            </div>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) =>
                                    setSelectedDate(
                                        event.target
                                            .value
                                    )
                                }
                                className="ml-2 w-9 cursor-pointer rounded-lg border-0 bg-transparent text-transparent outline-none"
                                title="Select date"
                            />
                        </div>
                    </div>
                </div>

                <section className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
                    {overview.map((item) => {
                        const Icon = item.icon;
                        const trend =
                            buildTrend(
                                item.value
                            );
                        const change =
                            percentChange(
                                trend
                            );

                        return (
                            <div
                                key={
                                    item.label
                                }
                                className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor:
                                                item
                                                    .accent
                                                    .bg,
                                            color: item
                                                .accent
                                                .icon,
                                        }}
                                    >
                                        <Icon
                                            size={
                                                18
                                            }
                                        />
                                    </div>

                                    <span className="text-sm font-bold text-[#1c0f0c]">
                                        {item.label}
                                    </span>
                                </div>

                                <p className="text-3xl font-bold leading-none">
                                    {loading
                                        ? "..."
                                        : item.value}
                                </p>

                                <div className="mt-3 flex items-end justify-between gap-3">
                                    <p
                                        className={`flex items-center gap-1 text-xs font-semibold ${
                                            change <
                                            0
                                                ? "text-[#b91c1c]"
                                                : "text-[#3f7d52]"
                                        }`}
                                    >
                                        {change <
                                        0 ? (
                                            <ArrowDown
                                                size={
                                                    12
                                                }
                                            />
                                        ) : (
                                            <ArrowUp
                                                size={
                                                    12
                                                }
                                            />
                                        )}

                                        {Math.abs(
                                            change
                                        )}
                                        %

                                        <span className="font-normal text-[#a8918c]">
                                            vs last
                                            month
                                        </span>
                                    </p>

                                    <Sparkline
                                        values={
                                            trend
                                        }
                                        color={
                                            item
                                                .accent
                                                .line
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm xl:col-span-5">
                        <SectionHeader
                            icon={
                                CalendarDays
                            }
                            title="Clinic Visits Overview"
                            subtitle={
                                isEstimated
                                    ? "Based on the latest visits only"
                                    : "Number of visits per month"
                            }
                        />

                        <LineAreaChart
                            data={
                                visitsOverview
                            }
                            color={MAROON}
                        />
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
                                    data={
                                        reasons
                                    }
                                    total={
                                        reasonsTotal
                                    }
                                    centerLabel="Total Visits"
                                    centerValue={
                                        totalVisits
                                    }
                                />

                                <div className="flex-1 space-y-2.5">
                                    {reasons.map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                key={
                                                    item.label
                                                }
                                                className="flex items-center justify-between gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    />

                                                    <span className="text-xs text-[#6b5551]">
                                                        {
                                                            item.label
                                                        }
                                                    </span>
                                                </div>

                                                <span className="text-xs font-bold text-[#1c0f0c]">
                                                    {Math.round(
                                                        (item.value /
                                                            reasonsTotal) *
                                                            100
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-[#a8918c]">
                                No clinic reason
                                data available.
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
                            {gender.map(
                                (item) => {
                                    const height =
                                        (item.value /
                                            maxGender) *
                                        130;

                                    return (
                                        <div
                                            key={
                                                item.label
                                            }
                                            className="flex h-full flex-1 flex-col items-center justify-end"
                                        >
                                            <span className="mb-2 text-sm font-bold">
                                                {
                                                    item.value
                                                }
                                            </span>

                                            <div
                                                className="w-12 rounded-t-lg transition-all duration-500"
                                                style={{
                                                    height: `${Math.max(
                                                        height,
                                                        item.value
                                                            ? 15
                                                            : 5
                                                    )}px`,
                                                    backgroundColor:
                                                        item.color,
                                                }}
                                            />
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        <div className="flex justify-around pt-3">
                            {gender.map(
                                (item) => (
                                    <div
                                        key={
                                            item.label
                                        }
                                        className="flex-1 text-center"
                                    >
                                        <p className="text-xs font-semibold">
                                            {
                                                item.label
                                            }
                                        </p>

                                        <p className="mt-1 text-[11px] text-[#a8918c]">
                                            {totalStudents
                                                ? Math.round(
                                                      (item.value /
                                                          totalStudents) *
                                                          100
                                                  )
                                                : 0}
                                            %
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </section>

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
                                        {[
                                            "Name",
                                            "ID",
                                            "Date Registered",
                                        ].map(
                                            (
                                                title
                                            ) => (
                                                <th
                                                    key={
                                                        title
                                                    }
                                                    className="px-2 py-2 text-xs font-semibold text-[#8a736e]"
                                                >
                                                    {
                                                        title
                                                    }
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentStudents.length ? (
                                        recentStudents.map(
                                            (
                                                student
                                            ) => (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                    className="border-t border-[#f6eae7] hover:bg-[#fdf5f3]"
                                                >
                                                    <td className="px-2 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                                                {getName(
                                                                    student
                                                                )
                                                                    .slice(
                                                                        0,
                                                                        2
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <span className="text-sm font-semibold">
                                                                {getName(
                                                                    student
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-3 text-sm text-[#8a736e]">
                                                        {student.student_id ||
                                                            student.id}
                                                    </td>

                                                    <td className="px-2 py-3 text-sm text-[#8a736e]">
                                                        {formatDate(
                                                            student.created_at ||
                                                                student.date_registered
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="py-10 text-center text-sm text-[#a8918c]"
                                            >
                                                No students
                                                found.
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
                                activityFeed.map(
                                    (
                                        item
                                    ) => (
                                        <div
                                            key={
                                                item.key
                                            }
                                            className="flex items-center gap-3"
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.color}`}
                                            >
                                                <item.icon
                                                    size={
                                                        16
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">
                                                    {
                                                        item.title
                                                    }
                                                </p>

                                                <p className="truncate text-xs text-[#8a736e]">
                                                    {
                                                        item.description
                                                    }{" "}
                                                    ·{" "}
                                                    {formatRelative(
                                                        item.date
                                                    )}
                                                </p>
                                            </div>

                                            <ChevronRight
                                                size={
                                                    16
                                                }
                                                className="shrink-0 text-[#d9c4bf]"
                                            />
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="py-10 text-center text-sm text-[#a8918c]">
                                    No recent
                                    activity.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <section className="mt-5 rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm">
                    <SectionHeader
                        icon={Activity}
                        title="Quick Actions"
                        subtitle="Frequently used clinic functions"
                    />

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <QuickAction
                            to="/students"
                            icon={UserPlus}
                            title="Register Student"
                        />

                        <QuickAction
                            to="/clinic-visits"
                            icon={Stethoscope}
                            title="New Clinic Visit"
                        />

                        <QuickAction
                            to="/medical-records"
                            icon={FileText}
                            title="Medical Record"
                        />

                        <QuickAction
                            to="/reports"
                            icon={ClipboardList}
                            title="View Reports"
                        />
                    </div>
                </section>
            </main>

            <ClinicAssistant />
        </div>
    );
}

function Sparkline({ values, color }) {
    const width = 90;
    const height = 34;

    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = values.map(
        (value, index) => {
            const x =
                (index /
                    (values.length - 1)) *
                width;

            const y =
                height -
                ((value - min) / range) *
                    height;

            return [x, y];
        }
    );

    const path = points
        .map(
            ([x, y], index) =>
                `${index === 0 ? "M" : "L"}${x},${y}`
        )
        .join(" ");

    const [lastX, lastY] =
        points[points.length - 1];

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="shrink-0"
        >
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx={lastX}
                cy={lastY}
                r="2.5"
                fill={color}
            />
        </svg>
    );
}

function LineAreaChart({ data, color }) {
    const width = 560;
    const height = 200;
    const padding = 24;

    const values = data.map(
        (item) => item.value
    );

    const max = Math.max(...values, 4);
    const ceiling = max * 1.15;

    const points = data.map(
        (item, index) => {
            const x =
                padding +
                (index /
                    (data.length - 1)) *
                    (width -
                        padding * 2);

            const y =
                height -
                padding -
                (item.value /
                    ceiling) *
                    (height -
                        padding * 2);

            return {
                x,
                y,
                ...item,
            };
        }
    );

    const linePath = points
        .map(
            (point, index) =>
                `${
                    index === 0 ? "M" : "L"
                }${point.x},${point.y}`
        )
        .join(" ");

    const areaPath = `${linePath} L${
        points[points.length - 1].x
    },${height - padding} L${
        points[0].x
    },${height - padding} Z`;

    const gridLines = [
        0.25,
        0.5,
        0.75,
        1,
    ];

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            <defs>
                <linearGradient
                    id="visitsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity="0.25"
                    />

                    <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>

            {gridLines.map(
                (gridLine) => (
                    <line
                        key={gridLine}
                        x1={padding}
                        x2={width - padding}
                        y1={
                            height -
                            padding -
                            gridLine *
                                (height -
                                    padding *
                                        2)
                        }
                        y2={
                            height -
                            padding -
                            gridLine *
                                (height -
                                    padding *
                                        2)
                        }
                        stroke="#f8ecea"
                        strokeWidth="1"
                    />
                )
            )}

            <path
                d={areaPath}
                fill="url(#visitsFill)"
                stroke="none"
            />

            <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {points.map(
                (point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={
                                index ===
                                points.length -
                                    1
                                    ? 4
                                    : 3
                            }
                            fill={color}
                        />

                        {point.value >
                            0 && (
                            <text
                                x={point.x}
                                y={
                                    point.y -
                                    9
                                }
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="700"
                                fill={color}
                            >
                                {
                                    point.value
                                }
                            </text>
                        )}
                    </g>
                )
            )}

            {points.map(
                (point, index) => (
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
                )
            )}
        </svg>
    );
}

function DonutChart({
    data,
    total,
    centerLabel,
    centerValue,
}) {
    const size = 140;
    const strokeWidth = 20;
    const radius =
        (size - strokeWidth) / 2;
    const circumference =
        2 * Math.PI * radius;

    let cumulative = 0;

    return (
        <div
            className="relative shrink-0"
            style={{
                width: size,
                height: size,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f8ecea"
                    strokeWidth={
                        strokeWidth
                    }
                />

                {data.map((item) => {
                    const fraction =
                        item.value /
                        total;

                    const dash =
                        fraction *
                        circumference;

                    const offset =
                        cumulative *
                        circumference;

                    cumulative += fraction;

                    return (
                        <circle
                            key={
                                item.label
                            }
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={
                                item.color
                            }
                            strokeWidth={
                                strokeWidth
                            }
                            strokeDasharray={`${dash} ${
                                circumference -
                                dash
                            }`}
                            strokeDashoffset={
                                -offset
                            }
                        />
                    );
                })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#1c0f0c]">
                    {centerValue}
                </span>

                <span className="text-[10px] text-[#a8918c]">
                    {centerLabel}
                </span>
            </div>
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    subtitle,
    link,
}) {
    const Icon = icon;

    return (
        <div className="mb-5 flex items-start justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505]">
                    <Icon size={18} />
                </div>

                <div>
                    <h2 className="text-[17px] font-bold">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-xs text-[#8a736e]">
                        {subtitle}
                    </p>
                </div>
            </div>

            {link && (
                <Link
                    to={link}
                    className="text-xs font-bold text-[#8b1505] hover:underline"
                >
                    View all →
                </Link>
            )}
        </div>
    );
}

function QuickAction({
    to,
    icon,
    title,
}) {
    const Icon = icon;

    return (
        <Link
            to={to}
            className="group flex min-h-[94px] flex-col items-center justify-center rounded-xl border border-[#f5e4e0] bg-[#fdf8f7] p-3 text-center hover:border-[#f0bdb2] hover:bg-[#fdf1ee]"
        >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505] group-hover:bg-[#8b1505] group-hover:text-white">
                <Icon size={19} />
            </div>

            <p className="text-xs font-semibold text-[#5c4642]">
                {title}
            </p>
        </Link>
    );
}

export default Dashboard;