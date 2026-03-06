module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password } = req.body
  if (password === process.env.APP_PASSWORD) {
    return res.status(200).json({
      user: { email: 'rep@pitchiq.app', name: 'Sales Rep', role: 'rep' }
    })
  }
  return res.status(401).json({ error: 'Invalid password' })
}
