/**
 * server/index.js
 * Updated to serve:
 *  - static files at root (public/)
 *  - /miniapp (legacy)
 *  - /manifest.json (serves manifest.json from repo root)
 *  - redirect / -> /miniapp/index.html
 */
import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

dotenv.config()
const app = express()
app.use(express.json())

// Basic rate limiter: 30 requests / 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 })
app.use('/api/confessions', limiter)

// Serve static files from /public at the site root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
app.use(express.static(PUBLIC_DIR))

// Also keep /miniapp path working (legacy)
app.use('/miniapp', express.static(PUBLIC_DIR))

// Serve manifest.json from project root so Farcaster can fetch it at /manifest.json
app.get('/manifest.json', async (req, res) => {
  try {
    const manifestPath = path.join(__dirname, '..', 'manifest.json')
    const data = await fs.readFile(manifestPath, 'utf8')
    // manifest.json should be valid JSON; serve with correct content-type
    res.setHeader('Content-Type', 'application/json')
    return res.send(data)
  } catch (err) {
    console.error('Error reading manifest.json', err)
    return res.status(404).send({ error: 'manifest not found' })
  }
})

// Optional: redirect root to miniapp entry
app.get('/', (req, res) => {
  res.redirect('/miniapp/index.html')
})

// Basic blocklist & moderation stub
const BLOCKLIST = ['doxtag', 'illegal-term']

function simpleModeration(text) {
  const lower = text.toLowerCase()
  for (const t of BLOCKLIST) if (lower.includes(t)) return { action: 'reject', reason: 'disallowed content' }
  // placeholder for ML moderation (call OpenAI moderation etc.)
  return { action: 'accept', score: 0.05 }
}

app.post('/api/confessions', async (req, res) => {
  try {
    const { content, image } = req.body
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' })
    if (content.length > 1000) return res.status(400).json({ error: 'Too long' })

    const mod = simpleModeration(content)
    if (mod.action === 'reject') return res.status(400).json({ error: mod.reason })

    // TODO: store to DB (Supabase), upload image to storage, moderation queue, post to Farcaster via server signer, etc.
    console.log('New confession:', { preview: content.slice(0,120), image, mod })

    return res.status(201).json({ ok: true, moderation: mod })
  } catch (err) {
    console.error('Server error', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
