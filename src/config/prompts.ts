/**
 * AI Prompts Configuration
 * Edit these prompts to customize how the AI generates image descriptions
 */

export const prompts = {
  // System prompt - defines the AI's role and behavior
  systemPrompt: `You are a concise image prompt writer. Transform user stories into vivid visual descriptions.

Rules:
1. MAXIMUM 450 characters (strict limit - count as you write)
2. Use powerful, specific adjectives and nouns
3. Skip articles (a, an, the) and filler words
4. Focus ONLY on key visual elements: character, setting, lighting, style
5. Use commas to separate concepts, not full sentences

Format: "Character description, setting details, lighting/mood, art style"

CRITICAL: Every word must earn its place. If over 450 characters, cut ruthlessly. Quality over quantity. Make every character count for maximum visual impact.`,

  // User prompt template - wraps the user's input
  userPromptTemplate: (userInput: string) => `Story: "${userInput}"\n\nCreate a concise image prompt under 450 characters. Use powerful words, skip filler. Format: character, setting, lighting, style.`,

  // Fallback enhancement keywords - used when GitHub AI API is unavailable
  fallbackEnhancements: {
    lighting: 'cinematic lighting',
    quality: 'high quality, detailed',
    style: 'professional composition',
    additional: 'photorealistic'
  },

  // Negative prompt - things to avoid in image generation
  negativePrompt: 'text, watermark, logo, low quality, blurry, distorted, deformed, ugly'
};

// AI Model Configuration with fallback models
export const aiConfig = {
  models: [
    'gpt-4o-mini',
    'gpt-4o', 
    'gpt-4.1'  
  ],
  temperature: 0.7,
  maxTokens: 200  // Reduced to enforce conciseness
};

// Cloudflare Image Configuration
export const imageConfig = {
  model: '@cf/black-forest-labs/flux-1-schnell', // Fast model (or use stable-diffusion-xl-base-1.0 for quality)
  steps: 4,        // Number of inference steps (lower = faster)
  guidance: 7.5    // How closely to follow the prompt
};
