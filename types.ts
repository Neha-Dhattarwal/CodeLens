
export interface Repo {
  id: string;
  name: string;
  url: string;
  description: string;
  architecture?: string;
  primaryLanguage?: string;
  stars?: number;
  forks?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface FileNode {
  id: string;
  repoId: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  explanation?: string;
  functions?: string[];
  imports?: string[];
  content?: string;
  language?: string;
  children?: FileNode[];
}

export interface Dependency {
  id: string;
  repoId: string;
  source: string; // File Path
  target: string; // File Path
  type: 'import' | 'reference';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
