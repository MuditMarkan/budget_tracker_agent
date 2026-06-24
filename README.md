<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6439a69e-58ec-4ef6-a23d-443159a8421e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Run the app:
   `npm run dev`

## Deploy to GitHub / Cloud Hosting

When deploying this app to a hosting platform (GitHub Codespaces, Render, Railway, Fly.io, etc.), you must set the `GEMINI_API_KEY` as an environment variable in your hosting platform's dashboard or deployment configuration.

### Option A: GitHub Codespaces / GitHub Actions
Set the secret in your GitHub repository:
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your actual Gemini API key
5. In your deployment workflow, reference it as `${{ secrets.GEMINI_API_KEY }}`

### Option B: General Cloud Platform (Render, Railway, Fly.io, etc.)
Set the environment variable in your platform's dashboard:
1. Navigate to your service settings
2. Find the **Environment Variables** or **Secrets** section
3. Add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
4. Redeploy your application

### Option C: Self-Hosted Server
Set the environment variable in your server environment:
```bash
export GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important Notes:**
- Never commit your `.env` file to version control (it is already in `.gitignore`)
- The `.env.example` file is a template only — it contains no real credentials
- The `GEMINI_API_KEY` is required for AI-powered features (Phase 3: AI Financial Advisory)
