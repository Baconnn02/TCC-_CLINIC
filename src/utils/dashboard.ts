import api from "../services/api";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const isDateOnly = (raw) =>
    typeof raw === "string" && DATE_ONLY.test(raw);





export const parseDate = (raw) => {
    if (!raw) {
        return null;
    }

    if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? null : raw;
    }

    if (isDateOnly(raw)) {
        const [year, month, day] = raw.split("-").map(Number);

        return new Date(year, month - 1, day);
    }

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const getLastMonths = (count) => {
    const now = new Date();
    const months = [];

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        months.push({
            label: date.toLocaleDateString("en-US", {
                month: "short",
            }),
            month: date.getMonth(),
            year: date.getFullYear(),
        });
    }

    return months;
};

export const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const visitDateKey = (raw) => {
    if (isDateOnly(raw)) {
        return raw;
    }

    const date = parseDate(raw);

    return date ? toDateKey(date) : null;
};

const API_ORIGIN = (() => {
    const baseURL = api?.defaults?.baseURL;

    if (
        typeof baseURL === "string" &&
        /^https?:\/\//i.test(baseURL)
    ) {
        try {
            return new URL(baseURL).origin;
        } catch {

        }
    }

    return "http://127.0.0.1:8000";
})();

export const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) {
        return path;
    }

    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

