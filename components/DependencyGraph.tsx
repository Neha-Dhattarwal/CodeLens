import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router-dom';
import { repoService } from '../services/api';
import { Loader2, Maximize, File, Code, Server, Layout, Database, Search as SearchIcon, X, HardDrive, Cpu, Terminal } from 'lucide-react';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260;
const nodeHeight = 80;
const groupPadding = 80;

// Custom Node Components for specific system roles
const DatabaseNode = ({ data }: { data: any }) => (
  <div className="relative p-5 rounded-[2rem] bg-stone-900 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center gap-2 min-w-[200px] group">
    <div className="absolute -top-1 -right-1 flex gap-0.5 scale-75">
      <div className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[7px] font-black text-amber-500">12KB</div>
      <div className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[7px] font-black text-amber-500">3 DEPS</div>
    </div>
    <div className="p-2 bg-amber-500/10 rounded-xl mb-1">
      <Database className="text-amber-500" size={24} />
    </div>
    <div className="flex flex-col items-center">
      <div className="text-sm font-black text-white tracking-widest uppercase">{data.label}</div>
      <div className="text-[8px] text-amber-500/50 font-bold tracking-tighter truncate max-w-[120px]">{data.fullPath}</div>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-stone-900" />
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-stone-900" />
  </div>
);

const ServerNode = ({ data }: { data: any }) => (
  <div className="relative p-5 rounded-3xl bg-red-950/40 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex items-center gap-4 min-w-[240px] group overflow-hidden">
    <div className="absolute top-2 right-2 scale-75">
      <div className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[7px] font-black text-red-400 uppercase">Host: API</div>
    </div>
    <div className="p-2.5 bg-red-500/20 rounded-2xl">
      <Server className="text-red-500" size={24} />
    </div>
    <div className="flex flex-col">
      <div className="text-sm font-black text-white tracking-widest">{data.label}</div>
      <div className="text-[8px] text-red-500/50 font-bold uppercase tracking-tighter truncate max-w-[140px]">{data.fullPath}</div>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3 !border-2 !border-red-950" />
    <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-3 !h-3 !border-2 !border-red-950" />
  </div>
);

const ComponentNode = ({ data }: { data: any }) => (
  <div className="relative p-5 rounded-[1.5rem] bg-emerald-950/30 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col gap-2 min-w-[180px] backdrop-blur-xl group">
    <div className="absolute top-2 right-2 scale-75">
      <div className="px-1 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[6px] font-black text-emerald-400">REACT</div>
    </div>
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
        <Cpu className="text-emerald-500" size={16} />
      </div>
      <div className="flex flex-col">
        <div className="text-xs font-black text-white tracking-tight">{data.label}</div>
        <div className="text-[7px] text-emerald-500/40 font-bold tracking-tighter truncate max-w-[100px]">{data.fullPath}</div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-emerald-950" />
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-emerald-950" />
  </div>
);

