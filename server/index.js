import express from 'express'
import cors from 'cors'
import supabaseRouter from './supabase.js'

const app = express()
app.use(express.json())
app.use(cors({ origin: '*', methods: ['GET','POST','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }))

const PORT = process.env.PORT || 5175
const YELP_API_KEY = process.env.YELP_API_KEY
const YELP_API_BASE = 'https://api.yelp.com/v3'

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Yelp proxy: search businesses
app.get('/api/yelp/businesses/search', async (req, res) => {
  if (!YELP_API_KEY) return res.status(500).json({ error: 'YELP_API_KEY missing' })
  const url = new URL(`${YELP_API_BASE}/businesses/search`)
  for (const [k, v] of Object.entries(req.query)) {
    if (v != null) url.searchParams.append(k, String(v))
  }
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  })
  const body = await resp.text()
  res.status(resp.status).type('application/json').send(body)
})

// Yelp proxy: business details
app.get('/api/yelp/businesses/:id', async (req, res) => {
  if (!YELP_API_KEY) return res.status(500).json({ error: 'YELP_API_KEY missing' })
  const resp = await fetch(`${YELP_API_BASE}/businesses/${req.params.id}`, {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  })
  const body = await resp.text()
  res.status(resp.status).type('application/json').send(body)
})

// Yelp proxy: reviews
app.get('/api/yelp/businesses/:id/reviews', async (req, res) => {
  if (!YELP_API_KEY) return res.status(500).json({ error: 'YELP_API_KEY missing' })
  const resp = await fetch(`${YELP_API_BASE}/businesses/${req.params.id}/reviews`, {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  })
  const body = await resp.text()
  res.status(resp.status).type('application/json').send(body)
})

// Supabase routes
app.use('/api', supabaseRouter)

app.listen(PORT, () => {
  console.log(`Backend proxy listening on http://localhost:${PORT}`)
})
