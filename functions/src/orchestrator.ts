import { getGeminiClient, parseJSON, BusinessContext, AgentResponse } from "./utils";
import { analyzeBusinessSituation } from "./agents/strategist";
import { generatePromoAssets, generateApologyResponse } from "./agents/creative";
import { findSuppliers, discoverLocalEvents, analyzeCompetitors } from "./agents/researcher";

/**
 * AI ORCHESTRATOR
 * 
 * Main intelligence that analyzes user messages and routes to appropriate agents
 * Can activate 1-3 agents based on the intent analysis
 */

const ORCHESTRATOR_SYSTEM = `
Anda adalah AI Orchestrator untuk LokalNexus, sistem Multi-Agent untuk UMKM.

AGEN YANG TERSEDIA:
1. STRATEGIST (Si Pemandu) - Business strategy, daily missions, action plans
2. CREATIVE (Si Humas) - Marketing, promo materials, review responses  
3. RESEARCHER (Si Pencari) - Supplier search, event discovery, competitor analysis

TUGAS ANDA:
Analisis pesan user dan tentukan agen mana yang harus dipanggil.

RULES:
- Bisa activate 1-3 agents sekaligus jika diperlukan
- STRATEGIST hampir selalu active untuk memberikan context
- CREATIVE jika ada mention tentang promosi, marketing, customer feedback
- RESEARCHER jika user butuh cari supplier, event, atau competitor info

OUTPUT JSON:
{
  "intent": "Summarize what user needs",
  "agents_to_activate": ["strategist", "creative", "researcher"],
  "context_extraction": {
    "businessName": "extracted if mentioned",
    "businessType": "extracted if mentioned",
    "currentSituation": "extracted situation/problem",
    "specificRequest": "specific thing user is asking"
  }
}
`;

export async function orchestrate(
    message: string,
    userId: string,
    conversationContext?: BusinessContext
): Promise<{
    agents: AgentResponse[];
    context: BusinessContext;
}> {
    const gemini = getGeminiClient();

    // Step 1: Analyze Intent
    const intentPrompt = `
RIWAYAT KONTEKS (jika ada):
${conversationContext ? JSON.stringify(conversationContext, null, 2) : "Belum ada konteks sebelumnya"}

PESAN BARU USER:
"${message}"

${ORCHESTRATOR_SYSTEM}
  `;

    let intent: any = {};
    try {
        const intentResponse = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: intentPrompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 1000,
                temperature: 0.2,
            },
        });

        intent = parseJSON(intentResponse.text || "{}");
    } catch (error) {
        console.error("Intent analysis error:", error);
        // Default fallback: activate strategist
        intent = {
            agents_to_activate: ["strategist"],
            context_extraction: {},
        };
    }

    // Step 2: Update Business Context
    const updatedContext: BusinessContext = {
        ...conversationContext,
        ...intent.context_extraction,
        currentSituation: intent.context_extraction?.currentSituation || message,
    };

    // Step 3: Route to Agents
    const agents_to_call = intent.agents_to_activate || ["strategist"];
    const agentPromises: Promise<AgentResponse>[] = [];

    for (const agentName of agents_to_call) {
        switch (agentName) {
            case "strategist":
                agentPromises.push(analyzeBusinessSituation(message, updatedContext));
                break;

            case "creative":
                // Determine if promo or apology
                if (message.toLowerCase().includes("review") || message.toLowerCase().includes("komplain")) {
                    // Apology mode (simplified for MVP)
                    agentPromises.push(
                        generateApologyResponse({
                            rating: 2,
                            text: intent.context_extraction?.specificRequest || message,
                            reviewer: "Customer",
                        })
                    );
                } else {
                    // Promo mode
                    agentPromises.push(
                        generatePromoAssets(
                            {
                                name: intent.context_extraction?.specificRequest || "Event Promo",
                                context: message,
                            },
                            updatedContext
                        )
                    );
                }
                break;

            case "researcher":
                // Determine research type
                if (message.toLowerCase().includes("supplier") || message.toLowerCase().includes("cari")) {
                    const product = intent.context_extraction?.specificRequest || "produk";
                    agentPromises.push(findSuppliers(product, updatedContext.location?.address));
                } else if (message.toLowerCase().includes("event") || message.toLowerCase().includes("bazar")) {
                    if (updatedContext.location) {
                        agentPromises.push(discoverLocalEvents(updatedContext.location));
                    }
                } else {
                    // Competitor analysis
                    agentPromises.push(
                        analyzeCompetitors(
                            updatedContext.businessType || "Retail",
                            updatedContext.location?.address || "Indonesia"
                        )
                    );
                }
                break;
        }
    }

    // Step 4: Await All Agent Responses
    const agentResponses = await Promise.all(agentPromises);

    return {
        agents: agentResponses,
        context: updatedContext,
    };
}
