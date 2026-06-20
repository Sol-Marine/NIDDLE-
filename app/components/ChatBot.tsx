"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const BOT_NAME = "Niddle AI";

const greetings = [
  "Hi there! I'm Niddle AI, your delivery assistant. How can I help you today?",
  "Welcome to Niddle! Ask me anything about our delivery services in Lagos.",
];

function getReply(input: string): string {
  const msg = input.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo)\b/.test(msg)) {
    return "Hello! Welcome to Niddle. I can help you with:\n\n- Pricing & quotes\n- Tracking packages\n- Delivery areas\n- How to send or receive packages\n- Rider info\n- Contact details\n\nWhat would you like to know?";
  }

  // Pricing
  if (/pric(e|ing|es)|cost|how much|quote|afford|cheap|expensive|rate|tariff|charge/.test(msg)) {
    return "Our delivery pricing is based on package size and handling:\n\n📦 Small: ₦2,000\n📦 Medium: ₦3,500\n📦 Large: ₦5,000\n\nExtra handling fees:\n- Fragile: +₦500\n- Perishable: +₦800\n- Valuable: +₦1,000\n- Urgent: +₦1,500\n\nYou can get an exact quote at /pricing or after filling out the send package form. You can also negotiate the price with the rider!";
  }

  // Track / tracking
  if (/track|where.*(package|delivery|order|rid)|status|locat/.test(msg)) {
    return "You can track your package in real-time!\n\n1. Go to /track\n2. Enter your tracking ID (starts with NID-)\n3. View the live timeline and map\n\nIf your package is out for delivery, you'll see the rider's location on the map. You can also confirm delivery from the tracking page.";
  }

  // Send / ship
  if (/send|ship|deliver.*(package|item|food|document)|pick.?up|book/.test(msg)) {
    return "Sending a package is easy!\n\n1. Go to /send-package\n2. Choose your package type & size\n3. Enter sender & recipient details\n4. Pick a rider or let us auto-assign\n5. Review the price & book!\n\nYou'll get a tracking ID (NID-XXXX-XXXX) to follow your delivery in real-time.";
  }

  // Receive
  if (/receive|incoming|someone.*send|expecting/.test(msg)) {
    return "Expecting a package? You can register it!\n\n1. Go to /receive-package\n2. Tell us what you're expecting\n3. Add your delivery preferences\n4. Get a quote and confirm\n\nYou can also check My Alerts to see if someone is sending something to you — just enter your phone number.";
  }

  // Areas / coverage / location / lagos
  if (/area|cover|location|lagos|deliver.*(to|in|where)|where.*deliver|island|mainland|lekki|ikeja|v/i.test(msg)) {
    return "We cover all of Lagos! 🏙️\n\n🏙️ Lagos Island (Victoria Island, Lekki, Ikoyi)\n🏘️ Mainland (Surulere, Yaba, Ikeja)\n🌊 Lekki Peninsula\n✈️ Airport area\n🏭 Industrial areas\n\nWhether you're on the Island or Mainland, we've got you covered with fast bicycle delivery.";
  }

  // How long / time / duration
  if (/how long|time|deliver.*when|duration|fast|speed|same.?day|express/.test(msg)) {
    return "Delivery times depend on the route and traffic:\n\n⚡ Express: 1-2 hours\n🚲 Standard: 2-4 hours\n📅 Flexible: Same-day\n\nLagos traffic can affect timing, so we recommend Express for urgent deliveries. You can pick a time slot when booking.";
  }

  // Rider
  if (/rider|cyclist|bicycle|bike|assign/.test(msg)) {
    return "Our riders are trained professionals! 🚴\n\n- All riders are verified and background-checked\n- You can pick a specific rider or let us auto-assign\n- Each rider has a rating and badge (Top Rider, Fast, Eco)\n- Track your rider in real-time on the map\n\nOur top riders include Chidi O. ⭐4.9, Zainab B. ⭐4.9, Amara K. ⭐4.8, and Femi A. ⭐4.7.";
  }

  // Payment / pay
  if (/pay|payment|cash|card|transfer|wallet|bank/.test(msg)) {
    return "We accept multiple payment methods:\n\n💵 Cash on delivery\n💳 Card payments\n🏦 Bank transfer\n📱 Mobile wallet\n\nYou can view your payment history in your profile under the Payments tab.";
  }

  // Cancel / refund
  if (/cancel|refund|money back|revoke/.test(msg)) {
    return "Need to cancel? Here's how:\n\n- Before pickup: Free cancellation, full refund\n- After pickup: Contact support for assistance\n- After delivery: No refund\n\nFor cancellation, go to your profile → Active Deliveries and cancel the order.";
  }

  // Contact / support / help
  if (/contact|support|help|reach|phone|email|call|complain|issue|problem|wrong/.test(msg)) {
    return "Need to reach us?\n\n📞 Phone: +234 800 NIDDLE\n📧 Email: support@niddle.ng\n📍 Lagos, Nigeria\n\nOr visit our contact page at /contact to send us a message directly.\n\nOur support team is available Monday-Saturday, 8AM-8PM.";
  }

  // Hours
  if (/hour|open|close|when.*open|operat|availab|24|night/.test(msg)) {
    return "We operate:\n\n🕐 Monday - Friday: 8:00 AM - 8:00 PM\n🕐 Saturday: 9:00 AM - 6:00 PM\n🚫 Sunday: Closed\n\nExpress deliveries are available during operating hours.";
  }

  // Negotiate / bargain
  if (/negoti|bargain|offer|deal|lower|reduce|discount/.test(msg)) {
    return "Yes! You can negotiate delivery prices on Niddle! 🤝\n\n1. Book your delivery with the estimated price\n2. Go to /track and find your order\n3. Enter your offer in the price section\n4. The rider can accept or counter-offer\n5. Once both agree, delivery proceeds!\n\nIt's that simple.";
  }

  // Eco / green / environment / bicycle
  if (/eco|green|environment|sustainab|bicycle|carbon|pollut/.test(msg)) {
    return "Niddle is 100% eco-friendly! 🌱\n\n🚲 We use bicycles for all deliveries\n🌍 Zero carbon emissions\n🍃 Supporting a greener Lagos\n💪 Keeping our riders fit and healthy\n\nBy choosing Niddle, you're helping reduce traffic and pollution in Lagos!";
  }

  // Safety / secure
  if (/safe|secur|insur|damag|lost|protect/.test(msg)) {
    return "Your packages are safe with us! 🔒\n\n- All riders are verified and background-checked\n- Real-time GPS tracking on every delivery\n- Proof of delivery with recipient confirmation\n- Package photos and notes at pickup\n- Valuable items get extra care handling\n\nFor valuable packages (₦1,000+ items), we recommend choosing 'Valuable' handling for extra protection.";
  }

  // App / download
  if (/app|download|mobile|phone.*app|android|ios/.test(msg)) {
    return "Niddle is currently available as a web app at niddle.ng — works great on mobile browsers! 📱\n\nYou can:\n- Book deliveries\n- Track packages\n- Chat with riders\n- Manage your profile\n\nA native mobile app is coming soon!";
  }

  // Account / login / register / sign up
  if (/account|login|sign.?in|register|sign.?up|password|profile/.test(msg)) {
    return "Managing your account is easy!\n\n- Sign up at /login with email or Google\n- Access your dashboard at /admin\n- Edit profile at /profile\n- View deliveries, payments, and addresses\n\nGoogle sign-in is the fastest way to get started!";
  }

  // Thanks
  if (/thank|thanks|thx|appreciate|helpful|great|awesome|nice|cool/.test(msg)) {
    return "You're welcome! 😊 I'm always here if you need anything else. Happy delivering with Niddle!";
  }

  // Goodbye
  if (/bye|goodbye|see you|later|exit|quit/.test(msg)) {
    return "Goodbye! 👋 Thanks for chatting with Niddle AI. Have a great day!";
  }

  // Default fallback
  return "I'm not sure I understand that. Here's what I can help with:\n\n- 💰 Pricing & quotes\n- 📦 Sending packages\n- 📥 Receiving packages\n- 🗺️ Delivery areas\n- 🚴 Rider info\n- 📍 Package tracking\n- 💳 Payments\n- 📞 Contact & support\n- 🤝 Price negotiation\n\nTry asking about any of these!";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: greetings[0] },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { role: "user", text };
    const botMsg: Message = { role: "bot", text: getReply(text) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const quickActions = [
    { label: "💰 Pricing", msg: "What are your prices?" },
    { label: "📦 Send", msg: "How do I send a package?" },
    { label: "📍 Track", msg: "How do I track my delivery?" },
    { label: "🗺️ Areas", msg: "Where do you deliver?" },
    { label: "🚴 Riders", msg: "Tell me about your riders" },
    { label: "📞 Contact", msg: "How do I contact support?" },
  ];

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-gray-800 rotate-0"
            : "bg-gradient-to-br from-[#D4A24C] to-[#C2533D] animate-bounce"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-24 right-3 md:right-6 z-50 w-[calc(100vw-24px)] max-w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: "min(520px, calc(100vh - 120px))" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4e] px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">{BOT_NAME}</h3>
              <p className="text-green-400 text-xs">● Online</p>
            </div>
            <span className="text-xs text-gray-400">Powered by Niddle</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#5A432C] text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", text: a.msg },
                      { role: "bot", text: getReply(a.msg) },
                    ]);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#FFF8F0] text-[#5A432C] font-medium border border-[#D4A24C]/20 hover:bg-[#D4A24C]/10 transition"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A24C]/30 transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                  input.trim()
                    ? "bg-[#5A432C] text-white hover:bg-[#4a3520]"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
