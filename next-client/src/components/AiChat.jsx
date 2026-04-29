"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "../lib/api";
import { usePlanStore } from "../lib/store";

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Architect Assistant. I can help you with home layouts, design ideas, space optimization, and budget advice. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const { user } = usePlanStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send chat
      const response = await sendChatMessage(userMessage, messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble connecting right now. Please try again later.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-gray-50 flex flex-col">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.1),transparent_55%)]" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur sticky top-0 flex-none">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-300"
              title="Back to Planner"
            >
              ←
            </button>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/40">
              <span className="text-xs font-bold tracking-tight">AI</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">Architect Assistant</h1>
              <p className="text-[10px] text-emerald-400">● Online</p>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-300">
            {user?.email}
          </div>
        </div>
      </header>

      {/* ── Chat Container ── */}
      <main className="flex-1 relative z-10 w-full max-w-4xl mx-auto p-4 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className={`flex items-center gap-2 mb-1 px-1 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {msg.role === "user" ? "You" : "AI Architect"}
                </span>
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20"
                    : msg.isError
                    ? "bg-rose-500/20 border border-rose-500/50 text-rose-200 rounded-tl-none"
                    : "bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur shadow-black/20"
                }`}
              >
                {/* Parse basic markdown (newlines and bold) for simplicity without extra libs */}
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, k) => 
                      part.startsWith("**") && part.endsWith("**") 
                        ? <strong key={k} className="text-white font-semibold">{part.slice(2, -2)}</strong> 
                        : part
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Architect</span>
              </div>
              <div className="px-4 py-4 rounded-2xl bg-slate-800/80 border border-white/5 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="mt-4 pt-4 border-t border-white/10 bg-slate-900/50">
          <form
            onSubmit={handleSend}
            className="relative flex items-end gap-2"
          >
            <textarea
              className="flex-1 w-full bg-slate-800/80 border border-white/10 rounded-2xl py-3 px-4 pl-4 pr-14 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none overflow-hidden min-h-[50px] max-h-[150px]"
              placeholder="Ask about layouts, room sizes, vastu, budget..."
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Recommend a layout for 2BHK in 1000 sqft",
              "How to improve natural light?",
              "Tips to reduce construction budget"
            ].map(suggestion => (
              <button 
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
