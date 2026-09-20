import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import ClinicVisits from "./pages/ClinicVisits";
import Profile from "./pages/Profile";
import Medicine from "./pages/Medicine";
import Reports from "./pages/Reports";
import MainLayout from "./components/layout/MainLayout";

function App() {
    return (
        <BrowserRouter>
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
                            <ComingSoon title="Settings" />
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
        </BrowserRouter>
    );
}


/* =====================================================
   COMING SOON COMPONENT
   ===================================================== */

function ComingSoon({ title }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f9fd] p-6">

            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">

                {/* TCC Icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                    <span className="text-2xl font-bold">
                        TCC
                    </span>

                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-[#0b2c4d]">
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