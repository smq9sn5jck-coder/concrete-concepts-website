/*
  Floating AI Chat Widget — appears on all pages
  Uses the AIChatBox component with the chat.send tRPC mutation
  Positioned bottom-right with a toggle button
*/
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, Message } from "./AIChatBox";
import { trackPhoneCallClick } from "@/components/ConversionTracking";

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "G'day! 👋 I'm the Concrete Concepts assistant. I can help with:\n\n- **Pricing estimates** for driveways, slabs, patios & more\n- **Service information** and what finish is best for you\n- **General concreting questions** about Brisbane projects\n\nHow can I help you today?",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.chat.send.useMutation();

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        // Send only user/assistant messages (not the initial greeting which is local)
        const chatHistory = updatedMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10) // Keep last 10 messages for context
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const result = await chatMutation.mutateAsync({ messages: chatHistory });
        const replyText = typeof result.reply === "string" ? result.reply : String(result.reply);
        const assistantMsg: Message = { role: "assistant", content: replyText };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: Message = {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. For immediate help, call us on **0424 463 268** or visit our [quote page](/get-quote).",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, chatMutation]
  );

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-brand-charcoal px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Concrete Concepts Assistant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:0424463268"
                  onClick={() => trackPhoneCallClick()}
                  className="text-gray-400 hover:text-brand-yellow transition-colors"
                  title="Call us"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask about pricing, services, or your project..."
              height={420}
              className="rounded-none border-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-brand-yellow hover:bg-brand-yellow/90 hover:scale-105"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-brand-charcoal" />
        )}
      </button>

      {/* Notification dot when closed */}
      {!isOpen && (
        <span className="fixed bottom-4 right-4 z-[51] pointer-events-none">
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </span>
      )}
    </>
  );
}
