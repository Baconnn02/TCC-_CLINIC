import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);

        const msg = String(error?.message || "").toLowerCase();
        const isChunkError =
            msg.includes("dynamically imported module") ||
            msg.includes("failed to fetch") ||
            msg.includes("importing a module script failed") ||
            error?.name === "ChunkLoadError";

        if (isChunkError && typeof window !== "undefined") {
            const lastReload = Number(sessionStorage.getItem("tcc-eb-reload-ts") || "0");
            const now = Date.now();
            if (now - lastReload > 8000) {
                sessionStorage.setItem("tcc-eb-reload-ts", String(now));
                sessionStorage.removeItem("tcc-chunk-reload-ts");
                sessionStorage.removeItem("tcc-chunk-reload-retry");
                sessionStorage.removeItem("tcc-chunk-reload-occurred");
                window.location.reload();
            }
        }
    }

    private handleReload = () => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("tcc-eb-reload-ts");
            sessionStorage.removeItem("tcc-chunk-reload-ts");
            sessionStorage.removeItem("tcc-chunk-reload-retry");
            sessionStorage.removeItem("tcc-chunk-reload-occurred");
            window.location.reload();
        }
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("tcc-eb-reload-ts");
            sessionStorage.removeItem("tcc-chunk-reload-ts");
            sessionStorage.removeItem("tcc-chunk-reload-retry");
            sessionStorage.removeItem("tcc-chunk-reload-occurred");
            window.location.href = "/dashboard";
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
                    <div className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-7 text-center shadow-sm dark:border-[#382f25] dark:bg-[#251f19]">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-[#8a6f50] dark:bg-amber-950/40 dark:text-[#d1b89d]">
                            <AlertCircle size={28} />
                        </div>

                        <h2 className="text-xl font-bold tracking-tight text-[#3d3329] dark:text-[#f4ecdf]">
                            Something went wrong
                        </h2>

                        <p className="mt-2 text-sm text-[#887d70] dark:text-stone-400">
                            The requested module could not be displayed properly. This may be due to a temporary connection issue or a system update.
                        </p>

                        {this.state.error?.message && (
                            <details className="mt-4 text-left text-xs text-[#a99d8f] dark:text-stone-500">
                                <summary className="cursor-pointer hover:underline text-center">
                                    Show Technical Details
                                </summary>
                                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-[#fcfaf6] p-2 font-mono text-[11px] text-red-600 dark:bg-[#1a1612] dark:text-red-400">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8a6f50] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#775f44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]"
                            >
                                <RotateCcw size={16} />
                                Reload Page
                            </button>

                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-4 py-2.5 text-sm font-semibold text-[#5a4d3f] transition hover:bg-[#f3ebd9] dark:border-[#382f25] dark:bg-[#1a1612] dark:text-stone-300 dark:hover:bg-[#2a241e]"
                            >
                                <Home size={16} />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