const nodeTypes = {
  database: DatabaseNode,
  server: ServerNode,
  component: ComponentNode
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 300, // Significant increase from 150
    nodesep: 250, // Significant increase from 150
    marginx: 200,
    marginy: 200
  });

  const dataNodes = nodes.filter(n => n.type !== 'group');
  dataNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    if (node.type !== 'group') {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? 'left' : 'top' as any;
      node.sourcePosition = isHorizontal ? 'right' : 'bottom' as any;
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const GraphInner = ({
  showInternalOnly = true,
  direction = 'TB'
}: { showInternalOnly?: boolean; direction?: 'TB' | 'LR' }) => {
  const { id } = useParams();
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltip, setTooltip] = useState<{ x: number, y: number, data: any } | null>(null);

  const getNodeType = (path: string) => {
    const lower = path.toLowerCase();
    if (lower.includes('db') || lower.includes('model') || lower.includes('schema')) return 'database';
    if (lower.includes('backend') || lower.includes('server') || lower.includes('api')) return 'server';
    if (lower.includes('component')) return 'component';
    return 'default';
  };

  const getLayerColor = (path: string) => {
    const lower = path.toLowerCase();
    if (lower.includes('db') || lower.includes('model')) return { bg: '#1c1917', border: '#f59e0b' };
    if (lower.includes('backend') || lower.includes('server')) return { bg: '#450a0a', border: '#ef4444' };
    if (lower.includes('pages')) return { bg: '#1e1b4b', border: '#6366f1' };
    if (lower.includes('components')) return { bg: '#064e3b', border: '#10b981' };
    return { bg: '#0f172a', border: '#334155' };
  };

  useEffect(() => {
    const loadGraph = async () => {
      if (!id) return;
      try {
        const response = await repoService.getDependencies(id);
        const deps = response.data;

        let initialNodes: Node[] = [];
        let initialEdges: Edge[] = [];
        const nodeSet = new Set<string>();
        const folders = new Set<string>();

        const isExternal = (path: string) => {
          const lower = path.toLowerCase();
          const hasExt = ['.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.json', '.mjs'].some(ext => lower.endsWith(ext));
          return !hasExt || lower.includes('node_modules');
        };

        const getFolder = (path: string) => {
          const parts = path.split(/[/\\]/);
          if (parts.length <= 1) return 'ROOT';
          return parts.slice(0, -1).join('/').toUpperCase();
        };

        deps.forEach((dep: any, index: number) => {
          [dep.sourceFile, dep.targetFile].forEach(path => {
            if (!nodeSet.has(path)) {
              const external = isExternal(path);
              const nodeType = getNodeType(path);
              const label = path.split(/[/\\]/).pop() || path;
              const folder = getFolder(path);
              if (!external) folders.add(folder);

              initialNodes.push({
                id: path,
                type: nodeType === 'default' ? undefined : nodeType,
                data: {
                  label,
                  fullPath: path,
                  isExternal: external,
                  folder
                },
                position: { x: 0, y: 0 },
                style: nodeType === 'default' ? {
                  background: external ? 'rgba(15, 23, 42, 0.4)' : getLayerColor(path).bg,
                  color: external ? '#475569' : '#f8fafc',
                  border: `2px solid ${external ? '#1e293b' : getLayerColor(path).border}`,
                  borderRadius: '20px',
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontWeight: '900',
                  fontFamily: 'JetBrains Mono, monospace',
                  width: 'auto',
                  minWidth: 160,
                  height: 'auto',
                  minHeight: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: external ? 'none' : `0 15px 35px -10px ${getLayerColor(path).border}40`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                } : {}
              });
              nodeSet.add(path);
            }
          });

          initialEdges.push({
            id: `e-${index}`,
            source: dep.sourceFile,
            target: dep.targetFile,
            type: 'smoothstep',
            animated: !isExternal(dep.targetFile),
            style: { stroke: '#334155', strokeWidth: 1.5, opacity: 0.4 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 20, height: 20 }
          });
        });

        // Create Subgraphs
        folders.forEach(folder => {
          initialNodes.push({
            id: `folder-${folder}`,
            type: 'group',
            data: { label: folder },
            position: { x: 0, y: 0 },
            style: {
              background: 'rgba(30, 41, 59, 0.03)',
              border: '2px dashed rgba(51, 65, 85, 0.3)',
              borderRadius: '40px',
              width: 0,
              height: 0,
              zIndex: -1,
              backdropFilter: 'blur(4px)'
            }
          });
        });

        setAllData({ nodes: initialNodes, edges: initialEdges });
      } catch (err) {
        console.error('Graph Load Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGraph();
  }, [id]);

  useEffect(() => {
    if (allData.nodes.length === 0) return;

    let filteredNodes = allData.nodes;
    let filteredEdges = allData.edges;

    if (showInternalOnly) {
      filteredNodes = allData.nodes.filter(n => !(n.data as any).isExternal || n.type === 'group');
      const activeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = allData.edges.filter(e => activeIds.has(e.source) && activeIds.has(e.target));
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...filteredNodes],
      [...filteredEdges],
      direction
    );

    const finalNodes = [...layoutedNodes];
    const groups = finalNodes.filter(n => n.type === 'group');

    groups.forEach(group => {
      const folderName = group.id.replace('folder-', '');
      const children = finalNodes.filter(n => n.data?.folder === folderName);

      if (children.length > 0) {
        const minX = Math.min(...children.map(n => n.position.x));
        const minY = Math.min(...children.map(n => n.position.y));
        const maxX = Math.max(...children.map(n => n.position.x + nodeWidth));
        const maxY = Math.max(...children.map(n => n.position.y + nodeHeight));

        group.position = { x: minX - groupPadding, y: minY - groupPadding };
        group.style = {
          ...group.style,
          width: (maxX - minX) + (groupPadding * 2),
          height: (maxY - minY) + (groupPadding * 2),
          border: '2px solid rgba(51, 65, 85, 0.2)',
          background: 'rgba(15, 23, 42, 0.05)',
        };
      }
    });

    setNodes(finalNodes);
    setEdges(layoutedEdges);

    setTimeout(() => {
      fitView({ padding: 0.15, duration: 1000 });
    }, 200);
  }, [allData, showInternalOnly, direction, setNodes, setEdges, fitView]);

  useEffect(() => {
    const activeId = pinnedNode || hoverNode || (searchQuery ? nodes.find(n => n.type !== 'group' && (n.data as any).label.toLowerCase().includes(searchQuery.toLowerCase()))?.id : null);

    if (!activeId) {
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1, scale: 1, filter: 'none' } })));
      setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#1e293b', strokeWidth: 2, opacity: 0.3 } })));
      return;
    }

    const connectedNodes = new Set<string>([activeId]);
    const connectedEdges = new Set<string>();

    edges.forEach(edge => {
      if (edge.source === activeId || edge.target === activeId) {
        connectedEdges.add(edge.id);
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }
    });

    setNodes(nds => nds.map(n => {
      if (n.type === 'group') return { ...n, style: { ...n.style, opacity: 0.2 } };
      const isConnected = connectedNodes.has(n.id);
      const isTarget = n.id === activeId;
      const baseStyle = n.style || {};

      return {
        ...n,
        style: {
          ...baseStyle,
          opacity: isConnected ? 1 : 0.05,
          filter: isConnected ? 'none' : 'blur(4px)',
          scale: isTarget ? 1.1 : 1,
          zIndex: isConnected ? 100 : 1
        }
      };
    }));

    setEdges(eds => eds.map(e => {
      const isConnected = connectedEdges.has(e.id);
      return {
        ...e,
        animated: isConnected,
        style: {
          ...e.style,
          stroke: isConnected ? '#3b82f6' : '#1e293b',
          strokeWidth: isConnected ? 4 : 1.5,
          opacity: isConnected ? 1 : 0.05,
          strokeDasharray: isConnected ? '10 10' : 'none'
        }
      };
    }));
  }, [hoverNode, pinnedNode, searchQuery, nodes.length, edges.length, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#020617]">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-600/20 animate-pulse rounded-full"></div>
          <Loader2 className="animate-spin text-blue-500 relative z-10" size={80} />
        </div>
        <div className="mt-10 text-center">
          <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Architectural Render</h2>
          <p className="text-blue-500/50 font-mono text-xs uppercase tracking-[0.6em] animate-pulse">Scanning System Topology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#020617] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.01}
        maxZoom={1}
        onNodeMouseEnter={(_, node) => {
          if (node.type !== 'group') {
            setHoverNode(node.id);
            setTooltip({ x: 0, y: 0, data: node });
          }
        }}
        onNodeMouseMove={(event, node) => {
          if (node.type !== 'group') {
            setTooltip({ x: event.clientX, y: event.clientY, data: node });
          }
        }}
        onNodeMouseLeave={() => {
          setHoverNode(null);
          setTooltip(null);
        }}
        onNodeClick={(_, node) => node.type !== 'group' && setPinnedNode(pinnedNode === node.id ? null : node.id)}
        onPaneClick={() => setPinnedNode(null)}
      >
        {/* Floating Control Deck */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-slate-900/60 border border-slate-700/50 rounded-[3rem] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="relative group">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Trace dependency path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-12 py-3 bg-slate-800/40 border border-transparent rounded-[2rem] text-sm text-white focus:outline-none focus:border-blue-500/50 w-[320px] transition-all"
            />
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <button
            onClick={() => fitView({ padding: 0.2, duration: 800 })}
            className="p-3 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all group"
            title="Recenter View"
          >
            <Maximize size={20} />
          </button>
        </div>

        <Background
          color="#1e293b"
          gap={100}
          variant={'lines' as any}
          size={1}
          className="opacity-20"
        />
        <Background
          color="#0f172a"
          gap={20}
          variant={'lines' as any}
          size={0.5}
          className="opacity-10"
        />

        {/* Intelligence Tooltip */}
        {tooltip && (
          <div
            className="absolute z-[100] p-6 bg-slate-900 border border-blue-500/30 rounded-3xl shadow-3xl backdrop-blur-2xl pointer-events-none min-w-[280px] animate-in fade-in zoom-in-95 duration-200"
            style={{ left: tooltip.x + 20, top: tooltip.y + 20 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <File className="text-blue-400" size={16} />
                </div>
                <div className="text-xs font-black text-white uppercase tracking-tighter">System Insight</div>
              </div>
              <div className="space-y-1 border-l-2 border-blue-500/20 pl-4">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Physical Path</div>
                <div className="text-xs text-slate-300 font-mono break-all leading-relaxed">{tooltip.data.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Impact</div>
                  <div className="text-xs text-blue-400 font-black">High Criticality</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Fan-out</div>
                  <div className="text-xs text-emerald-400 font-black">4 Relations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-10 right-10 flex gap-4 z-50">
          <div className="bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 backdrop-blur-xl">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-black text-white tracking-widest uppercase">System Balanced</span>
          </div>
        </div>

        {/* High-End Legend */}
        <div className="absolute bottom-10 left-10 bg-slate-900/95 border-2 border-slate-800 p-10 rounded-[3rem] backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-50 pointer-events-none w-[320px]">
          <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.5em] mb-6 border-b border-slate-800 pb-4">Logic Classifications</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-amber-500/10 border-2 border-amber-500 rounded-2xl">
                <Database size={20} className="text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Data Engines</div>
                <div className="text-[10px] text-slate-500 font-bold">Persistence Layers</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="p-3 bg-red-500/10 border-2 border-red-500 rounded-2xl">
                <Server size={20} className="text-red-500" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Execution Racks</div>
                <div className="text-[10px] text-slate-500 font-bold">Backend Logic</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="p-3 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl">
                <Code size={20} className="text-emerald-500" />
              </div>
              <div>
                <div className="text-xs font-black text-white">UI Blueprints</div>
                <div className="text-[10px] text-slate-500 font-bold">Reusable Modules</div>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-3 italic">
              <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              <span className="text-[10px] font-bold text-blue-500/70">Hover anywhere to trace signals</span>
            </div>
          </div>
        </div>

        <Controls className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-3xl overflow-hidden backdrop-blur-md m-10 scale-125" showInteractive={false} />

        <button
          onClick={() => fitView({ padding: 0.2, duration: 800 })}
          className="absolute bottom-14 right-24 bg-blue-600 border-4 border-blue-400 p-6 rounded-[2.5rem] text-white hover:bg-blue-500 transition-all z-50 shadow-[0_0_80px_-10px_rgba(59,130,246,0.8)] group active:scale-95"
        >
          <Maximize size={32} className="group-hover:scale-110 transition-transform" />
        </button>

        <MiniMap
          nodeColor={(n) => n.style?.background as string || '#1e293b'}
          maskColor="rgba(2, 6, 23, 0.95)"
          style={{ background: '#020617', borderRadius: '40px', border: '4px solid #111827', width: 280, height: 180 }}
          className="m-14"
        />
      </ReactFlow>

      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .react-flow__edge-path {
          transition: stroke 0.3s, stroke-width 0.3s;
        }
        .react-flow__edge.animated path {
          animation: flow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

const DependencyGraph = (props: { showInternalOnly?: boolean; direction?: 'TB' | 'LR' }) => (
  <ReactFlowProvider>
    <GraphInner {...props} />
  </ReactFlowProvider>
);

export default DependencyGraph;
