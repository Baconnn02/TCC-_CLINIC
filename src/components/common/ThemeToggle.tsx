import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../utils/theme";

interface ThemeToggleProps {
    className?: string;
    showLabels?: boolean;
    variant?: "default" | "compact" | "sidebar";
}

export function ThemeToggle({
    className = "",
    variant = "default",
}: ThemeToggleProps): React.JSX.Element {
    const { isDark, toggleTheme } = useTheme();

    if (variant === "sidebar") {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-stone-300 transition duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1ccb0] ${className}`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-amber-200/90 transition-transform group-hover:scale-105">
                        {isDark ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <span className="text-xs font-medium text-stone-200">
                        {isDark ? "Dark Mode" : "Light Mode"}
                    </span>
                </div>

                <div
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                        isDark ? "bg-[#8a6f50]" : "bg-stone-600"
                    }`}
                >
                    <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            isDark ? "translate-x-4" : "translate-x-1"
                        }`}
                    />
                </div>
            </button>
        );
    }

    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40 ${
                    isDark
                        ? "border-[#625344] bg-[#302820] text-[#e1ccb0] hover:bg-[#3d3228]"
                        : "border-[#e8dfd4] bg-[#fcfaf6] text-[#8a6f50] hover:bg-[#f3ebdf]"
                } ${className}`}
            >
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </button>
        );
    }

    // Default responsive toggle
    return (
        <button
            type="button"
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`group relative flex h-10 items-center gap-2 rounded-full border px-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40 ${
                isDark
                    ? "border-[#625344] bg-[#302820] text-[#e1ccb0] hover:border-[#806950]"
                    : "border-[#e8dfd4] bg-[#fcfaf6] text-[#8a6f50] hover:border-[#d6c2a6] hover:bg-[#f6f1e9]"
            } ${className}`}
        >
            {/* Sun Icon */}
            <Sun
                size={16}
                className={`transition-opacity duration-200 ${
                    isDark
                        ? "opacity-35 group-hover:opacity-60"
                        : "opacity-100 text-[#8a6f50]"
                }`}
            />

            {/* Pill track and sliding knob */}
            <span
                className={`relative flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                    isDark ? "bg-[#4a3d2f]" : "bg-[#eee7de]"
                }`}
            >
                <span
                    className={`absolute left-0.5 flex h-4 w-4 items-center justify-center rounded-full shadow-sm transition-transform duration-200 ease-out ${
                        isDark
                            ? "translate-x-5 bg-[#211c17] text-[#e1ccb0]"
                            : "translate-x-0 bg-white text-[#8a6f50]"
                    }`}
                >
                    {isDark ? <Moon size={10} /> : <Sun size={10} />}
                </span>
            </span>

            {/* Moon Icon */}
            <Moon
                size={16}
                className={`transition-opacity duration-200 ${
                    isDark
                        ? "opacity-100 text-[#e1ccb0]"
                        : "opacity-35 group-hover:opacity-60"
                }`}
            />
        </button>
    );
}

export default ThemeToggle;
