# Local Development Setup - Vistara/LokalNexus

## 🎯 Running Backend Locally with Firebase Emulator

Karena kita skip deployment production, kita akan run backend local untuk demo dan testing.

### Setup Firebase Emulator

1. **Install Firebase Emulator** (sudah termasuk di firebase-tools):
   ```bash
   # Sudah installed via npm install -g firebase-tools
   ```

2. **Start Emulator**:
   ```bash
   cd c:\Users\ADVAN\OneDrive\Documents\Build\Vistara-Project
   firebase emulators:start
   ```

   Ini akan start:
   - **Functions**: http://localhost:5001
   - **Firestore**: http://localhost:8080
   - **Auth**: http://localhost:9099
   - **Emulator UI**: http://localhost:4000

### Using Emulator with Frontend

Frontend Vite yang sudah ada perlu diubah untuk call local Functions instead of production Gemini API.

**Option 1: Keep Gemini Direct (Simple)**
- Frontend tetap call Gemini API langsung
- Backend local standby untuk testing
- Zero code change needed

**Option 2: Use Local Functions (Full Backend Integration)**
- Frontend call local Functions at http://localhost:5001
- Butuh update `geminiService.ts`
- Full end-to-end testing

## 🔧 Quick Integration (Option 2)

### Update Frontend to Use Local Functions

File: `services/geminiService.ts`

```typescript
// Add this at the top
const USE_LOCAL_BACKEND = true; // Set to false untuk direct Gemini
const LOCAL_FUNCTIONS_URL = "http://localhost:5001/vistara-nexus/asia-southeast1";

// Replace sendMessageToOrchestrator
export async function sendMessageToOrchestrator(history: AgentAction[], newMessage: string) {
  if (USE_LOCAL_BACKEND) {
    // Call local Cloud Function
    const response = await fetch(`${LOCAL_FUNCTIONS_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          message: newMessage,
          // conversationId: optional
        }
      })
    });
    
    const result = await response.json();
    return result.result.responses; // Cloud Function returns {result: {responses: []}}
  }
  
  // Original direct Gemini call (fallback)
  // ... existing code ...
}
```

## 🎬 Demo Flow

**Terminal 1** - Backend:
```bash
firebase emulators:start
```

**Terminal 2** - Frontend:
```bash
npm run dev
```

**Browser**:
- http://localhost:3000 (frontend)
- http://localhost:4000 (emulator UI untuk monitoring)

**Test Chat**:
1. Buka http://localhost:3000
2. Ketik: "Halo, saya punya bisnis kopi. Omzet turun 20%"
3. Backend orchestrator akan activate 2-3 agents
4. See multi-agent response!

## 🐛 Troubleshooting

**Error: "Port already in use"**
- Kill process di port yang conflict
- Atau ubah port di `firebase.json`

**Error: "Auth not configured"**
- Emulator tidak butuh real Firebase Auth
- Bisa mock user ID untuk testing

**Functions not updating**
- Restart emulator setiap kali edit functions code
- Atau run dengan `--only functions`
