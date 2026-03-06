export default async function handler(req, res) {
  // Verify cron secret
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Trigger re-ingest of support articles
    await fetch(`${process.env.VERCEL_URL || 'http://localhost:3001'}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'crawl' })
    })
    return res.status(200).json({ ok: true, ran: new Date().toISOString() })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
