import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { proposal, repProfile } = req.body

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Syne:wght@700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; color: #1a1a2e; padding: 48px 56px; font-size: 13px; line-height: 1.7; }
  h1 { font-family: 'Syne', sans-serif; font-size: 22px; margin-bottom: 4px; color: #0d0d1a; }
  .meta { color: #6b6b8a; font-size: 12px; margin-bottom: 32px; }
  .body { white-space: pre-wrap; color: #3a3a5c; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e0e0f0; font-size: 12px; color: #8b8ba8; }
  .footer strong { color: #3a3a5c; }
</style>
</head>
<body>
  <h1>Proposal</h1>
  <div class="meta">Prepared by ${repProfile?.name || 'Your Rep'}</div>
  <div class="body">${proposal || ''}</div>
  <div class="footer">
    <strong>${repProfile?.name || ''}</strong>
    ${repProfile?.title ? ` · ${repProfile.title}` : ''}
    <br>
    ${repProfile?.email || ''} · ${repProfile?.phone || ''}
  </div>
</body>
</html>`

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', margin: { top: '0', right: '0', bottom: '0', left: '0' } })
    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="proposal.pdf"')
    return res.send(pdf)
  } catch (err) {
    console.error('pdf error:', err)
    return res.status(500).json({ error: err.message })
  }
}
