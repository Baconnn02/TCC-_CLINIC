import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
    Activity,
    Users,
    CalendarDays,
    Pill,
    Search,
    Printer,
    RefreshCw,
    FileText,
    TrendingUp,
    UserRound,
} from "lucide-react";

function Reports() {
    const [visits, setVisits] = useState([]);
    const [students, setStudents] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);

        try {
            const [visitsResponse, studentsResponse, medicinesResponse] =
                await Promise.all([
                    api.get("/clinic-visits"),
                    api.get("/students"),
                    api.get("/medicines"),
                ]);

            const visitsData = Array.isArray(visitsResponse.data)
                ? visitsResponse.data
                : visitsResponse.data?.data || [];

            const studentsData = Array.isArray(studentsResponse.data)
                ? studentsResponse.data
                : studentsResponse.data?.data || [];

            const medicinesData = Array.isArray(medicinesResponse.data)
                ? medicinesResponse.data
                : medicinesResponse.data?.data || [];

            setVisits(visitsData);
            setStudents(studentsData);
            setMedicines(medicinesData);
        } catch (error) {
            console.error("Error loading reports:", error);

            setVisits([]);
            setStudents([]);
            setMedicines([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const getFullName = (person) => {
        if (!person) return "Unknown";

        return [
            person.first_name,
            person.middle_name,
            person.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getStudent = (visit) => {
        if (visit.student) {
            return visit.student;
        }

        return students.find(
            (student) =>
                String(student.id) === String(visit.student_id)
        );
    };

    const getStudentName = (visit) => {
        const student = getStudent(visit);

        return student ? getFullName(student) : "Unknown Student";
    };

    const normalizeDate = (date) => {
        if (!date) return "";

        return String(date).substring(0, 10);
    };

    const formatDate = (date) => {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return date;
        }
    };

    // =========================================================
    // FILTERED VISITS
    // =========================================================

    const filteredVisits = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return visits.filter((visit) => {
            const visitDate = normalizeDate(visit.visit_date);

            const matchesSearch =
                !keyword ||
                getStudentName(visit)
                    .toLowerCase()
                    .includes(keyword) ||
                String(visit.reason || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(visit.treatment || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchesFrom =
                !dateFrom || visitDate >= dateFrom;

            const matchesTo =
                !dateTo || visitDate <= dateTo;

            return (
                matchesSearch &&
                matchesFrom &&
                matchesTo
            );
        });
    }, [
        visits,
        students,
        search,
        dateFrom,
        dateTo,
    ]);

    // =========================================================
    // SUMMARY
    // =========================================================

    const totalVisits = filteredVisits.length;

    const uniqueStudents = new Set(
        filteredVisits.map(
            (visit) => visit.student_id
        )
    ).size;

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const todayVisits = filteredVisits.filter(
        (visit) =>
            normalizeDate(visit.visit_date) === today
    ).length;

    const medicinesUsed = filteredVisits.filter(
        (visit) => visit.medicine_id
    ).length;

    // =========================================================
    // VISIT REASONS
    // =========================================================

    const reasonData = useMemo(() => {
        const counts = {};

        filteredVisits.forEach((visit) => {
            const reason =
                visit.reason?.trim() || "Other";

            counts[reason] =
                (counts[reason] || 0) + 1;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
    }, [filteredVisits]);

    const maxReasonCount =
        Math.max(
            ...reasonData.map((item) => item[1]),
            1
        );

    // =========================================================
    // GENDER
    // =========================================================

    const genderData = useMemo(() => {
        let male = 0;
        let female = 0;
        let other = 0;

        filteredVisits.forEach((visit) => {
            const student = getStudent(visit);

            const sex = String(
                student?.sex || ""
            ).toLowerCase();

            if (sex === "male") {
                male++;
            } else if (sex === "female") {
                female++;
            } else {
                other++;
            }
        });

        return {
            male,
            female,
            other,
        };
    }, [filteredVisits, students]);

    const genderTotal =
        genderData.male +
        genderData.female +
        genderData.other;

    // =========================================================
    // MONTHLY VISITS
    // =========================================================

    const monthlyData = useMemo(() => {
        const months = [];

        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - i,
                1
            );

            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            const monthName = date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                }
            );

            const count = filteredVisits.filter(
                (visit) => {
                    const visitDate =
                        normalizeDate(
                            visit.visit_date
                        );

                    return visitDate.startsWith(
                        monthKey
                    );
                }
            ).length;

            months.push({
                month: monthName,
                count,
            });
        }

        return months;
    }, [filteredVisits]);

    const maxMonthlyCount =
        Math.max(
            ...monthlyData.map(
                (item) => item.count
            ),
            1
        );

    // =========================================================
    // TOP MEDICINES
    // =========================================================

    const medicineData = useMemo(() => {
        const counts = {};

        filteredVisits.forEach((visit) => {
            if (!visit.medicine_id) return;

            let medicineName =
                visit.medicine?.name;

            if (!medicineName) {
                const medicine = medicines.find(
                    (item) =>
                        String(item.id) ===
                        String(visit.medicine_id)
                );

                medicineName =
                    medicine?.name ||
                    "Unknown Medicine";
            }

            const quantity =
                Number(
                    visit.medicine_quantity
                ) || 1;

            counts[medicineName] =
                (counts[medicineName] || 0) +
                quantity;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [filteredVisits, medicines]);

    const maxMedicineCount =
        Math.max(
            ...medicineData.map(
                (item) => item[1]
            ),
            1
        );

    // =========================================================
    // PRINT
    // =========================================================

    const handlePrint = () => {
        window.print();
    };

    // =========================================================
    // CLEAR FILTER
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center bg-[#fbf6f5]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#800020]/20 border-t-[#800020]" />

                    <p className="text-sm font-medium text-gray-600">
                        Loading reports...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            id="reports-page"
            className="min-h-screen bg-[#fbf6f5] px-5 py-6 lg:px-6"
        >
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020] text-white shadow-md">
                        <FileText size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Reports
                        </h1>

                        <p className="text-sm text-gray-500">
                            Clinic visit reports and statistics
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadReports}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#800020] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#68001a]"
                    >
                        <Printer size={17} />
                        Print Report
                    </button>
                </div>
            </div>

            {/* =====================================================
                FILTERS
            ====================================================== */}

            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Search
                        size={18}
                        className="text-[#800020]"
                    />

                    <h2 className="font-bold text-gray-800">
                        Report Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search student, reason, treatment..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            From
                        </label>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) =>
                                setDateFrom(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            To
                        </label>

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) =>
                                setDateTo(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10"
                        />
                    </div>
                </div>

                {(search || dateFrom || dateTo) && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-bold text-gray-800">
                                {filteredVisits.length}
                            </span>{" "}
                            filtered visits
                        </p>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-semibold text-[#800020] hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Visits
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {totalVisits}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Clinic consultations
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#800020]/10 text-[#800020]">
                            <Activity size={23} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Students Served
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {uniqueStudents}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Unique students
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Users size={23} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Today's Visits
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {todayVisits}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Visits today
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <CalendarDays size={23} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Medicine Usage
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {medicinesUsed}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Visits with medicine
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <Pill size={23} />
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MONTHLY VISITS + REASONS
            ====================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Monthly Visits */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900">
                                Clinic Visits Trend
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Visits for the last 6 months
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800020]/10 text-[#800020]">
                            <TrendingUp size={19} />
                        </div>
                    </div>

                    <div className="flex h-64 items-end gap-3 border-b border-l border-gray-100 px-3 pb-2 pt-5">
                        {monthlyData.map(
                            (item) => {
                                const height =
                                    item.count === 0
                                        ? 4
                                        : Math.max(
                                              12,
                                              (item.count /
                                                  maxMonthlyCount) *
                                                  100
                                          );

                                return (
                                    <div
                                        key={item.month}
                                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                    >
                                        <span className="text-xs font-semibold text-gray-600">
                                            {item.count}
                                        </span>

                                        <div
                                            className="w-full max-w-[45px] rounded-t-lg bg-[#800020] transition-all hover:bg-[#68001a]"
                                            style={{
                                                height: `${height}%`,
                                            }}
                                        />

                                        <span className="text-xs font-medium text-gray-400">
                                            {item.month}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* Visit Reasons */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-900">
                            Common Visit Reasons
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Most recorded reasons for clinic visits
                        </p>
                    </div>

                    {reasonData.length > 0 ? (
                        <div className="space-y-5">
                            {reasonData.map(
                                ([reason, count]) => (
                                    <div
                                        key={reason}
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="truncate text-sm font-medium text-gray-700">
                                                {reason}
                                            </span>

                                            <span className="shrink-0 text-sm font-bold text-[#800020]">
                                                {count}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-[#800020] transition-all"
                                                style={{
                                                    width: `${
                                                        (count /
                                                            maxReasonCount) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                            No visit reason data available.
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                GENDER + MEDICINES
            ====================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Gender Distribution */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900">
                                Gender Distribution
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Students based on recorded clinic visits
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <UserRound size={19} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-gray-100">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background:
                                        genderTotal > 0
                                            ? `conic-gradient(
                                                #800020 0deg ${
                                                    (genderData.male /
                                                        genderTotal) *
                                                    360
                                                }deg,
                                                #3b82f6 ${
                                                    (genderData.male /
                                                        genderTotal) *
                                                    360
                                                }deg ${
                                                    ((genderData.male +
                                                        genderData.female) /
                                                        genderTotal) *
                                                    360
                                                }deg,
                                                #d1d5db ${
                                                    ((genderData.male +
                                                        genderData.female) /
                                                        genderTotal) *
                                                    360
                                                }deg 360deg
                                            )`
                                            : "#e5e7eb",
                                }}
                            />

                            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-sm">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {genderTotal}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        Visits
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid w-full grid-cols-3 gap-3">
                            <div className="rounded-xl bg-[#800020]/5 p-3 text-center">
                                <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-[#800020]" />

                                <p className="text-xs text-gray-500">
                                    Male
                                </p>

                                <p className="mt-1 font-bold text-gray-800">
                                    {genderData.male}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-center">
                                <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-blue-500" />

                                <p className="text-xs text-gray-500">
                                    Female
                                </p>

                                <p className="mt-1 font-bold text-gray-800">
                                    {genderData.female}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3 text-center">
                                <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-gray-400" />

                                <p className="text-xs text-gray-500">
                                    Other
                                </p>

                                <p className="mt-1 font-bold text-gray-800">
                                    {genderData.other}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medicine Usage */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900">
                                Medicine Usage
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Most used medicines in clinic visits
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <Pill size={19} />
                        </div>
                    </div>

                    {medicineData.length > 0 ? (
                        <div className="space-y-5">
                            {medicineData.map(
                                ([medicine, quantity]) => (
                                    <div
                                        key={medicine}
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                                    <Pill
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </div>

                                                <span className="truncate text-sm font-medium text-gray-700">
                                                    {medicine}
                                                </span>
                                            </div>

                                            <span className="shrink-0 text-sm font-bold text-green-600">
                                                {quantity}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-green-500"
                                                style={{
                                                    width: `${
                                                        (quantity /
                                                            maxMedicineCount) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                            No medicine usage data available.
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                RECENT VISITS TABLE
            ====================================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800020]/10 text-[#800020]">
                            <FileText size={19} />
                        </div>

                        <div>
                            <h2 className="font-bold text-gray-900">
                                Clinic Visit Details
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Detailed records included in this report
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[850px] w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Student
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Date
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Reason
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Treatment
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Medicine
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredVisits.length > 0 ? (
                                filteredVisits
                                    .slice(0, 20)
                                    .map((visit) => (
                                        <tr
                                            key={visit.id}
                                            className="border-b border-gray-50 transition hover:bg-[#800020]/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020]">
                                                        <UserRound
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>

                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {getStudentName(
                                                            visit
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatDate(
                                                    visit.visit_date
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {visit.reason ||
                                                    "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {visit.treatment ? (
                                                    <span className="inline-flex rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold text-[#800020]">
                                                        {
                                                            visit.treatment
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {visit.medicine
                                                    ?.name ||
                                                    "—"}
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-16 text-center"
                                    >
                                        <FileText
                                            size={35}
                                            className="mx-auto mb-3 text-gray-300"
                                        />

                                        <p className="font-semibold text-gray-700">
                                            No report data found
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Try changing your filters.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =====================================================
                PRINT FOOTER
            ====================================================== */}

            <div className="mt-6 text-center text-xs text-gray-400 print:block">
                TCC Clinic Management System • Clinic Report
            </div>

            {/* =====================================================
                PRINT CSS
            ====================================================== */}

            <style>
                {`
                    @media print {
                        body {
                            background: white !important;
                        }

                        #reports-page {
                            background: white !important;
                            padding: 20px !important;
                        }

                        #reports-page button,
                        #reports-page input,
                        #reports-page .print-hide {
                            display: none !important;
                        }

                        #reports-page {
                            min-height: auto !important;
                        }

                        table {
                            page-break-inside: auto;
                        }

                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }

                        @page {
                            size: A4;
                            margin: 12mm;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default Reports;