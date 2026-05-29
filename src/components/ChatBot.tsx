import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, RefreshCw, Zap, ShieldAlert, 
  HelpCircle, Sparkles 
} from 'lucide-react';
import { ChatMessage, SimCardState } from '../types';

interface ChatBotProps {
  sims: SimCardState[];
}

export default function ChatBot({ sims }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: 'assistant',
      text: "Olá, maninho! Sou o Cunene AI Assistant. Estou aqui para te ajudar a economizar saldo e combater o desperdício de dados móveis em Angola. Podes me perguntar sobre planos UNITEL, AFRICELL ou como restringir consumos do TikTok e Instagram. Como posso te apoiar agora?",
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeSim = sims.find(s => s.isActive) || sims[0];

  const quickPrompts = [
    { text: "Como poupar bateria e dados no TikTok/Instagram?", icon: "📱" },
    { text: "Melhores planos Unitel ou Africell de Angola?", icon: "🇦🇴" },
    { text: "Como funciona o bloqueio automático de segundo plano?", icon: "🛡️" }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          activeSim
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: data.text || "Desculpe, estou com dificuldades em comunicar com os servidores de Luanda no momento.",
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "Epa! Detetei uma quebra de ligação nos cabos submarinos. Por favor, reinicie e faça a sua pergunta novamente.",
          timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPromptClick = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in" id="chat_bot_container">
      {/* Quick Prompts Left Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-5 rounded-2xl bg-[#090D1A]/80 border border-slate-800/80 shadow-xl space-y-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Consultor de IA</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecione uma destas dúvidas frequentes dos consumidores angolanos para ver soluções dinâmicas de economia.
          </p>

          <div className="space-y-2.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleQuickPromptClick(p.text)}
                className="w-full text-left p-3 bg-slate-900/40 hover:bg-slate-900/85 border border-slate-800/80 rounded-xl transition-all text-xs font-medium text-slate-300 flex items-start gap-2.5"
              >
                <span className="text-sm shrink-0">{p.icon}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
          <p>
            💡 <strong>Dica do Cunene:</strong> A internet de Angola flutua muito. Ativar a compressão inteligente de dados em segundo plano reduz as latências e ajuda o teu pacote a durar mais tempo.
          </p>
        </div>
      </div>

      {/* Main Chat Thread Pane */}
      <div className="lg:col-span-3 p-5 bg-[#090D1A]/80 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col h-[520px] justify-between relative">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/60 mb-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Cunene AI Assistant</h4>
              <p className="text-[10px] text-emerald-400">Ligado • Operadora: {activeSim ? activeSim.operator : 'UNITEL'}</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-550/10 border border-indigo-500/15 rounded text-indigo-400">
            Angola Edition
          </span>
        </div>

        {/* Message Thread Box */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mb-4 text-xs">
          {messages.map((m) => {
            const isAsst = m.sender === 'assistant';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isAsst ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isAsst ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 font-mono text-[10px] font-bold'}`}>
                  {isAsst ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Body Bubble */}
                <div>
                  <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    isAsst 
                      ? 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800/60' 
                      : 'bg-indigo-600 text-white rounded-br-none'
                  }`}>
                    {m.text}
                  </div>
                  
                  <span className={`text-[9px] text-slate-500 block mt-1 ${isAsst ? 'text-left' : 'text-right'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-slate-900 border border-slate-800/40 p-3 rounded-2xl rounded-tl-none text-slate-400 italic">
                Cunene AI está a escrever...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Action input line */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2.5 items-center pt-3 border-t border-slate-800/60"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pergunte ao Cunene AI algo como: 'Como economizar na Unitel?'"
            className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-500/10 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
