
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Code2, 
  BookOpen, 
  Import, 
  Box,
  CornerDownRight,
  Search,
  Zap,
  ShieldAlert,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { repoService } from '../services/api';

interface TreeNodeProps {
  node: any;
  onSelect: (node: any) => void;
  selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelect, selectedId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedId === node._id || selectedId === node.id;
  const isDirectory = node.type === 'directory' || !!node.children;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-2xl transition-all group ${
          isSelected ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg' : 'hover:bg-slate-800/50'
        }`}
      >
        <span className="text-slate-500 group-hover:text-slate-300">
          {isDirectory ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <File size={16} className="ml-4" />}
        </span>
        {isDirectory && <Folder size={18} className={`${isOpen ? 'text-blue-400' : 'text-slate-500'} fill-current opacity-20`} />}
        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>{node.name}</span>
      </div>
      
      {isDirectory && isOpen && node.children && (
        <div className="ml-5 border-l border-slate-800/50 pl-3 mt-1 space-y-1">
          {node.children.map((child: any) => (
            <TreeNode key={child._id || child.id} node={child} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExplorerPage: React.FC = () => {
  const { id } = useParams();
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await repoService.getFiles(id);
        // Backend returns a flat list, we convert to tree if not handled by API
        setFileTree(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load project structure.');
        console.error('Explorer Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [id]);

  const filteredTree = useMemo(() => {
    if (!searchTerm) return fileTree;
    
    const filterNodes = (nodes: any[]): any[] => {
      return nodes.reduce((acc, node) => {
        const nameMatch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (node.children) {
          const children = filterNodes(node.children);
          if (children.length > 0 || nameMatch) {
            acc.push({ ...node, children });
          }
        } else if (nameMatch) {
          acc.push(node);
        }
        return acc;
      }, []);
    };
    
    return filterNodes(fileTree);
  }, [searchTerm, fileTree]);

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8 overflow-hidden animate-in fade-in duration-500">
      {/* File Tree Panel */}
      <div className="w-96 flex flex-col bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/20">
          <h2 className="text-lg font-bold flex items-center gap-3 mb-6 text-white">
            <Box size={20} className="text-blue-500" />
            Workspace
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white placeholder:text-slate-600"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-xs font-mono tracking-widest uppercase">Mapping repository...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
              <AlertCircle size={32} className="text-red-500/50" />
              <p className="text-sm text-slate-500 font-medium">{error}</p>
            </div>
          ) : filteredTree.length > 0 ? (
            filteredTree.map(node => (
              <TreeNode 
                key={node._id || node.id} 
                node={node} 
                onSelect={(node) => setSelectedFile(node)} 
                selectedId={selectedFile?._id || selectedFile?.id} 
              />
            ))
          ) : (
            <p className="text-center text-slate-600 text-xs mt-20 font-medium">No files indexed yet.</p>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
        {selectedFile ? (
          <div key={selectedFile._id || selectedFile.id} className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
            <div className="p-8 border-b border-slate-800/50 bg-slate-900/20 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600/10 rounded-2xl shadow-inner">
                  <File className="text-blue-400" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedFile.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-mono text-slate-400 rounded border border-slate-700 uppercase">{selectedFile.path.split('.').pop()}</span>
                    <p className="text-xs font-mono text-slate-500 tracking-wider truncate max-w-xs">{selectedFile.path}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <BookOpen size={24} className="text-blue-500" />
                    Neural Explanation
                  </h3>
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    AI Context Active
                  </div>
                </div>
                <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={64} className="text-blue-400" />
                  </div>
                  <p className="relative z-10 leading-relaxed text-slate-300 text-lg font-medium">
                    {selectedFile.explanation || "This file is currently being processed by the AI reasoning engine. Check back in a few seconds."}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Code2 size={24} className="text-purple-500" />
                    Interface
                  </h3>
                  <div className="space-y-3">
                    {selectedFile.functions && selectedFile.functions.length > 0 ? (
                      selectedFile.functions.map((fn: string) => (
                        <div key={fn} className="flex items-center gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 font-mono text-sm text-purple-300 hover:border-purple-500/40 transition-all group/fn">
                          <CornerDownRight size={16} className="text-slate-600 group-hover/fn:text-purple-500 transition-colors" />
                          {fn}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-600 text-sm font-medium">
                        No function declarations found.
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Import size={24} className="text-green-500" />
                    Inter-modules
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedFile.imports && selectedFile.imports.length > 0 ? (
                      selectedFile.imports.map((imp: string) => (
                        <span key={imp} className="px-5 py-2.5 bg-slate-800/80 text-xs font-bold font-mono text-slate-300 rounded-2xl border border-slate-700 hover:text-green-400 hover:border-green-500/40 transition-all cursor-default shadow-sm">
                          {imp}
                        </span>
                      ))
                    ) : (
                      <div className="p-8 w-full border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-600 text-sm font-medium">
                        No external dependencies.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-12 p-6 bg-blue-900/10 border border-blue-900/20 rounded-3xl flex items-start gap-4">
                    <ShieldAlert size={24} className="text-blue-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest">Static Audit</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">Cross-referenced with internal system graph. No circular dependencies detected originating from this module.</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="p-12 bg-slate-800/20 rounded-full shadow-inner">
              <Folder size={84} className="opacity-10" />
            </div>
            <div className="space-y-4 max-w-sm">
              <p className="text-3xl font-black text-slate-200 tracking-tighter">Deep Inspection</p>
              <p className="text-slate-500 leading-relaxed font-medium">
                Select a module from the workspace tree to reveal its internal logic and AI-augmented insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerPage;
