"use client";

import { useState, useEffect, useRef } from "react";
import type { RiderMessage } from "../lib/db";

interface RiderChatProps {
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: "rider" | "customer";
}

export default function RiderChat({ orderId, senderId, senderName, senderRole }: RiderChatProps) {
  const [messages, setMessages] = useState<RiderMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/rider-messages?orderId=${orderId}&riderId=${senderRole === "rider" ? senderId : ""}`);
      if (res.ok) {
        const data = await res.json();
        const newMsgs = data.messages || [];
        setMessages((prev) => {
          const prevIds = new Set(prev.map((m) => m.id));
          const added = newMsgs.filter((m: RiderMessage) => !prevIds.has(m.id));
          if (added.length > 0) {
            const unreadCount = added.filter((m: RiderMessage) => m.senderRole !== senderRole && !m.read).length;
            setUnread((prev) => prev + unreadCount);
          }
          return newMsgs;
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (unread > 0) setUnread(0);
  }, [messages.length]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/rider-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          senderId,
          senderName,
          senderRole,
          message: msg,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      setInput(msg);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-sm text-gray-700">Chat</span>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-lg">💬</span>
        <span className="font-semibold text-sm text-gray-700 flex-1">Chat with {senderRole === "rider" ? "Customer" : "Rider"}</span>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
        )}
      </div>

      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderRole === senderRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMe
                  ? "bg-[#5A432C] text-white rounded-br-md"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
              }`}>
                {!isMe && (
                  <p className="text-[10px] font-semibold text-[#D4A24C] mb-0.5">{msg.senderName}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A24C]/30"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="px-4 py-2.5 bg-[#D4A24C] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#c49540] transition-all"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
