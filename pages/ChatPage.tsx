
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Bot, User, Loader2, Sparkles, Terminal, Info, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { repoService } from '../services/api';

const ChatPage: React.FC = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `I have analyzed this codebase using advanced deep-reasoning models and I am ready to help. I understand the architecture, module dependencies, and specific file logic. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await repoService.askChat(id, input);
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response.data.content,
        timestamp: response.data.timestamp || new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      console.error('Chat Error:', err);
      setError('AI service unreachable. Ensure your backend is running with a valid API configuration.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="p-6 border-b border-slate-800/50 bg-slate-900/20 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/10 flex items-center justify-center border border-orange-500/20">
            <Bot className="text-orange-500" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">AI Analyst</h2>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 font-black uppercase tracking-widest mt-0.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
              DeepSeek-R1 Active
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <Info size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-950/20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`flex-none w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${msg.role === 'assistant' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
              {msg.role === 'assistant' ? <Sparkles size={24} /> : <User size={24} />}
            </div>
            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-6 rounded-3xl leading-relaxed whitespace-pre-wrap text-base font-medium ${msg.role === 'assistant'
                  ? 'bg-slate-900/80 border border-slate-800 text-slate-200'
                  : 'bg-orange-600 text-white shadow-2xl shadow-orange-900/20'
                }`}>
                {msg.content}
              </div>
              <p className="text-[10px] text-slate-600 font-mono px-2 uppercase font-bold tracking-widest">{msg.timestamp}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-5">
            <div className="flex-none w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-xl">
              <Sparkles size={24} />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
              </div>
              <span className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">Intelligence Engine is synthesizing logic...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center p-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-500 text-sm font-bold">
              <AlertCircle size={20} />
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-800/50 bg-slate-900/30">
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors">
            <Terminal size={20} />
          </div>
          <input
            type="text"
            placeholder="Ask about architecture, logic, or code patterns..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-14 pr-20 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/50 transition-all shadow-inner font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-900/30 active:scale-95"
          >
            <Send size={24} />
          </button>
        </form>
        <p className="mt-4 text-center text-[10px] text-slate-600 uppercase font-black tracking-tighter">
          Deep-Reasoning Logic — Professional Grade Inference
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
