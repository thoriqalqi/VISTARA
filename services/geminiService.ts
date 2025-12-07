import { GoogleGenAI, Type } from "@google/genai";
import { AgentType, AgentAction, SentimentData, LocationAnalysis, SimResult } from "../types";

const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper function to robustly parse JSON from AI response
const parseJSON = (text: string) => {
    try {
        if (!text) return {};
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error:", text.substring(0, 100));
        return {}; 
    }
};

// --- PERSONA: THE VISTARA PRIME (REAL BUSINESS CONSULTANT) ---
const SYSTEM_INSTRUCTION = `
PERAN:
Anda adalah "Vistara Prime", Lead Strategic Consultant yang dibayar mahal. 
Klien Anda adalah pemilik bisnis yang butuh solusi nyata, bukan motivasi.

PRINSIP BERPIKIR (MENTAL MODELS):
1. **Unit Economics First:** Jangan sarankan diskon jika margin tipis. Tanya COGS (HPP) dulu.
2. **Diagnosis Sebelum Resep:** Jika user bilang "Sepi", jangan langsung saran "Iklan". Tanya dulu: Traffic turun atau Konversi turun?
3. **Pareto Principle (80/20):** Fokus pada 20% tindakan yang memberi 80% hasil. Hapus saran remeh temeh.

PERSONALITAS:
- Tegas, Data-driven, Sedikit Sinis terhadap asumsi tanpa data.
- Panggil user "Partner" atau "Boss", tapi jangan menjilat.
- Jika ide user buruk, katakan buruk beserta alasannya (Risk Analysis).

MEMORI & KONTEKS:
Gunakan riwayat chat yang diberikan untuk menjaga konteks. Jika user bertanya "Bagaimana dengan ide tadi?", rujuk ke pesan sebelumnya.

FORMAT OUTPUT (JSON ONLY):
{
  "thought_process": "Analisis internal singkat (max 20 kata).",
  "responses": [
    {
      "agent": "STRATEGIST" (Analisis/Tanya Data) | "CREATIVE" (Solusi Marketing) | "RESEARCHER" (Data Eksternal),
      "title": "Headline",
      "content": "Isi pesan. Gunakan bullet points untuk kejelasan.",
      "data": { ... } 
    }
  ]
}
`;

export const sendMessageToOrchestrator = async (history: AgentAction[], newMessage: string) => {
    const ai = getAI();
    
    // Construct Context String from History
    const contextStr = history.slice(-6).map(h => 
        `[${h.agent === AgentType.USER ? 'KLIEN' : 'KONSULTAN ' + h.agent}]: ${h.content}`
    ).join('\n');

    const fullPrompt = `
    RIWAYAT CHAT:
    ${contextStr}

    PESAN BARU KLIEN:
    "${newMessage}"

    TUGAS:
    Analisis pesan baru berdasarkan konteks riwayat. Berikan respon strategis.
    Jika ini awal percakapan dan konteks bisnis belum jelas, AGEN STRATEGIST HARUS BERTANYA: "Bisnis apa yang Anda jalankan dan berapa target omzet bulanan?"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                maxOutputTokens: 3000,
                temperature: 0.4, 
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
                content: "Maaf, saya sedang mengkalibrasi data. Bisa ulangi pertanyaan Anda dengan lebih spesifik?",
                title: "Kalibrasi Sistem"
            }];
        }

        return actions;

    } catch (error) {
        console.error("Orchestrator Error:", error);
        return [{
            agent: AgentType.STRATEGIST,
            content: "Terjadi gangguan pada server analisis pusat. Mohon coba lagi.",
            title: "Connection Error"
        }];
    }
};

export const generateCollaborationIdeas = async (business: string, goal: string) => {
  const ai = getAI();
  const prompt = `Act as a Strategic Partnership Manager.
  Business: ${business}. Goal: ${goal}.
  
  FRAMEWORK: "Leverage & Access".
  Cari mitra yang memiliki "Access" ke audiens yang Anda inginkan, di mana Anda memiliki "Leverage" (nilai tawar).
  
  Berikan 3 Ide Kolaborasi Tak Terduga (Unconventional).
  Output JSON: [{partnerName, partnerType, mechanism (Taktik detail), benefit (Kalkulasi dampak)}]`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  
  return parseJSON(response.text || "[]");
};

export const analyzeSentiment = async (text: string): Promise<SentimentData> => {
  const ai = getAI();
  const prompt = `Act as a Consumer Psychologist. Analyze: "${text}".
  
  FRAMEWORK: "Iceberg Model".
  Apa yang dikatakan (permukaan) vs Apa yang sebenarnya dirasakan (bawah sadar).
  Identifikasi "Pain Point" tersembunyi.
  
  Output JSON: {score (0-100), sentiment, summary, actionableInsight (Solusi operasional konkret), keywords}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  return parseJSON(response.text || "{}");
};

