import { createClient } from 'redis'

async function getRedis() {
  const client = createClient({ url: process.env.pitchiq_REDIS_URL })
  await client.connect()
  return client
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'No ID' })

  const redis = await getRedis()
  try {
    const data = await redis.get(`report:${id}`)
    if (!data) return res.status(404).json({ error: 'Report not found' })
    return res.status(200).json(JSON.parse(data))
  } finally {
    await redis.disconnect()
  }
}
