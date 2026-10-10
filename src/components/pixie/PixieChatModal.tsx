import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  RotateCcw,
  Maximize2,
  Minimize2,
  Lightbulb,
  ChevronRight,
  Flame,
  Music,
} from 'lucide-react';
import { Pixie, PixieMessage } from '../../services/pixie';
import { PyeLogo } from '../ui/PyeLogo';

interface PixieChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

export const PixieChatModal: React.FC<PixieChatModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<PixieMessage[]>(() => Pixie.getMessages());
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    setMessages([...Pixie.getMessages()]);
    setIsTyping(true);

    try {
      await Pixie.sendMessage(text);
      setMessages([...Pixie.getMessages()]);
    } catch (e) {
      console.error('Pixie chat error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: string) => {
    handleSend(action);
  };

  const handleReset = () => {
    Pixie.clearHistory();
    setMessages([...Pixie.getMessages()]);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col bg-[#0b0b14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_12px_40px_rgba(255,0,122,0.25)] overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF007A] via-[#FF5500] to-[#FFA000] p-0.5 flex items-center justify-center shadow-lg shadow-[#FF007A]/25">
              <div className="w-full h-full bg-[#0b0b14] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FFA000] animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b0b14]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white font-display tracking-wide">
                PIXIE AI
              </h3>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#FF007A]/20 text-[#FF007A] border border-[#FF007A]/30">
                APPIX ASSISTANT
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Creative guide & platform companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 select-text">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-white rounded-br-sm shadow-md'
                    : 'bg-zinc-900/90 text-zinc-200 border border-white/5 rounded-bl-sm shadow'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[9px] mt-1 font-mono ${
                    isUser ? 'text-white/70 text-right' : 'text-zinc-500'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Action Chips for Pixie's intro or advice */}
              {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-1">
                  {m.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(act.action)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 hover:text-white transition flex items-center gap-1 active:scale-95"
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="w-2.5 h-2.5 text-[#FFA000]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs px-2 py-1">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF007A] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFA000] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Pixie is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Pixie anything about PYE..."
            className="flex-1 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF007A] transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-white disabled:opacity-40 transition active:scale-95 shadow-md shadow-[#FF007A]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
