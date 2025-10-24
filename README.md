# AI Image Generator

A TypeScript-based web application that generates AI-enhanced image prompts using GitHub Models (GPT-4) and creates images using Cloudflare AI.

## Features

- AI-powered prompt enhancement using GitHub Models (GPT-4o)
- Image generation using Cloudflare AI (Flux-1-Schnell)
- Simple text-to-image workflow
- TypeScript for type safety
- Express REST API backend

## Prerequisites

- Node.js (v14 or higher)
- GitHub Personal Access Token with Models API access
- Cloudflare Account ID and API Token

## Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your tokens:
```
GITHUB_TOKEN=your_github_token_here
ACCOUNT_ID=your_cloudflare_account_id_here
CF_TOKEN=your_cloudflare_api_token_here
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

6. Open your browser: http://localhost:3000

## Usage

1. Enter your image idea in the text area
2. Choose workflow:
   - Click "Next" to use your prompt as-is
   - Click "Next with AI" to enhance your prompt with AI
3. Edit the prompt if needed
4. Click "Generate Image"
5. View and download your generated image!

## API Endpoints

### POST /api/generate-script
Enhances a prompt using GitHub Models AI.

### POST /api/generate-image
Generates an image using Cloudflare AI.

## Technologies Used

- TypeScript
- Node.js & Express
- GitHub Models API (GPT-4o)
- Cloudflare AI (Flux-1-Schnell)

## License

ISC
