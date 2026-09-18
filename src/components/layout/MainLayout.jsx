import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f8fb]">
            {/* MOBILE HEADER */}
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center bg-white px-4 shadow-sm lg:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#70091f] hover:bg-gray-100"
                    aria-label="Toggle menu"
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
                        <p className="text-sm font-bold text-[#70091f]">
                            TCC Clinic
                        </p>
                        <p className="text-[10px] text-gray-500">
                            Management System
                        </p>
                    </div>
                </div>
            </header>

            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            {/* SIDEBAR */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* MAIN CONTENT */}
            <main className="min-h-screen w-full pt-16 lg:ml-[264px] lg:w-[calc(100%-264px)] lg:pt-0">
                <div className="w-full max-w-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;