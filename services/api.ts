
import axios from 'axios';
import { MOCK_REPO, generateDynamicRepo } from '../lib/mockData';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Increased timeout for heavy analysis requests
});

// Helper to determine if we should use simulation
let isSimulationMode = false;

export const repoService = {
  getSystemStatus: async () => {
    try {
      await api.get('/repos/health'); // Assuming a health check endpoint
      isSimulationMode = false;
      return { live: true };
    } catch {
      isSimulationMode = true;
      return { live: false };
    }
  },

  analyze: async (url: string) => {
    try {
      const response = await api.post('/repos/analyze', { url });
      return response;
    } catch (err) {
      console.warn('Backend unreachable. Engaging Simulation Engine for demo.');
      isSimulationMode = true;
      // Return a predictable ID for the mock data based on the URL
      return { data: { repoId: 'mock-session-' + btoa(url).substring(0, 8), message: 'Simulation Mode Active' } };
    }
  },

  getById: async (id: string) => {
    try {
      if (id.startsWith('mock-')) throw new Error('Simulation requested');
      return await api.get(`/repos/${id}`);
    } catch (err) {
      // If mock ID or backend fails, generate dynamic mock data
      return { data: MOCK_REPO };
    }
  },

  getFiles: async (id: string) => {
    try {
      if (id.startsWith('mock-')) throw new Error('Simulation requested');
      return await api.get(`/repos/${id}/files`);
    } catch (err) {
      const { generateDynamicFileTree } = await import('../lib/mockData');
      // In a real demo, we'd use the ID to keep the context, here we just return high-quality mocks
      return { data: generateDynamicFileTree('https://github.com/facebook/react') };
    }
  },

  getDependencies: async (id: string) => {
    try {
      if (id.startsWith('mock-')) throw new Error('Simulation requested');
      return await api.get(`/repos/${id}/dependencies`);
    } catch (err) {
      return {
        data: [
          { sourceFile: 'src/App.tsx', targetFile: 'src/components/Button.tsx' },
          { sourceFile: 'src/App.tsx', targetFile: 'src/components/Modal.tsx' },
          { sourceFile: 'src/components/Modal.tsx', targetFile: 'src/components/Button.tsx' },
          { sourceFile: 'src/index.tsx', targetFile: 'src/App.tsx' }
        ]
      };
    }
  },

  askChat: async (repoId: string, query: string) => {
    try {
      if (repoId.startsWith('mock-')) throw new Error('Simulation requested');
      return await api.post('/chat/ask', { repoId, query });
    } catch (err) {
      // Simulate DeepSeek-R1 reasoning style for the portfolio demo
      return {
        data: {
          content: `<thought>\nThe user is asking about: "${query}". \nI am in Simulation Mode because the local backend is not detected. \nI will provide an architectural overview based on common patterns found in repositories like this.\n</thought>\n\nBased on my simulated analysis of this codebase, the architecture follows a modular design. If you were connected to the Groq Live Engine, I would be able to pinpoint the exact line in your files. \n\n**Common patterns detected:**\n- Component-based structure\n- Centralized state management\n- Atomic design for UI components`,
          timestamp: new Date().toLocaleTimeString()
        }
      };
    }
  },
};

export default api;
