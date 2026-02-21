
/* 
  THIS FILE IS FOR BACKEND USAGE. 
  COPY TO: ./services/aiService.js
*/

import dotenv from 'dotenv';
dotenv.config();

const MODEL = 'llama3-8b-8192';

/**
 * Analyzes code for logical purpose and structure.
 */
export async function analyzeCode(code, filename) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Analyze source code and return a JSON object with: { "explanation": string, "functions": string[], "imports": string[] }. ONLY return JSON. Provide a simple, detailed explanation in easy language that a beginner can understand.'
          },
          { role: 'user', content: `File: ${filename}\nCode:\n${code.substring(0, 5000)}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Upstream intelligence error');
    }

    const rawContent = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(rawContent);
  } catch (error) {
    console.error('Logic Analysis Error:', error.message);
    return { explanation: "Logic synthesis partially unavailable for this module.", functions: [], imports: [] };
  }
}

/**
 * Generates an architectural summary using local intelligence models.
 */
export async function generateArchitectureSummary(repoName, folderStructure) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Summarize the architecture of a GitHub repository based on its folder structure.'
          },
          { role: 'user', content: `Repository: ${repoName}\nStructure:\n${JSON.stringify(folderStructure)}` }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Architectural summary currently unavailable.';
  } catch (error) {
    console.error('Intelligence Architecture summary error:', error);
    return 'Architectural summary currently unavailable.';
  }
}
