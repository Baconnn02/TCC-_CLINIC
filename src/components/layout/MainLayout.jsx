import Sidebar from "./Sidebar";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#f7f8fb]">
            <Sidebar />

            <main className="ml-[264px] min-h-screen w-[calc(100%-264px)]">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
