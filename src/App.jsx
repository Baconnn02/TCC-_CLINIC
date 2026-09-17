import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import ClinicVisits from "./pages/ClinicVisits";
import Profile from "./pages/Profile";
import Medicine from "./pages/Medicine";

import MainLayout from "./components/layout/MainLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />

                <Route
                    path="/students"
                    element={
                        <MainLayout>
                            <StudentManagement />
                        </MainLayout>
                    }
                />

                <Route
                    path="/clinic-visits"
                    element={
                        <MainLayout>
                            <ClinicVisits />
                        </MainLayout>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <MainLayout>
                            <Profile />
                        </MainLayout>
                    }
                />

                <Route
                    path="/medicines"
                    element={
                        <MainLayout>
                            <Medicine />
                        </MainLayout>
                    }
                />

                <Route
                    path="/prescriptions"
                    element={
                        <MainLayout>
                            <ComingSoon title="Prescriptions" />
                        </MainLayout>
                    }
                />

                <Route
                    path="/laboratory"
                    element={
                        <MainLayout>
                            <ComingSoon title="Laboratory" />
                        </MainLayout>
                    }
                />

                <Route
                    path="/medical-records"
                    element={
                        <MainLayout>
                            <ComingSoon title="Medical Records" />
                        </MainLayout>
                    }
                />

                <Route
                    path="/staff"
                    element={
                        <MainLayout>
                            <ComingSoon title="Doctors / Staff" />
                        </MainLayout>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <MainLayout>
                            <ComingSoon title="Reports" />
                        </MainLayout>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <MainLayout>
                            <ComingSoon title="Settings" />
                        </MainLayout>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

function ComingSoon({ title }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f9fd] p-6">
            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="text-2xl font-bold">
                        TCC
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-[#0b2c4d]">
                    {title}
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                    This module is currently under development.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    It will be connected to the TCC Clinic Management System.
                </p>
            </div>
        </div>
    );
}

export default App;