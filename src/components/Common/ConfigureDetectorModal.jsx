import React, { useState } from "react";
import { Server, Code, Check, Copy, Terminal, Shield, BookOpen } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export const ConfigureDetectorModal = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState("env"); // "env" | "python" | "node"

  const sampleEnv = `# Frontend (VITE_ prefix = bundled into client)
VITE_DETECTION_API_URL=http://localhost:8000/api/analyze

# Backend only (server/.env — never use VITE_ prefix for secrets)
# SIGHTENGINE_API_USER=your_api_user
# SIGHTENGINE_API_SECRET=your_api_secret
AI_HIGH_THRESHOLD=0.70
AI_LOW_THRESHOLD=0.30`;

  const samplePython = `# SecureLens AI - FastAPI ML Backend Integration Example
# Save as main.py and run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import torch

app = FastAPI(title="SecureLens Deepfake Model Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_media(
    file: UploadFile = File(...),
    fileHash: str = Form(...),
    mediaType: str = Form("IMAGE")
):
    # 1. Read file bytes
    contents = await file.read()
    
    # 2. Run your PyTorch / TensorFlow / ONNX deepfake classification model here
    # ai_probability = float(model.predict(contents))
    
    return {
        "classification": "ai_generated", # "ai_generated" | "authentic" | "inconclusive"
        "aiProbability": 0.947,
        "authenticProbability": 0.053,
        "confidence": 0.912,
        "modelName": "PyTorch Vision Classifier v2.4",
        "modelVersion": "2.4.1",
        "evidence": [
            "High spatial frequency artifacts detected in facial region",
            "Blink frequency anomaly identified"
        ]
    }`;

  const sampleNode = `// SecureLens AI - Express.js API Proxy Server Example
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/analyze', upload.single('file'), (req, res) => {
  const { fileHash, mediaType } = req.body;
  
  // Forward file bytes to your private ML inference server securely
  res.json({
    classification: 'ai_generated',
    aiProbability: 0.947,
    authenticProbability: 0.053,
    confidence: 0.912,
    modelName: 'Express ML Proxy Backend',
    modelVersion: '2.4.1',
    evidence: ['Frequency domain spectral anomaly detected']
  });
});

app.listen(8000, () => console.log('ML Backend API running on port 8000'));`;

  const copyText = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Trained AI Detector" maxWidth="max-w-2xl">
      <div className="space-y-5 py-2 text-zinc-200 text-xs font-sans">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start space-x-3">
          <Server className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">No Pseudo-Heuristics Principle</h4>
            <p className="text-zinc-300 leading-relaxed">
              In accordance with scientific detection standards, SecureLens AI does not synthesize fake AI percentages or treat missing EXIF tags as proof of AI generation. Connect a trained PyTorch, TensorFlow, or API endpoint below to perform live inference.
            </p>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 font-mono text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab("env")}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "env" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>.env Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab("python")}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "python" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python (FastAPI Backend)</span>
          </button>
          <button
            onClick={() => setActiveTab("node")}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "node" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Node.js / Express Proxy</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "env" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-400 font-bold uppercase">1. Add to root .env file</span>
              <button
                onClick={() => copyText(sampleEnv, setCopiedEnv)}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center space-x-1"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? "Copied!" : "Copy .env"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-blue-300 overflow-x-auto">
              {sampleEnv}
            </pre>
          </div>
        )}

        {activeTab === "python" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-400 font-bold uppercase">FastAPI Deepfake Inference Server</span>
              <button
                onClick={() => copyText(samplePython, setCopiedCode)}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center space-x-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-300 max-h-64 overflow-y-auto">
              {samplePython}
            </pre>
          </div>
        )}

        {activeTab === "node" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-400 font-bold uppercase">Express.js API Proxy Contract</span>
              <button
                onClick={() => copyText(sampleNode, setCopiedCode)}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center space-x-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-purple-300 max-h-64 overflow-y-auto">
              {sampleNode}
            </pre>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
};
