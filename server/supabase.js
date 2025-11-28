import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

let supabase = null
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

router.get('/favorites', async (req, res) => {
  if (!supabase) return res.status(501).json({ error: 'Supabase not configured' })
  const userId = String(req.query.user_id || '')
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.post('/favorites', async (req, res) => {
  if (!supabase) return res.status(501).json({ error: 'Supabase not configured' })
  const { user_id, business_id } = req.body || {}
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id, business_id })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/favorites', async (req, res) => {
  if (!supabase) return res.status(501).json({ error: 'Supabase not configured' })
  const { user_id, business_id } = req.body || {}
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user_id)
    .eq('business_id', business_id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

router.get('/favorites/check', async (req, res) => {
  if (!supabase) return res.status(501).json({ error: 'Supabase not configured' })
  const userId = String(req.query.user_id || '')
  const businessId = String(req.query.business_id || '')
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .single()
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message })
  res.json({ favorited: !!data })
})

export default router
