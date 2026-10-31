import type { ChangeEvent, FormEvent } from "react";
import { Pill, AlertTriangle, CheckCircle2, Calendar, AlertOctagon } from "lucide-react";

export interface MedicineFormData {
    medicine_name: string;
    treatment_type: string;
    expiration_date: string;
    unit: string;
    stock: string | number;
    minimum_stock: string | number;
    description: string;
}

export interface MedicineItem {
    id: number | string;
    medicine_name: string;
    treatment_type?: string;
    expiration_date?: string | null;
    unit?: string;
    stock?: number | string | null;
    minimum_stock?: number | string | null;
    description?: string | null;
}

interface MedicineModalProps {
    showForm: boolean;
    closeForm: () => void;
    editingMedicine: MedicineItem | null;
    form: MedicineFormData;
    handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    saving: boolean;
    error: string;
    treatmentTypes?: string[];
}

const DEFAULT_TREATMENT_TYPES = [
    "First Aid",
    "Medication",
    "Wound Care",
    "Cold Compress",
    "Hot Compress",
];

const UNIT_OPTIONS = [
    "Tablet",
    "Capsule",
    "Bottle",
    "Sachet",
    "Tube",
    "Piece",
    "Box",
    "Vial",
    "Ampoule",
];

export function MedicineModal({
    showForm,
    closeForm,
    editingMedicine,
    form,
    handleChange,
    handleSubmit,
    saving,
    error,
    treatmentTypes = DEFAULT_TREATMENT_TYPES,
}: MedicineModalProps) {
    if (!showForm) return null;

    // Filter out "All" if it was passed in treatmentTypes
    const availableTreatments = treatmentTypes.filter((t) => t !== "All");

    // Live preview of stock status
    const currentStock = Number(form.stock || 0);
    const minStock = Number(form.minimum_stock || 0);
    const isOutOfStock = form.stock !== "" && currentStock <= 0;
    const isLowStock = !isOutOfStock && form.stock !== "" && currentStock <= minStock;

    // Live preview of expiration status
    let isExpired = false;
    let isExpiringSoon = false;
    let daysUntilExp: number | null = null;

    if (form.expiration_date) {
        const exp = new Date(form.expiration_date);
        exp.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = exp.getTime() - today.getTime();
        daysUntilExp = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntilExp < 0) {
            isExpired = true;
        } else if (daysUntilExp <= 30) {
            isExpiringSoon = true;
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    closeForm();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="medicine-modal-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-stone-900"
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#d96502] dark:bg-amber-950/40 dark:text-amber-400">
                            <Pill size={20} />
                        </div>
                        <div>
                            <h2
                                id="medicine-modal-title"
                                className="text-lg font-semibold text-stone-800 dark:text-stone-100"
                            >
                                {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                {editingMedicine
                                    ? "Update medicine information, expiration date, and inventory levels."
                                    : "Enter medicine details to add it to the clinic inventory."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeForm}
                        disabled={saving}
                        aria-label="Close modal"
                        className="rounded-lg px-2.5 py-1 text-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Expiration Warning Banner if expired or expiring soon */}
                    {isExpired && (
                        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                            <AlertOctagon size={17} className="shrink-0 text-red-600" />
                            <span>
                                <strong>Warning:</strong> This medicine has expired ({Math.abs(daysUntilExp || 0)} day(s) ago). Expired medicines must be safely discarded.
                            </span>
                        </div>
                    )}

                    {isExpiringSoon && (
                        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                            <AlertTriangle size={17} className="shrink-0 text-amber-600" />
                            <span>
                                <strong>Notice:</strong> This medicine will expire in {daysUntilExp} day(s). Plan usage or replacement soon.
                            </span>
                        </div>
                    )}

                    {/* 2-Column Fields Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* 1. Medicine Name (Left) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Medicine Name
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="medicine_name"
                                value={form.medicine_name}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol 500mg"
                                required
                                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            />
                        </div>

                        {/* 2. Treatment Type (Right) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Treatment Type
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <select
                                name="treatment_type"
                                value={form.treatment_type}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            >
                                {availableTreatments.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Expiration Date (Left) */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center justify-between text-sm font-medium text-stone-700 dark:text-stone-300">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-stone-400" />
                                    Expiration Date
                                </span>
                                {isExpired ? (
                                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                                        Expired
                                    </span>
                                ) : isExpiringSoon ? (
                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                        Expiring Soon ({daysUntilExp}d)
                                    </span>
                                ) : null}
                            </label>
                            <input
                                type="date"
                                name="expiration_date"
                                value={form.expiration_date || ""}
                                onChange={handleChange}
                                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 dark:bg-stone-800 dark:text-stone-100 ${
                                    isExpired
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-800"
                                        : isExpiringSoon
                                        ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100 dark:border-amber-800"
                                        : "border-stone-300 focus:border-amber-500 focus:ring-amber-100 dark:border-stone-700"
                                }`}
                            />
                        </div>

                        {/* 4. Unit of Measure (Right) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Unit of Measure
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <select
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            >
                                {UNIT_OPTIONS.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Stock (Left) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {editingMedicine ? "Current Stock" : "Initial Stock"}
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={form.stock}
                                onChange={handleChange}
                                placeholder="0"
                                required
                                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            />
                        </div>

                        {/* 6. Minimum Stock (Right) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Minimum Stock (Alert Level)
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="minimum_stock"
                                min="0"
                                value={form.minimum_stock}
                                onChange={handleChange}
                                placeholder="10"
                                required
                                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            />
                        </div>

                        {/* 7. Live Status Preview (Full width) */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Status Overview
                            </label>
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-800/50">
                                {/* Stock Status badge */}
                                {isOutOfStock ? (
                                    <div className="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                                        <AlertTriangle size={15} />
                                        <span>Out of Stock</span>
                                    </div>
                                ) : isLowStock ? (
                                    <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                        <AlertTriangle size={15} />
                                        <span>Low Stock</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={15} />
                                        <span>In Stock</span>
                                    </div>
                                )}

                                <span className="text-stone-300 dark:text-stone-700">|</span>

                                {/* Expiration status badge */}
                                {isExpired ? (
                                    <div className="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                                        <AlertOctagon size={15} />
                                        <span>Expired ({form.expiration_date})</span>
                                    </div>
                                ) : isExpiringSoon ? (
                                    <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                        <Calendar size={15} />
                                        <span>Expiring in {daysUntilExp} day(s)</span>
                                    </div>
                                ) : form.expiration_date ? (
                                    <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                                        <CheckCircle2 size={15} className="text-emerald-500" />
                                        <span>Valid until {form.expiration_date}</span>
                                    </div>
                                ) : (
                                    <span className="text-stone-400">No expiration date set</span>
                                )}
                            </div>
                        </div>

                        {/* 8. Description (Full width across 2 columns) */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Description / Usage Notes
                                <span className="ml-1 text-xs font-normal text-stone-400">
                                    (Optional)
                                </span>
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Indications, dosage directions, or storage instructions..."
                                className="w-full resize-none rounded-lg border border-stone-300 bg-white p-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            />
                        </div>
                    </div>

                    {/* Divider and Action Buttons matching reference layout */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-200 pt-4 dark:border-stone-800">
                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-[#d96502] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b85400] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingMedicine
                                ? "Update Medicine"
                                : "Save Medicine"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
