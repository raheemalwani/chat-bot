/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { User, Bot } from "lucide-react";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-6 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAssistant ? "bg-[#5A5A40] text-white" : "bg-gray-200 text-gray-600"
        } ${isAssistant ? "mr-3" : "ml-3"}`}>
          {isAssistant ? <Bot size={18} /> : <User size={18} />}
        </div>
        
        <div className={`relative px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isAssistant 
            ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" 
            : "bg-[#5A5A40] text-white rounded-tr-none"
        }`}>
          {message.content}
          <div className={`text-[10px] opacity-40 mt-1 ${isAssistant ? "text-gray-500 text-left" : "text-white text-right"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
