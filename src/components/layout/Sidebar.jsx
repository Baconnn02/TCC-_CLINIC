import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Pill,
    FileText,
    UserRoundCog,
    BarChart3,
    Settings,
    Heart,
    X,
} from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Patient",
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
            path: "/medicines",
            icon: Pill,
        },
        {
            name: "Medical Records",
            path: "/medical-records",
            icon: FileText,
        },
        {
            name: "Doctors / Staff",
            path: "/staff",
            icon: UserRoundCog,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
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

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50
                flex w-[264px] flex-col
                bg-gradient-to-b from-[#5f071b] via-[#70091f] to-[#4d0616]
                text-white
                shadow-[8px_0_30px_rgba(80,0,20,0.08)]
                transition-transform duration-300
                lg:translate-x-0
                ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
            `}
        >
            {/* MOBILE CLOSE BUTTON */}
            <div className="flex justify-end px-4 pt-4 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                    aria-label="Close sidebar"
                >
                    <X size={22} />
                </button>
            </div>

            {/* BRAND */}
            <div className="px-5 pb-6 pt-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 p-1">
                        <img
                            src="/tcc-logo.jpg"
                            alt="TCC Logo"
                            className="h-12 w-12 rounded-full object-contain"
                        />
                    </div>

                    <div>
                        <p className="mt-1 text-xs font-medium text-red-100/80">
                            TCC Clinic
                        </p>

                        <p className="mt-1 text-xs font-medium text-red-100/80">
                            Management System
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-5 border-t border-white/10" />

            {/* MENU */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-red-100/55">
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
                                className={`
                                    flex h-12 items-center gap-3
                                    rounded-xl px-3.5
                                    transition
                                    ${
                                        isActive
                                            ? "bg-white text-[#70091f] shadow-sm"
                                            : "text-red-50/85 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        ${
                                            isActive
                                                ? "bg-[#f7e5e8] text-[#800020]"
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

            {/* BOTTOM MESSAGE */}
            <div className="px-4 pb-5">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                            <Heart
                                size={20}
                                fill="currentColor"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-bold">
                                Better Care
                            </p>

                            <p className="mt-0.5 text-xs text-red-100/70">
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