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
} from "lucide-react";
import api from "../services/api";

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
        per_page: 25,
    });
    const [summary, setSummary] = useState({
        total_medicines: 0,
        total_stock: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
    });
    const [search, setSearch] = useState("");
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

    const loadMedicines = useCallback(async (page = 1, searchTerm = "") => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/medicines", {
                params: {
                    page,
                    per_page: 25,
                    include_summary: 1,
                    search: searchTerm.trim() || undefined,
                },
            });

            setMedicines(response.data?.data || []);
            setPagination({
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                total: response.data?.total || 0,
                per_page: response.data?.per_page || 25,
            });
            setSummary(response.data?.summary || {
                total_medicines: 0,
                total_stock: 0,
                low_stock_count: 0,
                out_of_stock_count: 0,
            });
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
        const timeout = setTimeout(() => loadMedicines(1, ""), 0);

        return () => clearTimeout(timeout);
    }, [loadMedicines]);

    const initialSearch = useRef(true);
    useEffect(() => {
        if (initialSearch.current) {
            initialSearch.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            loadMedicines(1, search);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, loadMedicines]);

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
                search
            );

            setSuccessMessage(
                `${payload.medicine_name} ${editingMedicine ? "updated" : "added"} successfully.`
            );
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

    const createMiniBars = (
        values,
        maxValue
    ) => {
        return values.map((value, index) => (
            <div
                key={index}
                className="w-[6px] rounded-t-sm bg-current"
                style={{
                    height: `${Math.max(
                        8,
                        (value / Math.max(maxValue, 1)) * 34
                    )}px`,
                }}
            />
        ));
    };

    return (
        <div className="tcc-module-page min-h-screen text-[#302820]">
            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed right-5 top-5 z-[140] flex max-w-[calc(100vw-2.5rem)] items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl shadow-emerald-950/10"
                >
                    <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                    />
                    <p className="pr-2 text-sm font-medium text-[#302820]">
                        {successMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        aria-label="Dismiss success message"
                        className="-mr-1 -mt-1 rounded-md p-1 text-[#887d70] transition hover:bg-[#fcfaf6] hover:text-[#302820]"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}

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


                <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

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
                                {createMiniBars(
                                    [
                                        Math.max(totalMedicines * 0.45, 1),
                                        Math.max(totalMedicines * 0.65, 1),
                                        Math.max(totalMedicines * 0.82, 1),
                                        Math.max(totalMedicines * 0.92, 1),
                                        Math.max(totalMedicines, 1),
                                    ],
                                    Math.max(totalMedicines, 1)
                                )}
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
                                {createMiniBars(
                                    [
                                        totalStock * 0.38,
                                        totalStock * 0.55,
                                        totalStock * 0.72,
                                        totalStock * 0.86,
                                        totalStock,
                                    ],
                                    Math.max(totalStock, 1)
                                )}
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
                                {createMiniBars(
                                    [
                                        1,
                                        Math.max(lowStockCount * 0.45, 1),
                                        Math.max(lowStockCount * 0.65, 1),
                                        Math.max(lowStockCount * 0.82, 1),
                                        Math.max(lowStockCount, 1),
                                    ],
                                    Math.max(lowStockCount, 1)
                                )}
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
                                {createMiniBars(
                                    [
                                        1,
                                        Math.max(outOfStockCount * 0.45, 1),
                                        Math.max(outOfStockCount * 0.65, 1),
                                        Math.max(outOfStockCount * 0.82, 1),
                                        Math.max(outOfStockCount, 1),
                                    ],
                                    Math.max(outOfStockCount, 1)
                                )}
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

                        <div className="relative w-full sm:w-64">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a99d8f]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search medicine..."
                                className="w-full rounded-lg border border-[#e8dfd4] bg-[#fcfaf6] py-2 pl-9 pr-3 text-xs outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-4 focus:ring-[#8a6f50]/10"
                            />
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
                                            colSpan={7}
                                            className="py-12 text-center text-xs text-[#887d70]"
                                        >
                                            Loading medicines...
                                        </td>
                                    </tr>
                                ) : filteredMedicines.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
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


            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">


                        <div className="flex items-center justify-between border-b border-[#e8dfd4] px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                                    <Pill size={19} />
                                </div>

                                <div>
                                    <h3 className="font-bold">
                                        {editingMedicine
                                            ? "Edit Medicine"
                                            : "Add Medicine"}
                                    </h3>

                                    <p className="text-xs text-[#887d70]">
                                        {editingMedicine
                                            ? "Update medicine information and stock"
                                            : "Add a new medicine to the clinic inventory"}
                                    </p>
                                </div>

                            </div>

                            <button
                                onClick={closeForm}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#887d70] hover:bg-[#fcfaf6] hover:text-[#8a6f50]"
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {error && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}


                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Medicine Name
                                </label>

                                <input
                                    type="text"
                                    name="medicine_name"
                                    value={form.medicine_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Paracetamol"
                                    className="w-full rounded-xl border border-[#e8dfd4] px-4 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Treatment Type
                                </label>

                                <select
                                    name="treatment_type"
                                    value={form.treatment_type}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#e8dfd4] bg-white px-4 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                >
                                    {TREATMENT_TYPES.map(
                                        (type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>
                                        )
                                    )}
                                </select>

                                <p className="mt-1.5 text-[10px] text-[#887d70]">
                                    This determines when the medicine appears in Clinic Visits.
                                </p>
                            </div>


                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Unit
                                    </label>

                                    <select
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[#e8dfd4] bg-white px-3 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                    >
                                        <option value="Tablet">
                                            Tablet
                                        </option>

                                        <option value="Capsule">
                                            Capsule
                                        </option>

                                        <option value="Bottle">
                                            Bottle
                                        </option>

                                        <option value="Sachet">
                                            Sachet
                                        </option>

                                        <option value="Tube">
                                            Tube
                                        </option>

                                        <option value="Piece">
                                            Piece
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        min="0"
                                        value={form.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full rounded-xl border border-[#e8dfd4] px-3 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Minimum
                                    </label>

                                    <input
                                        type="number"
                                        name="minimum_stock"
                                        min="0"
                                        value={form.minimum_stock}
                                        onChange={handleChange}
                                        placeholder="10"
                                        className="w-full rounded-xl border border-[#e8dfd4] px-3 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                    />
                                </div>

                            </div>


                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Description
                                    <span className="ml-1 font-normal text-[#a99d8f]">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Short description..."
                                    className="w-full resize-none rounded-xl border border-[#e8dfd4] px-4 py-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-4 focus:ring-[#8a6f50]/10"
                                />
                            </div>


                            <div className="flex justify-end gap-3 border-t border-[#e8dfd4] pt-5">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-xl border border-[#e8dfd4] px-5 py-3 text-sm font-semibold text-[#766959] hover:bg-[#fcfaf6]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-[#8a6f50] px-5 py-3 text-sm font-semibold text-white hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingMedicine
                                        ? "Update Medicine"
                                        : "Add Medicine"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Medicine;
