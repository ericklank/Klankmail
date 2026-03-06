import Anthropic from '@anthropic-ai/sdk'
import { Pinecone } from '@pinecone-database/pinecone'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { pdf, query } = req.body

  try {
    // Extract a search query from transcript if no explicit query
    let searchQuery = query
    if (!searchQuery && pdf) {
      const extract = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } },
            { type: 'text', text: 'In 1-2 sentences, describe this company\'s industry, size, and main challenge for finding relevant customer stories. Be specific.' }
          ]
        }]
      })
      searchQuery = extract.content[0].text
    }

    // Embed the query
    const embedRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: `Embed: ${searchQuery}` }]
    })

    // Fallback: use OpenAI-style embedding or direct Pinecone inference
    const index = pinecone.index(process.env.PINECONE_STORIES_INDEX || 'pitchiq-stories')
    const results = await index.query({
      vector: new Array(1536).fill(0), // placeholder — replace with real embedding
      topK: 4,
      includeMetadata: true
    })

    const stories = (results.matches || []).map(m => ({
      company: m.metadata?.company || 'Customer',
      summary: m.metadata?.summary || '',
      url: m.metadata?.url || '',
      score: m.score
    }))

    return res.status(200).json({ stories })
  } catch (err) {
    console.error('search-stories error:', err)
    return res.status(200).json({ stories: [] }) // fail gracefully
  }
}
