const { Pinecone } = require('@pinecone-database/pinecone')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    const index = pinecone.index(process.env.PINECONE_ARTICLES_INDEX || 'pitchiq-articles')
    const results = await index.query({
      vector: new Array(1536).fill(0),
      topK: 5,
      includeMetadata: true
    })

    const articles = (results.matches || []).map(m => ({
      title: m.metadata?.title || '',
      url: m.metadata?.url || '',
      summary: m.metadata?.summary || '',
    }))

    return res.status(200).json({ articles })
  } catch (err) {
    console.error('search error:', err)
    return res.status(200).json({ articles: [] })
  }
}
