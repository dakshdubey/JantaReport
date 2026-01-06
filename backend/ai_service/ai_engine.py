from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
import numpy as np
import random

app = FastAPI()

# --- 1. INTEL ENGINE: CATEGORY & SEVERITY (Existing Upgrade) ---
intel_data = [
    ("pothole on the main road causing traffic", "Roads", "HIGH"),
    ("broken street light near my house", "Electricity", "MEDIUM"),
    ("water leakage from the large underground main pipe", "Water", "HIGH"),
    ("no water supply in our residential block for 3 days", "Water", "CRITICAL"),
    ("huge garbage heap is not cleared for over 10 days", "Waste", "HIGH"),
    ("medical waste dumped in the park", "Health", "CRITICAL"),
    ("industrial chemical runoff is contaminating the local stream", "Health", "CRITICAL"),
    ("sewage overflowing onto the sidewalk", "Waste", "CRITICAL"),
    ("street surface is uneven and dangerous for bikers", "Roads", "MEDIUM"),
    ("no power since yesterday transformer blast", "Electricity", "CRITICAL")
]

X_intel = [d[0] for d in intel_data]
y_cat = [d[1] for d in intel_data]
y_sev = [d[2] for d in intel_data]

cat_model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
    ('mlp', MLPClassifier(hidden_layer_sizes=(50, 25), max_iter=1000, random_state=42))
])
sev_model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
    ('mlp', MLPClassifier(hidden_layer_sizes=(50, 25), max_iter=1000, random_state=42))
])

cat_model.fit(X_intel, y_cat)
sev_model.fit(X_intel, y_sev)

# --- 2. EMOTION ENGINE: NEURAL EMOTION DETECTION ---
emotion_data = [
    ("i am very angry about this road condition", "ANGRY"),
    ("this is unacceptable and frustrating", "ANGRY"),
    ("I am extremely worried about my kids health", "WORRIED"),
    ("there is a dangerous wire hanging help me", "WORRIED"),
    ("thank you for the help i want to contribute", "HELPFUL"),
    ("how can i report a new issue here", "NEUTRAL"),
    ("just checking the status of my report", "NEUTRAL"),
    ("the water smells bad and i am scared for my family", "WORRIED"),
    ("fix this immediately this is peak corruption", "ANGRY"),
    ("happy to see the progress in our city", "HELPFUL")
]

X_emo = [d[0].lower() for d in emotion_data]
y_emo = [d[1] for d in emotion_data]

emo_model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('mlp', MLPClassifier(hidden_layer_sizes=(30, 15), max_iter=1000, random_state=42))
])
emo_model.fit(X_emo, y_emo)

# --- 3. RESPONSE ENGINE: TACTICAL REPLIES ---
RESPONSES = {
    "ANGRY": [
        "I understand your frustration. We are prioritizing high-impact issues to ensure accountability.",
        "Your concerns are valid. The administration is working to resolve such critical failures immediately.",
        "I hear you. Every report you file helps us put pressure on the right departments."
    ],
    "WORRIED": [
        "Your safety is our priority. Please ensure you are at a safe distance from the issue.",
        "We have logged your concern with high priority. Stay calm, the alert has been dispatched.",
        "I understand this is concerning. We are trackng this in real-time to prevent any accidents."
    ],
    "HELPFUL": [
        "Thank you for being a responsible citizen! Together we can make our city better.",
        "Great to see your involvement. Your detailed reports make the resolution process faster.",
        "Appreciate the positive energy! Feel free to report anything else you notice."
    ],
    "NEUTRAL": [
        "I can help you with reporting issues, checking status, or navigating the platform.",
        "Please provide the details of the issue, and I will help you categorize it.",
        "You can find all your submitted issues in the 'My Intel' section."
    ]
}

class ChatRequest(BaseModel):
    message: str

class ReportRequest(BaseModel):
    description: str

@app.get("/")
def home():
    return {"status": "Tactical AI Assistant Active", "version": "3.0.0"}

@app.post("/predict")
def predict(request: ReportRequest):
    desc = request.description.lower()
    cat_pred = cat_model.predict([desc])[0]
    sev_pred = sev_model.predict([desc])[0]
    return {"category": cat_pred, "severity": sev_pred}

@app.post("/chat")
def chat(request: ChatRequest):
    msg = request.message.lower()
    
    # Predict Emotion
    emo_probas = emo_model.predict_proba([msg])[0]
    emotion = emo_model.classes_[np.argmax(emo_probas)]
    confidence = np.max(emo_probas)
    
    final_emotion = emotion if confidence > 0.4 else "NEUTRAL"
    
    # Select Tactical Response
    response = random.choice(RESPONSES[final_emotion])
    
    return {
        "reply": response,
        "emotion": final_emotion,
        "confidence": float(confidence)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
