import React, { useState, useEffect } from 'react';
import { Task, Resource, Priority, TaskStatus } from '../types';
import { X, Calendar, Clock, Users, Tag } from 'lucide-react';

interface TaskEditModalProps {
  task: Task | null;
  resources: Resource[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, resources, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        estimatedHours: 1,
        assignedResourceIds: [],
        dueDate: ''
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.title) return;
    
    const newTask: Task = {
      ...(task || {
        id: `task-${Date.now()}`,
        timeTracked: 0,
        isTracking: false,
        dependencies: []
      }),
      ...formData as Task
    };
    onSave(newTask);
    onClose();
  };

  const toggleResource = (resId: string) => {
    const currentIds = formData.assignedResourceIds || [];
    if (currentIds.includes(resId)) {
      setFormData({ ...formData, assignedResourceIds: currentIds.filter(id => id !== resId) });
    } else {
      setFormData({ ...formData, assignedResourceIds: [...currentIds, resId] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-neutral-800 rounded-sm w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">{task ? 'Configure Task' : 'New Task Definition'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-8 flex-1 bg-black">
          {/* Title & Desc */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Task Title</label>
              <input 
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-sm"
                placeholder="> Enter task name..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Description</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-neutral-300 focus:border-brand-600 focus:outline-none h-32 resize-none font-mono text-xs leading-relaxed"
                placeholder="> Enter detailed specifications..."
              />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-2"><Tag className="w-3 h-3"/> Priority Level</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-xs"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-2"><Calendar className="w-3 h-3"/> Target Date</label>
              <input 
                type="date"
                value={formData.dueDate || ''}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Est. Duration (Hours)</label>
              <input 
                type="number"
                min="0"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Resource Assignment */}
          <div>
             <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2"><Users className="w-3 h-3"/> Resource Allocation</label>
             <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-dark-900 rounded-sm border border-neutral-800">
               {resources.map(res => (
                 <label key={res.id} className="flex items-center space-x-3 p-2 rounded-sm hover:bg-neutral-800 cursor-pointer group transition-colors">
                   <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${formData.assignedResourceIds?.includes(res.id) ? 'bg-brand-600 border-brand-600' : 'border-neutral-600 group-hover:border-white'}`}>
                      {formData.assignedResourceIds?.includes(res.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                   </div>
                   <input 
                      type="checkbox" 
                      checked={formData.assignedResourceIds?.includes(res.id)}
                      onChange={() => toggleResource(res.id)}
                      className="hidden"
                   />
                   <div className="text-sm">
                      <div className="text-neutral-200 font-medium font-mono text-xs">{res.name}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{res.type}</div>
                   </div>
                 </label>
               ))}
               {resources.length === 0 && <div className="text-xs font-mono text-neutral-500 col-span-2 p-2">No resources available. Initialize in Resources tab.</div>}
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-800 flex justify-between items-center bg-dark-900">
          {task ? (
            <button 
              onClick={() => { onDelete(task.id); onClose(); }}
              className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-red-900/30 hover:border-red-900 rounded-sm transition-colors bg-red-950/10"
            >
              Delete Task
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-sm text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-sm bg-brand-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-500 shadow-lg shadow-brand-900/20 transition-all">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};