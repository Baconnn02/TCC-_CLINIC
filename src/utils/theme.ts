import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "tcc-theme";
const THEME_EVENT = "tcc-theme-changed";

export function getStoredTheme(): Theme {
    if (typeof window === "undefined") return "light";
    try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light") {
            return stored;
        }
    } catch {
        // ignore localStorage errors
    }
    return "light";
}

export function applyTheme(theme: Theme): void {
    if (typeof document === "undefined") return;

    const isDark = theme === "dark";
    document.documentElement.classList.toggle("tcc-dark", isDark);
    document.documentElement.classList.toggle("dark", isDark);

    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // ignore localStorage errors
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent(THEME_EVENT, { detail: theme })
        );
    }
}

export function toggleTheme(): Theme {
    const current = getStoredTheme();
    const next: Theme = current === "dark" ? "light" : "dark";
    applyTheme(next);
    return next;
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

    useEffect(() => {
        // Ensure initial DOM state matches
        const initial = getStoredTheme();
        const isDark = initial === "dark";
        document.documentElement.classList.toggle("tcc-dark", isDark);
        document.documentElement.classList.toggle("dark", isDark);

        const handleThemeChange = (event: Event) => {
            const customEvent = event as CustomEvent<Theme>;
            if (customEvent.detail) {
                setThemeState(customEvent.detail);
            } else {
                setThemeState(getStoredTheme());
            }
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === THEME_KEY) {
                const nextTheme = event.newValue === "dark" ? "dark" : "light";
                setThemeState(nextTheme);
                document.documentElement.classList.toggle("tcc-dark", nextTheme === "dark");
                document.documentElement.classList.toggle("dark", nextTheme === "dark");
            }
        };

        window.addEventListener(THEME_EVENT, handleThemeChange);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener(THEME_EVENT, handleThemeChange);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setThemeState(next);
        return next;
    };

    const setTheme = (newTheme: Theme) => {
        applyTheme(newTheme);
        setThemeState(newTheme);
    };

    return {
        theme,
        isDark: theme === "dark",
        toggleTheme: toggle,
        setTheme,
    };
}

