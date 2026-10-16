import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getImageUrl, getLastMonths, isDateOnly, parseDate, toDateKey, visitDateKey } from "../utils/dashboard";
import { Avatar, DonutChart, LineAreaChart, MiniBarChart, QuickAction, SectionHeader, Skeleton, StudentDetail } from "../components/dashboard/DashboardWidgets";
import "./Dashboard.css";

const DashboardAssistant = lazy(() =>
    import("../components/dashboard/DashboardAssistant").then((m) => ({
        default: m.DashboardAssistant,
    }))
);

import {
    Users,
    Stethoscope,
    FileText,
    Search,
    Bell,
    CalendarDays,
    ClipboardList,
    UserPlus,
    Activity,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
    HeartPulse,
    ArrowUp,
    ArrowDown,
    ArrowLeft,

    PieChart as PieIcon,
    X,
    RotateCcw,
    AlertCircle,
    Sun,
    Moon,
    Trash2,
    Pencil,
    Pill,
    CheckCircle2,
} from "lucide-react";
import {
    getStoredNotifications,
    clearAllClinicNotifications,
    markAllNotificationsAsRead,
    type ClinicNotification,
} from "../services/notifications";
import ThemeToggle from "../components/common/ThemeToggle";
import { applyTheme } from "../utils/theme";

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40";

const ACTIVITIES_PER_PAGE = 5;

const ACCENTS = {
    cocoa: { icon: "#806748", bg: "#f3ebdf", line: "#8a6f50" },
    sand: { icon: "#8a6f50", bg: "#f5eee4", line: "#a88b68" },
    clay: { icon: "#91765c", bg: "#f2e9dc", line: "#a98260" },
    taupe: { icon: "#7a725f", bg: "#f0ece4", line: "#8e7d62" },
};

const DONUT_COLORS = [
    "#731124",
    "#cc785c",
    "#d99b26",
    "#3e8168",
    "#8a6f50",
    "#9e6b7d",
];

const QUICK_ACTIONS = [
    {
        to: "/clinic-visits",
        icon: Stethoscope,
        title: "Log a clinic visit",
        description: "Record a patient who came to the clinic",
        primary: true,
    },
    {
        to: "/students",
        icon: UserPlus,
        title: "Register a patient",
        description: "Add a new patient profile",
    },
    {
        to: "/clinic-visits",
        icon: FileText,
        title: "Clinic visit records",
        description: "Review recorded visit details",
    },
    {
        to: "/reports",
        icon: ClipboardList,
        title: "Reports",
        description: "View clinic summaries",
    },
];





const getName = (person) => {
    if (!person) return "Unknown Patient";
    if (person.name) return person.name;
    const fullName = `${person.first_name || ""} ${person.last_name || ""}`.trim();
    return fullName || "Unknown Patient";
};

const getVisitPatient = (visit) => {
    if (visit?.student) {
        return {
            ...visit.student,
            _type: "student",
            typeLabel: "Student",
        };
    }
    if (visit?.faculty) {
        return {
            ...visit.faculty,
            _type: "faculty",
            typeLabel: "Faculty",
        };
    }
    if (visit?.staff) {
        return {
            ...visit.staff,
            _type: "staff",
            typeLabel: "Staff",
        };
    }
    return null;
};

const getInitials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";

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
            (today.getTime() - date.getTime()) / 86400000
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





