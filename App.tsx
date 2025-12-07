import React, { useState, useRef, useEffect } from 'react';
import { AgentType, AgentAction } from './types';
import { sendMessageToOrchestrator } from './services/geminiService';
import { ChatBubble, Input, Button } from './components/Components';
import { Hexagon, Send, Sparkles, MoreHorizontal, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AgentAction[]>([
      {
          agent: AgentType.STRATEGIST,
          content: "Selamat pagi, Pak. Saya siap membantu operasional hari ini. Ada keluhan atau target khusus yang mau kita bahas?",
          title: "Sistem Siap"
      }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AgentAction = {
        agent: AgentType.USER,
        content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const agentActions = await sendMessageToOrchestrator(userMsg.content);
        
        // Simulate streaming delay between agents for realism
        for (const action of agentActions) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Natural delay
            setMessages(prev => [...prev, action]);
        }
    } catch (e) {
        setMessages(prev => [...prev, { agent: AgentType.STRATEGIST, content: "Maaf, ada gangguan koneksi." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-nexus-base flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 py-3 px-4 md:px-6 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent/20">
                <Hexagon size={24} className="text-white" />
            </div>
            <div>
                <h1 className="font-serif font-bold text-nexus-text text-lg leading-none">Vistara Core</h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-nexus-muted font-bold tracking-widest uppercase">3 Agents Active</span>
                </div>
            </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-nexus-text hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
         <div className="max-w-3xl mx-auto pb-4">
             {/* Date Divider */}
             <div className="flex justify-center mb-8">
                 <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Hari Ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long'})}
                 </span>
             </div>

             {/* Messages */}
             {messages.map((msg, idx) => (
                 <ChatBubble key={idx} message={msg} />
             ))}

             {/* Loading State - Thinking Indicator */}
             {loading && (
                 <div className="flex gap-4 mb-6 animate-pulse">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                         <Sparkles size={16} className="text-gray-400" />
                     </div>
                     <div className="flex items-center gap-1 text-xs text-gray-400 font-medium pt-2">
                         Vistara sedang berpikir<span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
                     </div>
                 </div>
             )}
             
             <div ref={messagesEndRef} />
         </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="max-w-3xl mx-auto flex gap-3 relative">
              <div className="flex-1 relative">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ketik masalah bisnis Anda..." 
                    className="pr-12 py-4 shadow-sm border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      {/* Decoration icons for input */}
                  </div>
              </div>
              <Button 
                variant="icon" 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                className="h-[58px] w-[58px] flex items-center justify-center flex-shrink-0"
              >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
              </Button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center">
             <p className="text-[10px] text-gray-400">Vistara AI Orchestrator • Powered by Gemini 2.5 Flash</p>
          </div>
      </footer>
    </div>
  );
};

export default App;