import { getGeminiClient, parseJSON, BusinessContext, AgentResponse } from "../utils";

/**
 * AGEN "SI HUMAS" - The Creative & Marketing Agent
 * 
 * Fungsi: Menangani reputasi dan materi promosi secara otonom
 * REACTIVE: Deteksi review buruk & generate apology response
 * PROACTIVE: Deteksi hari besar & generate poster promo otomatis
 */

const CREATIVE_PROMPT = `
PERAN:
Anda adalah "Si Humas", creative director dan brand manager yang proaktif.

KAPABILITAS:
1. Reactive: Monitoring sentiment & crisis management
2. Proactive: Campaign planning & content creation
3. Creative: Visual concept & copywriting

PRINSIP:
- Selalu on-brand dan konsisten dengan voice bisnis
- Empati tinggi untuk customer feedback
- Creative tapi tetap practical untuk UMKM

OUTPUT JSON:
{
  "type": "promo" | "apology" | "announcement",
  "copy": "Caption / text content",
  "visualConcept": "Deskripsi konsep visual untuk poster",
  "targetAudience": "Target audience",
  "callToAction": "CTA yang jelas"
}
`;

export async function generatePromoAssets(
    event: { name: string; date?: string; context?: string },
    businessContext: BusinessContext
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    const prompt = `
KONTEKS BISNIS:
Nama: ${businessContext.businessName || "UMKM"}
Jenis: ${businessContext.businessType || "Retail"}

EVENT/OCCASION:
Nama: ${event.name}
${event.date ? `Tanggal: ${event.date}` : ""}
${event.context ? `Konteks: ${event.context}` : ""}

TUGAS:
Buat konsep promo yang menarik untuk event ini. Fokus pada:
1. Copy yang catchy dan relevan
2. Visual concept yang bisa dibuat sederhana
3. CTA yang jelas dan mendorong action

${CREATIVE_PROMPT}
  `;

    try {
        // Generate marketing copy
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 1500,
                temperature: 0.7, // Higher temperature for creativity
            },
        });

        const data = parseJSON(response.text || "{}");

        // Generate poster image
        let posterUrl = "";
        try {
            const imagePrompt = `
Professional promotional poster for ${businessContext.businessName || "local business"}
Event: ${event.name}
Style: Modern, eye-catching, Indonesian aesthetic
Visual concept: ${data.visualConcept || "Vibrant promotional design"}
Include: Business name, event title, attractive graphics
High quality, suitable for social media and print
      `.trim();

            const imageResponse = await gemini.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: { parts: [{ text: imagePrompt }] },
            });

            if (imageResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                posterUrl = `data:image/png;base64,${imageResponse.candidates[0].content.parts[0].inlineData.data}`;
            }
        } catch (imgError) {
            console.error("Image generation error:", imgError);
            // Continue without image
        }

        const content = `🎨 **Kampanye Promo: ${event.name}**\n\n` +
            `📝 **Copy:**\n${data.copy || ""}\n\n` +
            `🎯 **Target:** ${data.targetAudience || "General audience"}\n\n` +
            `💬 **Call to Action:**\n${data.callToAction || "Kunjungi sekarang!"}`;

        return {
            agent: "creative",
            title: `Promo Campaign - ${event.name}`,
            content,
            data: {
                ...data,
                posterUrl,
            },
        };
    } catch (error) {
        console.error("Creative Agent Error:", error);
        return {
            agent: "creative",
            title: "Error",
            content: "Maaf, sedang ada gangguan dalam pembuatan kampanye. Coba lagi sebentar.",
        };
    }
}

export async function generateApologyResponse(
    review: { rating: number; text: string; reviewer: string }
): Promise<AgentResponse> {
    const gemini = getGeminiClient();

    const prompt = `
SITUASI:
Ada review buruk dari customer:
Rating: ${review.rating}/5
Review: "${review.text}"
Reviewer: ${review.reviewer}

TUGAS:
Buatkan draft balasan yang:
1. Sopan dan empati tinggi
2. Acknowledge masalahnya specifically
3. Offer solution atau kompensasi
4. Professional tapi tetap warm

OUTPUT JSON:
{
  "apologyMessage": "Draft balasan lengkap",
  "internalNote": "Catatan untuk internal team tentang langkah perbaikan",
  "urgencyLevel": "high" | "medium" | "low"
}
  `;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 1000,
                temperature: 0.5,
            },
        });

        const data = parseJSON(response.text || "{}");

        const content = `⚠️ **Review Alert - Bintang ${review.rating}**\n\n` +
            `Reviewer: ${review.reviewer}\n` +
            `Review: "${review.text}"\n\n` +
            `📝 **Draft Balasan:**\n${data.apologyMessage}\n\n` +
            `🔧 **Action Item:**\n${data.internalNote}`;

        return {
            agent: "creative",
            title: "Review Response",
            content,
            data,
        };
    } catch (error) {
        console.error("Apology Response Error:", error);
        return {
            agent: "creative",
            title: "Error",
            content: "Maaf, gagal generate response untuk review.",
        };
    }
}
