# Nigerian Legal Research — deployable prototype

A research-memo tool for Nigerian lawyers: enter a court/area of law, a legal
issue, and the key facts, and it generates a structured first-pass memo
(Issue Summary, Relevant Law, Key Case Law, Analysis, Gaps & Next Steps).

**This is a prototype, not production-ready.** Case law comes from the AI
model's own knowledge, not a verified database — every citation must be
checked before real use. See "What's still missing" below.

## Deploy it live (free, ~10 minutes)

1. **Get an Anthropic API key**
   Sign up at https://console.anthropic.com and create an API key.
   Note: this is a paid API — you're billed per use, separate from any
   Claude.ai subscription.

2. **Push this folder to GitHub**
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Create a new repo on GitHub, then push to it.

3. **Deploy on Vercel**
   - Go to https://vercel.com, sign up (free), click "Add New Project"
   - Import your GitHub repo
   - In the project's **Environment Variables** settings, add:
     `ANTHROPIC_API_KEY` = your key from step 1
   - Click Deploy

That's it — Vercel will give you a live URL like
`nigerian-legal-research.vercel.app` you can share with test users.

## Local development

```
npm install
cp .env.example .env   # add your real key to .env
npm run dev
```
Note: `npm run dev` runs the frontend only. To test the `/api/research`
serverless function locally, install the Vercel CLI (`npm i -g vercel`) and
run `vercel dev` instead.

## Project structure

```
src/App.jsx        → the UI (form + memo display)
api/research.js     → serverless function; holds the API key server-side,
                       calls Anthropic, returns the memo
```

The frontend never talks to Anthropic directly — it calls your own
`/api/research` endpoint, which holds the key securely. Never move the API
key into frontend code; anyone could read it and run up your bill.

## What's still missing before you sell this

- **Verified case law data.** Right now citations come from the model's
  memory, which can be wrong. Before charging anyone, look into a real
  Nigerian case law source (e.g. LawPavilion) to ground citations in fact.
- **Accounts.** No login yet — anyone with the URL can use it and consume
  your API budget. Add auth (e.g. Clerk or Supabase Auth) before sharing
  the link widely.
- **Payments.** No billing yet — add Paystack (built for Nigeria) or Stripe
  once you have people willing to pay.
- **Rate limiting.** Without accounts, add basic rate limiting to the
  serverless function to avoid a runaway API bill.
