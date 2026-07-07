"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, ArrowUp } from "lucide-react";

type Role = "user" | "assistant";
type Message = { role: Role; text: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text },
      // UI-only for now — no model wired up yet.
      {
        role: "assistant",
        text: "Not connected to a model yet — this is just the chat UI. Once a model is wired up, I'll answer from your cards and spending here.",
      },
    ]);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
        className="grain fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-md bg-panel text-white shadow-lg ring-1 ring-white/10 transition-transform hover:scale-105"
      >
        <Sparkles className="h-5 w-5 text-accent" />
      </button>
    );
  }

  return (
    <div className="panel-gradient grain fixed bottom-6 right-6 z-50 flex h-[30rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-md text-white shadow-2xl ring-1 ring-white/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-mono text-[0.7rem] uppercase tracking-wider">
            Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="rounded-md p-1 text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <Sparkles className="mb-3 h-6 w-6 text-accent" />
            <p className="text-sm text-white/60">
              Ask about your cards, spending, or which card to use for a purchase.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-lg bg-accent px-3 py-2 text-sm text-ink"
                    : "max-w-[85%] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90"
                }
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something…"
          className="min-w-0 flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-ink transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
