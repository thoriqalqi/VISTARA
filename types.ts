export enum AgentType {
  USER = 'USER',
  ORCHESTRATOR = 'ORCHESTRATOR', // The Brain
  STRATEGIST = 'STRATEGIST',     // Si Pemandu (Business logic)
  CREATIVE = 'CREATIVE',         // Si Humas (Marketing/Poster)
  RESEARCHER = 'RESEARCHER'      // Si Pencari (Data/Search)
}

export interface AgentAction {
  agent: AgentType;
  title?: string;
  content: string; // Text response
  data?: any; // Structured data for widgets (e.g. Poster props, Mission list)
}

export interface ChatMessage {
  id: string;
  sender: AgentType;
  text?: string; // Raw text
  actions?: AgentAction[]; // Multi-agent responses
  timestamp: Date;
  isTyping?: boolean;
}

// Data structures for specific agent widgets
export interface PosterData {
  headline: string;
  subheadline: string;
  colorTheme: string;
  footer: string;
}

export interface MissionData {
  missions: { task: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface ResearchData {
  eventName: string;
  location: string;
  date: string;
  opportunityScore: number;
}

export interface SentimentData {
  score: number;
  sentiment: string;
  summary: string;
  actionableInsight: string;
  keywords: string[];
}

export interface LocationAnalysis {
  suitabilityScore: number;
  economicGrade: string;
  demographicFit: string;
  competitorAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface SimResult {
  breakEvenPoint: string;
  roi: string;
  marketSaturation: string;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  chartData: { month: string; revenue: number; cost: number }[];
  strategicAdvice: string[];
}