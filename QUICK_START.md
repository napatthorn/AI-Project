# ?? Quick Start - AI Image Generator

## ? Ready to Use
Your text-to-image app is ready!

## ? Quick Setup (2 min)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file with your API keys:
```
GITHUB_TOKEN=your_github_token_here
ACCOUNT_ID=your_cloudflare_account_id_here
CF_TOKEN=your_cloudflare_api_token_here
PORT=3000
```

### 3. Build and Run
```bash
npm run build
npm start
```

### 4. Open Browser
```
http://localhost:3000
```

## ?? Usage
1. Enter your image idea
2. Click "Next with AI" to enhance (or "Next" to skip)
3. Edit the prompt if needed
4. Click "Generate Image"
5. Download your image!

## ?? Key Points
- ? **AI-Powered Prompts** - Uses GitHub Models (GPT-4o-mini, GPT-4o, GPT-4.1)
- ? **Fast Image Generation** - Uses Cloudflare AI (Flux-1-Schnell)
- ? **Automatic Fallback** - Switches between 3 models if rate limited
- ? **TypeScript** - Type-safe codebase

## ?? Customization
Edit prompts in `src/config/prompts.ts`:
- System prompt behavior
- Enhancement keywords
- Model configuration

## ?? Common Issues
- **Rate limit errors**: App automatically switches between 3 models
- **Image generation fails**: Check Cloudflare token
- **Build errors**: Run `npm install` again

---

**Current Status:**
- ? Server running: http://localhost:3000
- ? AI prompt generation: WORKING
- ? Image generation: WORKING
