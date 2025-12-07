
import React from 'react';
import { Loader2, Send, BrainCircuit, Lightbulb, Search, PenTool, CheckCircle2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { AgentType, AgentAction, PosterData, MissionData, ResearchData } from '../types';

// --- Base Components ---

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'icon' }> = ({ children, className = '', variant = 'primary', ...props }) => {
  const base = "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gradient-gold text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg active:scale-95 flex items-center gap-2",
    secondary: "bg-gray-100 text-nexus-text font-medium py-2 px-4 rounded-xl hover:bg-gray-200 active:scale-95 flex items-center gap-2",
    outline: "border border-gray-300 text-nexus-text font-medium py-3 px-6 rounded-xl hover:bg-gray-50 active:scale-95 flex items-center gap-2",
    icon: "p-3 rounded-full bg-nexus-accent text-white hover:bg-yellow-600 shadow-md"
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`w-full bg-white border border-gray-200 text-nexus-text font-sans p-4 rounded-xl focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent/50 placeholder-gray-400 shadow-sm ${props.className}`}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full bg-white border border-gray-200 text-nexus-text font-sans p-4 rounded-xl focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent/50 placeholder-gray-400 shadow-sm ${props.className}`}
  />
);

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    {title && <h3 className="text-xl font-bold text-nexus-text mb-4 font-serif">{title}</h3>}
    {children}
  </div>
);

export const StatBox: React.FC<{ label: string; value: string | number; subtext?: string; color?: string }> = ({ label, value, subtext, color = 'text-nexus-text' }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="text-xs text-nexus-muted uppercase font-bold mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {subtext && <div className="text-[10px] text-gray-400 mt-1">{subtext}</div>}
    </div>
);

export const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Chat & Agent Components ---

const AgentIcon = ({ type }: { type: AgentType }) => {
    switch (type) {
        case AgentType.STRATEGIST:
            return <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center border border-yellow-200"><BrainCircuit size={18} /></div>;
        case AgentType.CREATIVE:
            return <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center border border-pink-200"><PenTool size={18} /></div>;
        case AgentType.RESEARCHER:
            return <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200"><Search size={18} /></div>;
        default:
            return <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center"><BrainCircuit size={18} /></div>;
    }
};

const AgentName = ({ type }: { type: AgentType }) => {
    switch (type) {
        case AgentType.STRATEGIST: return <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Si Pemandu</span>;
        case AgentType.CREATIVE: return <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Si Humas</span>;
        case AgentType.RESEARCHER: return <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Si Pencari</span>;
        default: return null;
    }
};

// 1. Mission Widget (Strategist)
const MissionWidget: React.FC<{ data: MissionData }> = ({ data }) => (
    <div className="mt-3 bg-white rounded-xl border border-yellow-100 shadow-sm overflow-hidden">
        <div className="bg-yellow-50/50 px-4 py-2 border-b border-yellow-100 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-yellow-600" />
            <span className="text-xs font-bold text-yellow-800 uppercase">Misi Hari Ini</span>
        </div>
        <div className="p-3 space-y-2">
            {data.missions?.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 ${m.priority === 'High' ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}></div>
                    <div className="flex-1">
                        <div className="text-sm text-nexus-text font-medium leading-tight">{m.task}</div>
                        {m.priority === 'High' && <span className="text-[10px] text-red-500 font-bold mt-1 inline-block">PRIORITAS TINGGI</span>}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// 2. Poster Widget (Creative)
const PosterWidget: React.FC<{ data: PosterData }> = ({ data }) => (
    <div className="mt-3 relative group cursor-pointer perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative aspect-[4/5] w-full max-w-[280px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col mx-auto border border-gray-100 transform transition-transform group-hover:scale-[1.02]">
            {/* Mock Image Area */}
            <div className="h-3/5 bg-gray-100 relative overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800)' }}></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-4 right-4">
                     <h3 className="text-white font-serif font-bold text-2xl leading-none drop-shadow-md">{data.headline}</h3>
                 </div>
            </div>
            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                <div>
                    <p className="text-nexus-text font-sans font-medium text-lg leading-tight mb-1">{data.subheadline}</p>
                    <div className="w-10 h-1 bg-nexus-accent mt-2 mb-2"></div>
                </div>
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest text-center border-t border-gray-100 pt-2">
                    {data.footer}
                </div>
            </div>
            {/* Action Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                <button className="bg-white text-nexus-text font-bold text-sm px-6 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Unduh Poster
                </button>
            </div>
        </div>
    </div>
);

// 3. Research Widget (Researcher)
const ResearchWidget: React.FC<{ data: ResearchData }> = ({ data }) => (
    <div className="mt-3 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="flex">
             <div className="w-1/3 bg-blue-50 flex flex-col items-center justify-center p-3 border-r border-blue-100">
                 <span className="text-2xl font-bold text-blue-600">{data.opportunityScore}%</span>
                 <span className="text-[10px] text-blue-400 uppercase font-bold text-center leading-tight">Match Score</span>
             </div>
             <div className="w-2/3 p-3">
                 <h4 className="font-bold text-nexus-text text-sm mb-1 line-clamp-1">{data.eventName}</h4>
                 <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                     <MapPin size={12} className="text-blue-500" /> {data.location}
                 </div>
                 <div className="flex items-center gap-1.5 text-xs text-gray-500">
                     <Calendar size={12} className="text-blue-500" /> {data.date}
                 </div>
             </div>
        </div>
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 flex justify-between items-center">
             <span className="text-[10px] text-gray-400 font-medium">Source: Google Events</span>
             <a href="#" className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
                Lihat Detail <ExternalLink size={10} />
             </a>
        </div>
    </div>
);

// --- Main Chat Bubble ---

export const ChatBubble: React.FC<{ message: AgentAction }> = ({ message }) => {
    const isUser = message.agent === AgentType.USER;
    
    if (isUser) {
        return (
            <div className="flex justify-end mb-6 animate-fade-in">
                <div className="bg-nexus-text text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                    <p className="font-sans text-sm leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 mb-8 animate-fade-in group">
            <div className="flex-shrink-0 mt-1">
                <AgentIcon type={message.agent} />
            </div>
            <div className="flex-1 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1.5">
                    <AgentName type={message.agent} />
                    <span className="text-[10px] text-gray-400">• Vistara AI</span>
                </div>
                
                <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                    {message.title && <h4 className="font-serif font-bold text-nexus-text mb-2">{message.title}</h4>}
                    <p className="font-sans text-nexus-text text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Render Specific Widgets */}
                    {message.agent === AgentType.STRATEGIST && message.data && <MissionWidget data={message.data as MissionData} />}
                    {message.agent === AgentType.CREATIVE && message.data && <PosterWidget data={message.data as PosterData} />}
                    {message.agent === AgentType.RESEARCHER && message.data && <ResearchWidget data={message.data as ResearchData} />}
                </div>
            </div>
        </div>
    );
};
