import type { ChangeEvent, FormEvent } from "react";
import { Pill, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface MedicineFormData {
    medicine_name: string;
    treatment_type: string;
    unit: string;
    stock: string | number;
    minimum_stock: string | number;
    description: string;
}

export interface MedicineItem {
    id: number | string;
    medicine_name: string;
    treatment_type?: string;
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
                                    ? "Update medicine information and inventory levels."
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

                        {/* 3. Unit (Left) */}
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

                        {/* 4. Stock (Right) */}
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

                        {/* 5. Minimum Stock (Left) */}
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

                        {/* 6. Live Status Preview (Right) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Status Preview
                            </label>
                            <div className="flex h-[38px] items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-800/50">
                                {isOutOfStock ? (
                                    <>
                                        <AlertTriangle size={15} className="text-red-500" />
                                        <span className="font-semibold text-red-600 dark:text-red-400">
                                            Out of Stock
                                        </span>
                                        <span className="text-stone-400">· Restock required</span>
                                    </>
                                ) : isLowStock ? (
                                    <>
                                        <AlertTriangle size={15} className="text-amber-500" />
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                            Low Stock
                                        </span>
                                        <span className="text-stone-400">· Below minimum alert</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={15} className="text-emerald-500" />
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            In Stock
                                        </span>
                                        <span className="text-stone-400">· Sufficient quantity</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 7. Description (Full width across 2 columns) */}
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

