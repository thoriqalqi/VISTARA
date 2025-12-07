import * as functions from "firebase-functions/v2";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "./utils";
import { orchestrate } from "./orchestrator";

/**
 * MAIN CLOUD FUNCTIONS ENTRY POINT
 * 
 * Exports all Cloud Functions for Firebase deployment
 */

// ============================================
// HTTP CALLABLE FUNCTIONS
// ============================================

/**
 * Main Chat Function - Multi-Agent Orchestrator
 * 
 * Called from frontend when user sends a message
 */
export const chat = onCall(
    {
        region: "asia-southeast1",
        timeoutSeconds: 60,
        memory: "512MiB",
    },
    async (request) => {
        // Authentication check
        if (!request.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User must be authenticated to use chat"
            );
        }

        const userId = request.auth.uid;
        const { message, conversationId } = request.data;

        if (!message || typeof message !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Message is required and must be a string"
            );
        }

        try {
            // Get conversation context
            let conversationContext: any = {};
            if (conversationId) {
                const convDoc = await db.collection("conversations").doc(conversationId).get();
                if (convDoc.exists) {
                    conversationContext = convDoc.data()?.context || {};
                }
            }

            // Get user profile for business context
            const userDoc = await db.collection("users").doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                conversationContext = {
                    ...conversationContext,
                    businessName: userData?.businessProfile?.name,
                    businessType: userData?.businessProfile?.type,
                    location: userData?.businessProfile?.location,
                };
            }

            // Call orchestrator
            const result = await orchestrate(message, userId, conversationContext);

            // Save to Firestore
            const newConvId = conversationId || db.collection("conversations").doc().id;

            await db.collection("conversations").doc(newConvId).set(
                {
                    userId,
                    context: result.context,
                    lastUpdated: new Date(),
                },
                { merge: true }
            );

            // Save messages
            const batch = db.batch();

            // User message
            batch.set(db.collection("conversations").doc(newConvId).collection("messages").doc(), {
                role: "user",
                content: message,
                timestamp: new Date(),
            });

            // Agent responses
            for (const agentResponse of result.agents) {
                batch.set(db.collection("conversations").doc(newConvId).collection("messages").doc(), {
                    role: agentResponse.agent,
                    title: agentResponse.title,
                    content: agentResponse.content,
                    data: agentResponse.data || null,
                    timestamp: new Date(),
                });
            }

            await batch.commit();

            return {
                conversationId: newConvId,
                responses: result.agents,
                updatedContext: result.context,
            };
        } catch (error: any) {
            console.error("Chat function error:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Failed to process message",
                error.message
            );
        }
    }
);

/**
 * Generate Brand Assets Function
 * 
 * For direct brand generation (separate from chat)
 */
export const generateBrand = onCall(
    {
        region: "asia-southeast1",
        timeoutSeconds: 90,
        memory: "1GiB",
    },
    async (request) => {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Authentication required");
        }

        const { name, vibe } = request.data;

        if (!name || !vibe) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Name and vibe are required"
            );
        }

        try {
            const { generatePromoAssets } = await import("./agents/creative");

            const result = await generatePromoAssets(
                { name: `Brand: ${name}`, context: vibe },
                { businessName: name }
            );

            return result.data;
        } catch (error: any) {
            console.error("Generate brand error:", error);
            throw new functions.https.HttpsError("internal", "Brand generation failed", error.message);
        }
    }
);

// ============================================
// SCHEDULED FUNCTIONS (Background Jobs)
// ============================================

/**
 * Review Monitoring Job
 * Runs every 30 minutes to check for new Google Maps reviews
 */
export const monitorReviews = onSchedule(
    {
        schedule: "every 30 minutes",
        timeZone: "Asia/Jakarta",
        region: "asia-southeast1",
        memory: "256MiB",
    },
    async (event) => {
        console.log("Review monitoring job started");

        try {
            // Get all users with Google Maps integration
            const usersSnapshot = await db
                .collection("users")
                .where("businessProfile.googleMapsPlaceId", "!=", null)
                .get();

            console.log(`Monitoring ${usersSnapshot.size} businesses`);

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const placeId = userData.businessProfile?.googleMapsPlaceId;

                if (!placeId) continue;

                // TODO: Integrate with Google Maps API to fetch reviews
                // For MVP, this is a placeholder
                console.log(`Checking reviews for ${userData.businessProfile.name}`);

                // When bad review is detected:
                // 1. Generate apology response using Creative agent
                // 2. Save notification to Firestore
                // 3. Send push notification (optional)
            }

            console.log("Review monitoring completed");
        } catch (error) {
            console.error("Review monitoring error:", error);
        }
    }
);

/**
 * Event Detection Job
 * Runs daily at 6 AM to detect special days and events
 */
export const detectEvents = onSchedule(
    {
        schedule: "every day 06:00",
        timeZone: "Asia/Jakarta",
        region: "asia-southeast1",
        memory: "256MiB",
    },
    async (event) => {
        console.log("Event detection job started");

        try {
            const today = new Date();
            const specialDays = checkSpecialDays(today);

            if (specialDays.length > 0) {
                console.log(`Special days detected: ${specialDays.map(d => d.name).join(", ")}`);

                // Get all active users
                const usersSnapshot = await db.collection("users").limit(100).get();

                for (const userDoc of usersSnapshot.docs) {
                    const userData = userDoc.data();

                    for (const specialDay of specialDays) {
                        // Generate promo materials
                        const { generatePromoAssets } = await import("./agents/creative");

                        const promoResult = await generatePromoAssets(
                            { name: specialDay.name, date: specialDay.date },
                            {
                                businessName: userData.businessProfile?.name,
                                businessType: userData.businessProfile?.type,
                            }
                        );

                        // Save notification
                        await db.collection("notifications").add({
                            userId: userDoc.id,
                            type: "promo_suggestion",
                            title: `Promo Idea: ${specialDay.name}`,
                            data: promoResult.data,
                            read: false,
                            createdAt: new Date(),
                        });
                    }
                }
            }

            console.log("Event detection completed");
        } catch (error) {
            console.error("Event detection error:", error);
        }
    }
);

// Helper function to check for special days
function checkSpecialDays(date: Date): Array<{ name: string; date: string }> {
    const specialDays: Array<{ name: string; date: string }> = [];
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Indonesian special days
    const holidays: Record<string, string> = {
        "1-1": "Tahun Baru",
        "8-17": "Kemerdekaan Indonesia",
        "12-25": "Natal",
        // Add more holidays
    };

    const key = `${month}-${day}`;
    if (holidays[key]) {
        specialDays.push({
            name: holidays[key],
            date: date.toISOString().split("T")[0],
        });
    }

    // Check upcoming days (3 days ahead)
    const upcoming = new Date(date);
    upcoming.setDate(date.getDate() + 3);
    const upcomingKey = `${upcoming.getMonth() + 1}-${upcoming.getDate()}`;
    if (holidays[upcomingKey]) {
        specialDays.push({
            name: `Persiapan ${holidays[upcomingKey]}`,
            date: upcoming.toISOString().split("T")[0],
        });
    }

    return specialDays;
}
