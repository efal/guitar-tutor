import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { chatWithTutor } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles } from 'lucide-react';

const AICoach: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: "Hey! I'm Strum, your guitar tutor. Want to learn a new scale, understand a chord, or just talk music theory?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Prepare history for context
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const response = await chatWithTutor(history, userMsg.text);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (err) {
        // Error handling visual
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  }

  return (
    <div className="flex flex-col h-[600px] bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-900 p-4 border-b border-zinc-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-wood-600 flex items-center justify-center shadow-lg shadow-wood-900/50">
                <Sparkles size={20} className="text-white" />
            </div>
            <div>
                <h3 className="font-bold text-zinc-100">Strum AI Tutor</h3>
                <p className="text-xs text-wood-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                </p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-800/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-600' : 'bg-wood-700'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-zinc-600 text-white rounded-tr-none' 
                            : 'bg-zinc-700 text-zinc-200 rounded-tl-none border border-zinc-600'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="flex justify-start">
                    <div className="flex max-w-[80%] gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-wood-700">
                             <Bot size={14} />
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-700 border border-zinc-600 flex gap-1 items-center">
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-700">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about scales, chords, or theory..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-wood-500 transition-all placeholder-zinc-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-2 p-1.5 bg-wood-600 hover:bg-wood-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-2">
                Strum AI can make mistakes. Check important music theory info.
            </p>
        </div>
    </div>
  );
};

export default AICoach;