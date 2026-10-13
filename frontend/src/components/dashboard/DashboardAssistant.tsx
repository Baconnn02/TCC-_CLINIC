import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
    ArrowLeft,
    Clock,
    History,
    MessageCircle,
    MessageSquare,
    Plus,
    RotateCcw,
    Send,
    Trash2,
    X,
} from "lucide-react";
import api from "../../services/api";

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40";

const AI_QUICK_REPLIES = [
    "How many clinic visits were recorded this month?",
    "How many medicines are low or out of stock?",
    "How do I record a clinic visit?",
    "What can you help me with?",
];

const AI_GREETING =
    "Hello! I can help with clinic workflows and aggregate dashboard counts, plus general health education. I can’t view individual patient records or provide a diagnosis. What would you like help with?";

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp?: number;
    error?: boolean;
};

export type ChatSession = {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: ChatMessage[];
};

const STORAGE_KEY = "tcc-ai-chat-sessions-v1";

function createNewSession(): ChatSession {
    const now = Date.now();
    return {
        id: `session-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: "New Conversation",
        createdAt: now,
        updatedAt: now,
        messages: [
            {
                id: `ai-greeting-${now}`,
                role: "assistant",
                text: AI_GREETING,
                timestamp: now,
            },
        ],
    };
}

function loadSavedSessions(): ChatSession[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // ignore parse error
    }
    return [createNewSession()];
}

function formatSessionTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(timestamp?: number): string {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function DashboardAssistant() {
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"chat" | "history">("chat");
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const [sessions, setSessions] = useState<ChatSession[]>(() => loadSavedSessions());
    const [activeSessionId, setActiveSessionId] = useState<string>(() => {
        const initial = loadSavedSessions();
        return initial[0]?.id || "";
    });

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Save sessions to localStorage whenever modified
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } catch {
            // ignore storage quota error
        }
    }, [sessions]);

    // Active session and its messages
    const activeSession =
        sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession();
    const messages = activeSession.messages;

    useEffect(() => {
        if (scrollRef.current && viewMode === "chat") {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending, open, viewMode]);

    useEffect(() => {
        if (open && viewMode === "chat") {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open, viewMode]);

    const updateActiveMessages = (
        updater: (previousMessages: ChatMessage[]) => ChatMessage[],
        suggestedTitle?: string
    ) => {
        setSessions((previousSessions) =>
            previousSessions.map((session) => {
                if (session.id !== activeSession.id) return session;

                const newMessages = updater(session.messages);
                let newTitle = session.title;

                if (suggestedTitle && (session.title === "New Conversation" || !session.title)) {
                    newTitle =
                        suggestedTitle.length > 32
                            ? `${suggestedTitle.slice(0, 32)}...`
                            : suggestedTitle;
                }

                return {
                    ...session,
                    title: newTitle,
                    updatedAt: Date.now(),
                    messages: newMessages,
                };
            })
        );
    };

    const sendMessage = async (text = input, retrying = false) => {
        const value = (text ?? input).trim();

        if (!value || sending) {
            return;
        }

        const now = Date.now();
        const conversation = messages.filter((message) => !message.error);
        const updatedMessages: ChatMessage[] = retrying
            ? conversation
            : [
                  ...conversation,
                  {
                      id: `${now}-user`,
                      role: "user" as const,
                      text: value,
                      timestamp: now,
                  },
              ];

        updateActiveMessages(() => updatedMessages, value);
        setInput("");
        setSending(true);

        try {
            const apiMessages = updatedMessages
                .filter(
                    (message) =>
                        message.role === "user" || message.role === "assistant"
                )
                .slice(-12)
                .map((message) => ({
                    role:
                        message.role === "assistant"
                            ? "model"
                            : "user",
                    content: message.text,
                }));

            const response = await api.post("/ai-chat", {
                messages: apiMessages,
            });

            const reply =
                response.data?.message ||
                response.data?.reply ||
                "I couldn't generate a response right now.";

            updateActiveMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    text: reply,
                    timestamp: Date.now(),
                },
            ]);
        } catch (error) {
            console.error("AI chatbot error:", error);

            let errorMessage = "Sorry, I couldn't connect to the AI service right now.";

            if (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            updateActiveMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-error`,
                    role: "assistant",
                    text: errorMessage,
                    timestamp: Date.now(),
                    error: true,
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const retryLastMessage = () => {
        const lastUserMessage = [...messages]
            .reverse()
            .find((message) => message.role === "user");

        if (lastUserMessage) {
            void sendMessage(lastUserMessage.text, true);
        }
    };

    const startNewChat = () => {
        const fresh = createNewSession();
        setSessions((previous) => [fresh, ...previous]);
        setActiveSessionId(fresh.id);
        setViewMode("chat");
        setInput("");
    };

    const deleteSession = (sessionId: string, event?: React.MouseEvent) => {
        event?.stopPropagation();

        setSessions((previous) => {
            const filtered = previous.filter((s) => s.id !== sessionId);
            if (filtered.length === 0) {
                const fresh = createNewSession();
                setActiveSessionId(fresh.id);
                return [fresh];
            }

            if (activeSessionId === sessionId) {
                setActiveSessionId(filtered[0].id);
            }

            return filtered;
        });
    };

    const clearAllHistory = () => {
        const fresh = createNewSession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
        setViewMode("chat");
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open && (
                <div className="mb-3 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-[#8a6f50] px-4 py-3.5 text-white">
                        {viewMode === "history" ? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("chat")}
                                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
                                    aria-label="Back to chat"
                                    title="Back to chat"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <p className="text-sm font-bold">Chat History</p>
                                    <p className="text-[11px] text-white/70">
                                        {sessions.length} conversation{sessions.length === 1 ? "" : "s"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                                    <MessageCircle size={19} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold">TCC AI</p>
                                    <p className="truncate text-[11px] text-white/70">
                                        {activeSession.title || "AI Clinic Assistant"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            {viewMode === "chat" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={startNewChat}
                                        disabled={sending}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                        aria-label="New chat"
                                        title="New chat"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("history")}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                                        aria-label="View history"
                                        title="Chat history"
                                    >
                                        <History size={17} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={startNewChat}
                                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30"
                                    title="Start a new chat"
                                >
                                    <Plus size={14} /> New
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                                aria-label="Close AI chatbot"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* View: History List */}
                    {viewMode === "history" ? (
                        <div className="flex flex-1 flex-col overflow-hidden bg-[#fcfaf6]">
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {sessions.map((session) => {
                                    const isCurrent = session.id === activeSession.id;
                                    const messageCount = session.messages.filter(
                                        (m) => m.role === "user"
                                    ).length;

                                    return (
                                        <div
                                            key={session.id}
                                            onClick={() => {
                                                setActiveSessionId(session.id);
                                                setViewMode("chat");
                                            }}
                                            className={`group flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 transition ${
                                                isCurrent
                                                    ? "border-[#8a6f50] bg-white shadow-sm ring-1 ring-[#8a6f50]/20"
                                                    : "border-[#e8dfd4] bg-white/80 hover:border-[#8a6f50]/50 hover:bg-white"
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                                                <div
                                                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                                        isCurrent
                                                            ? "bg-[#8a6f50] text-white"
                                                            : "bg-[#f3ebdf] text-[#8a6f50]"
                                                    }`}
                                                >
                                                    <MessageSquare size={14} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-[#302820]">
                                                        {session.title || "Conversation"}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#a99d8f]">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {formatSessionTime(session.updatedAt)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {messageCount} question
                                                            {messageCount === 1 ? "" : "s"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => deleteSession(session.id, e)}
                                                className="shrink-0 p-1 text-[#a99d8f] opacity-60 transition hover:text-red-600 group-hover:opacity-100"
                                                title="Delete chat"
                                                aria-label="Delete chat"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Clear All Footer */}
                            <div className="border-t border-[#e8dfd4] bg-white p-3">
                                <button
                                    type="button"
                                    onClick={clearAllHistory}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                    <Trash2 size={13} /> Clear all history
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View: Chat Messages */
                        <>
                            <div
                                ref={scrollRef}
                                role="log"
                                aria-live="polite"
                                className="flex-1 space-y-3 overflow-y-auto bg-[#fcfaf6] px-3 py-4"
                            >
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex flex-col ${
                                            message.role === "user" ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                                                message.role === "user"
                                                    ? "bg-[#8a6f50] text-white"
                                                    : message.error
                                                    ? "border border-[#fecaca] bg-[#fdeeea] text-red-700"
                                                    : "border border-[#e8dfd4] bg-white text-[#302820]"
                                            }`}
                                        >
                                            {message.text}
                                            {message.error && (
                                                <button
                                                    type="button"
                                                    onClick={retryLastMessage}
                                                    disabled={sending}
                                                    className="mt-2 flex items-center gap-1 font-semibold underline underline-offset-2 disabled:opacity-50"
                                                >
                                                    <RotateCcw size={13} /> Try again
                                                </button>
                                            )}
                                        </div>
                                        {message.timestamp && (
                                            <span className="mt-1 px-1 text-[9px] text-[#a99d8f]">
                                                {formatMessageTime(message.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {sending && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-1 rounded-2xl border border-[#e8dfd4] bg-white px-4 py-3">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]" />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]"
                                                style={{ animationDelay: "120ms" }}
                                            />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]"
                                                style={{ animationDelay: "240ms" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Questions */}
                            <div className="border-t border-[#e8dfd4] bg-white px-3 py-2.5">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#a99d8f]">
                                    Quick questions
                                </p>
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {AI_QUICK_REPLIES.map((reply) => (
                                        <button
                                            key={reply}
                                            type="button"
                                            onClick={() => sendMessage(reply)}
                                            disabled={sending}
                                            className="shrink-0 rounded-full border border-[#e8dfd4] bg-[#fcfaf6] px-2.5 py-1.5 text-[11px] font-medium text-[#766959] transition hover:border-[#8a6f50] hover:text-[#8a6f50] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input form */}
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendMessage();
                                }}
                                className="flex items-center gap-2 border-t border-[#e8dfd4] bg-white p-2.5"
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Ask TCC AI..."
                                    disabled={sending}
                                    className="min-w-0 flex-1 rounded-full border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-2 focus:ring-[#8a6f50]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || sending}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8a6f50] text-white transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Send message"
                                >
                                    <Send size={16} />
                                </button>
                            </form>

                            {/* Disclaimer */}
                            <div className="border-t border-[#e8dfd4] bg-[#fcfaf6] px-3 py-2">
                                <p className="text-center text-[10px] leading-4 text-[#a99d8f]">
                                    TCC AI provides general information and system assistance. It
                                    does not replace a healthcare professional.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8a6f50] text-white shadow-xl transition hover:scale-105 hover:bg-[#735a40] ${FOCUS_RING}`}
                aria-label={open ? "Close TCC AI chatbot" : "Open TCC AI chatbot"}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </div>
    );
}
