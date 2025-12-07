import { getGeminiClient, parseJSON, BusinessContext, AgentResponse } from "../utils";

/**
 * AGEN "SI PEMANDU" - The Strategist Agent
 * 
 * Fungsi: Konsultan bisnis harian yang mengubah data analitik menjadi actionable tasks
 * - Analisis situasi bisnis
 * - Generate 3 misi harian yang spesifik dan actionable
 * - Memberikan strategic insights
 */

const STRATEGIST_PROMPT = `
PERAN:
Anda adalah "Si Pemandu", konsultan bisnis UMKM yang pragmatis dan action-oriented.

PRINSIP:
1. Fokus pada ACTIONABLE STEPS, bukan analisis panjang
2. Setiap saran harus SPESIFIK dan bisa dilakukan HARI INI
3. Prioritaskan quick wins dengan ROI tinggi

TUGAS:
Berdasarkan situasi bisnis user, berikan:
1. Quick Analysis (1-2 kalimat diagnosis masalah)
2. 3 Misi Harian (spesifik, actionable, prioritized)
3. Expected Impact (kalkulasi kasar hasil yang bisa dicapai)

OUTPUT JSON:
{
  "quickAnalysis": "Diagnosis singkat masalah utama",
  "dailyMissions": [
    {
      "priority": 1,
      "title": "Judul misi",
      "action": "Action spesifik yang harus dilakukan",
      "why": "Alasan kenapa ini penting",
      "deadline": "Kapan harus selesai (hari ini/besok/minggu ini)"
    }
  ],
  "expectedImpact": "Estimasi dampak jika misi dijalankan"
}
`;

export async function analyzeBusinessSituation(
    message: string,
    context: BusinessContext
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    const fullPrompt = `
KONTEKS BISNIS:
${context.businessName ? `Nama: ${context.businessName}` : ""}
${context.businessType ? `Jenis: ${context.businessType}` : ""}
${context.currentSituation ? `Situasi: ${context.currentSituation}` : ""}

PESAN USER:
"${message}"

${STRATEGIST_PROMPT}
  `;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 2000,
                temperature: 0.3,
            },
        });

        const data = parseJSON(response.text || "{}");

        let content = `📊 **Analisis Cepat:**\n${data.quickAnalysis || "Sedang menganalisis..."}\n\n`;

        content += `🎯 **Misi Harian Anda:**\n`;
        if (data.dailyMissions && data.dailyMissions.length > 0) {
            data.dailyMissions.forEach((mission: any, index: number) => {
                content += `\n**${index + 1}. ${mission.title}**\n`;
                content += `   📋 ${mission.action}\n`;
                content += `   💡 ${mission.why}\n`;
                content += `   ⏰ Deadline: ${mission.deadline}\n`;
            });
        }

        content += `\n💰 **Expected Impact:**\n${data.expectedImpact || ""}`;

        return {
            agent: "strategist",
            title: "Strategic Plan",
            content,
            data,
        };
    } catch (error) {
        console.error("Strategist Agent Error:", error);
        return {
            agent: "strategist",
            title: "Error",
            content: "Maaf, sedang ada gangguan dalam analisis strategis. Coba lagi sebentar.",
        };
    }
}
