
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Share2,
  MessageSquare,
  Github,
  Cpu,
  Home
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const repoId = location.pathname.split('/')[2];
  const isRepoPage = !!repoId && location.pathname !== '/';

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: `/repo/${repoId}` },
    { icon: <FolderTree size={20} />, label: 'Explorer', path: `/repo/${repoId}/explorer` },
    { icon: <Share2 size={20} />, label: 'Dependencies', path: `/repo/${repoId}/graph` },
    { icon: <MessageSquare size={20} />, label: 'AI Chat', path: `/repo/${repoId}/chat` },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar - only visible on repo specific pages */}
      {isRepoPage && (
        <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col sticky top-0 h-screen">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <Cpu className="text-blue-500" />
            <span className="font-bold text-xl tracking-tight text-white">CodeLens</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all mb-8"
            >
              <Home size={20} />
              <span>All Repos</span>
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${location.pathname === item.path
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <a
              href="https://github.com"
              target="_blank"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-sm"
            >
              <Github size={16} />
              <span>View Source</span>
            </a>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {!isRepoPage && (
          <header className="p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
              <Cpu className="text-blue-500 transition-transform group-hover:rotate-12" />
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">CodeLens AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400 font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-blue-400 transition-colors">Analyzer</Link>
              <a href="#features" className="hover:text-blue-400 transition-colors cursor-pointer">Documentation</a>
              <button
                onClick={() => {
                  const el = document.getElementById('url-input');
                  if (el) el.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </button>
            </div>
          </header>
        )}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
