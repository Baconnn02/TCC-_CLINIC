import { useEffect } from "react";
import { CheckCircle2, Trash2, Info, AlertTriangle, X } from "lucide-react";

export interface FloatingToastProps {
    message: string;
    type?: "success" | "delete" | "info" | "error";
    onClose: () => void;
    duration?: number;
}

export function FloatingToast({
    message,
    type,
    onClose,
    duration = 4000,
}: FloatingToastProps) {
    useEffect(() => {
        if (!message) return undefined;

        const timeout = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timeout);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isDelete = type === "delete" || (!type && message.toLowerCase().includes("delete"));
    const isError = type === "error";
    const isInfo = type === "info";

    const badgeBorder = isDelete
        ? "border-rose-200 shadow-rose-950/10"
        : isError
        ? "border-red-200 shadow-red-950/10"
        : isInfo
        ? "border-blue-200 shadow-blue-950/10"
        : "border-emerald-200 shadow-emerald-950/10";

    const IconComponent = isDelete
        ? Trash2
        : isError
        ? AlertTriangle
        : isInfo
        ? Info
        : CheckCircle2;

    const iconColor = isDelete
        ? "text-rose-600"
        : isError
        ? "text-red-600"
        : isInfo
        ? "text-blue-600"
        : "text-emerald-600";

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed right-5 top-5 z-[150] flex max-w-[calc(100vw-2.5rem)] items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${badgeBorder}`}
        >
            <IconComponent
                size={20}
                className={`mt-0.5 shrink-0 ${iconColor}`}
                aria-hidden="true"
            />
            <p className="pr-2 text-sm font-medium text-[#302820]">
                {message}
            </p>
            <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 rounded-md p-1 text-[#887d70] transition hover:bg-[#fcfaf6] hover:text-[#302820]"
            >
                <X size={16} aria-hidden="true" />
            </button>
        </div>
    );
}

export default FloatingToast;
