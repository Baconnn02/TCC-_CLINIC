import { lazy, Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StudentManagement = lazy(() => import("./pages/StudentManagement"));
const ClinicVisits = lazy(() => import("./pages/ClinicVisits"));
const Profile = lazy(() => import("./pages/Profile"));
const Medicine = lazy(() => import("./pages/Medicine"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
    useLayoutEffect(() => {
        document.documentElement.classList.toggle(
            "tcc-dark",
            localStorage.getItem("tcc-theme") !== "light"
        );
    }, []);

    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
                <Routes>

                {/* ========================================
                    LOGIN
                ======================================== */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* ========================================
                    DEFAULT ROUTE
                    Redirect "/" to Login
                ======================================== */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* ========================================
                    DASHBOARD
                ======================================== */}
                <Route
                    path="/dashboard"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    STUDENT MANAGEMENT
                ======================================== */}
                <Route
                    path="/students"
                    element={
                        <MainLayout>
                            <StudentManagement />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    CLINIC VISITS
                ======================================== */}
                <Route
                    path="/clinic-visits"
                    element={
                        <MainLayout>
                            <ClinicVisits />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    PROFILE
                ======================================== */}
                <Route
                    path="/profile"
                    element={
                        <MainLayout>
                            <Profile />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    MEDICINE
                ======================================== */}
                <Route
                    path="/medicine"
                    element={
                        <MainLayout>
                            <Medicine />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    PRESCRIPTIONS
                ======================================== */}
                <Route
                    path="/prescriptions"
                    element={
                        <MainLayout>
                            <ComingSoon title="Prescriptions" />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    LABORATORY
                ======================================== */}
                <Route
                    path="/laboratory"
                    element={
                        <MainLayout>
                            <ComingSoon title="Laboratory" />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    MEDICAL RECORDS
                ======================================== */}
                <Route
                    path="/medical-records"
                    element={
                        <MainLayout>
                            <ComingSoon title="Medical Records" />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    DOCTORS / STAFF
                ======================================== */}
                <Route
                    path="/staff"
                    element={
                        <MainLayout>
                            <ComingSoon title="Doctors / Staff" />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    REPORTS
                ======================================== */}
                <Route
                    path="/reports"
                    element={
                        <MainLayout>
                            <Reports />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    SETTINGS
                ======================================== */}
                <Route
                    path="/settings"
                    element={
                        <MainLayout>
                            <Settings />
                        </MainLayout>
                    }
                />

                {/* ========================================
                    UNKNOWN URL
                    ======================================== */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

function PageLoading() {
    return (
        <main
            className="tcc-module-page flex min-h-screen items-center justify-center"
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-3 text-sm font-medium text-[#8a736e]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#f0ded9] border-t-[#8b1505]" />
                Loading page…
            </div>
        </main>
    );
}


/* =====================================================
   COMING SOON COMPONENT
   ===================================================== */

function ComingSoon({ title }) {
    return (
        <div className="tcc-module-page flex min-h-screen items-center justify-center p-6">

            <div className="w-full max-w-md rounded-2xl border border-[#f0ded9] bg-white p-8 text-center shadow-sm sm:p-10">

                {/* TCC Icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fcebe7] text-[#8b1505]">

                    <span className="text-2xl font-bold">
                        TCC
                    </span>

                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold tracking-tight text-[#64101e]">
                    {title}
                </h1>

                {/* Description */}
                <p className="mt-3 text-sm text-slate-500">
                    This module is currently under development.
                </p>

                {/* Additional information */}
                <p className="mt-1 text-xs text-slate-400">
                    It will be connected to the TCC Clinic Management System.
                </p>

            </div>

        </div>
    );
}


/* =====================================================
   EXPORT APP
   ===================================================== */

export default App;
