import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { MessageCircle, RotateCcw, Send, X } from "lucide-react";
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

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
    error?: boolean;
};

export function DashboardAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "ai-greeting",
            role: "assistant",
            text: AI_GREETING,
        },
    ]);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight;
        }
    }, [messages, sending, open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const sendMessage = async (text = input, retrying = false) => {
        const value = (text ?? input).trim();

        if (!value || sending) {
            return;
        }

        const conversation = messages.filter((message) => !message.error);
        const updatedMessages = retrying
            ? conversation
            : [
                  ...conversation,
                  { id: `${Date.now()}-user`, role: "user" as const, text: value },
              ];

        setMessages(updatedMessages);
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

            const response = await api.post(
                "/ai-chat",
                {
                    messages: apiMessages,
                }
            );

            const reply =
                response.data?.message ||
                response.data?.reply ||
                "I couldn't generate a response right now.";

            setMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    text: reply,
                },
            ]);
        } catch (error) {
            console.error(
                "AI chatbot error:",
                error
            );

            let errorMessage =
                "Sorry, I couldn't connect to the AI service right now.";

            if (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setMessages((previous) => [
                ...previous,
                {
                    id: `${Date.now()}-error`,
                    role: "assistant",
                    text: errorMessage,
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

    const clearConversation = () => {
        setMessages([
            { id: "ai-greeting", role: "assistant", text: AI_GREETING },
        ]);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open && (
                <div className="mb-3 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-2xl">


                    <div className="flex items-center justify-between bg-[#8a6f50] px-4 py-3.5">
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                                <MessageCircle size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    TCC AI
                                </p>

                                <p className="text-[11px] text-white/70">
                                    AI Clinic Assistant
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={clearConversation}
                                disabled={sending}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                aria-label="Clear conversation"
                                title="Clear conversation"
                            >
                                <RotateCcw size={16} />
                            </button>
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


                    <div
                        ref={scrollRef}
                        role="log"
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-[#fcfaf6] px-3 py-4"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.role ===
                                    "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                                        message.role ===
                                        "user"
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
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl border border-[#e8dfd4] bg-white px-4 py-3">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]" />

                                    <span
                                        className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]"
                                        style={{
                                            animationDelay:
                                                "120ms",
                                        }}
                                    />

                                    <span
                                        className="h-2 w-2 animate-bounce rounded-full bg-[#8a6f50]"
                                        style={{
                                            animationDelay:
                                                "240ms",
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="border-t border-[#e8dfd4] bg-white px-3 py-2.5">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#a99d8f]">
                            Quick questions
                        </p>

                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {AI_QUICK_REPLIES.map(
                                (reply) => (
                                    <button
                                        key={reply}
                                        type="button"
                                        onClick={() =>
                                            sendMessage(
                                                reply
                                            )
                                        }
                                        disabled={sending}
                                        className="shrink-0 rounded-full border border-[#e8dfd4] bg-[#fcfaf6] px-2.5 py-1.5 text-[11px] font-medium text-[#766959] transition hover:border-[#8a6f50] hover:text-[#8a6f50] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {reply}
                                    </button>
                                )
                            )}
                        </div>
                    </div>


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
                            onChange={(event) =>
                                setInput(
                                    event.target.value
                                )
                            }
                            placeholder="Ask TCC AI..."
                            disabled={sending}
                            className="min-w-0 flex-1 rounded-full border border-[#e8dfd4] bg-[#fcfaf6] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#8a6f50] focus:bg-white focus:ring-2 focus:ring-[#8a6f50]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                            type="submit"
                            disabled={
                                !input.trim() ||
                                sending
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8a6f50] text-white transition hover:bg-[#735a40] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>


                    <div className="border-t border-[#e8dfd4] bg-[#fcfaf6] px-3 py-2">
                        <p className="text-center text-[10px] leading-4 text-[#a99d8f]">
                            TCC AI provides general information
                            and system assistance. It does not
                            replace a healthcare professional.
                        </p>
                    </div>
                </div>
            )}


            <button
                type="button"
                onClick={() =>
                    setOpen((previous) => !previous)
                }
                className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8a6f50] text-white shadow-xl transition hover:scale-105 hover:bg-[#735a40] ${FOCUS_RING}`}
                aria-label={
                    open
                        ? "Close TCC AI chatbot"
                        : "Open TCC AI chatbot"
                }
            >
                {open ? (
                    <X size={22} />
                ) : (
                    <MessageCircle size={22} />
                )}
            </button>
        </div>
    );
}





