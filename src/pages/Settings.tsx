import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Accessibility, LayoutList, LoaderCircle, LockKeyhole, LogOut, Moon, Sun, UserRound } from "lucide-react";
import api from "../services/api";

function Settings() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() =>
        localStorage.getItem("tcc-theme") === "dark"
    );
    const [compactTables, setCompactTables] = useState(() =>
        localStorage.getItem("tcc-compact-tables") === "true"
    );
    const [reducedMotion, setReducedMotion] = useState(() =>
        localStorage.getItem("tcc-reduced-motion") === "true"
    );
    const [loggingOut, setLoggingOut] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState({ message: "", error: false });
    const passwordsMismatch = Boolean(passwordForm.password_confirmation) && passwordForm.password !== passwordForm.password_confirmation;

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (passwordForm.password !== passwordForm.password_confirmation) {
            setPasswordFeedback({ message: "The new passwords do not match.", error: true });
            return;
        }
        if (changingPassword) return;
        setChangingPassword(true);
        setPasswordFeedback({ message: "", error: false });
        try {
            const response = await api.put("/password", passwordForm);
            setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
            setPasswordFeedback({ message: response.data?.message || "Password changed successfully.", error: false });
        } catch (error) {
            const message = error?.response?.data?.errors
                ? Object.values(error.response.data.errors).flat()[0]
                : error?.response?.data?.message || "Could not change the password. Please try again.";
            setPasswordFeedback({ message, error: true });
        } finally {
            setChangingPassword(false);
        }
    };

    const updateTheme = (enabled) => {
        setDarkMode(enabled);
        localStorage.setItem("tcc-theme", enabled ? "dark" : "light");
        document.documentElement.classList.toggle("tcc-dark", enabled);
    };

    const updateCompactTables = (enabled) => {
        setCompactTables(enabled);
        localStorage.setItem("tcc-compact-tables", String(enabled));
        document.documentElement.classList.toggle("tcc-compact-tables", enabled);
    };

    const updateReducedMotion = (enabled) => {
        setReducedMotion(enabled);
        localStorage.setItem("tcc-reduced-motion", String(enabled));
        document.documentElement.classList.toggle("tcc-reduced-motion", enabled);
    };

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);

        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            document.documentElement.classList.remove("tcc-dark");
            localStorage.setItem("tcc-theme", "light");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6">
            <main className="mx-auto w-full max-w-[1500px]">
                <header className="tcc-module-header mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6f50]">
                        Preferences
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#3d3329]">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-[#887d70]">
                        Customize the clinic system.
                    </p>
                </header>

                <section className="tcc-settings-card rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#302820]">
                                    Appearance
                                </h2>
                                <p className="mt-1 text-sm text-[#887d70]">
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
                            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40 ${
                                darkMode ? "bg-[#8a6f50]" : "bg-stone-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    darkMode ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    <p className="mt-5 border-t border-[#e8dfd4] pt-4 text-xs text-[#887d70]">
                        Dark mode is currently {darkMode ? "on" : "off"}.
                    </p>
                </section>

                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                                <UserRound size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#302820]">Profile</h2>
                                <p className="mt-1 text-sm text-[#887d70]">Update your name, email address, and profile photo.</p>
                            </div>
                        </div>
                        <Link to="/profile" className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dfd4] px-4 text-sm font-semibold text-[#6d5942] transition hover:border-[#8a6f50] hover:bg-[#fcfaf6]">
                            Edit profile
                        </Link>
                    </div>
                </section>

                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                            <LockKeyhole size={18} aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#302820]">Change password</h2>
                            <p className="mt-1 text-sm text-[#887d70]">Verify your current password and choose a new one.</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-medium text-[#514538] sm:col-span-2">
                            Current password
                            <input required type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10" />
                        </label>
                        <label className="text-sm font-medium text-[#514538]">
                            New password
                            <input required type="password" minLength={8} autoComplete="new-password" value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10" />
                            <span className="mt-1 block text-xs font-normal text-[#887d70]">At least 8 characters.</span>
                        </label>
                        <label className="text-sm font-medium text-[#514538]">
                            Confirm new password
                            <input required type="password" minLength={8} autoComplete="new-password" aria-invalid={passwordsMismatch} value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })} className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 ${passwordsMismatch ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8dfd4] focus:border-[#8a6f50] focus:ring-[#8a6f50]/10"}`} />
                            {passwordsMismatch && <span role="alert" className="mt-1 block text-xs font-normal text-red-700">Passwords do not match.</span>}
                        </label>
                        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                            <button type="submit" disabled={changingPassword} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#8a6f50] px-4 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-wait disabled:opacity-60">
                                {changingPassword ? "Updating..." : "Update password"}
                            </button>
                            {passwordFeedback.message && <p role="status" className={`text-sm ${passwordFeedback.error ? "text-red-700" : "text-green-700"}`}>{passwordFeedback.message}</p>}
                        </div>
                    </form>
                </section>

                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-[#302820]">
                            Display & accessibility
                        </h2>
                        <p className="mt-1 text-sm text-[#887d70]">
                            Adjust tables and animation to suit your workspace.
                        </p>
                    </div>

                    <div className="divide-y divide-[#e8dfd4]">
                        <PreferenceSwitch
                            icon={LayoutList}
                            title="Compact tables"
                            description="Reduce row spacing to show more records at once."
                            checked={compactTables}
                            onChange={updateCompactTables}
                        />
                        <PreferenceSwitch
                            icon={Accessibility}
                            title="Reduce motion"
                            description="Minimize interface animations and transitions."
                            checked={reducedMotion}
                            onChange={updateReducedMotion}
                        />
                    </div>
                </section>

                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#302820]">
                                Account
                            </h2>
                            <p className="mt-1 text-sm text-[#887d70]">
                                Sign out of your clinic management account on this device.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            aria-busy={loggingOut}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loggingOut ? (
                                <LoaderCircle size={18} aria-hidden="true" className="animate-spin" />
                            ) : (
                                <LogOut size={18} aria-hidden="true" />
                            )}
                            {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

function PreferenceSwitch({ icon: Icon, title, description, checked, onChange }) {
    return (
        <div className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                    <Icon size={18} aria-hidden="true" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-[#302820]">{title}</h3>
                    <p className="mt-1 text-sm text-[#887d70]">{description}</p>
                </div>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40 ${
                    checked ? "bg-[#8a6f50]" : "bg-stone-300"
                }`}
            >
                <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}

export default Settings;
