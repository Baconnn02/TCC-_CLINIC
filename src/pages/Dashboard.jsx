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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const isDateOnly = (raw) =>
    typeof raw === "string" && DATE_ONLY.test(raw);

/**
 * Parses a value into a Date.
 * YYYY-MM-DD strings are treated as LOCAL midnight.
 */
const parseDate = (raw) => {
    if (!raw) {
        return null;
    }

    if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? null : raw;
    }

    if (isDateOnly(raw)) {
        const [year, month, day] = raw.split("-").map(Number);

        return new Date(year, month - 1, day);
    }

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;
};

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

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const visitDateKey = (raw) => {
    if (isDateOnly(raw)) {
        return raw;
    }

    const date = parseDate(raw);

    return date ? toDateKey(date) : null;
};

const API_ORIGIN = (() => {
    const baseURL = api?.defaults?.baseURL;

    if (
        typeof baseURL === "string" &&
        /^https?:\/\//i.test(baseURL)
    ) {
        try {
            return new URL(baseURL).origin;
        } catch {
            // fall through
        }
    }

    return "http://127.0.0.1:8000";
})();

const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) {
        return path;
    }

    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
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

const studentKey = (student) =>
    String(student?.student_id || student?.id || "");

const getPersonId = (person) =>
    person?.student_id ||
    person?.staff_id ||
    person?.employee_id ||
    person?.id ||
    "";

const personKey = (person) =>
    `${person?._type || "student"}:${getPersonId(person)}`;

const TYPE_LABELS = {
    student: "Student",
    staff: "Staff",
    faculty: "Faculty",
};

const TYPE_ID_LABELS = {
    student: "Student ID",
    staff: "Staff ID",
    faculty: "Employee ID",
};

const formatDate = (raw) => {
    const date = parseDate(raw);

    if (!date) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatRelative = (raw) => {
    const date = parseDate(raw);

    if (!date) {
        return "—";
    }

    if (isDateOnly(raw)) {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const days = Math.round(
            (today - date) / 86400000
        );

        if (days <= 0) {
            return "Today";
        }

        if (days === 1) {
            return "Yesterday";
        }

        return days < 30
            ? `${days}d ago`
            : formatDate(date);
    }

    const minutes = Math.round(
        (Date.now() - date.getTime()) / 60000
    );

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

    const days = Math.round(hours / 24);

    return days < 30
        ? `${days}d ago`
        : formatDate(date);
};

const percentChange = (trend) => {
    if (!trend || trend.length < 2) {
        return null;
    }

    const previous = trend[trend.length - 2];
    const current = trend[trend.length - 1];

    if (!previous) {
        return null;
    }

    return Math.round(
        ((current - previous) / previous) * 100
    );
};

function useOutsideClick(ref, onOutside, active) {
    const callbackRef = useRef(onOutside);

    useEffect(() => {
        callbackRef.current = onOutside;
    });

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        const handler = (event) => {
            if (
                ref.current &&
                !ref.current.contains(event.target)
            ) {
                callbackRef.current();
            }
        };

        document.addEventListener(
            "mousedown",
            handler
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handler
            );
    }, [ref, active]);
}

/* -------------------------------------------------------------------------- */
/* TCC AI Chatbot                                                             */
/* -------------------------------------------------------------------------- */

const AI_QUICK_REPLIES = [
    "How do I register a student?",
    "How do I log a clinic visit?",
    "How can I view records?",
    "What can you help me with?",
];

const AI_GREETING =
    "Hello! I'm TCC AI. I can help you with the clinic system, dashboard navigation, documentation, and general health information. How can I help you today?";

