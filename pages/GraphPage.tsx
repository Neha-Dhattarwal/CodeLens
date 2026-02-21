import React from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Info, Filter, Download, GitBranch } from 'lucide-react';
import DependencyGraph from '../components/DependencyGraph';

const GraphPage: React.FC = () => {
  const { id } = useParams();
  const [showInternalOnly, setShowInternalOnly] = React.useState(true);
  const [direction, setDirection] = React.useState<'TB' | 'LR' | any>('TB');

  return (
    <div className="space-y-6 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Share2 className="text-blue-500" />
            Dependency Graph
          </h1>
          <p className="text-slate-500 text-sm">Interactive visualization of module relationships</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDirection(direction === 'TB' ? 'LR' : 'TB')}
            className={`flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm transition-all ${direction === 'LR' ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' : 'text-slate-300 hover:text-white'}`}
          >
            <GitBranch size={16} className={direction === 'LR' ? 'rotate-90' : ''} />
            {direction === 'TB' ? 'Vertical Flow' : 'Horizontal Flow'}
          </button>
          <button
            onClick={() => setShowInternalOnly(!showInternalOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${showInternalOnly
              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
          >
            <Filter size={16} />
            {showInternalOnly ? 'Internal Only' : 'Show All'}
          </button>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
            <Download size={16} />
            Export Image
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <DependencyGraph showInternalOnly={showInternalOnly} direction={direction} />
      </div>
    </div>
  );
};

export default GraphPage;
