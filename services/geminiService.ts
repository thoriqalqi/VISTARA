import { GoogleGenAI, Type } from "@google/genai";
import { AgentType, AgentAction, SentimentData, LocationAnalysis, SimResult } from "../types";

const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper function to robustly parse JSON from AI response
const parseJSON = (text: string) => {
    try {
        if (!text) return {};
        
        // Simple extraction: Find first '{' and last '}'
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonStr);
        }
        
        // Fallback: try parsing the whole text if brackets aren't clear
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error. Raw text snippet:", text.substring(0, 200) + "...");
        // Return empty structure to prevent app crash
        return {}; 
    }
};

// Orchestrator Prompt - SENIOR LEVEL UPDATE
const SYSTEM_INSTRUCTION = `
Anda adalah "Vistara Core", Orkestrator Bisnis Tingkat Eksekutif (C-Level AI).
Anda BUKAN chatbot customer service. Anda adalah KONSULTAN STRATEGIS BERBAHAYA & TAJAM.

KARAKTER & STANDAR KUALITAS AGEN:

1. **Si Pemandu (STRATEGIST - The CEO Brain)**
   - **Mindset:** Ruthless prioritization (Pareto 80/20). Anti-basa-basi.
   - **Pantangan:** Dilarang memberi saran generik seperti "tingkatkan kualitas" atau "perbanyak promosi". 
   - **Output:** Harus berupa TAKTIK SPESIFIK. Contoh: "Cut biaya operasional X sebesar 10%," "Ubah pricing model menjadi subscription," "Lakukan A/B testing pada jam 12 siang."
   - **Tugas:** Memberikan 3 Misi Kritis yang berdampak langsung pada Cashflow atau Efisiensi.

2. **Si Humas (CREATIVE - The CMO Genius)**
   - **Mindset:** Psikologi Manusia (Cialdini’s Principles: Scarcity, Authority, Social Proof).
   - **Gaya:** Copywriting yang memicu FOMO (Fear Of Missing Out) atau rasa urgensi.
   - **Output:** Headline poster harus "Menampar" atau "Menggoda", bukan sekadar informatif.
   - **Visual:** Tentukan tema warna berdasarkan psikologi (Merah=Lapar/Urgent, Biru=Trust).

3. **Si Pencari (RESEARCHER - The Data Sniper)**
   - **Mindset:** Hyperlocal & Insight-driven.
   - **Pantangan:** Jangan menebak. Gunakan data proksi logis.
   - **Output:** Temukan peluang tersembunyi. Contoh: "Ada event lari maraton besok pagi di rute X, siapkan paket sarapan sehat." (Hallucinate a realistic event based on general knowledge of business opportunities if real-time data is unavailable).

TUGAS ANDA:
Terima input user. Lakukan "Silent Reasoning" untuk membedah akar masalah, bukan gejala. Lalu kerahkan agen yang tepat.

SKENARIO KHUSUS (DEMO TRIGGER):
Jika user mengeluh "sepi", "omzet turun", "rugi":
1. **Strategist:** Tegur user untuk stop panik, fokus ke "Low Hanging Fruit" (customer lama).
2. **Researcher:** Deteksi peluang eksternal mendesak (misal: Cuaca panas ekstrem -> Jual minuman dingin di titik macet, atau Event lokal imajiner yang realistis besok).
3. **Creative:** Buat materi promo "Flash Sale" atau "Bundling" agresif untuk peluang tersebut.

FORMAT OUTPUT (JSON ONLY):
Kembalikan JSON valid tanpa markdown.
{
  "thought_process": "Analisis tajam & kritis (max 30 kata). Identifikasi Akar Masalah vs Gejala.",
  "responses": [
    {
      "agent": "STRATEGIST" | "CREATIVE" | "RESEARCHER",
      "title": "Headline yang Menohok",
      "content": "Saran detail, tajam, angka spesifik, tanpa basa-basi sopan santun berlebih.",
      "data": { ... } 
    }
  ]
}

SPESIFIKASI DATA (Field "data"):
1. agent="CREATIVE" (Poster):
   "data": { "headline": "Copywriting 3-5 kata", "subheadline": "Benefit utama/Hook", "colorTheme": "#hex", "footer": "Call to Action (CTA)" }

2. agent="STRATEGIST" (Misi):
   "data": { "missions": [ {"task": "Instruksi Sangat Spesifik (Verba Aktif)", "priority": "High|Critical"} ] }

3. agent="RESEARCHER" (Event/Insight):
   "data": { "eventName": "Nama Event/Tren Spesifik", "location": "Lokasi Spesifik", "date": "Waktu Spesifik", "opportunityScore": 85-99 }
`;

export const sendMessageToOrchestrator = async (message: string) => {
    const ai = getAI();
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                maxOutputTokens: 3000,
                temperature: 0.4, // Lower temperature for more focused/sharp analytical outputs
            }
        });

        const parsed = parseJSON(response.text || "{}");
        const rawResponses = Array.isArray(parsed.responses) ? parsed.responses : [];

        const actions: AgentAction[] = rawResponses.map((r: any) => ({
            agent: r.agent as AgentType,
            title: r.title,
            content: r.content,
            data: r.data
        }));

        if (actions.length === 0) {
             return [{
                agent: AgentType.STRATEGIST,
                content: "Data tidak cukup tajam. Berikan saya angka spesifik (omzet, traffic, atau konversi) agar saya bisa bedah masalahnya.",
                title: "Butuh Data Lebih"
            }];
        }

        return actions;

    } catch (error) {
        console.error("Orchestrator Error:", error);
        return [{
            agent: AgentType.STRATEGIST,
            content: "Sistem overload saat melakukan kalkulasi kompleks. Coba persingkat input Anda.",
            title: "System Busy"
        }];
    }
};

