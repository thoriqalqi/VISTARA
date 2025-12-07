# Vistara/LokalNexus - Firebase Deployment Guide

## 🚀 Quick Start Deployment

### Step 1: Create Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** atau **"Create a project"**
3. Nama project: `vistara-nexus` (atau nama lain yang Anda mau)
4. Enable Google Analytics: **Optional** (bisa skip untuk MVP)
5. Click **"Create project"** dan tunggu selesai

### Step 2: Enable Required Services

Di Firebase Console project Anda:

1. **Firestore Database:**
   - Pilih menu **"Build" → "Firestore Database"**
   - Click **"Create database"**
   - Pilih **"Start in production mode"** (security rules sudah kita setup)
   - Location: **asia-southeast1** (Singapura - closest to Indonesia)
   - Click **"Enable"**

2. **Authentication:**
   - Menu **"Build" → "Authentication"**
   - Click **"Get started"**
   - Enable **"Email/Password"** provider
   - Klik **"Save"**

3. **Cloud Functions:**
   - Otomatis enabled saat deploy
   - Perlu upgrade ke **Blaze Plan** (pay-as-you-go)
   - Jangan khawatir: FREE quota sangat besar!

### Step 3: Login Firebase CLI

Buka terminal di folder project, jalankan:

```bash
firebase login
```

Browser akan terbuka, login dengan Google account yang sama dengan Firebase Console.

### Step 4: Link Project

```bash
firebase use --add
```

Pilih project yang baru dibuat (`vistara-nexus`), beri alias `default`.

### Step 5: Set Environment Variables

```bash
cd functions
firebase functions:config:set gemini.api_key="AIzaSyC7vyCWgYiSs1uaHQQjZr_OXQpKw4Vse2w"
```

Optional (jika sudah punya Google Maps API key):
```bash
firebase functions:config:set google_maps.api_key="YOUR_MAPS_KEY_HERE"
```

### Step 6: Deploy!

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

Tunggu ~3-5 menit. Selesai! 🎉

---

## 🧪 Testing dengan Firebase Emulator (Local)

Untuk test tanpa deploy dulu:

```bash
# Start emulator
firebase emulators:start
```

Emulator UI: http://localhost:4000

Functions endpoint: http://localhost:5001

---

## 📝 Post-Deployment

Setelah deploy sukses, Anda akan dapat:

**Functions URLs:**
- `https://asia-southeast1-vistara-nexus.cloudfunctions.net/chat`
- `https://asia-southeast1-vistara-nexus.cloudfunctions.net/generateBrand`

**Test dengan cURL:**

```bash
# Test chat (needs authentication token)
curl -X POST https://asia-southeast1-vistara-nexus.cloudfunctions.net/chat \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"message": "Halo, saya punya bisnis kopi"}}'
```

---

## 🔧 Troubleshooting

**Error: "Billing account not configured"**
- Perlu upgrade ke Blaze Plan (pay-as-you-go)
- Masih FREE untuk usage kecil!

**Error: "Functions deployment failed"**
- Cek `npm run build` berhasil di functions folder
- Cek semua dependencies terinstall

**Error: "Permission denied"**
- Pastikan sudah `firebase login`
- Pastikan project ID benar

---

## 💰 Cost Monitoring

**Free Tier Mencakup:**
- 2,000,000 Cloud Functions invocations/month
- 50K Firestore reads, 20K writes per day
- Unlimited Authentication users

**Monitor Usage:**
Firebase Console → Usage and Billing
