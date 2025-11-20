import React, { useState, useRef } from 'react';
import { MindMapNode, MindMapEdge } from '../types';
import { Plus, MousePointer2, Move, ZoomIn, ZoomOut, Zap } from 'lucide-react';

interface MindMapProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  onUpdate: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export const MindMap: React.FC<MindMapProps> = ({ nodes, edges, onUpdate, onConnect, onNodeSelect, selectedNodeId }) => {
  // Viewport State (Infinite Canvas)
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Interaction State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const getWorldPos = (clientX: number, clientY: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - view.x) / view.zoom,
        y: (clientY - rect.top - view.y) / view.zoom
      };
    }
    return { x: 0, y: 0 };
  };

  // --- Infinite Canvas Logic ---

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // Zoom logic
    const zoomSensitivity = 0.001;
    const newZoom = Math.max(0.1, Math.min(3, view.zoom - e.deltaY * zoomSensitivity));
    setView(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking background, start panning
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      onNodeSelect(null); // Deselect when clicking bg
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    // Node Dragging
    if (draggedNodeId) {
      const dx = e.movementX / view.zoom;
      const dy = e.movementY / view.zoom;

      const updatedNodes = nodes.map(node => {
        if (node.id === draggedNodeId) {
          return { ...node, x: node.x + dx, y: node.y + dy };
        }
        return node;
      });
      onUpdate(updatedNodes, edges);
    }

    // Connection Dragging
    if (connectingNodeId) {
      setCursorPos(getWorldPos(e.clientX, e.clientY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    setConnectingNodeId(null);
  };

  // --- Node Interactions ---

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // Prevent canvas panning
    if (e.button === 0) {
      setDraggedNodeId(nodeId);
      onNodeSelect(nodeId);
    }
  };

  const handleConnectStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectingNodeId(nodeId);
    setCursorPos(getWorldPos(e.clientX, e.clientY));
    onNodeSelect(nodeId);
  };

  const handleNodeMouseUp = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingNodeId && connectingNodeId !== nodeId) {
      onConnect(connectingNodeId, nodeId);
    }
    setConnectingNodeId(null);
  };

  // --- CRUD Actions ---

  const addNode = (type: 'TASK' | 'RESOURCE' | 'NOTE') => {
    // Add node to center of current view
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = (rect.width / 2 - view.x) / view.zoom;
      const centerY = (rect.height / 2 - view.y) / view.zoom;

      const newNode: MindMapNode = {
        id: `node-${Date.now()}`,
        label: type === 'NOTE' ? 'New Note' : `New ${type === 'TASK' ? 'Task' : 'Resource'}`,
        type,
        x: centerX - 100, // Offset to center the node visually
        y: centerY - 25,
        notes: ''
      };
      onUpdate([...nodes, newNode], edges);
      onNodeSelect(newNode.id);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-sm border border-neutral-800 group select-none">
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* World Content (Transformed) */}
        <div 
          style={{ 
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%'
          }}
          className="relative w-full h-full"
        >
           {/* Grid Pattern (Scaled with World) */}
           <div className="absolute -top-[5000px] -left-[5000px] w-[10000px] h-[10000px] opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(to right, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}
           />

           {/* Connections Layer */}
           <svg className="absolute -top-[5000px] -left-[5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible">
             {/* Existing Edges */}
             {edges.map((edge) => {
                const source = nodes.find((n) => n.id === edge.source);
                const target = nodes.find((n) => n.id === edge.target);
                if (!source || !target) return null;
                
                return (
                  <line
                    key={edge.id}
                    x1={source.x + 100 + 5000} 
                    y1={source.y + 30 + 5000}  
                    x2={target.x + 100 + 5000}
                    y2={target.y + 30 + 5000}
                    stroke="#444"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Temporary Connection Line */}
              {connectingNodeId && (
                <line
                  x1={nodes.find(n => n.id === connectingNodeId)!.x + 100 + 5000}
                  y1={nodes.find(n => n.id === connectingNodeId)!.y + 30 + 5000}
                  x2={cursorPos.x + 5000}
                  y2={cursorPos.y + 5000}
                  stroke="#FF4D00"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
           </svg>

           {/* Nodes Layer */}
           {nodes.map((node) => {
             const isSelected = selectedNodeId === node.id;
             const isConnectingSource = connectingNodeId === node.id;
             
             let borderColor = 'border-neutral-700';
             let textColor = 'text-neutral-300';

             if (node.type === 'ROOT') { borderColor = 'border-brand-600'; textColor = 'text-white'; }
             if (node.type === 'TASK') { borderColor = 'border-blue-900'; textColor = 'text-blue-100'; }
             if (node.type === 'RESOURCE') { borderColor = 'border-green-900'; textColor = 'text-green-100'; }
             
             if (isSelected) {
               borderColor = 'border-white';
             }
             if (isConnectingSource) {
               borderColor = 'border-brand-500 shadow-[0_0_15px_rgba(255,77,0,0.3)]';
             }

             return (
              <div
                key={node.id}
                className={`absolute w-[200px] bg-black border ${borderColor} rounded-sm transition-all flex flex-col shadow-lg group hover:border-neutral-500 hover:z-50`}
                style={{ left: node.x, top: node.y, zIndex: isSelected ? 50 : 10 }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
              >
                <div className="p-3 flex items-start gap-3">
                   <div className={`w-2 h-2 mt-1 shrink-0 rounded-full ${node.type === 'ROOT' ? 'bg-brand-500' : node.type === 'TASK' ? 'bg-blue-500' : 'bg-green-500'}`} />
                   <div className="flex-1 min-w-0">
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-500`}>{node.type}</div>
                      <div className={`text-xs font-bold font-mono leading-tight truncate ${textColor}`}>{node.label}</div>
                   </div>
                </div>

                {/* Connection Handle */}
                <div 
                  className={`absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-neutral-900 border border-neutral-600 rounded-full cursor-crosshair z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isConnectingSource ? 'opacity-100 bg-brand-600 border-brand-500' : 'hover:bg-brand-600 hover:border-brand-500'}`}
                  onMouseDown={(e) => handleConnectStart(e, node.id)}
                >
                   <div className="w-1 h-1 bg-white rounded-full pointer-events-none"/>
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-50 pointer-events-none" />
                )}
              </div>
            );
           })}
        </div>
      </div>

      {/* Floating Controls Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 p-1 rounded-sm shadow-2xl flex items-center gap-1 z-30">
         <button onClick={() => addNode('TASK')} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-sm flex flex-col items-center gap-1 w-16 transition-colors">
           <Plus className="w-4 h-4" /> <span className="text-[9px] font-bold uppercase">Task</span>
         </button>
         <div className="w-px h-6 bg-neutral-800 mx-1"></div>
         <button onClick={() => addNode('RESOURCE')} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-sm flex flex-col items-center gap-1 w-16 transition-colors">
           <Plus className="w-4 h-4" /> <span className="text-[9px] font-bold uppercase">Res</span>
         </button>
         <div className="w-px h-6 bg-neutral-800 mx-1"></div>
         <button onClick={() => addNode('NOTE')} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-sm flex flex-col items-center gap-1 w-16 transition-colors">
           <Plus className="w-4 h-4" /> <span className="text-[9px] font-bold uppercase">Note</span>
         </button>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
         <button onClick={() => setView(v => ({...v, zoom: v.zoom + 0.1}))} className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-white hover:border-neutral-600"><ZoomIn className="w-4 h-4"/></button>
         <button onClick={() => setView(v => ({...v, zoom: 1, x: 0, y: 0}))} className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-white hover:border-neutral-600 text-[10px] font-bold font-mono">1:1</button>
         <button onClick={() => setView(v => ({...v, zoom: Math.max(0.1, v.zoom - 0.1)}))} className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-white hover:border-neutral-600"><ZoomOut className="w-4 h-4"/></button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none select-none opacity-50">
         <div className="flex items-center gap-2 bg-black/80 text-[10px] text-neutral-400 px-2 py-1 rounded-sm border border-neutral-900 font-mono uppercase">
           <MousePointer2 className="w-3 h-3"/> Pan Canvas
         </div>
         <div className="flex items-center gap-2 bg-black/80 text-[10px] text-neutral-400 px-2 py-1 rounded-sm border border-neutral-900 font-mono uppercase">
           <Move className="w-3 h-3"/> Move Nodes
         </div>
         <div className="flex items-center gap-2 bg-black/80 text-[10px] text-neutral-400 px-2 py-1 rounded-sm border border-neutral-900 font-mono uppercase">
           <Zap className="w-3 h-3"/> Drag Handle to Connect
         </div>
      </div>
    </div>
  );
};