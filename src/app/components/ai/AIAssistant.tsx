import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Brain } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getAIResponse } from '../../utils/aiUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    content: "👋 Hi! I'm your AI Design Assistant. I can help you:\n• Generate floor plans from descriptions\n• Suggest furniture placement & colors\n• Apply design styles\n• Answer design questions\n\nWhat would you like to design today?",
    timestamp: new Date(),
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context?: any;
}

export function AIAssistant({ isOpen, onClose, context }: Props) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, minimized]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate API delay
    await new Promise(res => setTimeout(res, 800 + Math.random() * 600));

    const response = getAIResponse(text, context);
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMsg]);
  };

  const quickActions = [
    'Suggest furniture layout',
    'Recommend color palette',
    'Optimize room flow',
    'Generate 3D preview tips',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-4 right-4 z-50 w-80 rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
          }`}
          style={{ maxHeight: minimized ? 52 : 480 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">AI Design Assistant</div>
                <div className="text-white/60 text-[10px] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Online · GPT-4 powered
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ height: 310 }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                        : isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {msg.role === 'assistant'
                        ? <Bot className="w-3.5 h-3.5 text-white" />
                        : <User className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                      }
                    </div>
                    <div
                      className={`max-w-[220px] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white'
                          : isDark
                            ? 'bg-gray-900 text-gray-200 border border-gray-800'
                            : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className={`px-3 py-2 rounded-xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 2 && (
                <div className={`px-3 pb-2 flex flex-wrap gap-1`}>
                  {quickActions.map(a => (
                    <button
                      key={a}
                      onClick={() => { setInput(a); }}
                      className={`px-2 py-1 rounded-lg text-[10px] border transition-colors ${
                        isDark ? 'border-gray-700 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400' : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className={`flex items-center gap-2 px-3 py-2.5 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about design..."
                  className={`flex-1 text-xs bg-transparent outline-none ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AIAssistantButton({ onClick }: { onClick: () => void }) {
  const { isDark } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
    >
      <Sparkles className="w-5 h-5" />
    </motion.button>
  );
}
