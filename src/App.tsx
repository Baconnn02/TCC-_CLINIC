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
        <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
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
                    path="/medicine"
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
                            <Reports />
                        </MainLayout>
                    }
                />




                <Route
                    path="/settings"
                    element={
                        <MainLayout>
                            <Settings />
                        </MainLayout>
                    }
                />




                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

// Preload common pages in the background after initial mount for instant transitions
if (typeof window !== "undefined") {
    setTimeout(() => {
        import("./pages/Dashboard");
        import("./pages/ClinicVisits");
        import("./pages/StudentManagement");
        import("./pages/Medicine");
        import("./pages/Reports");
    }, 100);
}

function PageLoading() {
    return null;
}






function ComingSoon({ title }) {
    return (
        <div className="tcc-module-page flex min-h-screen items-center justify-center p-6">

            <div className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-8 text-center shadow-sm sm:p-10">


                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#8a6f50]">

                    <span className="text-2xl font-bold">
                        TCC
                    </span>

                </div>


                <h1 className="text-2xl font-bold tracking-tight text-[#3d3329]">
                    {title}
                </h1>


                <p className="mt-3 text-sm text-stone-500">
                    This module is currently under development.
                </p>


                <p className="mt-1 text-xs text-stone-400">
                    It will be connected to the TCC Clinic Management System.
                </p>

            </div>

        </div>
    );
}






export default App;
