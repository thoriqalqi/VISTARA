import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();

// Initialize Gemini AI Client
export function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    return new GoogleGenAI({ apiKey });
}

// Helper function to parse JSON from AI responses
export function parseJSON(text: string): any {
    try {
        if (!text) return {};
        const firstOpen = text.indexOf("{");
        const lastClose = text.lastIndexOf("}");
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error:", text.substring(0, 100));
        return {};
    }
}

// Types
export interface BusinessContext {
    businessName?: string;
    businessType?: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    currentSituation?: string;
    goals?: string[];
    challenges?: string[];
}

export interface AgentResponse {
    agent: "strategist" | "creative" | "researcher";
    title: string;
    content: string;
    data?: any;
}