function AIChatbot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: "ai-greeting",
            role: "assistant",
            text: AI_GREETING,
        },
    ]);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight;
        }
    }, [messages, sending, open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const sendMessage = async (text) => {
        const value = (text ?? input).trim();

        if (!value || sending) {
            return;
        }

        const userMessage = {
            id: `${Date.now()}-user`,
            role: "user",
            text: value,
        };

        const updatedMessages = [
            ...messages,
            userMessage,
        ];

        setMessages(updatedMessages);
        setInput("");
        setSending(true);

        try {
            const apiMessages = updatedMessages
                .filter(
                    (message) =>
                        message.role === "user" ||
                        message.role === "assistant"
                )
                .slice(-12)
                .map((message) => ({
                    role:
                        message.role === "assistant"
                            ? "model"
                            : "user",
                    content: message.text,
                }));

            const response = await api.post(
                "/ai-chat",
                {
                    messages: apiMessages,
                }
            );

            const reply =
                response.data?.message ||
                response.data?.reply ||
                "I couldn't generate a response right now.";

            setMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    text: reply,
                },
            ]);
        } catch (error) {
            console.error(
                "AI chatbot error:",
                error
            );

            let errorMessage =
                "Sorry, I couldn't connect to the AI service right now.";

            if (error?.response?.data?.message) {
                errorMessage =
                    error.response.data.message;
            }

            setMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-error`,
                    role: "assistant",
                    text: errorMessage,
                    error: true,
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open && (
                <div className="mb-3 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#f0ded9] bg-white shadow-2xl">

                    {/* AI Header */}
                    <div className="flex items-center justify-between bg-[#8b1505] px-4 py-3.5">
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                                <MessageCircle size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    TCC AI
                                </p>

                                <p className="text-[11px] text-white/70">
                                    AI Clinic Assistant
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setOpen(false)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                            aria-label="Close AI chatbot"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        role="log"
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-[#fdf8f7] px-3 py-4"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.role ===
                                    "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                                        message.role ===
                                        "user"
                                            ? "bg-[#8b1505] text-white"
                                            : message.error
                                            ? "border border-[#f3c9c1] bg-[#fdeeea] text-[#8b1505]"
                                            : "border border-[#f0ded9] bg-white text-[#1c0f0c]"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl border border-[#f0ded9] bg-white px-4 py-3">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8b1505]" />

                                    <span
                                        className="h-2 w-2 animate-bounce rounded-full bg-[#8b1505]"
                                        style={{
                                            animationDelay:
                                                "120ms",
                                        }}
                                    />

                                    <span
                                        className="h-2 w-2 animate-bounce rounded-full bg-[#8b1505]"
                                        style={{
                                            animationDelay:
                                                "240ms",
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Questions */}
                    <div className="border-t border-[#f0ded9] bg-white px-3 py-2.5">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#a8918c]">
                            Quick questions
                        </p>

                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {AI_QUICK_REPLIES.map(
                                (reply) => (
                                    <button
                                        key={reply}
                                        type="button"
                                        onClick={() =>
                                            sendMessage(
                                                reply
                                            )
                                        }
                                        disabled={sending}
                                        className="shrink-0 rounded-full border border-[#f0ded9] bg-[#fdf8f7] px-2.5 py-1.5 text-[11px] font-medium text-[#6b5551] transition hover:border-[#8b1505] hover:text-[#8b1505] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {reply}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendMessage();
                        }}
                        className="flex items-center gap-2 border-t border-[#f0ded9] bg-white p-2.5"
                    >
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(event) =>
                                setInput(
                                    event.target.value
                                )
                            }
                            placeholder="Ask TCC AI..."
                            disabled={sending}
                            className="min-w-0 flex-1 rounded-full border border-[#f0ded9] bg-[#fdf8f7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#8b1505] focus:bg-white focus:ring-2 focus:ring-[#8b1505]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                            type="submit"
                            disabled={
                                !input.trim() ||
                                sending
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8b1505] text-white transition hover:bg-[#6f1004] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>

                    {/* Disclaimer */}
                    <div className="border-t border-[#f0ded9] bg-[#fffaf9] px-3 py-2">
                        <p className="text-center text-[10px] leading-4 text-[#a8918c]">
                            TCC AI provides general information
                            and system assistance. It does not
                            replace a healthcare professional.
                        </p>
                    </div>
                </div>
            )}

            {/* Floating AI Button */}
            <button
                type="button"
                onClick={() =>
                    setOpen((previous) => !previous)
                }
                className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8b1505] text-white shadow-xl transition hover:scale-105 hover:bg-[#6f1004] ${FOCUS_RING}`}
                aria-label={
                    open
                        ? "Close TCC AI chatbot"
                        : "Open TCC AI chatbot"
                }
            >
                {open ? (
                    <X size={22} />
                ) : (
                    <MessageCircle size={22} />
                )}
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

