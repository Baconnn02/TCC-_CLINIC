import React, { lazy, Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { PageLoadingScreen } from "./components/layout/PageLoading";
import ErrorBoundary from "./components/layout/ErrorBoundary";

// Helper to retry dynamic chunk import on new deployments or transient connection drops
function lazyWithRetry<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>
) {
    return lazy(async () => {
        try {
            return await factory();
        } catch (error: any) {
            const isChunkError =
                error?.message?.includes("Failed to fetch dynamically imported module") ||
                error?.name === "ChunkLoadError";

            if (isChunkError && typeof window !== "undefined") {
                const hasReloaded = sessionStorage.getItem("tcc-chunk-reload-retry");
                if (!hasReloaded) {
                    sessionStorage.setItem("tcc-chunk-reload-retry", "true");
                    window.location.reload();
                    return new Promise<{ default: T }>(() => {});
                }
            }
            throw error;
        }
    });
}

// Code-split / lazy-loaded route pages
const Login = lazyWithRetry(() => import("./pages/Login"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const StudentManagement = lazyWithRetry(() => import("./pages/StudentManagement"));
const ClinicVisits = lazyWithRetry(() => import("./pages/ClinicVisits"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Medicine = lazyWithRetry(() => import("./pages/Medicine"));
const Reports = lazyWithRetry(() => import("./pages/Reports"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));

function App(): React.JSX.Element {
    useLayoutEffect(() => {
        document.documentElement.classList.toggle(
            "tcc-dark",
            localStorage.getItem("tcc-theme") === "dark"
        );
        document.documentElement.classList.toggle(
            "tcc-compact-tables",
            localStorage.getItem("tcc-compact-tables") === "true"
        );
        document.documentElement.classList.toggle(
            "tcc-reduced-motion",
            localStorage.getItem("tcc-reduced-motion") === "true"
        );
    }, []);

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Suspense fallback={<PageLoadingScreen />}>
                    <Routes>
                        {/* Auth & Entry Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Main Application Layout Shell */}
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/students" element={<StudentManagement />} />
                            <Route path="/clinic-visits" element={<ClinicVisits />} />
                            <Route path="/medicine" element={<Medicine />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/profile" element={<Profile />} />

                            {/* Secondary / Under Development Modules */}
                            <Route
                                path="/prescriptions"
                                element={<ComingSoon title="Prescriptions" />}
                            />
                            <Route
                                path="/laboratory"
                                element={<ComingSoon title="Laboratory" />}
                            />
                            <Route
                                path="/medical-records"
                                element={<ComingSoon title="Medical Records" />}
                            />
                            <Route
                                path="/staff"
                                element={<ComingSoon title="Doctors / Staff" />}
                            />
                        </Route>

                        {/* Fallback Catch-all Route */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

function ComingSoon({ title }: { title: string }): React.JSX.Element {
    return (
        <div className="tcc-module-page flex min-h-[70vh] items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-8 text-center shadow-sm dark:border-[#382f25] dark:bg-[#251f19] sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#8a6f50] dark:bg-[#382f25] dark:text-[#d1b89d]">
                    <span className="text-2xl font-bold">TCC</span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#3d3329] dark:text-[#f4ecdf]">
                    {title}
                </h1>

                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                    This module is currently under development.
                </p>

                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                    It will be connected to the TCC Clinic Management System.
                </p>
            </div>
        </div>
    );
}

export default App;