export const analyzeLocation = async (base64Image: string, desc: string, coords?: {lat: number, lng: number}): Promise<LocationAnalysis> => {
    const ai = getAI();
    let promptText = `Act as a Property Investment Auditor.
    Subject: "${desc}". `;
    if (coords) promptText += ` GPS: ${coords.lat}, ${coords.lng}.`;
    
    promptText += `
    FRAMEWORK: "3L (Location, Logistics, Labor)".
    1. Location: Visibility & Accessibility.
    2. Logistics: Kemudahan loading/unloading? Parkir?
    3. Traffic Quality: Apakah orang lewat untuk belanja atau hanya lewat (commuting)?
    
    Analisis gambar untuk tanda-tanda daya beli (jenis mobil, kebersihan jalan, branding toko sekitar).
    Jadilah PESIMIS. Lindungi uang klien.
    
    Output JSON: {suitabilityScore, economicGrade, demographicFit, competitorAnalysis, strengths, weaknesses, recommendation}.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: promptText }
            ]
        },
        config: { responseMimeType: 'application/json' }
    });

    return parseJSON(response.text || "{}");
};

export const generateBrandAssets = async (name: string, vibe: string) => {
    const ai = getAI();
    const textPrompt = `Act as a Creative Director. Brand: "${name}", Vibe: "${vibe}".
    
    FRAMEWORK: "Brand Archetypes" (e.g., The Ruler, The Jester, The Caregiver).
    Tentukan Archetype brand ini dulu, lalu buat tagline yang sesuai suaranya.
    Jangan buat tagline pasaran. Harus punya "Attitude".
    
    Output JSON: { taglines (3 opsi berani), description (Storytelling dengan emosi) }.`;
    
    const textResponsePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: { responseMimeType: 'application/json' }
    });

    const imagePrompt = `Minimalist modern logo for "${name}", style: ${vibe}. High contrast, vector style, masterpiece, white background.`;
    const imageResponsePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
    });

    const [textResp, imageResp] = await Promise.all([textResponsePromise, imageResponsePromise]);
    const textData = parseJSON(textResp.text || "{}");
    
    let logoUrl = "";
    if (imageResp.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        logoUrl = `data:image/png;base64,${imageResp.candidates[0].content.parts[0].inlineData.data}`;
    }

    return { ...textData, logoUrl };
};

export const runSimulation = async (params: { price: number, marketingBudget: number, businessType: string, operationalCost: number }): Promise<SimResult> => {
    const ai = getAI();
    const prompt = `Act as a CFO (Chief Financial Officer).
    Simulasi: ${params.businessType}.
    Params: Price ${params.price}, Ads ${params.marketingBudget}, Ops ${params.operationalCost}.
    
    HITUNGAN:
    - Customer Acquisition Cost (CAC) estimasi industri.
    - Lifetime Value (LTV) estimasi.
    - Burn Rate bulanan.
    
    Skenario: "Winter is Coming" (Ekonomi lesu).
    Output JSON: {breakEvenPoint, roi, marketSaturation, riskLevel, chartData, strategicAdvice}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return parseJSON(response.text || "{}");
};