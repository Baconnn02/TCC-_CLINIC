import { useState } from "react";
import { Moon, Sun } from "lucide-react";

function Settings() {
    const [darkMode, setDarkMode] = useState(() =>
        localStorage.getItem("tcc-theme") !== "light"
    );

    const updateTheme = (enabled) => {
        setDarkMode(enabled);
        localStorage.setItem("tcc-theme", enabled ? "dark" : "light");
        document.documentElement.classList.toggle("tcc-dark", enabled);
    };

    return (
        <div className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6">
            <main className="mx-auto w-full max-w-[1500px]">
                <header className="tcc-module-header mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b1505]">
                        Preferences
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#64101e]">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-[#8a736e]">
                        Customize the clinic system.
                    </p>
                </header>

                <section className="rounded-2xl border border-[#f0ded9] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fcebe7] text-[#8b1505]">
                                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1c0f0c]">
                                    Appearance
                                </h2>
                                <p className="mt-1 text-sm text-[#8a736e]">
                                    Choose light or dark mode for the entire clinic system.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={darkMode}
                            aria-label="Enable dark mode"
                            onClick={() => updateTheme(!darkMode)}
                            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1505]/40 ${
                                darkMode ? "bg-[#8b1505]" : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    darkMode ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    <p className="mt-5 border-t border-[#f0ded9] pt-4 text-xs text-[#8a736e]">
                        Dark mode is currently {darkMode ? "on" : "off"}.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default Settings;
