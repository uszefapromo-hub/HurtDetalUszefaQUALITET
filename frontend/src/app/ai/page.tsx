'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Store, Megaphone, TrendingUp } from 'lucide-react';

interface Message { id: string; role: 'user' | 'ai'; content: string; }

const QUICK_ACTIONS = [
  { icon: Store, label: 'Generate Store Description', prompt: 'Generate a professional store description for an electronics store' },
  { icon: Megaphone, label: 'Marketing Copy', prompt: 'Create marketing copy for my best-selling product' },
  { icon: TrendingUp, label: 'Product Analysis', prompt: 'Analyze current market trends for electronics products' },
  { icon: Sparkles, label: 'AI Recommendations', prompt: 'What products should I add to increase my revenue?' },
];

export default function AICenter() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', content: 'Hello! I\'m your AI business assistant. I can help you with store descriptions, marketing copy, product analysis, and business strategy. What would you like help with today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: `I've analyzed your request: "${text}". Based on current market trends and your store data, here are my recommendations: Focus on premium positioning, optimize product descriptions with keywords, and consider bundle offers to increase average order value. Would you like me to elaborate on any specific aspect?` };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#00d4ff] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black">AI Center</h1>
            <p className="text-[#00d4ff] text-xs">Powered by GPT-4</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
            <motion.button key={label} whileTap={{ scale: 0.95 }} onClick={() => send(prompt)}
              className="flex-shrink-0 glass-card px-3 py-2 rounded-xl flex items-center gap-2 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <Icon size={14} className="text-[#7c3aed]" />
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#00d4ff] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
              ) : null}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] text-white rounded-tr-sm' : 'glass-card text-white/80 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#00d4ff] flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 border-t border-white/10 pt-3">
        <div className="flex gap-2">
          <div className="flex-1 glass-card flex items-center gap-2 px-3 py-2.5">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask AI anything about your business..." className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 text-sm" />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => send(input)} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center disabled:opacity-50 flex-shrink-0">
            <Send size={16} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
