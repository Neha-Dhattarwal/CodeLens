
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowRight, Loader2, Globe, Database, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { repoService } from '../services/api';

const HomePage: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsLoading(true);
    setError(null);

    const steps = [
      'Initializing Analysis Engine...',
      'Validating Repository...',
      'Cloning Source Files...',
      'Building Dependency Map...',
      'Generating Logic Summaries...'
    ];

    setLoadingStep(steps[0]);
    let stepIndex = 1;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 600);

    try {
      const response = await repoService.analyze(repoUrl);
      const { repoId } = response.data;

      setLoadingStep('Deployment Finalized. Redirecting...');
      setTimeout(() => {
        clearInterval(interval);
        navigate(`/repo/${repoId}`);
      }, 1000); // Shorter final delay
    } catch (err: any) {
      console.error('Analysis failed:', err);
      clearInterval(interval);
      setIsLoading(false);
      setError('Connection to engine failed. Please check if the repository is public.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-20 py-16 px-4">
      <div className="text-center max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} className="animate-pulse" />
          <span>Release 1.0 — Advanced Intelligence Engine</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
          Code Intelligence <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">AI-Architected.</span>
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          The ultimate platform for codebase exploration. Analyze architecture, trace data flow,
          and onboard to complex projects using state-of-the-art deep reasoning.
        </p>

        <form onSubmit={handleAnalyze} className="relative max-w-2xl mx-auto pt-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-slate-900/90 border border-slate-700/50 rounded-[1.5rem] overflow-hidden p-3 backdrop-blur-xl">
              <div className="pl-5 text-slate-500">
                <Github size={28} />
              </div>
              <input
                id="url-input"
                type="text"
                placeholder="https://github.com/facebook/react"
                className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-lg text-white font-mono placeholder:text-slate-600"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !repoUrl}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-orange-900/40 group/btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Repo</span>
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-8 space-y-4 animate-in fade-in duration-500">
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-orange-500 animate-[loading_4s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-sm font-mono text-orange-400 animate-pulse">{loadingStep}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center justify-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl animate-in zoom-in duration-300">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {!isLoading && !error && (
            <p className="mt-5 text-sm text-slate-500 font-mono">
              High-reasoning inference via <span className="text-blue-400">Advanced Logic Cluster</span>.
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0; transform: translateX(0); }
          50% { width: 70%; }
          100% { width: 100%; transform: translateX(0); }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          icon={<Globe className="text-orange-400" />}
          title="Deep Logic Analysis"
          description="Leveraging high-speed inference to analyze complex logic patterns and provide human-readable explanations."
        />
        <FeatureCard
          icon={<Database className="text-red-400" />}
          title="Module Interactions"
          description="Every file analyzed for exports and imports to build a live architectural map using state-of-the-art AI."
        />
        <FeatureCard
          icon={<ShieldCheck className="text-purple-400" />}
          title="Pattern Detection"
          description="Identify architectural bottlenecks and design patterns automatically with our specialized AI reasoning service."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-10 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 hover:border-orange-500/30 transition-all group backdrop-blur-sm">
    <div className="mb-6 p-4 rounded-2xl bg-slate-950/50 inline-block group-hover:scale-110 transition-transform shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-medium text-sm">
      {description}
    </p>
  </div>
);

export default HomePage;
