import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle(
            "tcc-dark",
            localStorage.getItem("tcc-theme") === "dark"
        );
    }, []);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-[#f7f2eb]">

            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-[#e8dfd4] bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8a6f50] transition duration-200 hover:scale-105 hover:bg-stone-100 active:scale-95"
                    aria-label="Toggle menu"
                    aria-controls="primary-navigation"
                    aria-expanded={sidebarOpen}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="ml-3 flex items-center gap-2">
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Logo"
                        className="h-9 w-9 rounded-full object-contain"
                    />

                    <div className="leading-tight">
                        <p className="text-sm font-bold text-[#8a6f50]">
                            TCC Clinic
                        </p>
                        <p className="text-[10px] text-stone-500">
                            Management System
                        </p>
                    </div>
                </div>
            </header>


            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                    className="tcc-sidebar-overlay fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
                />
            )}


            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />


            <main className="min-h-screen w-full pt-16 lg:ml-[264px] lg:w-[calc(100%-264px)] lg:pt-0">
                <div className="w-full max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;
