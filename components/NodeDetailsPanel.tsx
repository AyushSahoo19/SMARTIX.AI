import React, { useState, useEffect } from 'react';
import { MindMapNode, Task, Resource } from '../types';
import { X, Save, StickyNote, Type, Link, Clock, Calendar, Trash2 } from 'lucide-react';

interface NodeDetailsPanelProps {
  node: MindMapNode;
  relatedTask?: Task;
  relatedResource?: Resource;
  onClose: () => void;
  onSave: (updatedNode: MindMapNode) => void;
  onDelete: (nodeId: string) => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  node, 
  relatedTask, 
  relatedResource, 
  onClose, 
  onSave,
  onDelete
}) => {
  const [label, setLabel] = useState(node.label);
  const [notes, setNotes] = useState(node.notes || '');

  useEffect(() => {
    setLabel(node.label);
    setNotes(node.notes || '');
  }, [node]);

  const handleSave = () => {
    onSave({
      ...node,
      label,
      notes
    });
  };

  return (
    <div className="h-full w-full bg-dark-900 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-dark-900">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full 
            ${node.type === 'ROOT' ? 'bg-brand-600' : 
              node.type === 'TASK' ? 'bg-blue-500' : 
              node.type === 'RESOURCE' ? 'bg-green-500' : 'bg-amber-500'}`} 
          />
          <span className="text-xs font-bold text-white uppercase tracking-widest font-mono">Details: {node.type}</span>
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black">
        {/* Label Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <Type className="w-3 h-3" /> Node Label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:outline-none focus:border-brand-600 transition-colors text-sm font-mono"
          />
        </div>

        {/* Linked Data Info */}
        {relatedTask && (
          <div className="bg-dark-900 rounded-sm p-4 border border-neutral-800 space-y-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
             <div className="flex justify-between items-start">
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">Linked Task Entity</div>
                <span className="bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase">{relatedTask.status}</span>
             </div>
             
             <div className="space-y-2">
               <div className="flex items-center justify-between text-xs text-neutral-400 font-mono border-b border-neutral-800 pb-2">
                 <span>DUE DATE</span>
                 <span className="text-white">{relatedTask.dueDate ? new Date(relatedTask.dueDate).toLocaleDateString() : 'N/A'}</span>
               </div>
               <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                 <span>PRIORITY</span>
                 <span className="text-white">{relatedTask.priority}</span>
               </div>
             </div>
          </div>
        )}

        {relatedResource && (
           <div className="bg-dark-900 rounded-sm p-4 border border-neutral-800 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-600" />
            <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-1">Linked Resource Entity</div>
            
             <div className="flex items-center justify-between text-xs text-neutral-400 font-mono border-b border-neutral-800 pb-2">
              <span>TYPE</span>
              <span className="text-white">{relatedResource.type}</span>
            </div>
            {relatedResource.url && (
               <a href={relatedResource.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:text-white hover:underline block truncate font-mono flex items-center gap-2">
                 <Link className="w-3 h-3"/> OPEN LINK
               </a>
            )}
           </div>
        )}

        {/* Notes Section */}
        <div className="space-y-2 flex-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <StickyNote className="w-3 h-3" /> Documentation
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="> Enter technical specifications or notes..."
            className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-4 text-neutral-300 focus:outline-none focus:border-brand-600 transition-colors min-h-[200px] resize-none font-mono text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-neutral-800 bg-dark-900 flex gap-4">
        <button 
          onClick={() => onDelete(node.id)}
          className="flex-1 px-4 py-3 rounded-sm border border-neutral-800 text-neutral-500 hover:bg-red-950 hover:text-red-500 hover:border-red-900 transition-all text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2"
        >
          <Trash2 className="w-4 h-4"/> Delete
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] px-4 py-3 rounded-sm bg-brand-600 hover:bg-brand-500 text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20"
        >
          <Save className="w-4 h-4" /> Save Node
        </button>
      </div>
    </div>
  );
};