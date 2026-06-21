"use client";

import { useState, useEffect, useRef } from "react";
import type { StoreMessage } from "../lib/db";

interface ChatBoxProps {
  storeId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  storeName: string;
}

export default function ChatBox({ storeId, currentUserId, currentUserName, currentUserRole, storeName }: ChatBoxProps) {
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (open) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [open, storeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#D4A24C] text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center text-2xl">
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: "450px" }}>
          <div className="bg-gradient-to-r from-[#5A432C] to-[#4a3520] p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">{storeName}</p>
              <p className="text-white/60 text-xs">Chat with us</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">👋</span>
                <p className="text-gray-500 text-sm">Send a message to start chatting with {storeName}.</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-[#5A432C] text-white" : "bg-white text-gray-900 border border-gray-100 shadow-sm"}`}>
                    {!isMe && <p className="text-xs font-semibold text-[#D4A24C] mb-0.5">{msg.senderName}</p>}
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:border-[#D4A24C] outline-none"
              />
              <button onClick={send} disabled={sending || !input.trim()} className="w-10 h-10 rounded-xl bg-[#D4A24C] text-white flex items-center justify-center hover:bg-[#c49540] transition disabled:opacity-50">
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
