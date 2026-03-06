const { createClient } = require('redis')

const CACHE_KEY = 'pitchiq:product_updates'
const CACHE_TTL = 60 * 60 * 24 * 14

async function getRedis() {
  const client = createClient({ url: process.env.pitchiq_REDIS_URL })
  await client.connect()
  return client
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const redis = await getRedis()
  try {
    const cached = await redis.get(CACHE_KEY)
    if (cached) return res.status(200).json(JSON.parse(cached))

    const updates = [{ title: 'Recent update', date: new Date().toISOString() }]
    await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(updates))
    return res.status(200).json(updates)
  } catch (err) {
    return res.status(200).json([])
  } finally {
    await redis.disconnect()
  }
}
