import React from "react";

/**
 * Fullscreen loading screen used on initial application boot or auth routes.
 */
export function PageLoadingScreen(): React.JSX.Element {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f7f2eb] px-6 text-stone-700 transition-colors dark:bg-[#1a1612] dark:text-stone-200"
        >
            <div className="flex flex-col items-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#e8dfd4] bg-white p-2 shadow-sm dark:border-[#382f25] dark:bg-[#251f19]">
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Logo"
                        className="h-16 w-16 animate-pulse rounded-full object-contain"
                    />
                    <div className="absolute -inset-1 rounded-2xl border border-[#8a6f50]/20 animate-ping opacity-30" />
                </div>

                <h1 className="text-lg font-bold tracking-tight text-[#3d3329] dark:text-[#f4ecdf]">
                    TCC Clinic Management System
                </h1>
                <p className="mt-1 text-xs text-[#887d70] dark:text-stone-400">
                    Loading module, please wait...
                </p>

                {/* Animated loading bar */}
                <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[#e8dfd4] dark:bg-[#382f25]">
                    <div className="h-full w-24 rounded-full bg-[#8a6f50] animate-[shimmer_1.4s_infinite_ease-in-out]" />
                </div>
            </div>
            <span className="sr-only">Loading page...</span>
        </div>
    );
}

/**
 * In-layout skeleton loader for smooth transitions between main menu pages.
 * Preserves the sidebar and shell without blank screen flashes.
 */
export function PageLoadingContent(): React.JSX.Element {
    return (
        <div
            role="status"
            aria-live="polite"
            className="min-h-[calc(100vh-64px)] w-full p-4 sm:p-6 lg:p-8 animate-pulse space-y-6"
        >
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e8dfd4] dark:border-[#382f25]">
                <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-[#e8dfd4]/70 dark:bg-[#382f25]" />
                    <div className="h-7 w-56 rounded-lg bg-[#dfd4c5] dark:bg-[#42372c]" />
                    <div className="h-3.5 w-72 rounded bg-[#e8dfd4]/60 dark:bg-[#382f25]/70" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-28 rounded-xl bg-[#e8dfd4]/80 dark:bg-[#382f25]" />
                    <div className="h-10 w-32 rounded-xl bg-[#8a6f50]/40 dark:bg-[#8a6f50]/30" />
                </div>
            </div>

            {/* Metric cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-[#e8dfd4] bg-white/70 p-5 shadow-sm dark:border-[#382f25] dark:bg-[#251f19]/70"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-20 rounded bg-[#e8dfd4] dark:bg-[#382f25]" />
                            <div className="h-8 w-8 rounded-xl bg-[#e8dfd4]/80 dark:bg-[#382f25]" />
                        </div>
                        <div className="mt-4 h-7 w-16 rounded-lg bg-[#dfd4c5] dark:bg-[#42372c]" />
                        <div className="mt-2 h-3 w-24 rounded bg-[#e8dfd4]/60 dark:bg-[#382f25]/60" />
                    </div>
                ))}
            </div>

            {/* Main content table / card skeleton */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-sm dark:border-[#382f25] dark:bg-[#251f19]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e8dfd4]/60 dark:border-[#382f25]/60">
                    <div className="h-5 w-40 rounded bg-[#dfd4c5] dark:bg-[#42372c]" />
                    <div className="h-9 w-64 rounded-xl bg-[#e8dfd4]/70 dark:bg-[#382f25]" />
                </div>

                <div className="mt-5 space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 py-3 border-b border-[#e8dfd4]/40 dark:border-[#382f25]/40 last:border-none"
                        >
                            <div className="h-9 w-9 shrink-0 rounded-full bg-[#e8dfd4] dark:bg-[#382f25]" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-1/3 rounded bg-[#e8dfd4] dark:bg-[#382f25]" />
                                <div className="h-3 w-1/4 rounded bg-[#e8dfd4]/60 dark:bg-[#382f25]/60" />
                            </div>
                            <div className="hidden sm:block h-6 w-20 rounded-full bg-[#e8dfd4]/70 dark:bg-[#382f25]" />
                            <div className="h-8 w-16 rounded-lg bg-[#e8dfd4]/80 dark:bg-[#382f25]" />
                        </div>
                    ))}
                </div>
            </div>

            <span className="sr-only">Loading page content...</span>
        </div>
    );
}

export default PageLoadingScreen;

