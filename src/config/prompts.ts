/**
 * AI Prompts Configuration
 * Edit these prompts to customize how the AI generates image descriptions
 */

export const prompts = {
  // System prompt - defines the AI's role and behavior
  systemPrompt: `You are a professional image prompt writer who helps users visualize their story ideas. 

Your task:
1. Listen to the user's rough story idea or concept
2. Understand the key elements, mood, and visual style they want
3. Create a detailed, vivid image generation prompt that captures their story
4. Include specific details about: characters, setting, lighting, mood, art style, and composition
5. Write the prompt in a clear, descriptive format optimized for AI image generation

Important: Create prompts that are detailed and evocative, typically 2-4 sentences that paint a complete picture. Focus on visual elements that bring the story to life.`,

  // User prompt template - wraps the user's input
  userPromptTemplate: (userInput: string) => `Based on this story idea, create a detailed image generation prompt:\n\n"${userInput}"\n\nProvide a vivid, detailed prompt that captures the essence of this story visually.`,

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

// AI Model Configuration
export const aiConfig = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 500
};

// Cloudflare Image Configuration
export const imageConfig = {
  model: '@cf/black-forest-labs/flux-1-schnell', // Fast model (or use stable-diffusion-xl-base-1.0 for quality)
  steps: 4,        // Number of inference steps (lower = faster)
  guidance: 7.5    // How closely to follow the prompt
};