function Dashboard() {
    const navigate = useNavigate();

    const searchInputRef = useRef(null);
    const searchBoxRef = useRef(null);
    const bellRef = useRef(null);
    const profileRef = useRef(null);

    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [pickedKey, setPickedKey] = useState(null);
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

        window.addEventListener(
            "keydown",
            onKeyDown
        );

        return () =>
            window.removeEventListener(
                "keydown",
                onKeyDown
            );
    }, []);

    const closeSearch = () => {
        setSearch("");
        setPickedKey(null);
    };

    useOutsideClick(
        searchBoxRef,
        closeSearch,
        Boolean(search)
    );

    useOutsideClick(
        bellRef,
        () => setBellOpen(false),
        bellOpen
    );

    useOutsideClick(
        profileRef,
        () => setProfileOpen(false),
        profileOpen
    );

    const loadDashboard = async () => {
        setLoading(true);
        setError(false);

        try {
            const [
                dashboardResponse,
                studentsResponse,
            ] = await Promise.all([
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

            const [
                staffResult,
                facultyResult,
            ] = await Promise.allSettled([
                api.get("/staff"),
                api.get("/faculties"),
            ]);

            if (staffResult.status === "fulfilled") {
                const staffData = staffResult.value.data;

                setStaff(
                    Array.isArray(staffData)
                        ? staffData
                        : staffData?.data || []
                );
            } else {
                console.error(
                    "Staff loading error:",
                    staffResult.reason
                );
            }

            if (facultyResult.status === "fulfilled") {
                const facultyData = facultyResult.value.data;

                setFaculties(
                    Array.isArray(facultyData)
                        ? facultyData
                        : facultyData?.data || []
                );
            } else {
                console.error(
                    "Faculty loading error:",
                    facultyResult.reason
                );
            }
        } catch (loadError) {
            console.error(
                "Dashboard loading error:",
                loadError
            );

            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (logoutError) {
            console.error(
                "Logout error:",
                logoutError
            );
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const firstName = useMemo(() => {
        const fullName = (
            user?.name || ""
        ).trim();

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

    const allPeople = useMemo(
        () => [
            ...students.map((student) => ({
                ...student,
                _type: "student",
            })),
            ...staff.map((person) => ({
                ...person,
                _type: "staff",
            })),
            ...faculties.map((faculty) => ({
                ...faculty,
                _type: "faculty",
            })),
        ],
        [students, staff, faculties]
    );

    const filteredPeople = useMemo(() => {
        const value = search
            .toLowerCase()
            .trim();

        if (!value) {
            return [];
        }

        return allPeople
            .filter((person) => {
                const name =
                    getName(person).toLowerCase();

                const id = String(
                    getPersonId(person)
                ).toLowerCase();

                return (
                    name.includes(value) ||
                    id.includes(value)
                );
            })
            .slice(0, 8);
    }, [search, allPeople]);

    const selectedStudent = useMemo(() => {
        if (!pickedKey) {
            return null;
        }

        return (
            allPeople.find(
                (person) =>
                    personKey(person) ===
                    pickedKey
            ) || null
        );
    }, [pickedKey, allPeople]);

    const [studentVisits, setStudentVisits] =
        useState([]);

    const [studentRecords, setStudentRecords] =
        useState([]);

    const [
        studentDetailsLoading,
        setStudentDetailsLoading,
    ] = useState(false);

    const [
        studentDetailsError,
        setStudentDetailsError,
    ] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadStudentDetails = async () => {
            if (
                !selectedStudent ||
                selectedStudent._type !== "student"
            ) {
                setStudentVisits([]);
                setStudentRecords([]);
                setStudentDetailsLoading(false);
                setStudentDetailsError(false);
                return;
            }

            const studentId = getPersonId(
                selectedStudent
            );

            setStudentDetailsLoading(true);
            setStudentDetailsError(false);

            const visitRequest = api.get(
                `/clinic-visits?student_id=${encodeURIComponent(
                    studentId
                )}`
            );

            const recordRequest = api.get(
                `/medical-records?student_id=${encodeURIComponent(
                    studentId
                )}`
            );

            const [
                visitResult,
                recordResult,
            ] = await Promise.allSettled([
                visitRequest,
                recordRequest,
            ]);

            if (cancelled) {
                return;
            }

            const getRows = (result) => {
                if (
                    result.status !==
                    "fulfilled"
                ) {
                    return [];
                }

                const data =
                    result.value?.data;

                if (Array.isArray(data)) {
                    return data;
                }

                if (
                    Array.isArray(data?.data)
                ) {
                    return data.data;
                }

                return [];
            };

            setStudentVisits(
                getRows(visitResult)
            );

            setStudentRecords(
                getRows(recordResult)
            );

            if (
                visitResult.status ===
                    "rejected" ||
                recordResult.status ===
                    "rejected"
            ) {
                setStudentDetailsError(true);
            }

            setStudentDetailsLoading(false);
        };

        loadStudentDetails();

        return () => {
            cancelled = true;
        };
    }, [selectedStudent]);

    const totalStudents =
        dashboard?.total_students ??
        students.length;

    const totalVisits =
        dashboard?.total_visits ?? 0;

    const totalRecords =
        dashboard?.total_records ??
        totalVisits;

    const recentVisits = useMemo(
        () => dashboard?.recent_visits || [],
        [dashboard]
    );

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
                                    ] = raw
                                        .split("-")
                                        .map(Number);

                                    return (
                                        rowMonth - 1 ===
                                            month &&
                                        rowYear ===
                                            year
                                    );
                                }

                                return (
                                    Number(raw) - 1 ===
                                        month &&
                                    Number(row.year) ===
                                        year
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
                            const date =
                                parseDate(
                                    visit.visit_date ||
                                        visit.created_at
                                );

                            if (!date) {
                                return false;
                            }

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
                ? visitsOverview.map(
                      (month) => month.value
                  )
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

    const todayKey = toDateKey(
        new Date()
    );

    const isToday =
        selectedDate === todayKey;

    const displayDate = new Date(
        `${selectedDate}T00:00:00`
    );

    const selectedVisits = useMemo(
        () =>
            recentVisits.filter(
                (visit) =>
                    visitDateKey(
                        visit.visit_date ||
                            visit.created_at
                    ) === selectedDate
            ),
        [
            recentVisits,
            selectedDate,
        ]
    );

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
                (a, b) =>
                    b.value - a.value
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

    const countBySex = (value) =>
        students.filter(
            (student) =>
                String(
                    student.sex ||
                        student.gender ||
                        ""
                ).toLowerCase() === value
        ).length;

    const male = countBySex("male");
    const female = countBySex("female");

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

    const recentStudents = useMemo(
        () =>
            [...students]
                .sort((a, b) => {
                    const dateA =
                        parseDate(
                            a.created_at ||
                                a.date_registered
                        )?.getTime() || 0;

                    const dateB =
                        parseDate(
                            b.created_at ||
                                b.date_registered
                        )?.getTime() || 0;

                    return dateB - dateA;
                })
                .slice(0, 5),
        [students]
    );

    const activityFeed = useMemo(() => {
        const visitItems =
            recentVisits.map(
                (visit, index) => ({
                    key: `visit-${
                        visit.id ?? index
                    }`,
                    icon: Stethoscope,
                    color: "bg-[#fbe7ec] text-[#a81e3c]",
                    title:
                        "New clinic visit recorded",
                    description: `${getName(
                        visit.student
                    )} · ${
                        visit.reason ||
                        "Other"
                    }`,
                    date:
                        visit.visit_date ||
                        visit.created_at,
                })
            );

        const studentItems =
            students
                .filter(
                    (student) =>
                        student.created_at ||
                        student.date_registered
                )
                .map(
                    (student, index) => ({
                        key: `student-${
                            student.id ??
                            index
                        }`,
                        icon: UserPlus,
                        color: "bg-[#fcefe6] text-[#9a3412]",
                        title:
                            "New student registered",
                        description:
                            getName(student),
                        date:
                            student.created_at ||
                            student.date_registered,
                    })
                );

        return [
            ...visitItems,
            ...studentItems,
        ]
            .filter(
                (item) =>
                    parseDate(item.date)
            )
            .sort(
                (a, b) =>
                    parseDate(b.date) -
                    parseDate(a.date)
            )
            .slice(0, 5);
    }, [recentVisits, students]);

    const pickStudent = (person) => {
        setPickedKey(
            personKey(person)
        );
    };

    const handleSearchKeyDown = (
        event
    ) => {
        if (event.key === "Escape") {
            closeSearch();
            event.currentTarget.blur();
            return;
        }

        if (
            event.key === "Enter" &&
            !selectedStudent
        ) {
            const value = search
                .trim()
                .toLowerCase();

            const exact =
                filteredPeople.find(
                    (person) =>
                        String(
                            getPersonId(person)
                        ).toLowerCase() ===
                        value
                );

            const target =
                exact ||
                filteredPeople[0];

            if (target) {
                event.preventDefault();
                pickStudent(target);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#fbf6f5] text-[#1c0f0c]">

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(20%); }
                    100% { transform: translateX(100%); }
                }
                .skeleton-shimmer {
                    background: linear-gradient(90deg, #f3e4e0 0%, #fbf1ee 50%, #f3e4e0 100%);
                    background-size: 800px 100%;
                    animation: shimmer 1.5s ease-in-out infinite;
                }
                .fade-in-up {
                    animation: fadeInUp 0.45s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .skeleton-shimmer, .fade-in-up {
                        animation: none !important;
                    }
                }
            `}</style>

            {loading && (
                <div className="fixed left-0 top-0 z-[60] h-[3px] w-full overflow-hidden bg-[#f6eae7]">
                    <div
                        className="h-full w-1/3 rounded-full bg-[#8b1505]"
                        style={{
                            animation:
                                "loadingBar 1.1s ease-in-out infinite",
                        }}
                    />
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Top bar                                                          */}
            {/* ---------------------------------------------------------------- */}

            <header className="sticky top-0 z-40 flex h-[72px] items-center gap-5 border-b border-[#f0ded9] bg-white px-7">

                <div
                    ref={searchBoxRef}
                    className="relative w-full max-w-xl"
                >
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8918c]"
                    />

                    <input
                        ref={searchInputRef}
                        value={search}
                        onChange={(event) => {
                            setSearch(
                                event.target.value
                            );

                            setPickedKey(null);
                        }}
                        onKeyDown={
                            handleSearchKeyDown
                        }
                        placeholder="Search students, staff, or faculty by name or ID..."
                        aria-label="Search students, staff, or faculty"
                        className="w-full rounded-xl border border-[#f0ded9] bg-[#fdf8f7] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#8b1505] focus:bg-white focus:ring-4 focus:ring-[#8b1505]/10"
                    />

                    {!search && (
                        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#f0ded9] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#a8918c] sm:block">
                            /
                        </kbd>
                    )}

                    {search && (
                        <div className="absolute left-0 top-full z-30 mt-2 max-h-[calc(100vh-110px)] w-[min(900px,calc(100vw-56px))] overflow-y-auto rounded-xl border border-[#f0ded9] bg-white shadow-xl">

                            {selectedStudent ? (
                                <div className="p-4">

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fcebe7] text-sm font-bold text-[#8b1505]">
                                            {getInitials(
                                                getName(
                                                    selectedStudent
                                                )
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-base font-bold">
                                                    {getName(
                                                        selectedStudent
                                                    )}
                                                </p>

                                                <span className="rounded-full bg-[#fcebe7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8b1505]">
                                                    {TYPE_LABELS[
                                                        selectedStudent._type
                                                    ] || "Student"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#8a736e]">
                                                {TYPE_ID_LABELS[
                                                    selectedStudent._type
                                                ] || "Student ID"}
                                                :{" "}
                                                {getPersonId(
                                                    selectedStudent
                                                )}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                closeSearch
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a736e] hover:bg-[#fdf1ee] hover:text-[#8b1505]"
                                            aria-label="Close student search"
                                        >
                                            <X size={17} />
                                        </button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                                        {selectedStudent._type ===
                                        "student" ? (
                                            <>
                                                <StudentDetail
                                                    label="Course"
                                                    value={
                                                        selectedStudent.course
                                                    }
                                                />

                                                <StudentDetail
                                                    label="Year Level"
                                                    value={
                                                        selectedStudent.year_level
                                                    }
                                                />

                                                <StudentDetail
                                                    label="Section"
                                                    value={
                                                        selectedStudent.section
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <StudentDetail
                                                    label="Position"
                                                    value={
                                                        selectedStudent.position
                                                    }
                                                />

                                                <StudentDetail
                                                    label="Department"
                                                    value={
                                                        selectedStudent.department
                                                    }
                                                />
                                            </>
                                        )}

                                        <StudentDetail
                                            label="Sex"
                                            value={
                                                selectedStudent.sex ||
                                                selectedStudent.gender
                                            }
                                        />

                                        <StudentDetail
                                            label="Birth Date"
                                            value={formatDate(
                                                selectedStudent.birth_date
                                            )}
                                        />

                                        <StudentDetail
                                            label="Contact"
                                            value={
                                                selectedStudent.contact_number
                                            }
                                        />
                                    </div>

                                    <div className="mt-2">
                                        <StudentDetail
                                            label="Address"
                                            value={
                                                selectedStudent.address
                                            }
                                        />
                                    </div>

                                    {/* Clinic Visits */}
                                    {selectedStudent._type ===
                                        "student" && (
                                    <div className="mt-5 border-t border-[#f6eae7] pt-4">
                                        <div className="mb-3 flex items-center justify-between">

                                            <div>
                                                <p className="text-sm font-bold">
                                                    Clinic Visits
                                                </p>

                                                <p className="text-xs text-[#a8918c]">
                                                    Visit history for this student
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-[#fcebe7] px-2.5 py-1 text-xs font-bold text-[#8b1505]">
                                                {
                                                    studentVisits.length
                                                }
                                            </span>
                                        </div>

                                        {studentDetailsLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-12 w-full" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        ) : studentVisits.length ? (
                                            <div className="space-y-2">
                                                {studentVisits
                                                    .slice(
                                                        0,
                                                        5
                                                    )
                                                    .map(
                                                        (
                                                            visit,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    visit.id ??
                                                                    `visit-${index}`
                                                                }
                                                                className="rounded-lg border border-[#f6eae7] bg-[#fdf8f7] p-3"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold">
                                                                            {visit.reason?.trim() ||
                                                                                "Clinic Visit"}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#8a736e]">
                                                                            {formatDate(
                                                                                visit.visit_date ||
                                                                                    visit.created_at
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <Stethoscope
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="shrink-0 text-[#8b1505]"
                                                                    />
                                                                </div>

                                                                {(visit.notes ||
                                                                    visit.symptoms ||
                                                                    visit.diagnosis) && (
                                                                    <p className="mt-2 text-xs leading-5 text-[#6b5551]">
                                                                        {visit.notes ||
                                                                            visit.symptoms ||
                                                                            visit.diagnosis}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        ) : (
                                            <p className="rounded-lg bg-[#fdf8f7] px-3 py-4 text-center text-xs text-[#a8918c]">
                                                No clinic visits found for this student.
                                            </p>
                                        )}
                                    </div>
                                    )}

                                    {/* Records */}
                                    {selectedStudent._type ===
                                        "student" && (
                                    <div className="mt-5 border-t border-[#f6eae7] pt-4">
                                        <div className="mb-3 flex items-center justify-between">

                                            <div>
                                                <p className="text-sm font-bold">
                                                    Medical / Health Records
                                                </p>

                                                <p className="text-xs text-[#a8918c]">
                                                    Health information recorded for this student
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-[#fcefe6] px-2.5 py-1 text-xs font-bold text-[#9a3412]">
                                                {
                                                    studentRecords.length
                                                }
                                            </span>
                                        </div>

                                        {studentDetailsLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-12 w-full" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        ) : studentRecords.length ? (
                                            <div className="space-y-2">
                                                {studentRecords
                                                    .slice(
                                                        0,
                                                        5
                                                    )
                                                    .map(
                                                        (
                                                            record,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    record.id ??
                                                                    `record-${index}`
                                                                }
                                                                className="rounded-lg border border-[#f6eae7] bg-[#fffaf7] p-3"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">

                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold">
                                                                            {record.record_type ||
                                                                                record.type ||
                                                                                record.title ||
                                                                                "Health Record"}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#8a736e]">
                                                                            {formatDate(
                                                                                record.record_date ||
                                                                                    record.date ||
                                                                                    record.created_at
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <FileText
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="shrink-0 text-[#9a3412]"
                                                                    />
                                                                </div>

                                                                <div className="mt-2 space-y-1 text-xs text-[#6b5551]">

                                                                    {record.diagnosis && (
                                                                        <p>
                                                                            <span className="font-semibold">
                                                                                Diagnosis:
                                                                            </span>{" "}
                                                                            {
                                                                                record.diagnosis
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {record.notes && (
                                                                        <p>
                                                                            <span className="font-semibold">
                                                                                Notes:
                                                                            </span>{" "}
                                                                            {
                                                                                record.notes
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {record.allergies && (
                                                                        <p>
                                                                            <span className="font-semibold">
                                                                                Allergies:
                                                                            </span>{" "}
                                                                            {
                                                                                record.allergies
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        ) : (
                                            <p className="rounded-lg bg-[#fffaf7] px-3 py-4 text-center text-xs text-[#a8918c]">
                                                No medical or health records found for this student.
                                            </p>
                                        )}
                                    </div>
                                    )}

                                    {studentDetailsError &&
                                        selectedStudent._type ===
                                            "student" && (
                                        <p className="mt-3 rounded-lg bg-[#fdeeea] px-3 py-2 text-xs text-[#8b1505]">
                                            Some student history could not be loaded. Check that the clinic visit and medical record API routes are available.
                                        </p>
                                    )}

                                    <Link
                                        to="/students"
                                        onClick={
                                            closeSearch
                                        }
                                        className={`mt-4 flex items-center justify-center gap-1 rounded-lg bg-[#8b1505] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6f1004] ${FOCUS_RING}`}
                                    >
                                        View{" "}
                                        {TYPE_LABELS[
                                            selectedStudent._type
                                        ] || "Student"}{" "}
                                        Profile
                                        <ChevronRight
                                            size={14}
                                        />
                                    </Link>
                                </div>
                            ) : filteredPeople.length ? (
                                filteredPeople.map(
                                    (
                                        person,
                                        index
                                    ) => (
                                        <button
                                            type="button"
                                            key={
                                                personKey(
                                                    person
                                                ) ??
                                                `person-${index}`
                                            }
                                            onClick={() =>
                                                pickStudent(
                                                    person
                                                )
                                            }
                                            className="flex w-full items-center gap-3 border-b border-[#f6eae7] px-4 py-3 text-left last:border-b-0 hover:bg-[#fdf5f3]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                                {getInitials(
                                                    getName(
                                                        person
                                                    )
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">
                                                    {getName(
                                                        person
                                                    )}
                                                </p>

                                                <p className="text-xs text-[#a8918c]">
                                                    {TYPE_LABELS[
                                                        person._type
                                                    ] ||
                                                        "Student"}{" "}
                                                    ·{" "}
                                                    {getPersonId(
                                                        person
                                                    )}
                                                </p>
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className="shrink-0 text-[#d9c4bf]"
                                            />
                                        </button>
                                    )
                                )
                            ) : (
                                <p className="px-4 py-5 text-center text-sm text-[#a8918c]">
                                    No student, staff, or faculty matches “
                                    {search.trim()}”.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-4">

                    {/* Notifications */}
                    <div
                        ref={bellRef}
                        className="relative"
                    >
                        <button
                            onClick={() => {
                                setBellOpen(
                                    (open) =>
                                        !open
                                );

                                setProfileOpen(
                                    false
                                );

                                setBellSeen(true);
                            }}
                            aria-label="Notifications"
                            aria-expanded={
                                bellOpen
                            }
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#6b5551] hover:bg-[#fcebe7] hover:text-[#8b1505] ${FOCUS_RING}`}
                        >
                            <Bell size={21} />

                            {activityFeed.length >
                                0 &&
                                !bellSeen && (
                                    <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#d33a5c] ring-2 ring-white" />
                                )}
                        </button>

                        {bellOpen && (
                            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">

                                <div className="border-b border-[#f0ded9] px-4 py-3">
                                    <p className="text-sm font-semibold">
                                        Notifications
                                    </p>
                                </div>

                                {activityFeed.length ? (
                                    <ul className="max-h-80 overflow-y-auto">
                                        {activityFeed.map(
                                            (item) => (
                                                <li
                                                    key={
                                                        item.key
                                                    }
                                                    className="flex items-center gap-3 border-b border-[#f6eae7] px-4 py-3 last:border-b-0"
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color}`}
                                                    >
                                                        <item.icon
                                                            size={
                                                                15
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
                                                            }
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-[11px] text-[#a8918c]">
                                                        {formatRelative(
                                                            item.date
                                                        )}
                                                    </span>
                                                </li>
                                            )
                                        )}
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

                    {/* Profile */}
                    <div
                        ref={profileRef}
                        className="relative"
                    >
                        <button
                            onClick={() => {
                                setProfileOpen(
                                    (open) =>
                                        !open
                                );

                                setBellOpen(false);
                            }}
                            aria-expanded={
                                profileOpen
                            }
                            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#fdf5f3] ${FOCUS_RING}`}
                        >
                            <Avatar
                                user={user}
                                size={40}
                                iconSize={21}
                            />

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
                                className={`transition ${
                                    profileOpen
                                        ? "-rotate-90"
                                        : "rotate-90"
                                }`}
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-[#f0ded9] bg-white shadow-xl">

                                <div className="border-b border-[#f0ded9] px-4 py-4">
                                    <div className="flex items-center gap-3">

                                        <Avatar
                                            user={user}
                                            size={40}
                                            iconSize={20}
                                        />

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
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
                                        setProfileOpen(
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
                                        setProfileOpen(
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

            {/* ---------------------------------------------------------------- */}
            {/* Main                                                             */}
            {/* ---------------------------------------------------------------- */}

            <main className="w-full p-6 lg:p-7">

                {/* Welcome Banner */}
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
                                Welcome back,{" "}
                                {firstName}!
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-[#8b1505] ring-1 ring-white/70">
                                    {user?.role ||
                                        "Clinic Staff"}
                                </span>

                                <span className="text-[15px] text-[#7c625d]">
                                    Here's what's happening at the clinic.
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 self-start rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:self-auto">

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
                                    {" — "}
                                    {
                                        selectedVisits.length
                                    }{" "}
                                    {selectedVisits.length ===
                                    1
                                        ? "visit"
                                        : "visits"}
                                </p>
                            </div>

                            <input
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={(
                                    event
                                ) => {
                                    if (
                                        event.target
                                            .value
                                    ) {
                                        setSelectedDate(
                                            event
                                                .target
                                                .value
                                        );
                                    }
                                }}
                                className="ml-1 w-9 cursor-pointer rounded-lg border-0 bg-transparent text-transparent outline-none"
                                title="Pick a date"
                                aria-label="Pick a date"
                            />

                            {!isToday && (
                                <button
                                    onClick={() =>
                                        setSelectedDate(
                                            todayKey
                                        )
                                    }
                                    className={`flex items-center gap-1.5 rounded-lg bg-[#8b1505] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#6f1004] ${FOCUS_RING}`}
                                >
                                    <RotateCcw
                                        size={13}
                                    />

                                    Back to today
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-center gap-3 rounded-xl border border-[#f3c9c1] bg-[#fdeeea] px-4 py-3 text-sm text-[#8b1505]"
                    >
                        <AlertCircle
                            size={18}
                            className="shrink-0"
                        />

                        <p className="flex-1">
                            Couldn't load the dashboard data, so the numbers below may be incomplete.
                        </p>

                        <button
                            onClick={
                                loadDashboard
                            }
                            className={`rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#8b1505] ring-1 ring-[#f3c9c1] hover:bg-[#fdf5f3] ${FOCUS_RING}`}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Overview */}
                <section className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
                    {overview.map((item, index) => {
                        const Icon =
                            item.icon;

                        const change =
                            percentChange(
                                item.trend
                            );

                        return (
                            <div
                                key={
                                    item.label
                                }
                                className={`rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f0bdb2] hover:shadow-md ${
                                    loading
                                        ? ""
                                        : "fade-in-up"
                                }`}
                                style={
                                    loading
                                        ? undefined
                                        : {
                                              animationDelay: `${
                                                  index *
                                                  60
                                              }ms`,
                                          }
                                }
                            >
                                <div className="mb-4 flex items-center gap-2">

                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor:
                                                item
                                                    .accent
                                                    .bg,
                                            color:
                                                item
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
                                        {
                                            item.label
                                        }
                                    </span>
                                </div>

                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <p className="text-3xl font-bold leading-none">
                                        {
                                            item.value
                                        }
                                    </p>
                                )}

                                <div className="mt-3 flex items-end justify-between gap-3">

                                    {change !==
                                    null ? (
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
                                                vs last month
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-[#a8918c]">
                                            {
                                                item.caption
                                            }
                                        </p>
                                    )}

                                    {item.trend && (
                                        <Sparkline
                                            values={
                                                item.trend
                                            }
                                            color={
                                                item
                                                    .accent
                                                    .line
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Visits + Quick Actions */}
                <div
                    className={`mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "80ms" }
                    }
                >

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-7">

                        <SectionHeader
                            icon={Stethoscope}
                            title={
                                isToday
                                    ? "Today's visits"
                                    : "Visits on this day"
                            }
                            subtitle={
                                isToday
                                    ? "Students seen at the clinic today"
                                    : `Students seen on ${formatDate(
                                          displayDate
                                      )}`
                            }
                            link="/clinic-visits"
                            linkLabel="All visits"
                        />

                        {loading ? (
                            <div className="space-y-3">
                                {[0, 1, 2].map(
                                    (row) => (
                                        <div
                                            key={`visit-skeleton-${row}`}
                                            className="flex items-center gap-3"
                                        >
                                            <Skeleton className="h-9 w-9 shrink-0 !rounded-full" />
                                            <Skeleton className="h-4 flex-1" />
                                            <Skeleton className="h-6 w-16 shrink-0 !rounded-full" />
                                        </div>
                                    )
                                )}
                            </div>
                        ) : selectedVisits.length ? (
                            <ul>
                                {selectedVisits
                                    .slice(
                                        0,
                                        6
                                    )
                                    .map(
                                        (
                                            visit,
                                            index
                                        ) => (
                                            <li
                                                key={
                                                    visit.id ??
                                                    index
                                                }
                                                className="flex items-center gap-3 border-t border-[#f6eae7] py-3 first:border-t-0 first:pt-0"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                                    {getInitials(
                                                        getName(
                                                            visit.student
                                                        )
                                                    )}
                                                </div>

                                                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                                                    {getName(
                                                        visit.student
                                                    )}
                                                </p>

                                                <span className="shrink-0 rounded-full bg-[#fdf1ee] px-2.5 py-1 text-xs font-medium text-[#8b1505]">
                                                    {visit.reason?.trim() ||
                                                        "Other"}
                                                </span>
                                            </li>
                                        )
                                    )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center py-8 text-center">

                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fcebe7] text-[#8b1505]">
                                    <Stethoscope
                                        size={22}
                                    />
                                </div>

                                <p className="text-sm font-semibold">
                                    No visits logged{" "}
                                    {isToday
                                        ? "today"
                                        : "for this date"}
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

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

                        <SectionHeader
                            icon={Activity}
                            title="Quick actions"
                            subtitle="Things you do most often"
                        />

                        <div className="space-y-2.5">
                            {QUICK_ACTIONS.map(
                                (action) => (
                                    <QuickAction
                                        key={
                                            action.to
                                        }
                                        {...action}
                                    />
                                )
                            )}
                        </div>
                    </section>
                </div>

                {/* Charts */}
                <section
                    className={`mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "140ms" }
                    }
                >

                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

                        <SectionHeader
                            icon={CalendarDays}
                            title="Clinic Visits Overview"
                            subtitle={
                                isEstimated
                                    ? "Based on the latest visits only"
                                    : "Number of visits per month"
                            }
                        />

                        {loading ? (
                            <Skeleton className="h-[200px] w-full" />
                        ) : (
                            <LineAreaChart
                                data={
                                    visitsOverview
                                }
                                color={
                                    MAROON
                                }
                            />
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-4">

                        <SectionHeader
                            icon={PieIcon}
                            title="Visit Reasons"
                            subtitle="Most common reasons in the latest visits"
                        />

                        {loading ? (
                            <Skeleton className="h-[140px] w-full" />
                        ) : reasons.length ? (
                            <div className="flex items-center gap-5">

                                <DonutChart
                                    data={
                                        reasons
                                    }
                                    total={
                                        reasonsTotal
                                    }
                                    centerLabel="Latest visits"
                                    centerValue={
                                        reasonsTotal
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
                                No visit reasons recorded yet.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-3">

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
                                            {students.length
                                                ? Math.round(
                                                      (item.value /
                                                          students.length) *
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

                {/* Recent Students + Activity */}
                <div
                    className={`grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "200ms" }
                    }
                >

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-7">

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
                                    {loading ? (
                                        [0, 1, 2].map(
                                            (row) => (
                                                <tr
                                                    key={`recent-skeleton-${row}`}
                                                    className="border-t border-[#f6eae7] first:border-t-0"
                                                >
                                                    <td className="px-2 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <Skeleton className="h-8 w-8 shrink-0 !rounded-full" />
                                                            <Skeleton className="h-4 w-32" />
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-3">
                                                        <Skeleton className="h-4 w-16" />
                                                    </td>

                                                    <td className="px-2 py-3">
                                                        <Skeleton className="h-4 w-24" />
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : recentStudents.length ? (
                                        recentStudents.map(
                                            (
                                                student,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        student.id ??
                                                        `recent-${index}`
                                                    }
                                                    className="border-t border-[#f6eae7] hover:bg-[#fdf5f3]"
                                                >
                                                    <td className="px-2 py-3">

                                                        <div className="flex items-center gap-2.5">

                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fcebe7] text-xs font-bold text-[#8b1505]">
                                                                {getInitials(
                                                                    getName(
                                                                        student
                                                                    )
                                                                )}
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
                                                No students registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

                        <SectionHeader
                            icon={Activity}
                            title="Latest Activities"
                            subtitle="System activities and updates"
                        />

                        <div className="space-y-4">

                            {loading ? (
                                <>
                                    {[0, 1, 2].map(
                                        (row) => (
                                            <div
                                                key={`activity-skeleton-${row}`}
                                                className="flex items-center gap-3"
                                            >
                                                <Skeleton className="h-9 w-9 shrink-0 !rounded-full" />

                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                    <Skeleton className="h-3.5 w-3/5" />
                                                    <Skeleton className="h-3 w-2/5" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </>
                            ) : activityFeed.length ? (
                                activityFeed.map(
                                    (item) => (
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
                                                size={16}
                                                className="shrink-0 text-[#d9c4bf]"
                                            />
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="py-10 text-center text-sm text-[#a8918c]">
                                    No recent activity.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* ---------------------------------------------------------------- */}
            {/* NEW AI CHATBOT                                                   */}
            {/* ---------------------------------------------------------------- */}

            <AIChatbot />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                           */
/* -------------------------------------------------------------------------- */

function StudentDetail({
    label,
    value,
}) {
    const displayValue =
        value !== undefined &&
        value !== null &&
        String(value).trim()
            ? value
            : "—";

    return (
        <div className="rounded-lg border border-[#f6eae7] bg-[#fdf8f7] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a8918c]">
                {label}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold text-[#1c0f0c]">
                {displayValue}
            </p>
        </div>
    );
}

function Avatar({
    user,
    size = 40,
    iconSize = 20,
}) {
    const src = getImageUrl(
        user?.profile_picture
    );

    return (
        <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fcebe7] text-[#8b1505]"
            style={{
                width: size,
                height: size,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt="Profile"
                    className="h-full w-full object-cover"
                />
            ) : (
                <UserRound
                    size={iconSize}
                />
            )}
        </div>
    );
}

function Skeleton({
    className = "",
}) {
    return (
        <div
            className={`skeleton-shimmer rounded-lg ${className}`}
        />
    );
}

function Sparkline({
    values,
    color,
}) {
    const width = 90;
    const height = 34;

    if (
        !values ||
        values.length < 2
    ) {
        return null;
    }

    const max = Math.max(
        ...values,
        1
    );

    const min = Math.min(
        ...values,
        0
    );

    const range =
        max - min || 1;

    const points = values.map(
        (value, index) => {
            const x =
                (index /
                    (values.length - 1)) *
                width;

            const y =
                height -
                ((value - min) /
                    range) *
                    height;

            return [x, y];
        }
    );

    const path = points
        .map(
            ([x, y], index) =>
                `${
                    index === 0
                        ? "M"
                        : "L"
                }${x},${y}`
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

            <circle
                cx={lastX}
                cy={lastY}
                r="2.5"
                fill={color}
            />
        </svg>
    );
}

function LineAreaChart({
    data,
    color,
}) {
    const width = 560;
    const height = 200;
    const padding = 24;

    const values = data.map(
        (item) => item.value
    );

    const max = Math.max(
        ...values,
        4
    );

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
                    index === 0
                        ? "M"
                        : "L"
                }${point.x},${point.y}`
        )
        .join(" ");

    const areaPath = `${linePath} L${
        points[points.length - 1]
            .x
    },${
        height - padding
    } L${points[0].x},${
        height - padding
    } Z`;

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
            role="img"
            aria-label="Clinic visits per month"
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
                (gridLine) => {
                    const y =
                        height -
                        padding -
                        gridLine *
                            (height -
                                padding *
                                    2);

                    return (
                        <line
                            key={
                                gridLine
                            }
                            x1={
                                padding
                            }
                            x2={
                                width -
                                padding
                            }
                            y1={y}
                            y2={y}
                            stroke="#f8ecea"
                            strokeWidth="1"
                        />
                    );
                }
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
                    <g
                        key={index}
                    >
                        <circle
                            cx={
                                point.x
                            }
                            cy={
                                point.y
                            }
                            r={
                                index ===
                                points.length -
                                    1
                                    ? 4
                                    : 3
                            }
                            fill={
                                color
                            }
                        />

                        {point.value >
                            0 && (
                            <text
                                x={
                                    point.x
                                }
                                y={
                                    point.y -
                                    9
                                }
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="700"
                                fill={
                                    color
                                }
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
                (
                    point,
                    index
                ) => (
                    <text
                        key={`label-${index}`}
                        x={point.x}
                        y={
                            height -
                            4
                        }
                        textAnchor="middle"
                        fontSize="10"
                        fill="#a8918c"
                        fontWeight="500"
                    >
                        {
                            point.label
                        }
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
        (size -
            strokeWidth) /
        2;

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
                aria-hidden="true"
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

                {data.map(
                    (item) => {
                        const fraction =
                            item.value /
                            total;

                        const dash =
                            fraction *
                            circumference;

                        const offset =
                            cumulative *
                            circumference;

                        cumulative +=
                            fraction;

                        return (
                            <circle
                                key={
                                    item.label
                                }
                                cx={
                                    size /
                                    2
                                }
                                cy={
                                    size /
                                    2
                                }
                                r={
                                    radius
                                }
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
                    }
                )}
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
    linkLabel = "View all",
}) {
    const Icon = icon;

    return (
        <div className="mb-5 flex items-start justify-between gap-3">

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
                    className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#8b1505] hover:underline"
                >
                    {linkLabel}

                    <ChevronRight
                        size={14}
                    />
                </Link>
            )}
        </div>
    );
}

function QuickAction({
    to,
    icon,
    title,
    description,
    primary = false,
}) {
    const Icon = icon;

    return (
        <Link
            to={to}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${FOCUS_RING} ${
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
                        primary
                            ? "text-white"
                            : "text-[#1c0f0c]"
                    }`}
                >
                    {title}
                </p>

                <p
                    className={`truncate text-xs ${
                        primary
                            ? "text-white/75"
                            : "text-[#8a736e]"
                    }`}
                >
                    {description}
                </p>
            </div>

            <ChevronRight
                size={16}
                className={`shrink-0 ${
                    primary
                        ? "text-white/70"
                        : "text-[#d9c4bf]"
                }`}
            />
        </Link>
    );
}

export default Dashboard;