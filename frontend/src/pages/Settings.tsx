import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Accessibility,
    LayoutList,
    LoaderCircle,
    LockKeyhole,
    LogOut,
    Moon,
    Sun,
    UserRound,
} from "lucide-react";
import api, { resolveImageUrl } from "../services/api";
import FloatingToast from "../components/common/FloatingToast";
import { applyTheme, useTheme } from "../utils/theme";

function Settings() {
    const navigate = useNavigate();
    const { isDark: darkMode } = useTheme();
    const [compactTables, setCompactTables] = useState(() =>
        localStorage.getItem("tcc-compact-tables") === "true"
    );
    const [reducedMotion, setReducedMotion] = useState(() =>
        localStorage.getItem("tcc-reduced-motion") === "true"
    );
    const [loggingOut, setLoggingOut] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState({ message: "", error: false });
    const [toastMessage, setToastMessage] = useState("");
    const passwordsMismatch =
        Boolean(passwordForm.password_confirmation) &&
        passwordForm.password !== passwordForm.password_confirmation;

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
            const successMsg = response.data?.message || "Password changed successfully.";
            setPasswordFeedback({
                message: successMsg,
                error: false,
            });
            setToastMessage(successMsg);
        } catch (error) {
            const message = error?.response?.data?.errors
                ? Object.values(error.response.data.errors).flat()[0]
                : error?.response?.data?.message || "Could not change the password. Please try again.";
            setPasswordFeedback({ message, error: true });
        } finally {
            setChangingPassword(false);
        }
    };

    const updateTheme = (enabled: boolean) => {
        applyTheme(enabled ? "dark" : "light");
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
        applyTheme("light");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tcc-dashboard-cache");
        sessionStorage.clear();
        navigate("/login", { replace: true });
        try {
            api.post("/logout").catch((err) => {
                console.warn("Logout request failed in background:", err);
            });
        } catch {
            // ignore
        }
    };

    return (
        <div className="tcc-module-page min-h-screen px-5 py-5 lg:px-6 lg:py-6">
            <FloatingToast
                message={toastMessage}
                onClose={() => setToastMessage("")}
            />
            <main className="mx-auto w-full max-w-[1500px]">
                <header className="tcc-module-header mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6f50]">
                        Preferences
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#3d3329]">Settings</h1>
                    <p className="mt-1 text-sm text-[#887d70]">Customize the clinic system.</p>
                </header>

                {/* Appearance */}
                <section className="tcc-settings-card rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#302820]">Appearance</h2>
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

                {/* Change Name */}
                <ChangeNameSection onSuccess={setToastMessage} />

                {/* Change Email */}
                <ChangeEmailSection onSuccess={setToastMessage} />

                {/* Change Profile Photo */}
                <ChangeProfilePhotoSection onSuccess={setToastMessage} />

                {/* Change Password */}
                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                            <LockKeyhole size={18} aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#302820]">Change password</h2>
                            <p className="mt-1 text-sm text-[#887d70]">
                                Verify your current password and choose a new one.
                            </p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-medium text-[#514538] sm:col-span-2">
                            Current password
                            <input
                                required
                                type="password"
                                autoComplete="current-password"
                                value={passwordForm.current_password}
                                onChange={(event) =>
                                    setPasswordForm({ ...passwordForm, current_password: event.target.value })
                                }
                                className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10"
                            />
                        </label>
                        <label className="text-sm font-medium text-[#514538]">
                            New password
                            <input
                                required
                                type="password"
                                minLength={8}
                                autoComplete="new-password"
                                value={passwordForm.password}
                                onChange={(event) =>
                                    setPasswordForm({ ...passwordForm, password: event.target.value })
                                }
                                className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10"
                            />
                            <span className="mt-1 block text-xs font-normal text-[#887d70]">
                                At least 8 characters.
                            </span>
                        </label>
                        <label className="text-sm font-medium text-[#514538]">
                            Confirm new password
                            <input
                                required
                                type="password"
                                minLength={8}
                                autoComplete="new-password"
                                aria-invalid={passwordsMismatch}
                                value={passwordForm.password_confirmation}
                                onChange={(event) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        password_confirmation: event.target.value,
                                    })
                                }
                                className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 ${
                                    passwordsMismatch
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-[#e8dfd4] focus:border-[#8a6f50] focus:ring-[#8a6f50]/10"
                                }`}
                            />
                            {passwordsMismatch && (
                                <span role="alert" className="mt-1 block text-xs font-normal text-red-700">
                                    Passwords do not match.
                                </span>
                            )}
                        </label>
                        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#8a6f50] px-4 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-wait disabled:opacity-60"
                            >
                                {changingPassword ? "Updating..." : "Update password"}
                            </button>
                            {passwordFeedback.message && (
                                <p
                                    role="status"
                                    className={`text-sm ${passwordFeedback.error ? "text-red-700" : "text-green-700"}`}
                                >
                                    {passwordFeedback.message}
                                </p>
                            )}
                        </div>
                    </form>
                </section>

                {/* Display & Accessibility */}
                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-[#302820]">Display &amp; accessibility</h2>
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

                {/* Account / Logout */}
                <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#302820]">Account</h2>
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function storedUser(): { name: string; email: string; profile_picture: string | null } {
    try {
        const raw = localStorage.getItem("user");
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore parse errors
    }
    return { name: "", email: "", profile_picture: null };
}

function extractApiError(error: unknown): string {
    const err = error as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
    };
    if (err?.response?.data?.errors) {
        const first = Object.values(err.response.data.errors).flat()[0];
        if (first) return first as string;
    }
    return err?.response?.data?.message || "Something went wrong. Please try again.";
}

// ---------------------------------------------------------------------------
// Change Name
// ---------------------------------------------------------------------------

function ChangeNameSection({ onSuccess }: { onSuccess?: (msg: string) => void }) {
    const [name, setName] = useState(() => storedUser().name);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ message: "", error: false });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        setFeedback({ message: "", error: false });
        try {
            const user = storedUser();
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("email", user.email);
            formData.append("_method", "PUT");
            const response = await api.post("/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const updated = response.data?.user;
            if (updated) {
                localStorage.setItem("user", JSON.stringify(updated));
                setName(updated.name || "");
            }
            const successMsg = "Name updated successfully.";
            setFeedback({
                message: successMsg,
                error: false,
            });
            onSuccess?.(successMsg);
        } catch (error) {
            setFeedback({ message: extractApiError(error), error: true });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                    <UserRound size={18} aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#302820]">Change name</h2>
                    <p className="mt-1 text-sm text-[#887d70]">
                        Update the display name on your clinic account.
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm font-medium text-[#514538]">
                    Full name
                    <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Enter your full name"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10"
                    />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#8a6f50] px-4 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-wait disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save name"}
                    </button>
                    {feedback.message && (
                        <p
                            role="status"
                            className={`text-sm ${feedback.error ? "text-red-700" : "text-green-700"}`}
                        >
                            {feedback.message}
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Change Email
// ---------------------------------------------------------------------------

function ChangeEmailSection({ onSuccess }: { onSuccess?: (msg: string) => void }) {
    const [email, setEmail] = useState(() => storedUser().email);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ message: "", error: false });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        setFeedback({ message: "", error: false });
        try {
            const user = storedUser();
            const formData = new FormData();
            formData.append("name", user.name);
            formData.append("email", email.trim().toLowerCase());
            formData.append("_method", "PUT");
            const response = await api.post("/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const updated = response.data?.user;
            if (updated) {
                localStorage.setItem("user", JSON.stringify(updated));
                setEmail(updated.email || "");
            }
            const successMsg = "Email updated successfully.";
            setFeedback({
                message: successMsg,
                error: false,
            });
            onSuccess?.(successMsg);
        } catch (error) {
            setFeedback({ message: extractApiError(error), error: true });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                    {/* Mail icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#302820]">Change email</h2>
                    <p className="mt-1 text-sm text-[#887d70]">
                        Update the email address associated with your account.
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm font-medium text-[#514538]">
                    Email address
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd4] bg-white px-3 text-sm outline-none focus:border-[#8a6f50] focus:ring-2 focus:ring-[#8a6f50]/10"
                    />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#8a6f50] px-4 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-wait disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save email"}
                    </button>
                    {feedback.message && (
                        <p
                            role="status"
                            className={`text-sm ${feedback.error ? "text-red-700" : "text-green-700"}`}
                        >
                            {feedback.message}
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Change Profile Photo
// ---------------------------------------------------------------------------

function ChangeProfilePhotoSection({ onSuccess }: { onSuccess?: (msg: string) => void }) {
    const [preview, setPreview] = useState<string | null>(() => {
        const pic = storedUser().profile_picture;
        return pic ? resolveImageUrl(pic) : null;
    });
    const [imageError, setImageError] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ message: "", error: false });

    useEffect(() => {
        let mounted = true;
        api.get("/me")
            .then((res) => {
                if (mounted && res.data?.user) {
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    if (!avatarFile && res.data.user.profile_picture) {
                        setPreview(resolveImageUrl(res.data.user.profile_picture));
                        setImageError(false);
                    }
                }
            })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, [avatarFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFeedback({ message: "", error: false });
        if (file.size > 2 * 1024 * 1024) {
            setFeedback({ message: "Image must be less than 2 MB.", error: true });
            e.target.value = "";
            return;
        }
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setFeedback({ message: "Only PNG, JPG, JPEG, and WEBP images are allowed.", error: true });
            e.target.value = "";
            return;
        }
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result as string);
            setImageError(false);
        };
        reader.onerror = () => {
            setAvatarFile(null);
            setFeedback({ message: "Failed to read the selected image.", error: true });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (saving || !avatarFile) return;
        setSaving(true);
        setFeedback({ message: "", error: false });
        try {
            const user = storedUser();
            const formData = new FormData();
            formData.append("name", user.name);
            formData.append("email", user.email);
            formData.append("avatar", avatarFile);
            formData.append("_method", "PUT");
            const response = await api.post("/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const updated = response.data?.user;
            if (updated) {
                localStorage.setItem("user", JSON.stringify(updated));
                if (updated.profile_picture) {
                    setPreview(resolveImageUrl(updated.profile_picture));
                    setImageError(false);
                }
            }
            setAvatarFile(null);
            const input = document.getElementById(
                "settings-profile-image"
            ) as HTMLInputElement | null;
            if (input) input.value = "";
            const successMsg = "Profile photo updated successfully.";
            setFeedback({
                message: successMsg,
                error: false,
            });
            onSuccess?.(successMsg);
        } catch (error) {
            setFeedback({ message: extractApiError(error), error: true });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="tcc-settings-card mt-5 rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdf] text-[#8a6f50]">
                    {/* Camera icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#302820]">Change profile photo</h2>
                    <p className="mt-1 text-sm text-[#887d70]">
                        Upload a new profile picture. PNG, JPG or WEBP, max 2 MB.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
                {/* Avatar preview */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e8dfd4] bg-stone-100">
                    {preview && !imageError ? (
                        <img
                            src={preview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-stone-400"
                            aria-hidden="true"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-3">
                    {/* File chooser */}
                    <label
                        htmlFor="settings-profile-image"
                        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-[#e8dfd4] px-4 py-2.5 text-sm font-semibold text-[#6d5942] transition hover:border-[#8a6f50] hover:bg-[#fcfaf6]"
                    >
                        {/* Upload icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                        </svg>
                        {avatarFile ? avatarFile.name : "Choose photo"}
                    </label>
                    <input
                        id="settings-profile-image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            disabled={saving || !avatarFile}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#8a6f50] px-4 text-sm font-semibold text-white transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Uploading..." : "Save photo"}
                        </button>
                        {feedback.message && (
                            <p
                                role="status"
                                className={`text-sm ${feedback.error ? "text-red-700" : "text-green-700"}`}
                            >
                                {feedback.message}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </section>
    );
}

// ---------------------------------------------------------------------------
// PreferenceSwitch
// ---------------------------------------------------------------------------

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
