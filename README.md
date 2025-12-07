# Vistara/LokalNexus - AI Business Consultant for UMKM

**Platform konsultasi bisnis berbasis AI dengan Multi-Agent Orchestrator untuk membantu UMKM Indonesia mengambil keputusan strategis secara real-time.**

## 🎯 Konsep Utama

Vistara menggunakan **3 AI Agents** yang bekerja secara kolaboratif untuk memberikan solusi bisnis yang komprehensif:

### 1. **"Si Pemandu"** (The Strategist)
- 📊 Analisis situasi bisnis
- 🎯 Generate 3 misi harian yang actionable
- 💡 Strategic recommendations dengan expected impact
- ⚡ Fokus pada quick wins & ROI tinggi

### 2. **"Si Humas"** (The Creative & Marketing Agent)
- 🎨 **Reactive**: Auto-detect review buruk & generate apology response
- 🚀 **Proactive**: Deteksi hari besar & auto-generate poster promo
- ✍️ Marketing copywriting & brand storytelling
- 🖼️ AI-powered image generation untuk visual assets

### 3. **"Si Pencari"** (The Researcher)
- 🔍 Supplier search dengan price comparison
- 📅 Local event discovery (bazar, festival)
- 🏪 Competitor analysis
- 📊 Market insights & trend identification

## 🏗️ Arsitektur

### **Frontend** (Vite + React + TypeScript)
- Modern chat interface dengan glassmorphism design
- Real-time AI responses
- Multi-tab features (Chat, Brand AI, Sentiment Analysis, Location Intelligence, Collaboration)
- Responsive & mobile-friendly

### **Backend** (Firebase Cloud Functions - Serverless)
- **AI Orchestrator**: Intent analysis & smart agent routing
- **Multi-Agent System**: 1-3 agents dapat aktif bersamaan
- **Scheduled Jobs**: 
  - Review monitoring (every 30 min)
  - Event detection (daily 6 AM)
- **Firestore**: NoSQL database untuk conversations & tasks
- **Firebase Auth**: User authentication

### **AI Engine**
- Google Gemini 2.5 Flash untuk text generation
- Gemini Flash Image untuk poster/logo generation
- Advanced prompt engineering untuk setiap agent
- Context-aware conversations

## 🚀 Tech Stack

```
Frontend:  React 19 + TypeScript + Tailwind CSS + Vite
Backend:   Firebase Cloud Functions (Node.js 18)
AI:        Google Gemini 2.5 Flash + Gemini Image API
Database:  Cloud Firestore
Auth:      Firebase Authentication
Hosting:   Vercel (Frontend) + Firebase (Backend)
```

## 💡 Fitur Unggulan

### **Multi-Agent Orchestration**
User hanya mengirim 1 pesan, sistem otomatis mengaktifkan agent yang tepat:
```
Input: "Minggu ini sepi, omzet turun 20%"

Output:
├─ Si Pemandu: Diagnosis + 3 misi harian
├─ Si Pencari: Event lokal yang bisa dimanfaatkan
└─ Si Humas: Poster promo auto-generated
```

### **Proactive Intelligence**
- Auto-generate promo material untuk hari besar Indonesia
- Monitor review Google Maps secara otomatis
- Push notifications untuk bad reviews dengan draft apology

### **Actionable Insights**
- Bukan sekedar analisis, tapi **to-do list konkret**
- Estimasi dampak untuk setiap action
- Prioritization berdasarkan ROI

## 📊 Demo Scenario

**User Says:**
> "Minggu ini sepi banget, omzet turun 20%. Bantuin dong."

**Vistara Responds:**

**Si Pemandu (Strategist):**
```
📊 Analisis Cepat:
Penurunan traffic karena kompetitor baru di radius 500m

🎯 Misi Harian:
1. Buat promo bundling untuk clearance stok lama (Deadline: Hari ini)
2. Partnership dengan 3 warung kopi terdekat (Deadline: Besok)
3. Post 2x di Instagram dengan hashtag lokal (Deadline: Hari ini)

💰 Expected Impact: +20% traffic, clearance 30% slow-moving stock
```

**Si Pencari (Researcher):**
```
📅 Event Opportunity: Bazar Alun-Alun besok (8-9 Des)
🎯 Action: Daftar booth sekarang → [Link Pendaftaran]
💡 Potential: 500+ visitors, cocok untuk brand awareness
```

**Si Humas (Creative):**
```
🎨 Poster Promo Auto-Generated:
"FLASH SALE BAZAR SPECIAL - Buy 1 Get 1 Kopi Nusantara"
[AI-generated poster dengan branding bisnis user]

📝 Caption Ready-to-Post:
"Jangan lewatkan! Eksklusif di Bazar Alun-Alun..."
```

## 🎯 Target User

- **UMKM Indonesia** (warung, toko, café, retail)
- **Pemilik bisnis** yang butuh advisor tapi budget terbatas
- **Entrepreneur pemula** yang perlu guidance strategis

## 🔐 Security & Privacy

- API keys stored server-side (tidak exposed di frontend)
- Firestore security rules untuk user isolation
- Firebase Auth untuk authentication
- Rate limiting untuk prevent abuse

## 💰 Cost Efficiency

**Free Tier Coverage:**
- 2M Cloud Functions calls/month
- 50K Firestore reads/day
- Gemini API free tier
- **Estimasi:** $0-5/bulan untuk 100-1000 users

## 📈 Roadmap

- [ ] Google Maps API integration untuk real review monitoring
- [ ] Real web scraping dengan Puppeteer/Firecrawl
- [ ] WhatsApp Business integration
- [ ] Voice input & output
- [ ] Mobile app (React Native)
- [ ] Multi-language support (EN, ID)

## 🏆 Keunggulan Kompetitif

1. **Multi-Agent vs Single AI**: Lebih komprehensif & specialized
2. **Proactive vs Reactive**: Tidak menunggu user bertanya
3. **Actionable vs Informational**: To-do list, bukan essay
4. **Local Context**: Understand Indonesia UMKM ecosystem
5. **Serverless Architecture**: Auto-scale & cost-efficient

---

**Built with ❤️ for Indonesian UMKM**

*Vistara - Where AI meets Actionable Intelligence*
