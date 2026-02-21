
import express from 'express';
import type { RequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Repo, FileRecord, Dependency } from './models.js';
import { startAnalysisWorker } from './worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
// Also load root .env.local if needed for frontend keys in backend
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup with type casting for Express 5/cors compatibility
app.use(cors() as any);
app.use(express.json() as any);

// MongoDB Connection
const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codepulse';
// Sanitize URI (remove brackets sometimes pasted from examples)
const sanitizedUri = rawUri.replace(/<([^>]+)>/g, '$1');

mongoose.connect(sanitizedUri)
  .then(() => {
    const host = mongoose.connection.host;
    console.log(`Connected to MongoDB: ${host}`);
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

app.post('/api/repos/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  try {
    let repo = await Repo.findOne({ url });
    if (!repo) {
      repo = await Repo.create({
        url,
        name: url.split('/').pop() || 'Unnamed Repo',
        status: 'pending'
      });
    } else if (repo.status === 'completed') {
      return res.json({ message: 'Analysis already exists', repoId: repo._id });
    }
    startAnalysisWorker(repo._id.toString());
    res.status(202).json({ message: 'Analysis started', repoId: repo._id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/repos/:id', async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repo not found' });
    res.json(repo);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/repos/:id/files', async (req, res) => {
  try {
    const files = await FileRecord.find({ repoId: req.params.id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/repos/:id/dependencies', async (req, res) => {
  try {
    const deps = await Dependency.find({ repoId: req.params.id });
    res.json(deps);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/ask', async (req, res) => {
  const { repoId, query } = req.body;
  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository context not found' });

    // Groq API Call for Contextual Chat
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a Principal Software Engineer. You are helping a developer understand the codebase of "${repo.name}". Answer contextually based on the repository patterns and architecture.`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error Response:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Groq AI analysis failed',
        details: data
      });
    }

    const content = data.choices?.[0]?.message?.content || "AI Engine returned an empty response.";

    res.json({
      content,
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    console.error('Groq Chat error:', err);
    res.status(500).json({ error: 'Groq AI analysis failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
