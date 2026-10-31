import { useCallback, useEffect, useRef, useState } from "react";
import {
    Pill,
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    AlertTriangle,
    CheckCircle2,
    X,
    BarChart3,
    AlertOctagon,
    Calendar,
} from "lucide-react";
import api from "../services/api";
import FloatingToast from "../components/common/FloatingToast";
import { MedicineModal } from "../components/medicine/MedicineModal";
import { addClinicNotification, getStoredNotifications } from "../services/notifications";

const TREATMENT_TYPES = [
    "First Aid",
    "Medication",
    "Wound Care",
    "Cold Compress",
    "Hot Compress",
    "All",
];

const EMPTY_FORM = {
    medicine_name: "",
    treatment_type: "Medication",
    expiration_date: "",
    unit: "Tablet",
    stock: "",
    minimum_stock: "10",
    description: "",
};

function Medicine() {
    const [medicines, setMedicines] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 50,
    });
    const [summary, setSummary] = useState({
        total_medicines: 0,
        total_stock: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        expired_count: 0,
        expiring_soon_count: 0,
        expired_medicines: [] as any[],
        expiring_soon_medicines: [] as any[],
    });
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!successMessage) return undefined;

        const timeout = setTimeout(() => setSuccessMessage(""), 4000);
        return () => clearTimeout(timeout);
    }, [successMessage]);

    const loadMedicines = useCallback(async (page = 1, searchTerm = "", statusFilterParam = "all") => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/medicines", {
                params: {
                    page,
                    per_page: 50,
                    include_summary: 1,
                    search: searchTerm.trim() || undefined,
                    status_filter: statusFilterParam !== "all" ? statusFilterParam : undefined,
                },
            });

            const dataList = response.data?.data || [];
            setMedicines(dataList);
            setPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 50,
            });
            const sum = response.data?.summary || {
                total_medicines: 0,
                total_stock: 0,
                low_stock_count: 0,
                out_of_stock_count: 0,
                expired_count: 0,
                expiring_soon_count: 0,
                expired_medicines: [],
                expiring_soon_medicines: [],
            };
            setSummary(sum);

            // Automatically notify for expired medicines
            if (Array.isArray(sum.expired_medicines) && sum.expired_medicines.length > 0) {
                const stored = getStoredNotifications();
                sum.expired_medicines.forEach((med: any) => {
                    const alertKey = `expired-med-${med.id}-${med.expiration_date}`;
                    if (!stored.some((n) => n.key === alertKey)) {
                        addClinicNotification({
                            type: "delete",
                            title: "Expired Medicine Alert",
                            description: `${med.medicine_name} expired on ${med.expiration_date}. Immediate removal/disposal required.`,
                            category: "medicine",
                        });
                    }
                });
            }

            // Automatically notify for medicines expiring within 30 days
            if (Array.isArray(sum.expiring_soon_medicines) && sum.expiring_soon_medicines.length > 0) {
                const stored = getStoredNotifications();
                sum.expiring_soon_medicines.forEach((med: any) => {
                    const alertKey = `expiring-med-${med.id}-${med.expiration_date}`;
                    if (!stored.some((n) => n.key === alertKey)) {
                        addClinicNotification({
                            type: "info",
                            title: "Medicine Expiring Soon",
                            description: `${med.medicine_name} will expire on ${med.expiration_date}. Plan replenishment.`,
                            category: "medicine",
                        });
                    }
                });
            }
        } catch (err) {
            console.error("Medicine loading error:", err);

            setError(
                "Unable to load medicines. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => loadMedicines(1, "", statusFilter), 0);

        return () => clearTimeout(timeout);
    }, [loadMedicines, statusFilter]);

    const initialSearch = useRef(true);
    useEffect(() => {
        if (initialSearch.current) {
            initialSearch.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            loadMedicines(1, search, statusFilter);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, loadMedicines]);

    useEffect(() => {
        const handleStockUpdate = () => {
            loadMedicines(pagination.current_page, search, statusFilter);
        };

        window.addEventListener("medicine-stock-updated", handleStockUpdate);
        return () => window.removeEventListener("medicine-stock-updated", handleStockUpdate);
    }, [loadMedicines, pagination.current_page, search]);

    const openAddForm = () => {
        setEditingMedicine(null);
        setForm(EMPTY_FORM);
        setError("");
        setShowForm(true);
    };

    const openEditForm = (medicine) => {
        setEditingMedicine(medicine);

        setForm({
            medicine_name: medicine.medicine_name || "",
            treatment_type: medicine.treatment_type || "Medication",
            expiration_date: medicine.expiration_date
                ? String(medicine.expiration_date).split("T")[0]
                : "",
            unit: medicine.unit || "Tablet",
            stock:
                medicine.stock === null ||
                medicine.stock === undefined
                    ? ""
                    : String(medicine.stock),
            minimum_stock:
                medicine.minimum_stock === null ||
                medicine.minimum_stock === undefined
                    ? "10"
                    : String(medicine.minimum_stock),
            description: medicine.description || "",
        });

        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingMedicine(null);
        setForm(EMPTY_FORM);
        setError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!form.medicine_name.trim()) {
            setError("Medicine name is required.");
            return;
        }

        if (!form.treatment_type) {
            setError("Treatment type is required.");
            return;
        }

        if (form.stock === "") {
            setError("Stock quantity is required.");
            return;
        }

        const stockValue = Number(form.stock);

        const minimumStockValue = Number(
            form.minimum_stock === ""
                ? 0
                : form.minimum_stock
        );

        if (!Number.isFinite(stockValue) || stockValue < 0) {
            setError(
                "Stock must be a valid number of 0 or more."
            );
            return;
        }

        if (
            !Number.isFinite(minimumStockValue) ||
            minimumStockValue < 0
        ) {
            setError(
                "Minimum stock must be a valid number of 0 or more."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                medicine_name: form.medicine_name.trim(),
                treatment_type: form.treatment_type,
                expiration_date: form.expiration_date ? form.expiration_date : null,
                unit: form.unit,
                stock: stockValue,
                minimum_stock: minimumStockValue,
                description:
                    form.description.trim() || null,
            };

            if (editingMedicine) {
                const response = await api.put(
                    `/medicines/${editingMedicine.id}`,
                    payload
                );

                setMedicines((previous) =>
                    previous.map((medicine) =>
                        medicine.id === editingMedicine.id
                            ? response.data.medicine
                            : medicine
                    )
                );
            } else {
                const response = await api.post(
                    "/medicines",
                    payload
                );

                setMedicines((previous) => [
                    response.data.medicine,
                    ...previous,
                ]);
            }

            closeForm();
            await loadMedicines(
                editingMedicine ? pagination.current_page : 1,
                search,
                statusFilter
            );

            const isEdit = Boolean(editingMedicine);
            setSuccessMessage(
                `${payload.medicine_name} ${isEdit ? "updated" : "added"} successfully.`
            );

            addClinicNotification({
                type: isEdit ? "edit" : "add",
                title: isEdit ? "Medicine Updated" : "Medicine Added",
                description: isEdit
                    ? `${payload.medicine_name} updated in inventory`
                    : `${payload.medicine_name} (${stockValue} ${payload.unit}) added to inventory`,
                category: "medicine",
            });
        } catch (err) {
            console.error("Medicine save error:", err);

            const validationErrors =
                err?.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(validationErrors).flat()[0];

                setError(
                    String(firstError || "Please check the form.")
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                        "Unable to save medicine."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteMedicine = async (medicine) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${medicine.medicine_name}?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/medicines/${medicine.id}`);

            setMedicines((previous) =>
                previous.filter(
                    (item) => item.id !== medicine.id
                )
            );
            await loadMedicines(pagination.current_page, search);
            setSuccessMessage(`${medicine.medicine_name} deleted successfully.`);

            addClinicNotification({
                type: "delete",
                title: "Medicine Deleted",
                description: `${medicine.medicine_name} removed from inventory`,
                category: "medicine",
            });
        } catch (err) {
            console.error("Medicine delete error:", err);

            alert(
                "Unable to delete medicine. Please try again."
            );
        }
    };

    const getStatus = (medicine) => {
        const stock = Number(medicine.stock || 0);
        const minimum = Number(
            medicine.minimum_stock || 0
        );

        if (stock <= 0) {
            return {
                label: "Out of Stock",
                className:
                    "bg-red-50 text-red-700 border-red-100",
            };
        }

        if (stock <= minimum) {
            return {
                label: "Low Stock",
                className:
                    "bg-amber-50 text-amber-700 border-amber-100",
            };
        }

        return {
            label: "In Stock",
            className:
                "bg-green-50 text-green-700 border-green-100",
        };
    };


    const getExpirationInfo = (expirationDate: string | null | undefined) => {
        if (!expirationDate) {
            return { status: "none", label: "No Date", days: null, formattedDate: "" };
        }
        const cleanDate = String(expirationDate).split("T")[0];
        const exp = new Date(cleanDate);
        exp.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = exp.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days < 0) {
            return {
                status: "expired",
                label: `Expired (${Math.abs(days)}d ago)`,
                days,
                formattedDate: cleanDate,
            };
        }
        if (days <= 30) {
            return {
                status: "expiring_soon",
                label: `Expires in ${days}d`,
                days,
                formattedDate: cleanDate,
            };
        }
        return {
            status: "valid",
            label: cleanDate,
            days,
            formattedDate: cleanDate,
        };
    };

    const filteredMedicines = medicines;
    const totalMedicines = summary.total_medicines;
    const totalStock = summary.total_stock;
    const lowStockCount = summary.low_stock_count;
    const outOfStockCount = summary.out_of_stock_count;

    const inStockCount =
        totalMedicines -
        lowStockCount -
        outOfStockCount;

    const stockStatusTotal = Math.max(
        totalMedicines,
        1
    );

    const inStockPercent =
        (inStockCount / stockStatusTotal) * 100;

    const lowStockPercent =
        (lowStockCount / stockStatusTotal) * 100;

    const outOfStockPercent =
        (outOfStockCount / stockStatusTotal) * 100;

    const maxStatusCount = Math.max(
        inStockCount,
        lowStockCount,
        outOfStockCount,
        1
    );

    const donutStyle = {
        background: `conic-gradient(
            #27a866 0% ${inStockPercent}%,
            #f5ae22 ${inStockPercent}% ${
                inStockPercent + lowStockPercent
            }%,
            #e63946 ${
                inStockPercent + lowStockPercent
            }% 100%
        )`,
    };

    const createMiniBars = (ratios = [0.38, 0.58, 0.78, 1.0]) => {
        return ratios.map((ratio, index) => (
            <div
                key={index}
                className="w-[6px] rounded-t-sm bg-current"
                style={{
                    height: `${Math.round(Math.max(8, ratio * 34))}px`,
                }}
            />
        ));
    };

    return (
        <div className="tcc-module-page min-h-screen text-[#302820]">
            <FloatingToast
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />

            <main className="mx-auto w-full max-w-[1500px] px-5 py-5 lg:px-6 lg:py-6">


                <div className="tcc-module-header mb-5 flex flex-col gap-4 rounded-2xl border px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                            <Pill size={25} />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6f50]">
                                Medicine Inventory
                            </p>

                            <h1 className="text-2xl font-bold tracking-tight text-[#3d3329] sm:text-[28px]">
                                Medicine Inventory
                            </h1>

                            <p className="mt-0.5 text-xs text-[#887d70]">
                                Manage medicines, track stock levels, and keep the clinic well prepared.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openAddForm}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#735a40]"
                    >
                        <Plus size={17} />
                        Add Medicine
                    </button>
                </div>


                {error && !showForm && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Expiration Alert Banner */}
                {summary.expired_count > 0 && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300">
                                <AlertOctagon size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    {summary.expired_count} Medicine{summary.expired_count > 1 ? "s" : ""} Expired in Inventory!
                                </p>
                                <p className="text-xs text-red-700/80 dark:text-red-300/80">
                                    Expired medicines must not be dispensed to students or staff. Please review and safely dispose of them immediately.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const nextFilter = statusFilter === "expired" ? "all" : "expired";
                                setStatusFilter(nextFilter);
                                loadMedicines(1, search, nextFilter);
                            }}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 active:scale-95"
                        >
                            {statusFilter === "expired" ? "Show All Medicines" : "View Expired Medicines"}
                        </button>
                    </div>
                )}

                {summary.expired_count === 0 && summary.expiring_soon_count > 0 && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    {summary.expiring_soon_count} Medicine{summary.expiring_soon_count > 1 ? "s" : ""} Expiring Soon (Within 30 Days)
                                </p>
                                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                                    Check stock levels and schedule restock before items reach expiration.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const nextFilter = statusFilter === "expiring_soon" ? "all" : "expiring_soon";
                                setStatusFilter(nextFilter);
                                loadMedicines(1, search, nextFilter);
                            }}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 active:scale-95"
                        >
                            {statusFilter === "expiring_soon" ? "Show All Medicines" : "View Expiring Medicines"}
                        </button>
                    </div>
                )}


                <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                    <div className="rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-4 py-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebdf] text-[#8a6f50]">
                                    <Pill size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#887d70]">
                                        Total Medicines
                                    </p>

                                    <p className="mt-0.5 text-2xl font-bold">
                                        {totalMedicines}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-green-600">
                                        ↑ Inventory items
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-12 items-end gap-1 text-[#8a6f50]">
                                {createMiniBars()}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-[#fffdf9] px-4 py-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                    <Package size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#887d70]">
                                        Total Stock
                                    </p>

                                    <p className="mt-0.5 text-2xl font-bold">
                                        {totalStock}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-green-600">
                                        ↑ Available units
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-12 items-end gap-1 text-amber-600">
                                {createMiniBars()}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-[#fcfaf6] px-4 py-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <AlertTriangle size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#887d70]">
                                        Low Stock
                                    </p>

                                    <p className="mt-0.5 text-2xl font-bold">
                                        {lowStockCount}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-amber-600">
                                        Needs attention
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-12 items-end gap-1 text-amber-500">
                                {createMiniBars()}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-[#fcfaf6] px-4 py-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <Package size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#887d70]">
                                        Out of Stock
                                    </p>

                                    <p className="mt-0.5 text-2xl font-bold">
                                        {outOfStockCount}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-red-600">
                                        Needs restocking
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-12 items-end gap-1 text-red-600">
                                {createMiniBars()}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-[#fff8f8] px-4 py-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <AlertOctagon size={19} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#887d70]">
                                        Expired
                                    </p>

                                    <p className="mt-0.5 text-2xl font-bold text-red-600">
                                        {summary.expired_count || 0}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-red-600">
                                        {summary.expiring_soon_count > 0 ? `+${summary.expiring_soon_count} expiring soon` : "Requires disposal"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-12 items-end gap-1 text-red-600">
                                {createMiniBars([0.4, 0.6, 0.9, 1.0])}
                            </div>
                        </div>
                    </div>

                </section>


                <section className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2">

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50]">
                                <Pill size={16} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold">
                                    Stock Overview
                                </h2>

                                <p className="text-[10px] text-[#887d70]">
                                    Medicine inventory status
                                </p>
                            </div>
                        </div>

                        <div className="flex min-h-[145px] items-center justify-center gap-8">

                            <div
                                className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                                style={donutStyle}
                            >
                                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-white">
                                    <span className="text-xl font-bold">
                                        {totalStock}
                                    </span>

                                    <span className="text-[9px] text-[#887d70]">
                                        Total Stock
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-[190px] space-y-3">

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#27a866]" />
                                        <span className="text-xs text-[#766959]">
                                            In Stock
                                        </span>
                                    </div>

                                    <span className="text-xs font-bold">
                                        {inStockCount}
                                    </span>

                                    <span className="w-9 text-right text-[10px] text-[#887d70]">
                                        {Math.round(inStockPercent)}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#f5ae22]" />
                                        <span className="text-xs text-[#766959]">
                                            Low Stock
                                        </span>
                                    </div>

                                    <span className="text-xs font-bold">
                                        {lowStockCount}
                                    </span>

                                    <span className="w-9 text-right text-[10px] text-[#887d70]">
                                        {Math.round(lowStockPercent)}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#e63946]" />
                                        <span className="text-xs text-[#766959]">
                                            Out of Stock
                                        </span>
                                    </div>

                                    <span className="text-xs font-bold">
                                        {outOfStockCount}
                                    </span>

                                    <span className="w-9 text-right text-[10px] text-[#887d70]">
                                        {Math.round(outOfStockPercent)}%
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e8dfd4] bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50]">
                                <BarChart3 size={16} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold">
                                    Medicine Stock Distribution
                                </h2>

                                <p className="text-[10px] text-[#887d70]">
                                    Medicines grouped by stock status
                                </p>
                            </div>
                        </div>

                        <div className="relative h-[145px] pl-7">

                            <div className="absolute inset-x-7 top-1 bottom-6 flex flex-col justify-between">
                                <div className="border-t border-[#eee7de]" />
                                <div className="border-t border-[#eee7de]" />
                                <div className="border-t border-[#eee7de]" />
                                <div className="border-t border-[#eee7de]" />
                                <div className="border-t border-[#eee7de]" />
                                <div className="border-t border-[#ded4c9]" />
                            </div>

                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] text-[#887d70]">
                                <span>{maxStatusCount}</span>
                                <span>{Math.round(maxStatusCount * 0.8)}</span>
                                <span>{Math.round(maxStatusCount * 0.6)}</span>
                                <span>{Math.round(maxStatusCount * 0.4)}</span>
                                <span>{Math.round(maxStatusCount * 0.2)}</span>
                                <span>0</span>
                            </div>

                            <div className="absolute inset-x-7 bottom-6 top-1 flex items-end justify-around">

                                <div className="flex h-full w-20 flex-col items-center justify-end">
                                    <span className="mb-1 text-[10px] font-bold">
                                        {inStockCount}
                                    </span>

                                    <div
                                        className="w-16 rounded-t-md bg-[#27a866]"
                                        style={{
                                            height: `${Math.max(
                                                4,
                                                (inStockCount /
                                                    maxStatusCount) *
                                                    105
                                            )}px`,
                                        }}
                                    />
                                </div>

                                <div className="flex h-full w-20 flex-col items-center justify-end">
                                    <span className="mb-1 text-[10px] font-bold">
                                        {lowStockCount}
                                    </span>

                                    <div
                                        className="w-16 rounded-t-md bg-[#f5ae22]"
                                        style={{
                                            height: `${Math.max(
                                                4,
                                                (lowStockCount /
                                                    maxStatusCount) *
                                                    105
                                            )}px`,
                                        }}
                                    />
                                </div>

                                <div className="flex h-full w-20 flex-col items-center justify-end">
                                    <span className="mb-1 text-[10px] font-bold">
                                        {outOfStockCount}
                                    </span>

                                    <div
                                        className="w-16 rounded-t-md bg-[#e63946]"
                                        style={{
                                            height: `${Math.max(
                                                4,
                                                (outOfStockCount /
                                                    maxStatusCount) *
                                                    105
                                            )}px`,
                                        }}
                                    />
                                </div>

                            </div>

                            <div className="absolute inset-x-7 bottom-0 flex justify-around text-[9px] font-medium text-[#766959]">
                                <span className="w-20 text-center">
                                    In Stock
                                </span>

                                <span className="w-20 text-center">
                                    Low Stock
                                </span>

                                <span className="w-20 text-center">
                                    Out of Stock
                                </span>
                            </div>

                        </div>
                    </div>

                </section>


                <section className="overflow-hidden rounded-xl border border-[#e8dfd4] bg-white shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-[#e8dfd4] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50]">
                                <Pill size={16} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold">
                                    Medicine List
                                </h2>

                                <p className="text-[10px] text-[#887d70]">
                                    Current medicine inventory
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a99d8f]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    const val = event.target.value;
                                    setSearch(val);
                                    setSelectedCategory(val ? "" : "All");
                                }}
                                placeholder="Search by name, treatment, unit, or symptom..."
                                className="w-full rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] py-2 pl-9 pr-8 text-xs outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setSelectedCategory("All");
                                        loadMedicines(1, "");
                                    }}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[#a99d8f] hover:bg-[#f6f1e9] hover:text-[#3c332a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8dfd4] bg-[#fcfaf6] px-4 py-2.5">
                        {/* Treatment Category Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[11px] font-semibold text-[#887d70]">Category:</span>
                            {["All", "First Aid", "Medication", "Wound Care", "Cold Compress", "Hot Compress"].map((cat) => {
                                const isSelected = (!selectedCategory && cat === "All") || selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            const query = cat === "All" ? "" : cat;
                                            setSelectedCategory(cat);
                                            setSearch(query);
                                            loadMedicines(1, query, statusFilter);
                                        }}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                            isSelected
                                                ? "bg-[#8a6f50] text-white shadow-sm"
                                                : "border border-[#e8dfd4] bg-white text-[#675948] hover:bg-[#f6f0e6]"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status Quick Filters */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[11px] font-semibold text-[#887d70]">Status:</span>
                            {[
                                { key: "all", label: "All Items" },
                                { key: "expired", label: `Expired (${summary.expired_count || 0})`, isDanger: summary.expired_count > 0 },
                                { key: "expiring_soon", label: `Expiring Soon (${summary.expiring_soon_count || 0})`, isWarning: summary.expiring_soon_count > 0 },
                                { key: "low_stock", label: `Low Stock (${summary.low_stock_count || 0})` },
                                { key: "out_of_stock", label: `Out of Stock (${summary.out_of_stock_count || 0})` },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(tab.key);
                                        loadMedicines(1, search, tab.key);
                                    }}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                        statusFilter === tab.key
                                            ? tab.isDanger
                                                ? "bg-red-600 text-white shadow-sm"
                                                : tab.isWarning
                                                ? "bg-amber-600 text-white shadow-sm"
                                                : "bg-[#8a6f50] text-white shadow-sm"
                                            : tab.isDanger
                                            ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                                            : tab.isWarning
                                            ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                            : "border border-[#e8dfd4] bg-white text-[#675948] hover:bg-[#f6f0e6]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">

                            <thead>
                                <tr className="border-b border-[#e8dfd4] bg-[#fcfaf6] text-left">

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Medicine Name
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Treatment Type
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Unit
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Stock
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Minimum Stock
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Expiration Date
                                    </th>

                                    <th className="px-4 py-2.5 text-[10px] font-bold text-[#887d70]">
                                        Status
                                    </th>

                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold text-[#887d70]">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-12 text-center text-xs text-[#887d70]"
                                        >
                                            Loading medicines...
                                        </td>
                                    </tr>
                                ) : filteredMedicines.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-12 text-center"
                                        >
                                            <Pill
                                                size={30}
                                                className="mx-auto mb-2 text-[#ded4c9]"
                                            />

                                            <p className="text-xs font-semibold">
                                                No medicines found
                                            </p>

                                            <p className="mt-1 text-[10px] text-[#887d70]">
                                                Add a medicine to start managing your inventory.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMedicines.map(
                                        (medicine) => {
                                            const status =
                                                getStatus(medicine);

                                            return (
                                                <tr
                                                    key={medicine.id}
                                                    className="border-b border-[#eee7de] transition hover:bg-[#fcfaf6]"
                                                >


                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">

                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3ebdf] text-[#8a6f50]">
                                                                <Pill size={15} />
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-bold">
                                                                    {medicine.medicine_name}
                                                                </p>

                                                                {medicine.description && (
                                                                    <p className="mt-0.5 max-w-[200px] truncate text-[9px] text-[#a99d8f]">
                                                                        {medicine.description}
                                                                    </p>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </td>


                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex rounded-full border border-[#e8dfd4] bg-[#fcfaf6] px-2.5 py-1 text-[9px] font-semibold text-[#8a6f50]">
                                                            {medicine.treatment_type || "Not Assigned"}
                                                        </span>
                                                    </td>


                                                    <td className="px-4 py-2.5 text-xs text-[#766959]">
                                                        {medicine.unit}
                                                    </td>


                                                    <td className="px-4 py-2.5">
                                                        <span className="text-xs font-bold">
                                                            {medicine.stock}
                                                        </span>
                                                    </td>


                                                    <td className="px-4 py-2.5 text-xs text-[#766959]">
                                                        {medicine.minimum_stock}
                                                    </td>

                                                    {/* Expiration Date Cell */}
                                                    <td className="px-4 py-2.5">
                                                        {(() => {
                                                            const exp = getExpirationInfo(medicine.expiration_date);
                                                            if (exp.status === "expired") {
                                                                return (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                                                        <AlertOctagon size={11} className="shrink-0" />
                                                                        Expired: {exp.formattedDate}
                                                                    </span>
                                                                );
                                                            }
                                                            if (exp.status === "expiring_soon") {
                                                                return (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                                        <Calendar size={11} className="shrink-0" />
                                                                        {exp.formattedDate} ({exp.days}d)
                                                                    </span>
                                                                );
                                                            }
                                                            if (exp.status === "valid") {
                                                                return (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#554a3e]">
                                                                        <Calendar size={12} className="text-[#a89d8f]" />
                                                                        {exp.formattedDate}
                                                                    </span>
                                                                );
                                                            }
                                                            return <span className="text-[10px] italic text-[#a89d8f]">No date</span>;
                                                        })()}
                                                    </td>

                                                    <td className="px-4 py-2.5">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold ${status.className}`}
                                                        >
                                                            {status.label}
                                                        </span>
                                                    </td>


                                                    <td className="px-4 py-2.5">
                                                        <div className="flex justify-end gap-1.5">

                                                            <button
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        medicine
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8dfd4] text-[#8a6f50] transition hover:bg-[#f3ebdf]"
                                                                title="Edit medicine"
                                                            >
                                                                <Pencil size={13} />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    deleteMedicine(
                                                                        medicine
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                                                                title="Delete medicine"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[#e8dfd4] px-4 py-3 text-xs text-[#887d70]">
                        <span>
                            {pagination.total} medicine(s) · Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={pagination.current_page <= 1}
                                onClick={() => loadMedicines(pagination.current_page - 1, search)}
                                className="rounded-lg border border-[#e8dfd4] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => loadMedicines(pagination.current_page + 1, search)}
                                className="rounded-lg border border-[#e8dfd4] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>

            </main>


            <MedicineModal
                showForm={showForm}
                closeForm={closeForm}
                editingMedicine={editingMedicine}
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                saving={saving}
                error={error}
                treatmentTypes={TREATMENT_TYPES}
            />
        </div>
    );
}

export default Medicine;
