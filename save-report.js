import { createClient } from 'redis'

async function getRedis() {
  const client = createClient({ url: process.env.pitchiq_REDIS_URL })
  await client.connect()
  return client
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { report } = req.body
  if (!report) return res.status(400).json({ error: 'No report data' })

  const id = generateId()
  const redis = await getRedis()

  try {
    await redis.setEx(`report:${id}`, 60 * 60 * 24 * 30, JSON.stringify(report)) // 30-day TTL
    return res.status(200).json({ id })
  } finally {
    await redis.disconnect()
  }
}
