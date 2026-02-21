import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileCode,
  Layers,
  GitBranch,
  Star,
  Activity,
  Box,
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio,
  Cpu,
  Globe,
  Database,
  Terminal,
  Search,
  CheckCircle2
} from 'lucide-react';
import { repoService } from '../services/api';
import { Repo } from '../types';

const DashboardPage: React.FC = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const pollInterval = useRef<any>(null);

  const fetchRepoData = async () => {
    if (!id) return;
    try {
      const response = await repoService.getById(id);
      setRepo(response.data);
      setIsLive(!id.startsWith('mock-'));
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoData();
    pollInterval.current = setInterval(fetchRepoData, 5000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [id]);

  if (loading && !repo) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-10">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-600/30 animate-pulse rounded-full"></div>
          <Loader2 className="animate-spin text-blue-500 relative z-10" size={100} />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-white tracking-widest uppercase italic">Synthesizing Hub</h2>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.8em] animate-pulse">Intelligence Engine Active</p>
        </div>
      </div>
    );
  }

  const isProcessing = repo?.status === 'processing' || repo?.status === 'pending';
  const techStack = [repo?.primaryLanguage, 'Tailwind', 'AI Reasoning', 'Express', 'React Flow'].filter(Boolean);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20">
      {/* Premium Header Hub */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 border border-slate-800/50 rounded-[3rem] p-12 backdrop-blur-3xl overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="space-y-8 flex-1">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  <Zap size={14} />
                  CodeLens V2
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  <Radio size={14} className="animate-pulse" />
                  Active Scan
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Activity size={14} className="animate-bounce" />
                    Reasoning Active
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-7xl font-black text-white tracking-tighter leading-tight italic">
                  {repo?.name}
                </h1>
                <p className="text-2xl text-slate-400 max-w-4xl font-medium leading-relaxed">
                  {repo?.description || 'Architectural breakdown enabled by Intelligence & Vision.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, i) => (
                  <span key={tech} className="px-5 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-black text-slate-300 uppercase tracking-widest hover:border-blue-500/50 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-6 w-full lg:w-auto self-stretch lg:self-end">
              <div className="flex-1 lg:w-48 p-6 bg-slate-900/80 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center gap-2 shadow-xl">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Popularity</span>
                <div className="flex items-center gap-3 text-3xl font-black text-white">
                  <Star size={24} className="text-amber-500 fill-amber-500" />
                  {(repo?.stars || 0).toLocaleString()}
                </div>
              </div>
              <div className="flex-1 lg:w-48 p-6 bg-blue-600 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-2xl shadow-blue-500/40 group/btn cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                <span className="text-[10px] uppercase font-black text-blue-100 tracking-widest relative z-10">Repo Health</span>
                <div className="flex items-center gap-3 text-3xl font-black text-white relative z-10">
                  <CheckCircle2 size={24} />
                  98%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Pulse Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {[
          { label: 'Total Files', value: '1,248', icon: <FileCode />, color: 'text-blue-500' },
          { label: 'Modules', value: '42', icon: <Layers />, color: 'text-purple-500' },
          { label: 'Complexity', value: 'Medium', icon: <Cpu />, color: 'text-emerald-500' },
          { label: 'Latency', value: '24ms', icon: <Zap />, color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-between group hover:bg-slate-900/50 transition-all">
            <div className="space-y-1">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-black text-white">{stat.value}</div>
            </div>
            <div className={`p-3 bg-slate-800/50 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
              {React.cloneElement(stat.icon as any, { size: 20 })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Enhanced Architecture Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {!repo?.architecture || isProcessing ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-10 bg-slate-900/20 rounded-[3rem] border border-slate-800 animate-pulse space-y-6">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl"></div>
                    <div className="space-y-3">
                      <div className="h-5 bg-slate-800 rounded-full w-3/4"></div>
                      <div className="h-4 bg-slate-800/40 rounded-full w-full"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              (repo?.architecture || '').split('# ').filter(Boolean).map((section, idx) => {
                const lines = section.split('\n');
                if (lines.length === 0) return null;
                const title = lines[0];
                const content = lines.slice(1).join('\n').trim();

                if (!title || !content) return null;
                const colors = [
                  { bg: 'bg-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: <Layers /> },
                  { bg: 'bg-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: <Zap /> },
                  { bg: 'bg-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: <Box /> }
                ][idx % 3];

                return (
                  <div key={idx} className="group relative p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] hover:border-blue-500/50 transition-all duration-500 flex flex-col gap-6 shadow-2xl backdrop-blur-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 transition-all"></div>

                    <div className="flex items-center gap-5">
                      <div className={`p-4 ${colors.bg} ${colors.border} border rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                        {React.cloneElement(colors.icon as any, { className: colors.text, size: 24 })}
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight leading-none">{title.replace('#', '').trim()}</h3>
                    </div>
                    <div className="text-slate-400 text-sm leading-relaxed font-bold italic border-l-2 border-slate-800/50 pl-4">
                      {content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to={`/repo/${id}/explorer`} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
              <div className="relative p-10 rounded-[2.5rem] bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 transition-all flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-8">
                  <div className="p-6 bg-orange-600/10 rounded-3xl group-hover:rotate-12 transition-all">
                    <FileCode className="text-orange-500" size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Code Mapping</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Unified Repo Explorer</p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-orange-600 transition-all">
                  <ChevronRight size={28} />
                </div>
              </div>
            </Link>

            <Link to={`/repo/${id}/graph`} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
              <div className="relative p-10 rounded-[2.5rem] bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-8">
                  <div className="p-6 bg-purple-600/10 rounded-3xl group-hover:-rotate-12 transition-all">
                    <Box className="text-purple-500" size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Deep Blueprint</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Live Dependency Graph</p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-purple-600 transition-all">
                  <ChevronRight size={28} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-10">
          <div className="bg-slate-900/60 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 backdrop-blur-xl group">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xl flex items-center gap-4 text-white uppercase tracking-tighter">
                <Activity className="text-blue-500 animate-pulse" size={24} />
                Repo Pulse
              </h3>
              <RefreshCw size={18} className="text-slate-600 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover/item:text-slate-300 transition-colors">Source Language</span>
                </div>
                <span className="font-black text-sm text-blue-400 px-4 py-2 bg-blue-500/5 border border-blue-500/20 rounded-xl">{repo?.primaryLanguage || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover/item:text-slate-300 transition-colors">Analysis Engine</span>
                </div>
                <span className="text-purple-400 font-black text-sm px-4 py-2 bg-purple-500/5 border border-purple-500/20 rounded-xl">Deep Thinking</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover/item:text-slate-300 transition-colors">Analysis Depth</span>
                </div>
                <span className="text-emerald-400 font-black text-sm px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl italic">Full Semantic</span>
              </div>
            </div>

            <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 space-y-4">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Live Activity Feed</div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Mapping internal dependencies...
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                Synthesizing folder hierarchy...
              </div>
            </div>
          </div>

          {/* AI Assistant Banner */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[3rem] p-12 text-white shadow-[0_20px_100px_rgba(59,130,246,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <MessageSquare size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black tracking-tighter leading-none italic">Talk to your Codebase</h3>
                <p className="text-blue-100 font-bold text-lg leading-relaxed opacity-80">
                  Uncover hidden patterns, bugs, and architectural flaws with the LLM.
                </p>
              </div>
              <Link
                to={`/repo/${id}/chat`}
                className="w-full py-5 bg-white text-blue-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] transition-all active:scale-95 group/launch"
              >
                Launch Intelligence
                <ChevronRight size={24} className="group-hover/launch:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
