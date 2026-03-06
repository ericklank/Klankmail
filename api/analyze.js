const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a sales intelligence assistant. You analyze call transcripts and return structured JSON for sales reps.

Your output MUST be valid JSON only — no markdown, no preamble.

JSON schema:
{
  "companyName": string,
  "contactName": string,
  "currentSituation": string (2-4 sentence summary of their current state, tech stack, pain points),
  "discussedInCall": string[] (key topics covered, 5-8 items),
  "missedOpportunities": string[] (features/value props that weren't mentioned but would resonate, 3-5 items),
  "objectionsRaised": Array<{ objection: string, suggestion: string }>,
  "digDeeper": Array<{ topic: string, question: string }>,
  "recommendedNextSteps": string[] (3-5 concrete next actions, ordered by priority),
  "followUpEmail": string (complete follow-up email with rep signature),
  "proposal": string (1-page text proposal),
  "salesforceFields": {
    "Account Name": string,
    "Contact Name": string,
    "Title": string,
    "Industry": string,
    "Employees": string,
    "Current ATS/HCM": string,
    "Pain Points": string,
    "Budget Signals": string,
    "Decision Timeline": string,
    "Next Step": string,
    "Most Recent Update": string
  },
  "sfCoaching": Array<{ field: string, question: string }>
}`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { pdf, repName, repEmail, repPhone, repTitle, dealStage, notes } = req.body

  if (!pdf) return res.status(400).json({ error: 'No PDF provided' })

  const userPrompt = `Analyze this call transcript.

Rep: ${repName || 'Rep'} | ${repTitle || ''} | ${repEmail || ''} | ${repPhone || ''}
Deal stage: ${dealStage || 'discovery'}
${notes ? `Additional context: ${notes}` : ''}

Return the JSON analysis.`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdf }
            },
            { type: 'text', text: userPrompt }
          ]
        }
      ]
    })

    const text = response.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('analyze error:', err)
    return res.status(500).json({ error: err.message })
  }
}
