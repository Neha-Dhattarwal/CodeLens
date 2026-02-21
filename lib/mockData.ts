
import { Repo, FileNode } from '../types';

/**
 * Parses a GitHub URL to extract owner and repo name
 */
const parseUrl = (url: string) => {
  const parts = url.replace('https://github.com/', '').split('/');
  return {
    owner: parts[0] || 'unknown',
    name: parts[1] || 'repository'
  };
};

/**
 * Generates dynamic repository metadata based on the URL
 */
export const generateDynamicRepo = (url: string): Repo => {
  const { owner, name } = parseUrl(url);
  const isUI = name.toLowerCase().includes('ui') || name.toLowerCase().includes('react');
  const isBackend = name.toLowerCase().includes('api') || name.toLowerCase().includes('node') || name.toLowerCase().includes('server');

  return {
    id: `dynamic-${Date.now()}`,
    name: `${owner}/${name}`,
    url: url,
    description: isUI 
      ? `A highly optimized library for building modern user interfaces in ${name}.`
      : isBackend 
      ? `A robust and scalable backend infrastructure for ${name} services.`
      : `High-performance implementation of ${name} core logic and utilities.`,
    stars: Math.floor(Math.random() * 50000) + 5000,
    forks: Math.floor(Math.random() * 5000) + 100,
    primaryLanguage: isUI ? 'TypeScript' : isBackend ? 'JavaScript' : 'Python',
    status: 'completed',
    createdAt: new Date().toISOString(),
    architecture: isUI 
      ? `This repository follows a component-driven architecture. It leverages a monorepo structure where core components reside in 'packages/core' and are exported via a main entry point. It utilizes Radix UI for accessibility and Tailwind CSS for atomic styling.`
      : `The system utilizes a microservices architecture optimized for low-latency data processing. It implements a clear separation between the transport layer (Express/Fastify) and the domain logic, ensuring high testability and maintenance.`
  };
};

/**
 * Generates a file tree structure based on the repository type
 */
export const generateDynamicFileTree = (url: string): FileNode[] => {
  const { name } = parseUrl(url);
  const isUI = name.toLowerCase().includes('ui') || name.toLowerCase().includes('react');

  if (isUI) {
    return [
      {
        id: 'dir-src',
        repoId: 'dynamic',
        name: 'src',
        type: 'directory',
        path: 'src',
        children: [
          {
            id: 'dir-components',
            repoId: 'dynamic',
            name: 'components',
            type: 'directory',
            path: 'src/components',
            children: [
              {
                id: 'file-button',
                repoId: 'dynamic',
                name: 'Button.tsx',
                type: 'file',
                path: 'src/components/Button.tsx',
                explanation: 'A polymorphic button component that supports various sizes, variants, and loading states. It uses clsx for conditional class merging.',
                functions: ['Button(props)', 'buttonVariants(config)'],
                imports: ['react', 'lucide-react', 'clsx']
              },
              {
                id: 'file-modal',
                repoId: 'dynamic',
                name: 'Modal.tsx',
                type: 'file',
                path: 'src/components/Modal.tsx',
                explanation: 'An accessible dialog component built on top of Radix UI Primitives. Handles focus trapping and scroll locking automatically.',
                functions: ['Modal(children)', 'ModalContent()', 'useModal()'],
                imports: ['@radix-ui/react-dialog', 'framer-motion']
              }
            ]
          },
          {
            id: 'file-app',
            repoId: 'dynamic',
            name: 'App.tsx',
            type: 'file',
            path: 'src/App.tsx',
            explanation: 'The main application entry point that sets up global providers (Theme, Auth, QueryClient) and handles top-level routing.',
            functions: ['App()', 'Router()'],
            imports: ['react-router-dom', './components/Layout']
          }
        ]
      },
      {
        id: 'file-config',
        repoId: 'dynamic',
        name: 'tailwind.config.js',
        type: 'file',
        path: 'tailwind.config.js',
        explanation: 'Configuration for the Tailwind CSS compiler, defining the custom color palette, spacing scales, and animation keyframes.',
        imports: ['tailwindcss/colors']
      }
    ];
  }

  // Backend / Generic default structure
  return [
    {
      id: 'dir-lib',
      repoId: 'dynamic',
      name: 'lib',
      type: 'directory',
      path: 'lib',
      children: [
        {
          id: 'file-db',
          repoId: 'dynamic',
          name: 'database.ts',
          type: 'file',
          path: 'lib/database.ts',
          explanation: 'Connection singleton for the primary data store. Implements connection pooling and automatic retry logic on network failure.',
          functions: ['connect()', 'disconnect()', 'healthCheck()'],
          imports: ['pg', 'dotenv']
        },
        {
          id: 'file-auth',
          repoId: 'dynamic',
          name: 'auth.ts',
          type: 'file',
          path: 'lib/auth.ts',
          explanation: 'Core authentication middleware using JWT and bcrypt. Validates session tokens and enforces role-based access control (RBAC).',
          functions: ['verifyToken(token)', 'hashPassword(pass)', 'generateJWT(user)'],
          imports: ['jsonwebtoken', 'bcryptjs']
        }
      ]
    },
    {
      id: 'file-index',
      repoId: 'dynamic',
      name: 'index.ts',
      type: 'file',
      path: 'index.ts',
      explanation: 'Server initialization file. Sets up middleware chains, configures CORS, and binds the listener to the specified port.',
      functions: ['main()', 'setupMiddleware()'],
      imports: ['express', 'cors', './lib/database']
    }
  ];
};

// Added missing MOCK_REPO and MOCK_FILE_TREE exports to fix compilation errors in DashboardPage and ExplorerPage.
export const MOCK_REPO: Repo = {
  id: 'mock-react-id',
  name: 'facebook/react',
  url: 'https://github.com/facebook/react',
  description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
  stars: 215000,
  forks: 45000,
  primaryLanguage: 'JavaScript',
  status: 'completed',
  createdAt: new Date().toISOString(),
  architecture: 'React follows a component-based architecture. It uses a virtual DOM to optimize rendering and provides hooks for state management and side effects.'
};

export const MOCK_FILE_TREE: FileNode[] = generateDynamicFileTree('https://github.com/facebook/react');
