# AnonCast Mini App — Scaffold

Ringkasan:
- Mini app frontend di `public/` (index.html + main.js) yang memanggil `sdk.actions.ready()` dan POST `/api/confessions`.
- Server di `server/index.js` (Express) yang melayani static `public/` dan endpoint `/api/confessions` (stub moderation + logging).
- `manifest.json` untuk Farcaster Mini App discovery/embed.

Persyaratan:
- Node.js >= 22.11.0
- npm (atau pnpm/yarn)

Langkah cepat (development):
1. Salin file scaffold ini ke folder baru, lalu di terminal:
   npm install

2. Buat salinan file .env.example → .env dan edit jika perlu.

3. Jalankan server:
   npm start

   Server akan jalan di http://localhost:3000 dan melayani:
   - http://localhost:3000/miniapp/index.html (entry)
   - POST http://localhost:3000/api/confessions

4. (Dev preview di Farcaster) Jika mau preview di Warpcast dev tool:
   - Gunakan cloudflared: `cloudflared tunnel --url http://localhost:3000`
   - Buka URL tunnel yang diberikan, buka sekali di browser
   - Di Farcaster Developer Tools (Enable Developer Mode), Paste manifest URL:
     https://<tunnel-domain>/manifest.json
   - Klik Preview

Catatan penting:
- Jangan menyimpan private key di frontend.
- Endpoint `/api/confessions` saat ini stub. Untuk produksi:
  - Tambah rate-limiting, reCAPTCHA/Turnstile, automated moderation (OpenAI/whatever), upload image handling, simpan ke DB (Supabase), dan post ke Farcaster dari server-side signer.
- Untuk produksi host di domain HTTPS (Vercel/Netlify) dan pastikan manifest.domain sesuai.

Jika mau, aku bisa:
- A. Tambah fitur admin UI (non-kode spec atau simple page).
- B. Tambah server logic untuk upload images ke Supabase Storage.
- C. Implementasi server-side Farcaster post function (I will show exact code but will NOT run private key — you run locally)  

Pilih A/B/C atau bilang “lanjutkan deploy” dan aku bantu langkah berikutnya.