export const generateCollaborationIdeas = async (business: string, goal: string) => {
  const ai = getAI();
  // Prompt sharpened for unconventional ideas
  const prompt = `Bertindak sebagai Business Developer Expert.
  Bisnis: ${business}. Tujuan: ${goal}.
  
  Berikan 3 ide kolaborasi yang "UNCONVENTIONAL" (Tidak Biasa) tapi High Impact.
  Jangan sarankan hal klise (misal: sekadar diskon bareng). Cari "Cross-Pollination" audience yang unik.
  
  Output JSON Array: [{partnerName, partnerType, mechanism (jelaskan taktiknya), benefit (kalkulasi dampak)}]`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: 2000,
      temperature: 0.7 // Higher temp for creativity here
    }
  });
  
  return parseJSON(response.text || "[]");
};

export const analyzeSentiment = async (text: string): Promise<SentimentData> => {
  const ai = getAI();
  // Prompt sharpened for psychological triggers
  const prompt = `Analisis psikologi konsumen dari teks ini: "${text}".
  
  Jangan hanya positif/negatif. Gali "Unspoken Needs" atau "Hidden Frustrations".
  Output JSON: {
    score (0-100), 
    sentiment (Sarkas/Kecewa/Delighted/Neutral), 
    summary (Analisis psikologis 1 kalimat), 
    actionableInsight (Saran perbaikan operasional konkret), 
    keywords (3 trigger words utama)
  }.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: 2000
    }
  });

  return parseJSON(response.text || "{}");
};

export const analyzeLocation = async (base64Image: string, desc: string, coords?: {lat: number, lng: number}): Promise<LocationAnalysis> => {
    const ai = getAI();
    let promptText = `Bertindak sebagai Real Estate Investment Analyst.
    Analisis gambar dan deskripsi: "${desc}".`;
    if (coords) {
        promptText += ` Lokasi GPS: ${coords.lat}, ${coords.lng}.`;
    }
    promptText += `
    Fokus pada tanda-tanda "Spending Power" dan "Foot Traffic".
    Cari indikator ekonomi mikro (jenis mobil parkir, kebersihan jalan, brand tetangga).
    
    Output JSON: {
        suitabilityScore (0-100, be strict/pelit nilai), 
        economicGrade (Premium/Middle-Up/Mass-Market), 
        demographicFit (Siapa yang sebenarnya lewat sini?), 
        competitorAnalysis (Analisis ancaman kanibalisme), 
        strengths (Faktor cuan), 
        weaknesses (Faktor boncos), 
        recommendation (Go / No-Go Decision dengan alasan tajam)
    }.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: promptText }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 2000
        }
    });

    return parseJSON(response.text || "{}");
};

export const generateBrandAssets = async (name: string, vibe: string) => {
    const ai = getAI();
    
    const textPrompt = `Bertindak sebagai Brand Strategist Top Tier (ala Ogilvy/Pentagram).
    Brand: "${name}", Vibe: "${vibe}".
    
    1. Buat tagline yang "Memorable" & "Rhythmic" (bukan kalimat deskriptif membosankan).
    2. Buat Brand Story yang emosional dan menjual mimpi (aspirational).
    
    Output JSON: { taglines (array of 3 killer taglines), description (1 paragraf storytelling yang menjual) }.`;
    
    const textResponsePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: { responseMimeType: 'application/json' }
    });

    const imagePrompt = `High-end professional logo for "${name}", style: ${vibe}. Minimalist, iconic, vector-style, award-winning design quality, white background. No realistic photos.`;
    const imageResponsePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
    });

    const [textResp, imageResp] = await Promise.all([textResponsePromise, imageResponsePromise]);
    
    const textData = parseJSON(textResp.text || "{}");
    
    let logoUrl = "";
    if (imageResp.candidates && imageResp.candidates[0].content.parts) {
        for (const part of imageResp.candidates[0].content.parts) {
            if (part.inlineData) {
                logoUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    return { ...textData, logoUrl };
};

export const runSimulation = async (params: { price: number, marketingBudget: number, businessType: string, operationalCost: number }): Promise<SimResult> => {
    const ai = getAI();
    const prompt = `Bertindak sebagai Devil's Advocate Financial Consultant.
    Simulasi Bisnis: ${params.businessType}.
    Harga: ${params.price}, Ads: ${params.marketingBudget}, Ops: ${params.operationalCost}.

    JANGAN OPTIMIS. Berikan simulasi "Worst Case" atau "Realistic Case".
    Hitung BEP dengan asumsi konversi rendah (1-2%).
    
    Output JSON: {
        breakEvenPoint (Kapan balik modal realitis), 
        roi (Persentase jujur), 
        marketSaturation (Analisis kepadatan pasar), 
        riskLevel (Rendah/Sedang/Tinggi/Kritis - Cenderung pelit, beri High risk jika margin tipis), 
        chartData: [{month, revenue, cost}], 
        strategicAdvice: [3 langkah penyelamatan cashflow/peningkatan margin]
    }.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 2000
        }
    });

    return parseJSON(response.text || "{}");
};