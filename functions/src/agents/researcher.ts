import { getGeminiClient, parseJSON, AgentResponse } from "../utils";

/**
 * AGEN "SI PENCARI" - The Researcher Agent
 * 
 * Fungsi: Riset pasar dan mencari peluang eksternal
 * - Web scraping untuk supplier search
 * - Competitor analysis
 * - Local market insights
 * - Event discovery
 */

const RESEARCHER_PROMPT = `
PERAN:
Anda adalah "Si Pencari", market researcher yang detail dan data-driven.

FOKUS:
1. Find actionable opportunities (suppliers, events, partnerships)
2. Competitive intelligence (what competitors are doing)
3. Market trends (demand patterns, pricing)

PRINSIP:
- Data harus verified dan actionable
- Prioritaskan local/nearby results
- Berikan comparison jika ada multiple options

OUTPUT JSON:
{
  "findings": [
    {
      "type": "supplier" | "event" | "competitor" | "trend",
      "title": "Nama/judul",
      "description": "Deskripsi detail",
      "actionable": "What to do with this info",
      "source": "Sumber data",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendation": "Recommended next action based on findings"
}
`;

export async function findSuppliers(
    product: string,
    location?: string
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    // Note: For MVP, we'll use AI to simulate web scraping results
    // In production, integrate with actual scraping tool (Puppeteer/Firecrawl)

    const prompt = `
TUGAS: Cari supplier/distributor untuk produk "${product}"
${location ? `Lokasi: ${location}` : "Lokasi: Indonesia"}

INSTRUKSI:
Berdasarkan pengetahuan Anda tentang marketplace dan distributor Indonesia:
1. Berikan 3-5 opsi supplier yang reliable
2. Include estimasi harga (jika memungkinkan)
3. Sertakan cara kontak

${RESEARCHER_PROMPT}

IMPORTANT: Set type: "supplier" untuk semua findings
  `;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 2000,
                temperature: 0.3,
            },
        });

        const data = parseJSON(response.text || "{}");

        let content = `🔍 **Hasil Pencarian Supplier: ${product}**\n\n`;

        if (data.findings && data.findings.length > 0) {
            data.findings.forEach((finding: any, index: number) => {
                content += `**${index + 1}. ${finding.title}**\n`;
                content += `   ${finding.description}\n`;
                content += `   ✅ Action: ${finding.actionable}\n`;
                if (finding.source) {
                    content += `   📌 Source: ${finding.source}\n`;
                }
                content += `\n`;
            });
        }

        content += `💡 **Rekomendasi:**\n${data.recommendation || "Hubungi supplier prioritas tinggi terlebih dahulu."}`;

        return {
            agent: "researcher",
            title: `Supplier Search - ${product}`,
            content,
            data,
        };
    } catch (error) {
        console.error("Researcher Agent Error:", error);
        return {
            agent: "researcher",
            title: "Error",
            content: "Maaf, pencarian supplier mengalami gangguan. Coba lagi sebentar.",
        };
    }
}

export async function discoverLocalEvents(
    location: { lat: number; lng: number; address: string }
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    const prompt = `
TUGAS: Temukan event/bazar lokal yang bisa dimanfaatkan untuk promosi bisnis
Lokasi: ${location.address}
Koordinat: ${location.lat}, ${location.lng}

INSTRUKSI:
Berdasarkan pengetahuan tentang event umum di Indonesia dan lokasi tersebut:
1. Identifikasi event yang relevan untuk UMKM (bazar, festival, hari besar)
2. Berikan info praktis (tanggal, lokasi, cara daftar)
3. Estimasi potential benefit

${RESEARCHER_PROMPT}

IMPORTANT: Set type: "event" untuk semua findings
  `;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 1500,
                temperature: 0.4,
            },
        });

        const data = parseJSON(response.text || "{}");

        let content = `📅 **Event Opportunities di ${location.address}**\n\n`;

        if (data.findings && data.findings.length > 0) {
            data.findings.forEach((finding: any, index: number) => {
                const priorityEmoji = finding.priority === "high" ? "⭐" :
                    finding.priority === "medium" ? "✨" : "💫";
                content += `${priorityEmoji} **${finding.title}**\n`;
                content += `   ${finding.description}\n`;
                content += `   🎯 ${finding.actionable}\n\n`;
            });
        }

        content += `💡 **Recommendation:**\n${data.recommendation}`;

        return {
            agent: "researcher",
            title: "Local Events Discovery",
            content,
            data,
        };
    } catch (error) {
        console.error("Event Discovery Error:", error);
        return {
            agent: "researcher",
            title: "Error",
            content: "Maaf, pencarian event mengalami gangguan.",
        };
    }
}

export async function analyzeCompetitors(
    businessType: string,
    location: string
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    const prompt = `
TUGAS: Analisis kompetitor untuk bisnis ${businessType} di area ${location}

INSTRUKSI:
1. Identifikasi competitor landscape
2. Analyze strengths & weaknesses
3. Find differentiation opportunities

${RESEARCHER_PROMPT}

IMPORTANT: Set type: "competitor" untuk findings
  `;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 1500,
                temperature: 0.3,
            },
        });

        const data = parseJSON(response.text || "{}");

        let content = `🎯 **Competitor Analysis - ${businessType}**\n\n`;

        if (data.findings && data.findings.length > 0) {
            data.findings.forEach((finding: any, index: number) => {
                content += `**${index + 1}. ${finding.title}**\n`;
                content += `   ${finding.description}\n`;
                content += `   💡 Insight: ${finding.actionable}\n\n`;
            });
        }

        content += `🚀 **Strategic Recommendation:**\n${data.recommendation}`;

        return {
            agent: "researcher",
            title: "Competitor Intelligence",
            content,
            data,
        };
    } catch (error) {
        console.error("Competitor Analysis Error:", error);
        return {
            agent: "researcher",
            title: "Error",
            content: "Maaf, analisis kompetitor mengalami gangguan.",
        };
    }
}
