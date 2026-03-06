# PitchIQ

Sales intelligence for high-performance teams. Upload a call transcript → get a full post-call package in ~15 seconds.

## Stack
- React (Vite) frontend
- Vercel serverless functions (api/)
- Anthropic Claude API (analysis)
- Pinecone (vector search — articles + customer stories)
- Redis / Vercel KV (report sharing, update caching)

## Deploy to Vercel

1. Push repo to GitHub
2. Import to Vercel
3. Add environment variables (see `.env.example`)
4. Deploy

## Environment Variables

| Key | Description |
|-----|-------------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_ARTICLES_INDEX` | Index name for support articles |
| `PINECONE_STORIES_INDEX` | Index name for customer stories |
| `pitchiq_REDIS_URL` | Redis connection string |
| `APP_PASSWORD` | Shared team password (temporary — migrate to Clerk) |
| `CRON_SECRET` | Secret for cron job auth |

## Auth Migration (when ready)

The `useAuth` hook is designed to be swapped out for Clerk with minimal changes:
1. `npm install @clerk/clerk-react`
2. Wrap `<ClerkProvider>` in `main.jsx`
3. Replace `useAuth()` calls with `useUser()` from Clerk

## Repo Structure

```
api/          Vercel serverless functions
src/
  components/ Layout, shared UI
  hooks/      useAuth, useProfile
  pages/      Route-level components
  styles/     Global CSS design system
```
