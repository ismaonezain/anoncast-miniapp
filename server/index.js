/**
 * Simple Express server:
 * - serves static files from ../public at /miniapp
 * - provides POST /api/confessions (basic moderation stub)
 *
 * For production: replace stub with real moderation, storage, DB, and Farcaster posting.
 */
import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
app.use(express.json())

// Basic rate limiter: 30 requests / 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 })
app.use('/api/confessions', limiter)

// Serve static miniapp under /miniapp
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/miniapp', express.static(path.join(__dirname, '..', 'public')))

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
