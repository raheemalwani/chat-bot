/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";
import { ChatMessage } from "./ChatMessage";
import { sendMessageStream } from "../services/geminiService";
import { SUGGESTED_PROMPTS } from "../constants";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm Aura. I'm here to chat, listen, and help in any way I can. How's your day going so far?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      let accumulatedContent = "";
      const stream = sendMessageStream([...messages, userMessage]);
      
      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }
    } catch (err) {
      setError("I'm having a little trouble connecting right now. Want to try again?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl overflow-hidden border-x border-gray-100">
      {/* Header */}
      <header className="px-6 py-4 border-bottom bg-[#F8F7F3] border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800 text-lg leading-tight">Aura</h1>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Always here to help
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8F7F3]/30">
        <div className="space-y-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center space-x-2 text-gray-400 p-2 italic text-sm">
              <Loader2 className="animate-spin" size={16} />
              <span>Aura is thinking...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mt-4">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Empty State / Suggestions */}
        {messages.length <= 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-6">Need some inspiration? Try asking me one of these:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#5A5A40] hover:text-[#5A5A40] transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
        <div className="relative flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Message Aura..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-2xl resize-none outline-none transition-all max-h-32 text-gray-700"
              rows={1}
            />
          </div>
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-gray-400">
          Aura is an AI and can make mistakes. Consider checking important info.
        </p>
      </footer>
    </div>
  );
}
