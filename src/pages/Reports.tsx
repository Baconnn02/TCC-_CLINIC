import { useEffect, useState } from "react";
import api from "../services/api";

import {
    FileText,
    Printer,
    Users,
    Activity,
    Pill,
    CalendarDays,
    AlertCircle,
    Building2,
    Stethoscope,
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

    const maximumReasonCount = Math.max(
        1,
        ...reasons.map((reason) => Number(reason.count || 0))
    );

    const medicineUsage = report?.medicine_usage || [];

    const nurseActivity = report?.nurse_activity || [];

    const dailyVisits = report?.daily_visits || [];

    const visits = report?.visits || [];

    return (
        <div
            id="reports-page"
            className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6"
        >

            <div className="tcc-module-header mb-5 flex flex-col gap-4 rounded-2xl border px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8a6f50] text-white shadow-md">
                        <FileText size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">
                            Monthly Reports
                        </h1>

                        <p className="text-sm text-stone-500">
                            TCC Clinic Management System
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        disabled={!report}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#735a40] disabled:opacity-50"
                    >
                        <Printer size={17} />

                        Print Report
                    </button>
                </div>
            </div>


            <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm print:hidden">
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays
                        size={19}
                        className="text-[#8a6f50]"
                    />

                    <h2 className="font-bold text-stone-800">
                        Select Report Period
                    </h2>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase text-stone-500">
                            Month
                        </label>

                        <select
                            value={month}
                            onChange={(e) =>
                                setMonth(Number(e.target.value))
                            }
                            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-[#8a6f50] focus:bg-white"
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
                        <label className="mb-2 block text-xs font-semibold uppercase text-stone-500">
                            Year
                        </label>

                        <select
                            value={year}
                            onChange={(e) =>
                                setYear(Number(e.target.value))
                            }
                            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-[#8a6f50] focus:bg-white"
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
                            className="rounded-xl bg-[#8a6f50] px-6 py-3 text-sm font-semibold text-white hover:bg-[#8a6f50] disabled:opacity-50"
                        >
                            {loading
                                ? "Generating..."
                                : "Generate Monthly Report"}
                        </button>
                    </div>
                </div>
            </div>


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


            {report && (
                <div id="report-print-area" className="report-paper space-y-5">
                    <header className="report-letterhead rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <img src="/tcc-logo.jpg" alt="TCC logo" className="h-14 w-14 rounded-full border border-[#e8dfd4] bg-white object-contain p-1" />
                                <div>
                                    <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8a6f50]">
                                        <Building2 size={14} aria-hidden="true" />
                                        TCC Clinic Management System
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Monthly Clinic Report</h1>
                                    <p className="mt-1 text-sm text-stone-500">Clinic visit activity and services summary</p>
                                </div>
                            </div>

                            <div className="report-period-box rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-5 py-3 sm:min-w-52 sm:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">Reporting period</p>
                                <p className="mt-1 text-lg font-bold text-[#8a6f50]">
                                    {report.report?.period || `${monthNames[month - 1]} ${year}`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-[#e8dfd4] pt-4 text-xs text-stone-500">
                            <p><span className="font-semibold text-stone-700">Generated:</span>{" "}{formatGeneratedAt(report.report?.generated_at)}</p>
                            <p><span className="font-semibold text-stone-700">Visit records:</span>{" "}{Number(visits.length).toLocaleString()}</p>
                            <p className="print:hidden"><span className="font-semibold text-stone-700">Scope:</span>{" "}All clinic visits recorded for the selected month</p>
                        </div>
                    </header>

                    <section className="report-summary-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard title="Total Visits" value={summary.total_visits || 0} icon={<Activity size={21} />} />
                        <SummaryCard title="Student Visits" value={summary.student_visits || 0} icon={<Users size={21} />} />
                        <SummaryCard title="Faculty Visits" value={summary.faculty_visits || 0} icon={<Users size={21} />} />
                        <SummaryCard title="Staff Visits" value={summary.staff_visits || 0} icon={<Users size={21} />} />
                    </section>

                    <section className="report-panel rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a6f50]">Daily activity</p>
                                <h2 className="mt-1 text-lg font-bold text-stone-900">Clinic visits by day</h2>
                            </div>
                            <p className="text-xs text-stone-500">Number of visits · {report.report?.period || `${monthNames[month - 1]} ${year}`}</p>
                        </div>
                        <DailyVisitsChart data={dailyVisits} month={month} year={year} />
                    </section>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <section className="report-panel rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]"><Stethoscope size={18} aria-hidden="true" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-900">Visit Reasons</h2>
                                    <p className="text-xs text-stone-500">{reasons.length} categories recorded</p>
                                </div>
                            </div>
                            {reasons.length === 0 ? (
                                <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">No visit reasons recorded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reasons.map((item) => {
                                        const count = Number(item.count || 0);
                                        return (
                                            <div key={item.reason}>
                                                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                                    <span className="truncate font-medium text-stone-700">{item.reason || "Other"}</span>
                                                    <span className="shrink-0 font-bold text-[#8a6f50]">{count}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                                                    <div className="h-full rounded-full bg-[#8a6f50]" style={{ width: `${(count / maximumReasonCount) * 100}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="report-panel rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700"><Pill size={18} aria-hidden="true" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-900">Medicine Usage</h2>
                                    <p className="text-xs text-stone-500">Dispensed during this period</p>
                                </div>
                            </div>
                            {medicineUsage.length === 0 ? (
                                <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">No medicine usage recorded.</p>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {medicineUsage.map((item) => (
                                        <div key={item.medicine_id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                            <span className="text-sm font-medium text-stone-700">{item.medicine_name}</span>
                                            <span className="shrink-0 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">{Number(item.quantity_used || 0).toLocaleString()} {item.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="report-panel rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]"><Users size={18} aria-hidden="true" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-900">Nurse Activity</h2>
                                    <p className="text-xs text-stone-500">Visits recorded by nurse</p>
                                </div>
                            </div>
                            {nurseActivity.length === 0 ? (
                                <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">No nurse activity recorded.</p>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {nurseActivity.map((item) => (
                                        <div key={item.nurse_id || item.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                            <span className="text-sm font-medium text-stone-700">{item.name}</span>
                                            <span className="shrink-0 text-sm font-bold text-[#8a6f50]">{Number(item.visits || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <section className="report-panel report-register overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-sm">
                        <div className="border-b border-[#e8dfd4] px-5 py-4 sm:px-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a6f50]">Supporting detail</p>
                            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                                <h2 className="text-lg font-bold text-stone-900">Clinic Visit Register</h2>
                                <p className="text-xs text-stone-500">{visits.length.toLocaleString()} records</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="report-visit-table w-full min-w-[800px] table-fixed">
                                <colgroup>
                                    <col style={{ width: "13%" }} /><col style={{ width: "20%" }} /><col style={{ width: "12%" }} />
                                    <col style={{ width: "19%" }} /><col style={{ width: "20%" }} /><col style={{ width: "16%" }} />
                                </colgroup>
                                <thead>
                                    <tr className="bg-stone-50 text-left">
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Patient</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Type</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Reason</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Medicine</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-stone-500">Nurse</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.length > 0 ? visits.map((visit) => (
                                        <tr key={visit.id} className="border-t border-stone-100">
                                            <td className="px-4 py-3 text-sm text-stone-600">{formatVisitDate(visit.date)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-stone-800">{visit.person}</td>
                                            <td className="px-4 py-3 text-sm text-stone-600">{visit.person_type}</td>
                                            <td className="px-4 py-3 text-sm text-stone-700">{visit.reason || "—"}</td>
                                            <td className="px-4 py-3 text-sm text-stone-600">
                                                {visit.medicine ? `${visit.medicine}${visit.medicine_quantity ? ` · ${visit.medicine_quantity}` : ""}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-stone-600">{visit.nurse || "—"}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-stone-500">No clinic visits were recorded for this reporting period.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <footer className="report-signatures hidden border-t border-stone-300 pt-8 print:grid print:grid-cols-2 print:gap-16">
                        <div className="border-t border-stone-500 pt-2 text-xs text-stone-600">Prepared by</div>
                        <div className="border-t border-stone-500 pt-2 text-xs text-stone-600">Reviewed by</div>
                    </footer>
                    <p className="hidden text-center text-[9px] text-stone-500 print:block">
                        TCC Clinic Management System · Monthly Clinic Report · {report.report?.period}
                    </p>
                </div>
            )}
        </div>
    );
}

function formatVisitDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));

    if (!match) return value || "—";

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function formatGeneratedAt(value) {
    if (!value) return "—";

    const sqlTimestamp = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value));
    const date = sqlTimestamp
        ? new Date(
              Number(sqlTimestamp[1]),
              Number(sqlTimestamp[2]) - 1,
              Number(sqlTimestamp[3]),
              Number(sqlTimestamp[4]),
              Number(sqlTimestamp[5]),
              Number(sqlTimestamp[6] || 0)
          )
        : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function DailyVisitsChart({ data, month, year }) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const countByDay = new Map(
        data.map((item) => [getDayOfMonth(item.date), Number(item.count || 0)])
    );
    const points = Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        count: countByDay.get(index + 1) || 0,
    }));
    const totalVisits = points.reduce((total, point) => total + point.count, 0);
    const maximum = Math.max(0, ...points.map((point) => point.count));
    const axisMaximum = Math.max(4, Math.ceil(maximum / 4) * 4);
    const left = 48;
    const top = 20;
    const plotWidth = 820;
    const plotHeight = 190;
    const baseline = top + plotHeight;
    const slotWidth = plotWidth / daysInMonth;
    const barWidth = Math.min(20, slotWidth * 0.62);

    return (
        <div className="report-chart-wrap mt-4 overflow-x-auto">
            <svg
                className="report-chart min-w-[680px]"
                viewBox="0 0 900 270"
                role="img"
                aria-label={`Daily clinic visits for ${month}/${year}; ${totalVisits} visits across ${daysInMonth} days.`}
            >
                <title>Daily clinic visits for {month}/{year}</title>
                {[0, 1, 2, 3, 4].map((step) => {
                    const y = top + (plotHeight / 4) * step;
                    const value = Math.round(axisMaximum * (1 - step / 4));

                    return (
                        <g key={step}>
                            <line x1={left} y1={y} x2={left + plotWidth} y2={y} stroke="#e8dfd4" strokeDasharray={step === 4 ? undefined : "3 5"} />
                            <text x={left - 10} y={y + 4} textAnchor="end" fill="#887d70" fontSize="10">{value}</text>
                        </g>
                    );
                })}

                {points.map((point, index) => {
                    const height = (point.count / axisMaximum) * plotHeight;
                    const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
                    const showLabel = point.day === 1 || point.day % 5 === 0 || point.day === daysInMonth;

                    return (
                        <g key={point.day}>
                            {point.count > 0 && (
                                <rect x={x} y={baseline - height} width={barWidth} height={height} rx="3" fill="#8a6f50">
                                    <title>Day {point.day}: {point.count} visits</title>
                                </rect>
                            )}
                            {showLabel && (
                                <text x={left + index * slotWidth + slotWidth / 2} y={baseline + 22} textAnchor="middle" fill="#887d70" fontSize="10">{point.day}</text>
                            )}
                        </g>
                    );
                })}

                <text x={left} y="263" fill="#887d70" fontSize="10">Day of month</text>
            </svg>
            <p className="mt-1 text-right text-xs text-stone-500">
                {totalVisits.toLocaleString()} visits recorded this month
            </p>
        </div>
    );
}

function getDayOfMonth(value) {
    const match = /^\d{4}-\d{2}-(\d{2})/.exec(String(value || ""));
    return match ? Number(match[1]) : Number.NaN;
}

function SummaryCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-stone-500">
                        {title}
                    </p>

                    <p className="mt-1 text-3xl font-bold text-stone-900">
                        {Number(value || 0).toLocaleString()}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8a6f50]/10 text-[#8a6f50]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default Reports;
