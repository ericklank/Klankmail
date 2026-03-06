const Anthropic = require('@anthropic-ai/sdk')
const { Pinecone } = require('@pinecone-database/pinecone')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    const index = pinecone.index(process.env.PINECONE_STORIES_INDEX || 'pitchiq-stories')
    const results = await index.query({
      vector: new Array(1536).fill(0),
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
    return res.status(200).json({ stories: [] })
  }
}
