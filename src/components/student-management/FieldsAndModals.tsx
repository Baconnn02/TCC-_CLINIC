import type { ChangeEventHandler, ReactNode } from "react";

interface InputFieldProps { label: string; value: string | number | null | undefined; onChange: ChangeEventHandler<HTMLInputElement>; type?: string; required?: boolean; placeholder?: string; disabled?: boolean; }
interface SelectFieldProps { label: string; value: string | number | null | undefined; onChange: ChangeEventHandler<HTMLSelectElement>; options: string[]; required?: boolean; disabled?: boolean; }
interface ModalProps { children: ReactNode; onClose: () => void; title: string; maxWidth?: string; }
interface ConfirmationModalProps { open: boolean; title: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void; }
interface InfoItemProps { label: string; value: ReactNode; }
interface RecordSectionProps { icon: ReactNode; title: string; children: ReactNode; }

export function InputField({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    disabled = false,
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            />
        </div>
    );
}







export function SelectField({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
}: SelectFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <select
                value={value ?? ""}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            >
                <option value="">
                    Select {label}
                </option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}







export function Modal({
    children,
    onClose,
    title,
    maxWidth = "max-w-3xl",
}: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-xl`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold text-stone-800">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-xl text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                    >
                        ×
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}







export function ConfirmationModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onClose,
}: ConfirmationModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start gap-4 px-6 py-5">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            danger
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                        }`}
                    >
                        {danger ? (
                            <span className="text-2xl">!</span>
                        ) : (
                            <span className="text-xl">✓</span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-stone-800">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-stone-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-amber-600 hover:bg-amber-700"
                        }`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}







export function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="rounded-lg bg-stone-50 p-3">
            <p className="text-xs font-medium uppercase text-stone-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-stone-800">
                {value || "-"}
            </p>
        </div>
    );
}







export function RecordSection({
    icon,
    title,
    children,
}: RecordSectionProps) {
    return (
        <div className="mb-6 last:mb-0">
            <div className="mb-3 flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="text-base leading-none">
                    {icon}
                </span>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
                    {title}
                </h3>
            </div>

            {children}
        </div>
    );
}







