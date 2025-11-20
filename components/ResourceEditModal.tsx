import React, { useState, useEffect } from 'react';
import { Resource, ResourceType } from '../types';
import { 
  X, 
  Briefcase, 
  Wrench, 
  DollarSign, 
  User, 
  Lightbulb, 
  Book, 
  Video, 
  Github, 
  Link, 
  Layout, 
  Globe 
} from 'lucide-react';

interface ResourceEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (res: Resource) => void;
}

export const ResourceEditModal: React.FC<ResourceEditModalProps> = ({ resource, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Resource>>({});

  useEffect(() => {
    if (resource) {
      setFormData({ ...resource });
    } else {
      setFormData({
        name: '',
        type: 'PERSON',
        details: '',
        url: ''
      });
    }
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name) return;
    const newRes: Resource = {
      ...(resource || { id: `res-${Date.now()}` }),
      ...formData as Resource
    };
    onSave(newRes);
    onClose();
  };

  const types: { id: ResourceType; label: string; icon: React.ElementType }[] = [
    { id: 'PERSON', label: 'People', icon: User },
    { id: 'GENIUS', label: 'Genius', icon: Lightbulb },
    { id: 'BLOG', label: 'Blog', icon: Globe },
    { id: 'VIDEO', label: 'Video', icon: Video },
    { id: 'PROJECT', label: 'Project', icon: Layout },
    { id: 'GITHUB', label: 'GitHub', icon: Github },
    { id: 'BOOK', label: 'Book', icon: Book },
    { id: 'LINK', label: 'Link', icon: Link },
    { id: 'TOOL', label: 'Tool', icon: Wrench },
    { id: 'MATERIAL', label: 'Material', icon: Briefcase },
    { id: 'BUDGET', label: 'Budget', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-neutral-800 rounded-sm w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">{resource ? 'Edit Resource Entity' : 'New Resource Entity'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Resource Name</label>
              <input 
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-sm"
                placeholder="> Enter identifier..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Category Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                 {types.map(t => (
                   <button
                     key={t.id}
                     onClick={() => setFormData({ ...formData, type: t.id })}
                     className={`flex items-center gap-2 p-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all ${formData.type === t.id ? 'bg-brand-600 border-brand-600 text-white' : 'bg-dark-900 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white'}`}
                   >
                      <t.icon className="w-3 h-3" /> {t.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">URL / Reference Link</label>
              <input 
                value={formData.url || ''}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-xs"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Metadata / Specifications</label>
              <input 
                value={formData.details || ''}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                className="w-full bg-dark-900 border border-neutral-800 rounded-sm p-3 text-white focus:border-brand-600 focus:outline-none font-mono text-xs"
                placeholder="> Enter details..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-800 flex justify-end gap-3 bg-dark-900 rounded-b-sm">
           <button onClick={onClose} className="px-4 py-2 rounded-sm text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-6 py-2 rounded-sm bg-brand-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-500 transition-colors shadow-lg shadow-brand-900/20">Confirm Save</button>
        </div>
      </div>
    </div>
  );
};