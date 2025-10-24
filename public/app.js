// DOM Elements
const promptInput = document.getElementById('promptInput');
const nextBtn = document.getElementById('nextBtn');
const generateScriptBtn = document.getElementById('generateScriptBtn');
const scriptCard = document.getElementById('scriptCard');
const scriptOutput = document.getElementById('scriptOutput');
const scriptInfoText = document.getElementById('scriptInfoText');
const generateVideoBtn = document.getElementById('generateVideoBtn');
const videoCard = document.getElementById('videoCard');
const statusOutput = document.getElementById('statusOutput');
const statusMessage = document.getElementById('statusMessage');
const videoContainer = document.getElementById('videoContainer');
const videoPlayer = document.getElementById('videoPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');

let currentScript = '';

// API Base URL
const API_BASE = '';

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Show loading state on button
function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const loader = button.querySelector('.loader');
    
    if (isLoading) {
        button.disabled = true;
        if (loader) loader.style.display = 'inline-block';
        if (btnText) btnText.style.opacity = '0.7';
    } else {
        button.disabled = false;
        if (loader) loader.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
    }
}

// Next Button - Go to step 2 with original input (no AI enhancement)
nextBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showError('Please describe your idea first!');
        return;
    }
    
    // Display the user's original input in step 2
    currentScript = prompt;
    scriptOutput.value = prompt;
    scriptInfoText.textContent = 'Review and edit your prompt as needed.';
    scriptCard.style.display = 'block';
    videoCard.style.display = 'none';
    
    // Scroll to script
    scriptCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Generate Script (Next with AI)
generateScriptBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showError('Please tell us your story idea!');
        return;
    }
    
    setButtonLoading(generateScriptBtn, true);
    scriptCard.style.display = 'none';
    videoCard.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate prompt');
        }
        
        currentScript = data.script;
        scriptOutput.value = currentScript;
        scriptInfoText.textContent = 'The AI has enhanced your idea with detailed descriptions. Review and edit if needed.';
        scriptCard.style.display = 'block';
        
        // Scroll to script
        scriptCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to generate prompt. Please try again.');
    } finally {
        setButtonLoading(generateScriptBtn, false);
    }
});

// Generate Image (instant - no polling needed)
generateVideoBtn.addEventListener('click', async () => {
    // Get the current value from the editable textarea
    const prompt = scriptOutput.value.trim();
    
    if (!prompt) {
        showError('Please enter a prompt describing the image you want!');
        return;
    }
    
    setButtonLoading(generateVideoBtn, true);
    videoCard.style.display = 'block';
    videoContainer.style.display = 'none';
    statusOutput.style.display = 'block';
    statusMessage.textContent = 'Generating image with Cloudflare AI... This takes just a few seconds!';
    
    // Scroll to video card
    videoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ script: prompt })
        });
        
        const data = await response.json();
        
        console.log('Image response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate image');
        }
        
        // Image is ready immediately!
        if (data.imageUrl) {
            console.log('Displaying image, data URL length:', data.imageUrl.length);
            displayImage(data.imageUrl);
        } else {
            throw new Error('No image URL received from server');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to generate image. Please try again.');
        videoCard.style.display = 'none';
    } finally {
        setButtonLoading(generateVideoBtn, false);
    }
});

function displayImage(imageUrl) {
    console.log('displayImage called with URL length:', imageUrl.length);
    statusOutput.style.display = 'none';
    videoContainer.style.display = 'block';
    
    // Make sure the image element is visible and has the src set
    videoPlayer.style.display = 'block';
    videoPlayer.onload = () => {
        console.log('Image loaded successfully');
    };
    videoPlayer.onerror = (e) => {
        console.error('Image failed to load:', e);
        showError('Failed to display image. The image might be corrupted.');
    };
    
    videoPlayer.src = imageUrl;
    downloadBtn.href = imageUrl;
    
    videoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