function Dashboard() {
    const navigate = useNavigate();

    const searchInputRef = useRef(null);
    const searchBoxRef = useRef(null);
    const bellRef = useRef(null);
    const profileRef = useRef(null);

    const [dashboard, setDashboard] = useState(() => {
        const cached = localStorage.getItem("tcc-dashboard-cache");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                return null;
            }
        }
        return null;
    });
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");

        if (!saved) {
            return null;
        }

        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    });
    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [pickedKey, setPickedKey] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [bellSeen, setBellSeen] = useState(false);
    const [customNotifications, setCustomNotifications] = useState<ClinicNotification[]>(() =>
        getStoredNotifications()
    );

    useEffect(() => {
        const handleNotifUpdate = () => {
            setCustomNotifications(getStoredNotifications());
        };
        window.addEventListener("tcc-notifications-updated", handleNotifUpdate);
        window.addEventListener("storage", handleNotifUpdate);
        return () => {
            window.removeEventListener("tcc-notifications-updated", handleNotifUpdate);
            window.removeEventListener("storage", handleNotifUpdate);
        };
    }, []);
    const [loading, setLoading] = useState(() => {
        // If we already have cached data, don't show blocking loading state
        return !localStorage.getItem("tcc-dashboard-cache");
    });
    const [error, setError] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() =>
        toDateKey(new Date())
    );
    const [activityPage, setActivityPage] = useState(1);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return undefined;
        }

        const timeout = setTimeout(() => loadDashboard(), 0);

        return () => clearTimeout(timeout);
    }, [navigate]);

    useEffect(() => {
        let active = true;
        api.get("/me")
            .then((res) => {
                if (active && res.data?.user) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
            })
            .catch(() => {
                // Keep local user if network error
            });

        return () => {
            active = false;
        };
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
        setShowSearchDropdown(false);
    };

    useOutsideClick(
        searchBoxRef,
        () => setShowSearchDropdown(false),
        showSearchDropdown
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

    async function loadDashboard() {
        // If we don't have dashboard data, show loading; otherwise refresh smoothly in background
        if (!dashboard) {
            setLoading(true);
        }
        setError(false);

        try {
            const response = await api.get("/dashboard");
            setDashboard(response.data);
            try {
                localStorage.setItem("tcc-dashboard-cache", JSON.stringify(response.data));
            } catch {
                // ignore storage quota errors
            }
        } catch (loadError: any) {
            console.error(
                "Dashboard loading error:",
                loadError
            );

            if (loadError?.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const term = search.trim();

        if (!term) {
            setStudents([]);
            setStaff([]);
            setFaculties([]);
            setSearchLoading(false);
            return undefined;
        }

        setSearchLoading(true);
        let cancelled = false;
        const timeout = setTimeout(async () => {
            try {
                const [studentResult, staffResult, facultyResult] = await Promise.allSettled([
                    api.get("/students", { params: { search: term, per_page: 8 } }),
                    api.get("/staff", { params: { search: term, per_page: 8 } }),
                    api.get("/faculties", { params: { search: term, per_page: 8 } }),
                ]);
                if (!cancelled) {
                    setStudents(studentResult.status === "fulfilled" ? studentResult.value.data?.data || [] : []);
                    setStaff(staffResult.status === "fulfilled" ? staffResult.value.data?.data || [] : []);
                    setFaculties(facultyResult.status === "fulfilled" ? facultyResult.value.data?.data || [] : []);
                    setSearchLoading(false);
                }
            } catch (searchError) {
                if (!cancelled) {
                    console.error("Student search error:", searchError);
                    setStudents([]);
                    setStaff([]);
                    setFaculties([]);
                    setSearchLoading(false);
                }
            }
        }, 200);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [search]);

    const logout = async () => {
        setProfileOpen(false);

        try {
            api.post("/logout", {}, { timeout: 3000 }).catch((logoutError) => {
                console.error(
                    "Logout error:",
                    logoutError
                );
            });
        } catch {
            // ignore
        }

        applyTheme("light");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tcc-dashboard-cache");

        navigate("/login", { replace: true });
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

        const tokens = value.split(/[\s,]+/).filter((t) => t && t !== "-");

        return allPeople
            .filter((person) => {
                const name =
                    getName(person).toLowerCase();

                const id = String(
                    getPersonId(person)
                ).toLowerCase();
                const position = String(person.position || "").toLowerCase();
                const department = String(person.department || "").toLowerCase();
                const course = String(person.course || "").toLowerCase();
                const personType = String(person._type || "").toLowerCase();
                const combined = `${id} ${name} ${position} ${department} ${course} ${personType}`;

                if (combined.includes(value) || name.includes(value) || id.includes(value) || course.includes(value)) {
                    return true;
                }

                return tokens.length > 0 && tokens.every((token) => combined.includes(token));
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
            if (!selectedStudent) {
                setStudentVisits([]);
                setStudentRecords([]);
                setStudentDetailsLoading(false);
                setStudentDetailsError(false);
                return;
            }

            const param =
                selectedStudent._type === "faculty"
                    ? `faculty_id=${encodeURIComponent(selectedStudent.id)}`
                    : selectedStudent._type === "staff"
                    ? `staff_id=${encodeURIComponent(selectedStudent.id)}`
                    : `student_id=${encodeURIComponent(selectedStudent.id)}`;

            setStudentDetailsLoading(true);
            setStudentDetailsError(false);

            const visitRequest = api.get(`/clinic-visits?${param}`);

            const visitResult = await Promise.allSettled([
                visitRequest,
            ]).then(([result]) => result);

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

            const visits = getRows(visitResult);

            setStudentVisits(visits);
            setStudentRecords(
                visits
                    .filter(
                        (visit) =>
                            visit.assessment ||
                            visit.treatment ||
                            visit.remarks ||
                            visit.symptoms
                    )
                    .map((visit) => ({
                        id: `visit-${visit.id}`,
                        record_type: visit.reason || "Clinic visit",
                        record_date:
                            visit.visit_date || visit.created_at,
                        diagnosis: visit.assessment,
                        notes:
                            visit.treatment ||
                            visit.remarks ||
                            visit.symptoms,
                    }))
            );

            if (visitResult.status === "rejected") {
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
    const totalPatients =
        dashboard?.total_patients ?? totalStudents + staff.length + faculties.length;

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
        () => getLastMonths(6),
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

    // Show 4 months for the mini bar charts on the overview cards
    const miniBarMonths = useMemo(() => {
        return visitsOverview.slice(-4);
    }, [visitsOverview]);

    const isEstimated =
        !hasMonthlySeries;

    const overview = [
        {
            label: "Total Patients",
            value: totalPatients,
            caption: "Students, staff, and faculty",
            icon: Users,
            barData: miniBarMonths,
            trend: miniBarMonths.map((m) => m.value),
        },
        {
            label: "Clinic Visits",
            value: totalVisits,
            caption: "All recorded visits",
            icon: Stethoscope,
            barData: miniBarMonths,
            trend: miniBarMonths.map((m) => m.value),
        },
        {
            label: "Medical Records",
            value: totalRecords,
            caption: "Records on file",
            icon: FileText,
            barData: miniBarMonths,
            trend: miniBarMonths.map((m) => m.value),
        },
        {
            label: "Recent Activity",
            value: recentVisits.length,
            caption: "Latest visits shown",
            icon: Activity,
            barData: miniBarMonths,
            trend: miniBarMonths.map((m) => m.value),
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
        const count: Record<string, number> = {};

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

    const male = Math.max(
        0,
        Number(
            dashboard?.patient_gender_counts?.male ??
            dashboard?.student_gender_counts?.male
        ) || 0
    );
    const female = Math.max(
        0,
        Number(
            dashboard?.patient_gender_counts?.female ??
            dashboard?.student_gender_counts?.female
        ) || 0
    );

    const totalGenderPatients = male + female || totalPatients || 1;

    const gender = [
        {
            label: "Male",
            value: male,
            color: ACCENTS.sand.line,
        },
        {
            label: "Female",
            value: female,
            color: ACCENTS.clay.line,
        },
    ];

    const maxGender = Math.max(
        male,
        female,
        1
    );

    const recentPatients = useMemo(
        () => dashboard?.recent_patients || dashboard?.recent_students || [],
        [dashboard]
    );

    const activityFeed = useMemo(() => {
        const customItems = customNotifications.map((notif) => {
            const isDelete = notif.type === "delete";
            const isEdit = notif.type === "edit";
            let icon = CheckCircle2;
            const color = isDelete
                ? "bg-rose-50 text-rose-600"
                : isEdit
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700";

            if (isDelete) {
                icon = Trash2;
            } else if (isEdit) {
                icon = Pencil;
            } else if (notif.category === "medicine") {
                icon = Pill;
            } else if (notif.category === "visit") {
                icon = Stethoscope;
            } else if (notif.category === "patient") {
                icon = UserPlus;
            }

            return {
                key: notif.key || notif.id,
                icon,
                color,
                title: notif.title,
                description: notif.description,
                date: notif.date,
                read: notif.read,
            };
        });

        const visitItems = recentVisits.map((visit, index) => {
            const patient = getVisitPatient(visit);
            const patientName = patient ? getName(patient) : "Patient";
            const roleSuffix = patient?.typeLabel ? ` (${patient.typeLabel})` : "";
            return {
                key: `visit-${visit.id ?? index}`,
                icon: Stethoscope,
                color: "bg-[#f4ecdf] text-[#a88b68]",
                title: "New clinic visit recorded",
                description: `${patientName}${roleSuffix} · ${visit.reason || "General Consultation"}`,
                date: visit.visit_date || visit.created_at,
            };
        });

        const registrationItems = recentPatients
            .filter(
                (patient) =>
                    patient.created_at ||
                    patient.date_registered
            )
            .map((patient, index) => {
                const type = patient.patient_type || patient._type || "student";
                const typeName =
                    type === "faculty"
                        ? "faculty member"
                        : type === "staff"
                        ? "staff member"
                        : "student";
                return {
                    key: `patient-${patient.id ?? index}`,
                    icon: UserPlus,
                    color: "bg-[#f3ebdf] text-[#8f7154]",
                    title: `New ${typeName} registered`,
                    description: getName(patient),
                    date: patient.created_at || patient.date_registered,
                };
            });

        return [
            ...customItems,
            ...visitItems,
            ...registrationItems,
        ]
            .filter(
                (item) =>
                    parseDate(item.date)
            )
            .sort(
                (a, b) =>
                    (parseDate(b.date)?.getTime() ?? 0) -
                    (parseDate(a.date)?.getTime() ?? 0)
            )
            .slice(0, 50);
    }, [customNotifications, recentVisits, recentPatients]);

    const totalActivityPages = Math.max(
        1,
        Math.ceil(activityFeed.length / ACTIVITIES_PER_PAGE)
    );
    const currentActivityPage = Math.min(
        Math.max(1, activityPage),
        totalActivityPages
    );
    const activityStartIndex = (currentActivityPage - 1) * ACTIVITIES_PER_PAGE;
    const activityEndIndex = Math.min(
        activityStartIndex + ACTIVITIES_PER_PAGE,
        activityFeed.length
    );
    const pagedActivities = useMemo(
        () => activityFeed.slice(activityStartIndex, activityEndIndex),
        [activityFeed, activityStartIndex, activityEndIndex]
    );

    const pickStudent = (person) => {
        setPickedKey(
            personKey(person)
        );
        setShowSearchDropdown(true);
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
        <div className="tcc-theme-shell min-h-screen bg-[#f7f2eb] text-[#302820]">
            {loading && (
                <div className="fixed left-0 top-0 z-[60] h-[3px] w-full overflow-hidden bg-[#eee7de]">
                    <div
                        className="h-full w-1/3 rounded-full bg-[#8a6f50]"
                        style={{
                            animation:
                                "loadingBar 1.1s ease-in-out infinite",
                        }}
                    />
                </div>
            )}





            <header className="sticky top-0 z-40 flex h-[72px] items-center gap-5 border-b border-[#e8dfd4] bg-white px-7">

                <div
                    ref={searchBoxRef}
                    className="relative w-full max-w-xl"
                >
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a99d8f]"
                    />

                    <input
                        ref={searchInputRef}
                        value={search}
                        onFocus={() => {
                            if (search.trim()) {
                                setShowSearchDropdown(true);
                            }
                        }}
                        onChange={(event) => {
                            const value = event.target.value;
                            setSearch(value);
                            setShowSearchDropdown(Boolean(value.trim()));

                            if (!value.trim()) {
                                setStudents([]);
                                setStaff([]);
                                setFaculties([]);
                                setSearchLoading(false);
                            }

                            setPickedKey(null);
                        }}
                        onKeyDown={
                            handleSearchKeyDown
                        }
                        placeholder="Search students, staff, or faculty by name or ID..."
                        aria-label="Search students, staff, or faculty"
                        className="w-full rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10"
                    />

                    {!search ? (
                        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#e8dfd4] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#a99d8f] sm:block">
                            /
                        </kbd>
                    ) : (
                        <button
                            type="button"
                            onClick={closeSearch}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#a99d8f] hover:bg-[#f6f1e9] hover:text-[#3c332a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {showSearchDropdown && Boolean(search.trim()) && (
                        <div className="absolute left-0 top-full z-50 mt-2 max-h-[calc(100vh-110px)] w-[min(900px,calc(100vw-56px))] overflow-y-auto rounded-xl border border-[#e8dfd4] bg-white shadow-xl">

                            {selectedStudent ? (
                                <div className="p-4">

                                    <div className="flex items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPickedKey(null)}
                                            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] text-[#887d70] hover:bg-[#f3ebdf] hover:text-[#8a6f50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]"
                                            aria-label="Back to search results"
                                            title="Back to search results"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3ebdf] text-sm font-bold text-[#8a6f50]">
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

                                                <span className="rounded-full bg-[#f3ebdf] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6f50]">
                                                    {TYPE_LABELS[
                                                        selectedStudent._type
                                                    ] || "Student"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#887d70]">
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
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#887d70] hover:bg-[#f6eee4] hover:text-[#8a6f50]"
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


                                    <div className="mt-5 border-t border-[#eee7de] pt-4">
                                        <div className="mb-3 flex items-center justify-between">

                                            <div>
                                                <p className="text-sm font-bold">
                                                    Clinic Visits
                                                </p>

                                                <p className="text-xs text-[#a99d8f]">
                                                    Visit history for this{" "}
                                                    {selectedStudent._type === "faculty"
                                                        ? "faculty member"
                                                        : selectedStudent._type === "staff"
                                                        ? "staff member"
                                                        : "student"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-[#f3ebdf] px-2.5 py-1 text-xs font-bold text-[#8a6f50]">
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
                                                                className="rounded-lg border border-[#eee7de] bg-[#fcfaf6] p-3"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold">
                                                                            {visit.reason?.trim() ||
                                                                                "Clinic Visit"}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#887d70]">
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
                                                                        className="shrink-0 text-[#8a6f50]"
                                                                    />
                                                                </div>

                                                                {(visit.notes ||
                                                                    visit.symptoms ||
                                                                    visit.diagnosis) && (
                                                                    <p className="mt-2 text-xs leading-5 text-[#766959]">
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
                                            <p className="rounded-lg bg-[#fcfaf6] px-3 py-4 text-center text-xs text-[#a99d8f]">
                                                No clinic visits found for this{" "}
                                                {selectedStudent._type === "faculty"
                                                    ? "faculty member"
                                                    : selectedStudent._type === "staff"
                                                    ? "staff member"
                                                    : "student"}.
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-5 border-t border-[#eee7de] pt-4">
                                        <div className="mb-3 flex items-center justify-between">

                                            <div>
                                                <p className="text-sm font-bold">
                                                    Medical / Health Records
                                                </p>

                                                <p className="text-xs text-[#a99d8f]">
                                                    Health details recorded with clinic visits
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-[#f3ebdf] px-2.5 py-1 text-xs font-bold text-[#8f7154]">
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
                                                                className="rounded-lg border border-[#eee7de] bg-[#fcfaf6] p-3"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">

                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold">
                                                                            {record.record_type ||
                                                                                record.type ||
                                                                                record.title ||
                                                                                "Health Record"}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#887d70]">
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
                                                                        className="shrink-0 text-[#8f7154]"
                                                                    />
                                                                </div>

                                                                <div className="mt-2 space-y-1 text-xs text-[#766959]">

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
                                            <p className="rounded-lg bg-[#fcfaf6] px-3 py-4 text-center text-xs text-[#a99d8f]">
                                                No medical or health records found for this{" "}
                                                {selectedStudent._type === "faculty"
                                                    ? "faculty member"
                                                    : selectedStudent._type === "staff"
                                                    ? "staff member"
                                                    : "student"}.
                                            </p>
                                        )}
                                    </div>

                                    {studentDetailsError && (
                                        <p className="mt-3 rounded-lg bg-[#fdeeea] px-3 py-2 text-xs text-red-700">
                                            This person's visit history could not be loaded. Please try again.
                                        </p>
                                    )}

                                    <Link
                                        to={`/students?profile_type=${encodeURIComponent(
                                            selectedStudent._type
                                        )}&profile_code=${encodeURIComponent(
                                            selectedStudent.student_id ||
                                                selectedStudent.staff_id ||
                                                selectedStudent.employee_id ||
                                                selectedStudent.id
                                        )}&search=${encodeURIComponent(
                                            selectedStudent.student_id ||
                                                selectedStudent.staff_id ||
                                                selectedStudent.employee_id ||
                                                selectedStudent.id
                                        )}`}
                                        onClick={
                                            closeSearch
                                        }
                                        className={`mt-4 flex items-center justify-center gap-1 rounded-lg bg-[#8a6f50] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#735a40] ${FOCUS_RING}`}
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
                            ) : searchLoading ? (
                                <div className="flex items-center justify-center gap-2.5 px-4 py-8 text-sm font-medium text-[#8a6f50]">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8a6f50] border-t-transparent" />
                                    <span>Searching students, staff, and faculty...</span>
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
                                            className="flex w-full items-center gap-3 border-b border-[#eee7de] px-4 py-3 text-left last:border-b-0 hover:bg-[#f6f1e9]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ebdf] text-xs font-bold text-[#8a6f50]">
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

                                                <p className="text-xs text-[#a99d8f]">
                                                    {TYPE_LABELS[
                                                        person._type
                                                    ] ||
                                                        "Student"}{" "}
                                                    ·{" "}
                                                    {getPersonId(
                                                        person
                                                    )}
                                                    {person.course ? ` · ${person.course}` : ""}
                                                    {person.department ? ` · ${person.department}` : ""}
                                                </p>
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className="shrink-0 text-[#ded4c9]"
                                            />
                                        </button>
                                    )
                                )
                            ) : (
                                <p className="px-4 py-5 text-center text-sm text-[#a99d8f]">
                                    No student, staff, or faculty matches “
                                    {search.trim()}”.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-4">

                    <ThemeToggle />


                    <div
                        ref={bellRef}
                        className="relative"
                    >
                        <button
                            onClick={() => {
                                setBellOpen((open) => {
                                    const next = !open;
                                    if (next) {
                                        setBellSeen(true);
                                        markAllNotificationsAsRead();
                                    }
                                    return next;
                                });
                                setProfileOpen(false);
                            }}
                            aria-label="Notifications"
                            aria-expanded={
                                bellOpen
                            }
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#766959] hover:bg-[#f3ebdf] hover:text-[#8a6f50] ${FOCUS_RING}`}
                        >
                            <Bell size={21} />

                            {(customNotifications.some((n) => !n.read) || (activityFeed.length > 0 && !bellSeen)) && (
                                <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#a98b70] ring-2 ring-white" />
                            )}
                        </button>

                        {bellOpen && (
                            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-xl">

                                <div className="border-b border-[#e8dfd4] px-4 py-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        Notifications
                                    </p>
                                    {customNotifications.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllClinicNotifications();
                                            }}
                                            className="text-xs text-[#8a6f50] hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {activityFeed.length ? (
                                    <ul className="max-h-80 overflow-y-auto">
                                        {activityFeed.map(
                                            (item) => (
                                                <li
                                                    key={
                                                        item.key
                                                    }
                                                    className="flex items-center gap-3 border-b border-[#eee7de] px-4 py-3 last:border-b-0"
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

                                                        <p className="truncate text-xs text-[#887d70]">
                                                            {
                                                                item.description
                                                            }
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-[11px] text-[#a99d8f]">
                                                        {formatRelative(
                                                            item.date
                                                        )}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="px-4 py-6 text-center text-sm text-[#a99d8f]">
                                        You're all caught up.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-[#e8dfd4]" />


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
                            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#f6f1e9] ${FOCUS_RING}`}
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

                                <p className="text-xs text-[#887d70]">
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
                            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-xl">

                                <div className="border-b border-[#e8dfd4] px-4 py-4">
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

                                            <p className="text-xs text-[#887d70]">
                                                {user?.role ||
                                                    "Clinic Staff"}
                                            </p>
                                        </div>
                                    </div>
                                </div>



                                <Link
                                    to="/settings"
                                    onClick={() =>
                                        setProfileOpen(
                                            false
                                        )
                                    }
                                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#f6f1e9]"
                                >
                                    <Settings
                                        size={18}
                                        className="text-[#8a6f50]"
                                    />

                                    Settings
                                </Link>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 border-t border-[#e8dfd4] px-4 py-3 text-left text-sm text-[#a88b68] hover:bg-[#f4ecdf]"
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





            <main className="flex w-full flex-col p-6 lg:p-7">


                <div className="tcc-hero-banner relative mb-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#f3ebdf] to-[#f2e9dc] px-7 py-7">

                    <HeartPulse
                        size={200}
                        className="pointer-events-none absolute -right-8 -top-10 text-[#c9b08d] opacity-60 dark:opacity-20"
                    />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="text-left">
                            <p className="text-sm font-semibold text-[#8a6f50]">
                                {greeting}
                            </p>

                            <h1 className="mt-1 text-[34px] font-bold leading-tight tracking-tight text-[#302820]">
                                Welcome back,{" "}
                                {firstName}!
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-[#8a6f50] ring-1 ring-white/70">
                                    {user?.role ||
                                        "Clinic Staff"}
                                </span>

                                <span className="text-[15px] text-[#887d70]">
                                    Here's what's happening at the clinic.
                                </span>
                            </div>
                        </div>

                        <div className="tcc-hero-date-card relative flex flex-wrap items-center gap-3 self-start rounded-2xl border border-[#e8dfd4] bg-white p-3 shadow-md transition-all dark:border-[#4e4234] dark:!bg-[#211c17] lg:self-auto">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50] dark:!bg-[#382d21] dark:!text-[#e1ccb0]">
                                <CalendarDays size={20} strokeWidth={2.2} />
                            </div>

                            <div className="pr-1 text-left">
                                <p className="text-sm font-bold text-[#1e1b18] dark:!text-[#f8f3eb]">
                                    {displayDate.toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        }
                                    )}
                                </p>

                                <p className="text-xs font-medium text-[#766959] dark:!text-[#b5a898]">
                                    {displayDate.toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                        }
                                    )}
                                    {" — "}
                                    <span className="font-semibold text-[#8a6f50] dark:!text-[#e1ccb0]">
                                        {selectedVisits.length}{" "}
                                        {selectedVisits.length === 1 ? "visit" : "visits"}
                                    </span>
                                </p>
                            </div>

                            {/* Clean custom calendar picker trigger icon */}
                            <label className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#e8dfd4] bg-[#faf6ef] text-[#8a6f50] transition-colors hover:bg-[#f3ebdf] dark:border-[#4e4234] dark:!bg-[#342a22] dark:!text-[#e1ccb0] dark:hover:!bg-[#44382c]" title="Pick a date">
                                <CalendarDays size={16} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setSelectedDate(event.target.value);
                                        }
                                    }}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-label="Pick a date"
                                />
                            </label>

                            {!isToday && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedDate(
                                            todayKey
                                        )
                                    }
                                    className={`flex items-center gap-1.5 rounded-lg bg-[#8a6f50] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#735a40] ${FOCUS_RING}`}
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


                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-center gap-3 rounded-xl border border-[#fecaca] bg-[#fdeeea] px-4 py-3 text-sm text-red-700"
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
                            className={`rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#8a6f50] ring-1 ring-[#fecaca] hover:bg-[#f6f1e9] ${FOCUS_RING}`}
                        >
                            Try again
                        </button>
                    </div>
                )}


                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {overview.map((item, index) => {
                        const Icon = item.icon;
                        const change = percentChange(item.trend);

                        return (
                            <div
                                key={item.label}
                                className={`flex min-h-[148px] flex-col justify-between rounded-2xl border border-[#eee7de] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                    loading ? "" : "fade-in-up"
                                }`}
                                style={
                                    loading
                                        ? undefined
                                        : {
                                              animationDelay: `${index * 60}ms`,
                                          }
                                }
                            >
                                {/* Top row: Icon + Title on left, Mini bar chart on right */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#faeaec] text-[#731124]">
                                            <Icon
                                                size={18}
                                                strokeWidth={2.2}
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <span className="text-[15px] font-bold tracking-tight text-[#1e1b18]">
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* Mini 6-month bar chart with rounded pill bars */}
                                    <MiniBarChart
                                        data={item.barData}
                                        activeColor="#731124"
                                        inactiveColor="#f4d7dd"
                                    />
                                </div>

                                {/* Bottom area: Large count and trend comparison */}
                                <div className="mt-3">
                                    {loading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <p className="text-3xl font-extrabold leading-none tracking-tight tabular-nums text-[#1a1412]">
                                            {item.value}
                                        </p>
                                    )}

                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                                        <span className="flex items-center font-semibold text-[#10b981]">
                                            <ArrowUp size={12} className="text-[#10b981]" />
                                            <span className="ml-0.5 text-[#10b981]">
                                                {change !== null && change > 0 ? change : 0}%
                                            </span>
                                        </span>
                                        <span className="font-normal text-[#9c8e82]">
                                            vs last month
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>


                <div
                    className={`order-3 grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "80ms" }
                    }
                >

                    <section className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-7">

                        <SectionHeader
                            icon={Stethoscope}
                            title={
                                isToday
                                    ? "Today's visits"
                                    : "Visits on this day"
                            }
                            subtitle={
                                isToday
                                    ? "Patients seen at the clinic today"
                                    : `Patients seen on ${formatDate(
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
                                        ) => {
                                            const patient = getVisitPatient(visit);
                                            const patientName = patient ? getName(patient) : "Patient";
                                            return (
                                                <li
                                                    key={
                                                        visit.id ??
                                                        index
                                                    }
                                                    className="flex items-center gap-3 border-t border-[#eee7de] py-3 first:border-t-0 first:pt-0"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ebdf] text-xs font-bold text-[#8a6f50]">
                                                        {getInitials(
                                                            patientName
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold">
                                                            {patientName}
                                                        </p>
                                                        {patient?.typeLabel && (
                                                            <span className="text-[10px] text-[#8a6f50]">
                                                                {patient.typeLabel}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-[#f6eee4] px-2.5 py-1 text-xs font-medium text-[#8a6f50]">
                                                        {visit.reason?.trim() ||
                                                            "Other"}
                                                    </span>
                                                </li>
                                            );
                                        }
                                    )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center py-8 text-center">

                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ebdf] text-[#8a6f50]">
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

                                <p className="mt-1 text-xs text-[#a99d8f]">
                                    Visits will show up here as soon as they are recorded.
                                </p>

                                <Link
                                    to="/clinic-visits"
                                    className={`mt-4 rounded-lg bg-[#8a6f50] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#735a40] ${FOCUS_RING}`}
                                >
                                    Log a clinic visit
                                </Link>
                            </div>
                        )}

                        <p className="mt-4 border-t border-[#eee7de] pt-3 text-[11px] text-[#a99d8f]">
                            Based on the latest visits the dashboard loads. Open All visits for the full history.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

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


                <section
                    className={`order-1 mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "140ms" }
                    }
                >

                    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

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
                            <Skeleton className="h-[240px] w-full" />
                        ) : (
                            <LineAreaChart
                                data={
                                    visitsOverview
                                }
                                color={ACCENTS.cocoa.line}
                            />
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-4">

                        <SectionHeader
                            icon={PieIcon}
                            title="Visit Reasons"
                            subtitle="Most common reasons in the latest visits"
                        />

                        {loading ? (
                            <Skeleton className="h-[140px] w-full" />
                        ) : reasons.length ? (
                            <div className="flex items-center gap-4 sm:gap-5">

                                <DonutChart
                                    data={
                                        reasons
                                    }
                                    total={
                                        reasonsTotal
                                    }
                                    centerLabel="visits"
                                    centerValue={
                                        reasonsTotal
                                    }
                                    size={120}
                                    strokeWidth={16}
                                />

                                <div className="flex-1 min-w-0 space-y-2.5">

                                    {reasons.map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                key={
                                                    item.label
                                                }
                                                className="flex items-center justify-between gap-2 min-w-0"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">

                                                    <span
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    />

                                                    <span
                                                        className="truncate text-xs font-medium text-[#766959]"
                                                        title={item.label}
                                                    >
                                                        {
                                                            item.label
                                                        }
                                                    </span>
                                                </div>

                                                <span className="shrink-0 text-xs font-bold text-[#302820]">
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
                            <p className="py-10 text-center text-sm text-[#a99d8f]">
                                No visit reasons recorded yet.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-3">

                        <SectionHeader
                            icon={Users}
                            title="Gender Distribution"
                            subtitle="Students, staff, and faculty by gender"
                        />

                        <div className="flex h-[170px] items-end justify-around border-b border-[#e8dfd4] px-6">

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
                                            <span className="mb-2 text-sm font-bold text-[#302820]">
                                                {
                                                    item.value
                                                }
                                            </span>

                                            <div
                                                className="w-12 rounded-t-lg transition-all duration-500"
                                                aria-label={`${item.label}: ${item.value} registered patients`}
                                                role="img"
                                                style={{
                                                    height: `${
                                                        item.value > 0
                                                            ? Math.max(
                                                                  height,
                                                                  15
                                                              )
                                                            : 0
                                                    }px`,
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
                                        <p className="text-xs font-semibold text-[#302820]">
                                            {
                                                item.label
                                            }
                                        </p>

                                        <p className="mt-1 text-[11px] font-medium text-[#a99d8f]">
                                            {totalGenderPatients
                                                ? Math.round(
                                                      (item.value /
                                                          totalGenderPatients) *
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


                <div
                    className={`order-2 mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12 ${
                        loading ? "" : "fade-in-up"
                    }`}
                    style={
                        loading
                            ? undefined
                            : { animationDelay: "200ms" }
                    }
                >

                    <section className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-7">

                        <SectionHeader
                            icon={Users}
                            title="Recent Patients"
                            subtitle="Latest registered students, staff, and faculty"
                            link="/students"
                            linkLabel="View patients"
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
                                                    className="px-2 py-2 text-xs font-semibold text-[#887d70]"
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
                                                    className="border-t border-[#eee7de] first:border-t-0"
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
                                    ) : recentPatients.length ? (
                                        recentPatients.map(
                                            (
                                                patient,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        patient.id ??
                                                        `recent-${index}`
                                                    }
                                                    className="border-t border-[#eee7de] hover:bg-[#f6f1e9]"
                                                >
                                                    <td className="px-2 py-3">

                                                        <div className="flex items-center gap-2.5">

                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3ebdf] text-xs font-bold text-[#8a6f50]">
                                                                {getInitials(
                                                                    getName(
                                                                        patient
                                                                    )
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <span className="block truncate text-sm font-semibold">
                                                                    {getName(
                                                                        patient
                                                                    )}
                                                                </span>

                                                                {patient.patient_type && (
                                                                    <span className="inline-block rounded bg-[#f2e9dc] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8a6f50]">
                                                                        {patient.patient_type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-3 text-sm text-[#887d70]">
                                                        {patient.id_number ||
                                                            patient.student_id ||
                                                            patient.staff_id ||
                                                            patient.employee_id ||
                                                            patient.id}
                                                    </td>

                                                    <td className="px-2 py-3 text-sm text-[#887d70]">
                                                        {formatDate(
                                                            patient.created_at ||
                                                                patient.date_registered
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-10 text-center text-sm text-[#a99d8f]"
                                            >
                                                No patients registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xl:col-span-5">

                        <SectionHeader
                            icon={Activity}
                            title="Latest Activities"
                            subtitle="System activities and updates"
                        />

                        <div className="space-y-4">

                            {loading ? (
                                <>
                                    {[0, 1, 2, 3, 4].map(
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
                            ) : pagedActivities.length ? (
                                pagedActivities.map(
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

                                                <p className="truncate text-sm text-[#887d70]">
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
                                                className="shrink-0 text-[#ded4c9]"
                                            />
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="py-10 text-center text-sm text-[#a99d8f]">
                                    No recent activity.
                                </p>
                            )}
                        </div>

                        {!loading && activityFeed.length > 0 && (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee7de] pt-3.5">
                                <p className="text-sm font-medium text-[#766959]">
                                    Showing <span className="font-semibold text-[#302820]">{activityStartIndex + 1}–{activityEndIndex}</span> of {activityFeed.length}
                                </p>

                                {totalActivityPages > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={currentActivityPage <= 1}
                                            onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                                            className={`inline-flex h-8 items-center gap-1 rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-2.5 text-sm font-medium text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#302820] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                                            aria-label="Previous activities"
                                        >
                                            <ChevronLeft size={15} />
                                            <span>Prev</span>
                                        </button>

                                        {totalActivityPages <= 6 ? (
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((p) => {
                                                    const isCurrent = p === currentActivityPage;
                                                    return (
                                                        <button
                                                            key={`activity-page-${p}`}
                                                            type="button"
                                                            onClick={() => setActivityPage(p)}
                                                            className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                                                                isCurrent
                                                                    ? "bg-[#8a6f50] text-white shadow-sm"
                                                                    : "border border-[#e8dfd4] bg-[#fcfaf6] text-[#766959] hover:bg-[#f3ebdf]"
                                                            } ${FOCUS_RING}`}
                                                            aria-label={`Go to page ${p}`}
                                                            aria-current={isCurrent ? "page" : undefined}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span className="px-2 text-sm font-semibold text-[#8a6f50]">
                                                {currentActivityPage} / {totalActivityPages}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            disabled={currentActivityPage >= totalActivityPages}
                                            onClick={() => setActivityPage((prev) => Math.min(totalActivityPages, prev + 1))}
                                            className={`inline-flex h-8 items-center gap-1 rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] px-2.5 text-sm font-medium text-[#766959] transition hover:bg-[#f3ebdf] hover:text-[#302820] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                                            aria-label="Next activities"
                                        >
                                            <span>Next</span>
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>





            <Suspense fallback={null}>
                <DashboardAssistant />
            </Suspense>
        </div>
    );
}





export default Dashboard;
