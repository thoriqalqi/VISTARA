import React, { useState, useRef, useEffect } from 'react';
import { AgentType, AgentAction } from './types';
import { sendMessageToOrchestrator } from './services/geminiService';
import { ChatBubble, Input, Button } from './components/Components';
import { 
  Hexagon, Send, Sparkles, LayoutDashboard, 
  Map as MapIcon, HeartPulse, Users, Palette, 
  Activity, Menu, X, Loader2
} from 'lucide-react';

// Import Feature Components
import { BrandAI } from './features/BrandAI';
import { LocationAI } from './features/LocationAI';
import { SentimentAI } from './features/SentimentAI';
import { CollabAI } from './features/CollabAI';
import { SimAI } from './features/SimAI';

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'brand' | 'location' | 'sentiment' | 'collab' | 'sim'>('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chat State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AgentAction[]>([
      {
          agent: AgentType.STRATEGIST,
          content: "Vistara Prime siap. Saya telah mempelajari data pasar terkini. Ceritakan bisnis Anda secara singkat (Produk, Target Pasar, Isu Utama) agar saya bisa memberikan diagnosis akurat.",
          title: "CONSULTANT ONLINE"
      }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AgentAction = { agent: AgentType.USER, content: input };
    
    // Optimistic Update
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Pass the CURRENT messages state (history) + the new user message to the service
        // We use 'messages' from state, but we need to append the new userMsg effectively for the context
        // However, React state update is async, so we manually combine them for the API call
        const currentHistory = [...messages, userMsg];
        
        const agentActions = await sendMessageToOrchestrator(currentHistory, userMsg.content);
        
        for (const action of agentActions) {
            // Artificial delay for "Thinking" effect
            await new Promise(resolve => setTimeout(resolve, 800)); 
            setMessages(prev => [...prev, action]);
        }
    } catch (e) {
        setMessages(prev => [...prev, { agent: AgentType.STRATEGIST, content: "Koneksi ke server pusat terganggu. Silakan coba lagi." }]);
    } finally {
        setLoading(false);
    }
  };

  const menuItems = [
    { id: 'chat', label: 'Command Center', icon: LayoutDashboard },
    { id: 'sim', label: 'Business Simulator', icon: Activity },
    { id: 'sentiment', label: 'Emosi Meter', icon: HeartPulse },
    { id: 'location', label: 'Geo Intelligence', icon: MapIcon },
    { id: 'brand', label: 'Brand Atelier', icon: Palette },
    { id: 'collab', label: 'Synergy Link', icon: Users },
  ];

  return (
    <div className="h-screen bg-nexus-base flex font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex w-64 bg-nexus-onyx text-white flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Hexagon size={18} className="text-white fill-white/20" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide">VISTARA</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeTab === item.id 
                        ? 'bg-nexus-accent text-white shadow-lg shadow-nexus-accent/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                    <span className="font-medium text-sm">{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-6 border-t border-gray-800">
            <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">System Status</p>
                <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    ALL SYSTEMS ONLINE
                </div>
            </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-nexus-onyx flex items-center justify-between px-4 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Hexagon size={18} className="text-white" />
            </div>
            <span className="font-serif font-bold text-white text-lg">VISTARA</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
          <div className="absolute inset-0 bg-nexus-onyx z-20 pt-20 px-4 md:hidden">
             <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left ${
                            activeTab === item.id ? 'bg-nexus-accent text-white' : 'text-gray-400'
                        }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
             </nav>
          </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative md:static pt-16 md:pt-0">
        
        {/* TOP BAR (Context) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 shadow-sm flex-shrink-0">
            <h2 className="font-serif font-bold text-nexus-text text-xl">
                {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-nexus-muted bg-gray-100 px-3 py-1.5 rounded-full">
                <span>Powered by Gemini 2.5 Flash</span>
            </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8 relative">
            
            {/* 1. CHAT ORCHESTRATOR */}
            {activeTab === 'chat' && (
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="flex-1 pr-2">
                        {messages.map((msg, idx) => (
                            <ChatBubble key={idx} message={msg} />
                        ))}
                        {loading && (
                            <div className="flex gap-4 mb-6 animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <Sparkles size={16} className="text-gray-400" />
                                </div>
                                <div className="text-xs text-gray-400 font-medium pt-2">
                                    Analyzing market variables...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="pt-4 sticky bottom-0 bg-gradient-to-t from-nexus-base via-nexus-base to-transparent pb-2">
                         <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex gap-2 items-center relative">
                            <Input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik pesan Anda..." 
                                className="border-none shadow-none focus:ring-0 bg-transparent py-3 px-4 text-sm"
                            />
                            <Button 
                                variant="icon" 
                                onClick={handleSend} 
                                disabled={loading || !input.trim()}
                                className="h-10 w-10 p-0 flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
                            </Button>
                         </div>
                         <p className="text-center text-[10px] text-gray-400 mt-2">
                            Vistara Prime AI. Verifikasi keputusan finansial secara independen.
                         </p>
                    </div>
                </div>
            )}

            {/* 2. FEATURE COMPONENTS */}
            {activeTab === 'sim' && <div className="max-w-5xl mx-auto"><SimAI /></div>}
            {activeTab === 'sentiment' && <div className="max-w-5xl mx-auto"><SentimentAI /></div>}
            {activeTab === 'location' && <div className="max-w-5xl mx-auto"><LocationAI /></div>}
            {activeTab === 'brand' && <div className="max-w-5xl mx-auto"><BrandAI /></div>}
            {activeTab === 'collab' && <div className="max-w-5xl mx-auto"><CollabAI /></div>}

        </div>
      </main>
    </div>
  );
};

export default App;