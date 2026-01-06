const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');

// Mock AI responses (temporary solution until Python service is running)
const EMOTION_KEYWORDS = {
    ANGRY: ['angry', 'frustrated', 'unacceptable', 'furious', 'mad', 'irritated', 'sick of'],
    WORRIED: ['worried', 'concerned', 'scared', 'afraid', 'dangerous', 'safety', 'fear'],
    HELPFUL: ['thank', 'appreciate', 'grateful', 'happy', 'glad', 'contribute'],
    NEUTRAL: []
};

const RESPONSES = {
    ANGRY: [
        "I understand your frustration. We are prioritizing high-impact issues to ensure accountability.",
        "Your concerns are valid. The administration is working to resolve such critical failures immediately.",
        "I hear you. Every report you file helps us put pressure on the right departments."
    ],
    WORRIED: [
        "Your safety is our priority. Please ensure you are at a safe distance from the issue.",
        "We have logged your concern with high priority. Stay calm, the alert has been dispatched.",
        "I understand this is concerning. We are tracking this in real-time to prevent any accidents."
    ],
    HELPFUL: [
        "Thank you for being a responsible citizen! Together we can make our city better.",
        "Great to see your involvement. Your detailed reports make the resolution process faster.",
        "Appreciate the positive energy! Feel free to report anything else you notice."
    ],
    NEUTRAL: [
        "I can help you with reporting issues, checking status, or navigating the platform.",
        "Please provide the details of the issue, and I will help you categorize it.",
        "You can find all your submitted issues in the 'My Intel' section."
    ]
};

function detectEmotion(message) {
    const lowerMsg = message.toLowerCase();

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        if (emotion === 'NEUTRAL') continue;
        for (const keyword of keywords) {
            if (lowerMsg.includes(keyword)) {
                return emotion;
            }
        }
    }
    return 'NEUTRAL';
}

function getResponse(emotion) {
    const responses = RESPONSES[emotion] || RESPONSES.NEUTRAL;
    return responses[Math.floor(Math.random() * responses.length)];
}

router.post('/predict', authenticateToken, async (req, res) => {
    try {
        const { description } = req.body;

        // Simple keyword-based categorization
        const lowerDesc = description.toLowerCase();
        let category = 'Roads';
        let severity = 'MEDIUM';

        if (lowerDesc.includes('water') || lowerDesc.includes('leak') || lowerDesc.includes('pipe')) {
            category = 'Water';
        } else if (lowerDesc.includes('electric') || lowerDesc.includes('power') || lowerDesc.includes('wire')) {
            category = 'Electricity';
        } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste') || lowerDesc.includes('sewage')) {
            category = 'Waste';
        } else if (lowerDesc.includes('health') || lowerDesc.includes('medical') || lowerDesc.includes('chemical')) {
            category = 'Health';
        }

        if (lowerDesc.includes('critical') || lowerDesc.includes('dangerous') || lowerDesc.includes('urgent')) {
            severity = 'CRITICAL';
        } else if (lowerDesc.includes('high') || lowerDesc.includes('serious')) {
            severity = 'HIGH';
        } else if (lowerDesc.includes('low') || lowerDesc.includes('minor')) {
            severity = 'LOW';
        }

        res.json({ category, severity, confidence: 0.85 });
    } catch (error) {
        console.error('AI Predict Error:', error.message);
        res.json({ category: 'Roads', severity: 'MEDIUM', error: 'Fallback mode' });
    }
});

router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;

        const emotion = detectEmotion(message);
        const reply = getResponse(emotion);

        res.json({
            reply,
            emotion,
            confidence: 0.8
        });
    } catch (error) {
        console.error('AI Chat Error:', error.message);
        res.json({ reply: 'Assistant Offline', emotion: 'NEUTRAL', error: true });
    }
});

module.exports = router;
