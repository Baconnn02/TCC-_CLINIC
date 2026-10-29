import React from "react";
import api from "../../services/api";
import { invalidateRecordCache } from "../../services/recordCache";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Pill,
    BarChart3,
    Network,
    Settings,
    LogOut,
    Heart,
    X,
} from "lucide-react";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const routePrefetchers: Record<string, () => void> = {
    "/dashboard": () => { import("../../pages/Dashboard"); },
    "/students": () => { import("../../pages/StudentManagement"); },
    "/clinic-visits": () => { import("../../pages/ClinicVisits"); },
    "/medicine": () => { import("../../pages/Medicine"); },
    "/reports": () => { import("../../pages/Reports"); },
    "/organization": () => { import("../../pages/Organization"); },
    "/settings": () => { import("../../pages/Settings"); },
};

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps): React.JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }

        try {
            api.post("/logout", {}, { timeout: 3000 }).catch((logoutError) => {
                console.error("Logout error:", logoutError);
            });
        } catch {
            // ignore
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tcc-dashboard-cache");
        try {
            invalidateRecordCache();
        } catch {
            // ignore
        }

        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Patients",
            path: "/students",
            icon: Users,
        },
        {
            name: "Clinic Visits",
            path: "/clinic-visits",
            icon: Stethoscope,
        },
        {
            name: "Medicines",
            path: "/medicine",
            icon: Pill,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Organization",
            path: "/organization",
            icon: Network,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings,
        },
    ];

    const handleNavigation = () => {
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    const handlePrefetch = (path: string) => {
        try {
            routePrefetchers[path]?.();
        } catch {
            // ignore
        }
    };

    return (
        <aside
            id="primary-navigation"
            className={`
                tcc-sidebar
                ${sidebarOpen ? "is-open" : ""}
                fixed inset-y-0 left-0 z-50
                flex w-[264px] flex-col
                bg-gradient-to-b from-[#5c0819] via-[#480613] to-[#2e030c]
                text-white
                shadow-[8px_0_30px_rgba(0,0,0,0.35)]
                transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                lg:translate-x-0
                ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
            `}
        >
            <div className="flex justify-end px-4 pt-4 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition duration-200 hover:rotate-90 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fcebe7]"
                    aria-label="Close sidebar"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="px-5 pb-6 pt-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 p-1">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-12 w-12 rounded-full object-contain transition-transform duration-300 hover:rotate-6 hover:scale-105"
                        />
                    </div>

                    <div>
                        <p className="text-l font-bold text-[#fcebe7]">
                            TCC Clinic
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#fcebe7]/75">
                            Management System
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-5 border-t border-white/10" />

            <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-4 py-6">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fcebe7]/60">
                    Main Menu
                </p>

                <div className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            location.pathname === item.path ||
                            location.pathname.startsWith(
                                `${item.path}/`
                            );

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavigation}
                                onMouseEnter={() => handlePrefetch(item.path)}
                                onFocus={() => handlePrefetch(item.path)}
                                aria-current={isActive ? "page" : undefined}
                                title={item.name}
                                className={`
                                    group flex h-12 items-center gap-3
                                    rounded-xl px-3.5
                                    transition-[transform,background-color,color,box-shadow] duration-200 ease-out
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fcebe7]
                                    ${
                                        isActive
                                            ? "bg-[#70091f] text-white shadow-md ring-1 ring-white/20"
                                            : "text-[#fcebe7]/80 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-lg transition-transform duration-200 group-hover:scale-105
                                        ${
                                            isActive
                                                ? "bg-[#8b1505] text-white shadow-sm"
                                                : ""
                                        }
                                    `}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={
                                            isActive ? 2.5 : 2
                                        }
                                    />
                                </div>

                                <span className="text-[14px] font-medium">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="px-4 pb-5 space-y-3">
                {/* Log Out Button */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex h-11 w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3.5 text-left text-[#fcebe7]/90 transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/20 hover:text-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-[0.98]"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-900/40 text-red-300 transition-all duration-200 group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white">
                        <LogOut size={16} strokeWidth={2.2} />
                    </div>

                    <span className="text-sm font-semibold tracking-tight">
                        Log Out
                    </span>
                </button>

                {/* Better Care Banner */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-[#fcebe7]">
                            <Heart size={18} fill="currentColor" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                                Better Care
                            </p>

                            <p className="text-[11px] text-[#fcebe7]/70 truncate">
                                Better Records, Better Monitoring
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
