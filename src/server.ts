import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { prompts, aiConfig, imageConfig } from './config/prompts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Types
interface GenerateScriptRequest {
    prompt: string;
}

interface GenerateImageRequest {
    script: string;
}

// Route to generate video prompt using AI
app.post('/api/generate-script', async (req: Request<{}, {}, GenerateScriptRequest>, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating image prompt for:', prompt);

        // Try GitHub Models API with your token
        if (process.env.GITHUB_TOKEN) {
            try {
                console.log('Attempting to use GitHub Models API...');
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
                        model: aiConfig.model,
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
                console.log('[SUCCESS] GitHub Models API - Generated prompt:', script);
                res.json({ script });
                return;
            } catch (aiError: any) {
                console.error('[ERROR] GitHub Models API failed:', aiError.response?.data || aiError.message);
                console.log('[INFO] Falling back to enhanced prompt generator...');
            }
        }

        // Fallback: Enhanced prompt generator
        const script = generateEnhancedPrompt(prompt);
        console.log('Generated enhanced prompt:', script);
        res.json({ script });

    } catch (error: any) {
        console.error('Error generating prompt:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to generate prompt',
            details: error.response?.data || error.message
        });
    }
});

// Enhanced prompt generator based on story ideas
function generateEnhancedPrompt(userStory: string): string {
    const cleanStory = userStory.trim();
    const enhancements = prompts.fallbackEnhancements;
    
    // Build a detailed prompt from the story
    let enhancedPrompt = cleanStory;
    
    // Add visual quality enhancements if not present
    const lowerStory = cleanStory.toLowerCase();
    
    // Add lighting if not mentioned
    if (!lowerStory.includes('light') && !lowerStory.includes('glow') && !lowerStory.includes('illuminat')) {
        enhancedPrompt += `, ${enhancements.lighting}`;
    }
    
    // Add quality descriptors if not present
    if (!lowerStory.includes('quality') && !lowerStory.includes('detailed') && !lowerStory.includes('sharp')) {
        enhancedPrompt += `, ${enhancements.quality}`;
    }
    
    // Add professional composition
    if (!lowerStory.includes('composition') && !lowerStory.includes('framing') && !lowerStory.includes('camera')) {
        enhancedPrompt += `, ${enhancements.style}`;
    }
    
    // Add photorealistic style if appropriate and not mentioned
    if (!lowerStory.includes('realistic') && !lowerStory.includes('photorealistic') && 
        !lowerStory.includes('anime') && !lowerStory.includes('cartoon') && !lowerStory.includes('art style')) {
        enhancedPrompt += `, ${enhancements.additional}`;
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
        
        if (cleanPrompt.length > 500) {
            cleanPrompt = cleanPrompt.substring(0, 500).trim();
            console.log('[WARNING] Prompt truncated to 500 characters');
        }
        
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

// Start server
app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log('[CONFIG] GitHub Token configured:', !!process.env.GITHUB_TOKEN);
    console.log('[CONFIG] Cloudflare Token configured:', !!process.env.CF_TOKEN);
    console.log('[CONFIG] Edit prompts in: src/config/prompts.ts');
    console.log('[CONFIG] Image model:', imageConfig.model);
});
