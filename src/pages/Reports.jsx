import { useEffect, useState } from "react";
import api from "../services/api";

import {
    FileText,
    Printer,
    RefreshCw,
    Users,
    Activity,
    Pill,
    CalendarDays,
    AlertCircle,
} from "lucide-react";

function Reports() {
    const currentDate = new Date();

    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const generateReport = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/reports/monthly", {
                params: {
                    month,
                    year,
                },
            });

            console.log("MONTHLY REPORT:", response.data);

            setReport(response.data);
        } catch (err) {
            console.error("REPORT ERROR:", err);

            setReport(null);

            setError(
                err?.response?.data?.message ||
                    "Unable to generate the monthly report."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const summary = report?.summary || {};

    const reasons = report?.reasons || [];

    const medicineUsage = report?.medicine_usage || [];

    const dailyVisits = report?.daily_visits || [];

    const visits = report?.visits || [];

    return (
        <div
            id="reports-page"
            className="min-h-screen bg-[#fbf6f5] px-5 py-6 lg:px-6"
        >
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020] text-white shadow-md">
                        <FileText size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Monthly Reports
                        </h1>

                        <p className="text-sm text-gray-500">
                            TCC Clinic Management System
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />

                        Generate
                    </button>

                    <button
                        onClick={handlePrint}
                        disabled={!report}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#800020] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#68001a] disabled:opacity-50"
                    >
                        <Printer size={17} />

                        Print Report
                    </button>
                </div>
            </div>

            {/* FILTER */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:hidden">
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays
                        size={19}
                        className="text-[#800020]"
                    />

                    <h2 className="font-bold text-gray-800">
                        Select Report Period
                    </h2>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                            Month
                        </label>

                        <select
                            value={month}
                            onChange={(e) =>
                                setMonth(Number(e.target.value))
                            }
                            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white"
                        >
                            {monthNames.map((name, index) => (
                                <option
                                    key={name}
                                    value={index + 1}
                                >
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                            Year
                        </label>

                        <select
                            value={year}
                            onChange={(e) =>
                                setYear(Number(e.target.value))
                            }
                            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#800020] focus:bg-white"
                        >
                            {Array.from(
                                { length: 7 },
                                (_, index) =>
                                    currentDate.getFullYear() - 3 + index
                            ).map((itemYear) => (
                                <option
                                    key={itemYear}
                                    value={itemYear}
                                >
                                    {itemYear}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="rounded-xl bg-[#800020] px-6 py-3 text-sm font-semibold text-white hover:bg-[#68001a] disabled:opacity-50"
                        >
                            {loading
                                ? "Generating..."
                                : "Generate Monthly Report"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <AlertCircle
                        size={20}
                        className="text-red-500"
                    />

                    <div>
                        <p className="font-semibold text-red-700">
                            Report Error
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* REPORT */}
            {report && (
                <div>
                    {/* PRINT HEADER */}
                    <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow-sm print:shadow-none">
                        <h1 className="text-2xl font-bold text-gray-900">
                            TCC CLINIC MANAGEMENT SYSTEM
                        </h1>

                        <h2 className="mt-2 text-xl font-bold text-[#800020]">
                            Monthly Clinic Report
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {report.report?.period}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Generated:{" "}
                            {report.report?.generated_at}
                        </p>
                    </div>

                    {/* SUMMARY */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard
                            title="Total Visits"
                            value={summary.total_visits || 0}
                            icon={<Activity size={22} />}
                        />

                        <SummaryCard
                            title="Student Visits"
                            value={summary.student_visits || 0}
                            icon={<Users size={22} />}
                        />

                        <SummaryCard
                            title="Faculty Visits"
                            value={summary.faculty_visits || 0}
                            icon={<Users size={22} />}
                        />

                        <SummaryCard
                            title="Staff Visits"
                            value={summary.staff_visits || 0}
                            icon={<Users size={22} />}
                        />
                    </div>

                    {/* REASONS + MEDICINE */}
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-lg font-bold text-gray-900">
                                Visit Reasons
                            </h2>

                            {reasons.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No visit reasons recorded.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {reasons.map((item) => (
                                        <div
                                            key={item.reason}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {item.reason}
                                            </span>

                                            <span className="font-bold text-[#800020]">
                                                {item.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <Pill
                                    size={20}
                                    className="text-green-600"
                                />

                                <h2 className="text-lg font-bold text-gray-900">
                                    Medicine Usage
                                </h2>
                            </div>

                            {medicineUsage.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No medicine used during this period.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {medicineUsage.map((item) => (
                                        <div
                                            key={item.medicine_id}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {item.medicine_name}
                                            </span>

                                            <span className="font-bold text-green-600">
                                                {item.quantity_used}{" "}
                                                {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DAILY VISITS */}
                    <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-bold text-gray-900">
                            Daily Clinic Visits
                        </h2>

                        {dailyVisits.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                No visits recorded.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                                {dailyVisits.map((item) => (
                                    <div
                                        key={item.date}
                                        className="rounded-xl bg-gray-50 p-4 text-center"
                                    >
                                        <p className="text-xs text-gray-400">
                                            {item.date}
                                        </p>

                                        <p className="mt-2 text-2xl font-bold text-[#800020]">
                                            {item.count}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            visits
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* VISITS */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Clinic Visit Details
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {visits.length} visit records
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Person
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Type
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Reason
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Medicine
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                                            Nurse
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visits.length > 0 ? (
                                        visits.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {visit.date}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                                                    {visit.person}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold text-[#800020]">
                                                        {visit.person_type}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {visit.reason || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {visit.medicine
                                                        ? `${visit.medicine} ${
                                                              visit.medicine_quantity ||
                                                              ""
                                                          }`
                                                        : "—"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {visit.nurse || "—"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-5 py-12 text-center text-sm text-gray-400"
                                            >
                                                No clinic visits found for this
                                                month.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINT FOOTER */}
            {report && (
                <div className="mt-6 hidden text-center text-xs text-gray-400 print:block">
                    TCC Clinic Management System • Monthly Clinic Report
                </div>
            )}

            {/* PRINT CSS */}
            <style>
                {`
                    @media print {
                        body {
                            background: white !important;
                        }

                        #reports-page {
                            background: white !important;
                            padding: 10px !important;
                        }

                        #reports-page > div {
                            box-shadow: none !important;
                        }

                        .print\\:hidden {
                            display: none !important;
                        }

                        @page {
                            size: A4;
                            margin: 12mm;
                        }

                        table {
                            page-break-inside: auto;
                        }

                        tr {
                            page-break-inside: avoid;
                        }
                    }
                `}
            </style>
        </div>
    );
}

function SummaryCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#800020]/10 text-[#800020]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default Reports;