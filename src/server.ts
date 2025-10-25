import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { prompts, aiConfig, imageConfig } from './config/prompts';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Types
interface GenerateScriptRequest {
    prompt: string;
}

interface GenerateImageRequest {
    script: string;
}

// Route to generate video prompt using AI with automatic model fallback
app.post('/api/generate-script', async (req: Request<{}, {}, GenerateScriptRequest>, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating image prompt for:', prompt);

        // Try GitHub Models API with automatic fallback between models
        if (process.env.GITHUB_TOKEN) {
            for (let i = 0; i < aiConfig.models.length; i++) {
                const model = aiConfig.models[i];
                try {
                    console.log(`[ATTEMPT ${i + 1}/${aiConfig.models.length}] Trying model: ${model}...`);
                    
                    const response = await axios.post(
                        'https://models.inference.ai.azure.com/chat/completions',
                        {
                            messages: [
                                {
                                    role: 'system',
                                    content: prompts.systemPrompt
                                },
                                {
                                    role: 'user',
                                    content: prompts.userPromptTemplate(prompt)
                                }
                            ],
                            model: model,
                            temperature: aiConfig.temperature,
                            max_tokens: aiConfig.maxTokens
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                            }
                        }
                    );

                    let script = response.data.choices[0].message.content;
                    // Remove surrounding quotes if AI added them
                    script = script.trim().replace(/^["']|["']$/g, '');
                    console.log(`[SUCCESS] Model ${model} - Generated prompt:`, script);
                    res.json({ script, model: model });
                    return;
                    
                } catch (aiError: any) {
                    const errorCode = aiError.response?.data?.error?.code;
                    const errorMessage = aiError.response?.data?.error?.message || aiError.message;
                    
                    console.error(`[ERROR] Model ${model} failed:`, errorCode || errorMessage);
                    
                    // If rate limit reached, try next model
                    if (errorCode === 'RateLimitReached') {
                        console.log(`[INFO] ${model} rate limit reached. Trying next model...`);
                        continue; // Try next model in the list
                    } else {
                        // For other errors, also try next model
                        console.log(`[INFO] ${model} error. Trying next model...`);
                        continue;
                    }
                }
            }
            
            // All models failed, use free fallback
            console.log('[INFO] All GitHub models exhausted. Using free fallback generator.');
        }

        // Fallback: Enhanced prompt generator (100% free, unlimited!)
        const script = generateEnhancedPrompt(prompt);
        console.log('[FREE FALLBACK] Generated enhanced prompt:', script);
        res.json({ script, model: 'fallback' });

    } catch (error: any) {
        console.error('Error generating prompt:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to generate prompt',
            details: error.response?.data || error.message
        });
    }
});

// Enhanced prompt generator - completely free, no API needed!
function generateEnhancedPrompt(userStory: string): string {
    const cleanStory = userStory.trim();
    const lowerStory = cleanStory.toLowerCase();
    const enhancements = prompts.fallbackEnhancements;
    
    // Start with the user's input
    let enhancedPrompt = cleanStory;
    
    // Detect art style from user input
    const hasAnimeStyle = /anime|manga|cartoon|comic/i.test(cleanStory);
    const hasRealisticStyle = /realistic|photorealistic|photo/i.test(cleanStory);
    
    // Add style-specific enhancements
    if (!hasAnimeStyle && !hasRealisticStyle) {
        // Default to photorealistic if no style mentioned
        enhancedPrompt += `, ${enhancements.additional}`;
    }
    
    // Add lighting if not mentioned
    if (!lowerStory.includes('light') && !lowerStory.includes('glow') && !lowerStory.includes('illuminat')) {
        enhancedPrompt += `, ${enhancements.lighting}`;
    }
    
    // Add quality descriptors
    if (!lowerStory.includes('quality') && !lowerStory.includes('detailed') && !lowerStory.includes('sharp')) {
        enhancedPrompt += `, ${enhancements.quality}`;
    }
    
    // Add composition
    if (!lowerStory.includes('composition') && !lowerStory.includes('framing') && !lowerStory.includes('camera')) {
        enhancedPrompt += `, ${enhancements.style}`;
    }
    
    // Add atmosphere keywords based on content
    if (lowerStory.includes('cat') || lowerStory.includes('pet') || lowerStory.includes('animal')) {
        if (!lowerStory.includes('cute')) enhancedPrompt += ', adorable';
    }
    if (lowerStory.includes('space') || lowerStory.includes('galaxy') || lowerStory.includes('cosmic')) {
        if (!lowerStory.includes('nebula')) enhancedPrompt += ', cosmic nebula, stars';
    }
    if (lowerStory.includes('city') || lowerStory.includes('urban')) {
        if (!lowerStory.includes('neon')) enhancedPrompt += ', urban atmosphere';
    }
    
    return enhancedPrompt;
}

// Route to generate image using Cloudflare AI
app.post('/api/generate-image', async (req: Request<{}, {}, GenerateImageRequest>, res: Response) => {
    try {
        const { script } = req.body;

        if (!script) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating image with Cloudflare AI, prompt:', script);

        // Clean and validate the prompt
        let cleanPrompt = script
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        console.log('[INFO] Cleaned prompt length:', cleanPrompt.length);

        // Call Cloudflare AI for image generation
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/ai/run/${imageConfig.model}`,
            {
                prompt: cleanPrompt,
                num_steps: imageConfig.steps,
                guidance: imageConfig.guidance
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('[INFO] Response status:', response.status);
        console.log('[INFO] Response data type:', typeof response.data);

        // Cloudflare returns JSON with base64 image in result.image
        const base64Image = response.data.result?.image;
        
        if (!base64Image) {
            console.error('[ERROR] Full response:', JSON.stringify(response.data));
            throw new Error('No image data in Cloudflare response');
        }
        
        const imageDataUrl = `data:image/png;base64,${base64Image}`;

        console.log('[SUCCESS] Image generated successfully');
        console.log('[INFO] Base64 length:', base64Image.length, 'chars');

        // Send LINE notification after successful generation
        sendLineNotification('Image Generation Successful');

        res.json({ 
            imageUrl: imageDataUrl,
            message: 'Image generated successfully'
        });
        
    } catch (error: any) {
        console.error('Error generating image:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to generate image',
            details: error.response?.data || error.message
        });
    }
});

// Route to send notification to LINE
async function sendLineNotification(message: string) {
    try {
        const lineToken = '8jt0YZhIRwwikTsJGeKPf704ZqZNWY69FVrgQEuo2DhWH7xx+FXm90Vdu6zFpUcCSW/0x2LjYRhPvQmqAojfi2qKsAHRBq2GOozf65vorNHZUxraqoJaCBukVBFBelm+tM57oVYrTrS/ekom1CcnuQdB04t89/1O/w1cDnyilFU=';

        const payload = {
            messages: [
                {
                    type: 'text',
                    text: message
                }
            ]
        };

        await axios.post(
            'https://api.line.me/v2/bot/message/broadcast',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${lineToken}`
                }
            }
        );

        console.log('? LINE notification sent successfully!');
    } catch (error: any) {
        console.error('? Error sending LINE notification:', error.response?.data || error.message);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log('[CONFIG] GitHub Token configured:', !!process.env.GITHUB_TOKEN);
    console.log('[CONFIG] Cloudflare Token configured:', !!process.env.CF_TOKEN);
    console.log('[CONFIG] Edit prompts in: src/config/prompts.ts');
    console.log('[CONFIG] Image model:', imageConfig.model);
});
