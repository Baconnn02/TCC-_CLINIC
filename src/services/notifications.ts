export interface ClinicNotification {
    id: string;
    key: string;
    type: "add" | "delete" | "edit" | "info";
    title: string;
    description: string;
    timestamp: number;
    date: string;
    category?: "visit" | "patient" | "medicine" | "system";
    read?: boolean;
}

const STORAGE_KEY = "tcc-clinic-notifications-v1";
const MAX_NOTIFICATIONS = 30;

export function getStoredNotifications(): ClinicNotification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (e) {
        console.warn("Failed to load stored notifications:", e);
    }
    return [];
}

export function saveNotifications(notifications: ClinicNotification[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    } catch (e) {
        console.warn("Failed to save notifications to storage:", e);
    }
}

export function addClinicNotification(item: {
    type: "add" | "delete" | "edit" | "info";
    title: string;
    description: string;
    category?: "visit" | "patient" | "medicine" | "system";
}): ClinicNotification {
    const now = Date.now();
    const newNotification: ClinicNotification = {
        id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
        key: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
        type: item.type,
        title: item.title,
        description: item.description,
        timestamp: now,
        date: new Date(now).toISOString(),
        category: item.category || "system",
        read: false,
    };

    const current = getStoredNotifications();
    const updated = [newNotification, ...current].slice(0, MAX_NOTIFICATIONS);
    saveNotifications(updated);

    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("tcc-notifications-updated", { detail: updated })
        );
    }

    return newNotification;
}

export function clearAllClinicNotifications(): void {
    saveNotifications([]);
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("tcc-notifications-updated", { detail: [] })
        );
    }
}

export function markAllNotificationsAsRead(): void {
    const current = getStoredNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("tcc-notifications-updated", { detail: updated })
        );
    }
}

