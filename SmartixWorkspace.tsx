
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Network, 
  Briefcase, 
  PlusCircle, 
  Sparkles, 
  Pause,
  Play,
  ChevronRight,
  Box,
  X,
  LogOut,
  Table as TableIcon,
  Calendar,
  Filter,
  ExternalLink,
  User,
  Lightbulb,
  Video,
  Github,
  Book,
  Link,
  Globe,
  Wrench,
  Layout,
  DollarSign,
  Trash2
} from 'lucide-react';
import { MindMap } from './components/MindMap';
import { TaskEditModal } from './components/TaskEditModal';
import { ResourceEditModal } from './components/ResourceEditModal';
import { NodeDetailsPanel } from './components/NodeDetailsPanel';
import { generateProjectPlan } from './services/geminiService';
import { Project, Task, Resource, TaskStatus, Priority, MindMapNode, MindMapEdge, User as UserType, ResourceType } from './types';

// --- Utility Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
  <div className={`premium-panel bg-dark-900 border border-neutral-800 rounded-sm p-6 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        {title && <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'default' }) => {
  const colors = {
    default: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    success: 'bg-green-950 text-green-400 border-green-900',
    warning: 'bg-amber-950 text-amber-400 border-amber-900',
    danger: 'bg-red-950 text-red-400 border-red-900',
    info: 'bg-blue-950 text-blue-400 border-blue-900'
  };
  return <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-widest border ${colors[variant]} font-mono`}>{children}</span>;
};

interface SmartixWorkspaceProps {
  user: UserType;
  onLogout: () => void;
  isDemo?: boolean;
  initialProject?: Project;
}

export const SmartixWorkspace: React.FC<SmartixWorkspaceProps> = ({ user, onLogout, isDemo = false, initialProject }) => {
  // --- State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'TASKS' | 'MINDMAP' | 'RESOURCES' | 'TABLE'>('DASHBOARD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  // Modals & Editing
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // Visual Planner State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Filters & Sort
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'DUE_DATE' | 'PRIORITY' | 'NONE'>('NONE');
  const [resourceTab, setResourceTab] = useState<'ALL' | ResourceType>('ALL');

  // --- Data Loading ---

  useEffect(() => {
    if (isDemo && initialProject) {
      setProjects([initialProject]);
      setActiveProjectId(initialProject.id);
    } else if (!isDemo && user) {
      const saved = localStorage.getItem(`smartix_projects_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProjects(parsed);
          if (parsed.length > 0 && !activeProjectId) setActiveProjectId(parsed[0].id);
        } catch (e) { console.error("Failed to load", e); }
      } else {
        setProjects([]);
        setActiveProjectId(null);
      }
    }
  }, [user, isDemo, initialProject]); // Added dependencies to prevent loops, though typical usage won't change these props

  // Save projects
  useEffect(() => {
    if (!isDemo && user) {
      localStorage.setItem(`smartix_projects_${user.id}`, JSON.stringify(projects));
    }
  }, [projects, user, isDemo]);

  // --- Computed ---
  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    let tasks = [...activeProject.tasks];
    
    if (filterPriority !== 'ALL') {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }

    if (sortBy === 'PRIORITY') {
      const priorityWeight = { [Priority.CRITICAL]: 4, [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
      tasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    } else if (sortBy === 'DUE_DATE') {
      tasks.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    }

    return tasks;
  }, [activeProject, filterPriority, sortBy]);

  const filteredResources = useMemo(() => {
    if (!activeProject) return [];
    if (resourceTab === 'ALL') return activeProject.resources;
    return activeProject.resources.filter(r => r.type === resourceTab);
  }, [activeProject, resourceTab]);

  // --- Actions ---

  const handleGeneratePlan = async () => {
    if (!prompt.trim() || !user) return;
    setIsGenerating(true);
    try {
      // In demo mode, we might want to simulate generation or allow real generation if API key works
      // For now, we allow real generation as requested "full functionality"
      const result = await generateProjectPlan(prompt);
      
      const newTasks: Task[] = (result.tasks || []).map((t: any, idx: number) => ({
        id: `task-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description,
        status: TaskStatus.TODO,
        priority: t.priority as Priority,
        estimatedHours: t.estimatedHours,
        dependencies: [],
        assignedResourceIds: [],
        timeTracked: 0,
        isTracking: false
      }));

      const newResources: Resource[] = (result.resources || []).map((r: any, idx: number) => ({
        id: `res-${Date.now()}-${idx}`,
        name: r.name,
        type: r.type,
        details: r.details,
        url: r.url
      }));

      const nodes: MindMapNode[] = (result.mindMapNodes || []).map((n: any) => ({
        id: n.id || `node-${Math.random()}`,
        label: n.label,
        type: n.type,
        x: n.x,
        y: n.y
      }));

      const edges: MindMapEdge[] = [];
      (result.mindMapNodes || []).forEach((n: any) => {
        if (n.connectsTo && Array.isArray(n.connectsTo)) {
           n.connectsTo.forEach((targetId: string) => {
             edges.push({ id: `edge-${n.id}-${targetId}`, source: n.id, target: targetId });
           });
        }
      });

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: result.projectName || "New Project",
        description: result.description || "",
        tasks: newTasks,
        resources: newResources,
        mindMap: { nodes, edges },
        createdAt: new Date().toISOString(),
        ownerId: user.id
      };

      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      setShowPromptModal(false);
      setPrompt('');
      setView('DASHBOARD');
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate plan. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskTimer = (taskId: string) => {
    if (!activeProject) return;
    const updatedProject = { ...activeProject };
    updatedProject.tasks = updatedProject.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, isTracking: !t.isTracking };
      }
      return t;
    });
    updateProject(updatedProject);
  };

  // Timer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(currentProjects => {
        return currentProjects.map(p => {
          const hasTracking = p.tasks.some(t => t.isTracking);
          if (!hasTracking) return p;
          return {
            ...p,
            tasks: p.tasks.map(t => t.isTracking ? { ...t, timeTracked: t.timeTracked + 1 } : t)
          };
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateProject = (p: Project) => {
    setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map(t => t.id === taskId ? { ...t, status } : t);
    updateProject({ ...activeProject, tasks: updatedTasks });
  };

  // CRUD Handlers
  const saveTask = (task: Task) => {
    if (!activeProject) return;
    const exists = activeProject.tasks.find(t => t.id === task.id);
    let newTasks;
    if (exists) {
      newTasks = activeProject.tasks.map(t => t.id === task.id ? task : t);
    } else {
      newTasks = [...activeProject.tasks, task];
    }
    updateProject({ ...activeProject, tasks: newTasks });
  };

  const deleteTask = (taskId: string) => {
    if (!activeProject) return;
    updateProject({ ...activeProject, tasks: activeProject.tasks.filter(t => t.id !== taskId) });
  };

  const saveResource = (res: Resource) => {
    if (!activeProject) return;
    const exists = activeProject.resources.find(r => r.id === res.id);
    let newRes;
    if (exists) {
      newRes = activeProject.resources.map(r => r.id === res.id ? res : r);
    } else {
      newRes = [...activeProject.resources, res];
    }
    updateProject({ ...activeProject, resources: newRes });
  };

  const deleteResource = (resId: string) => {
    if (!activeProject) return;
    // Remove from tasks first
    const newTasks = activeProject.tasks.map(t => ({
       ...t, assignedResourceIds: t.assignedResourceIds.filter(id => id !== resId)
    }));
    const newResources = activeProject.resources.filter(r => r.id !== resId);
    updateProject({ ...activeProject, tasks: newTasks, resources: newResources });
  };

  const updateMindMapNode = (updatedNode: MindMapNode) => {
    if (!activeProject) return;
    const newNodes = activeProject.mindMap.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    updateProject({
      ...activeProject,
      mindMap: { ...activeProject.mindMap, nodes: newNodes }
    });
  };

  const deleteMindMapNode = (nodeId: string) => {
    if (!activeProject) return;
    const newNodes = activeProject.mindMap.nodes.filter(n => n.id !== nodeId);
    const newEdges = activeProject.mindMap.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    updateProject({
      ...activeProject,
      mindMap: { nodes: newNodes, edges: newEdges }
    });
    setSelectedNodeId(null);
  };

  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (!activeProject) return;
    if (sourceId === targetId) return;
    
    // Check for duplicate edge (undirected check)
    const exists = activeProject.mindMap.edges.some(
      e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)
    );
    if (exists) return;

    const newEdge: MindMapEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId
    };
    
    updateProject({
      ...activeProject,
      mindMap: {
        ...activeProject.mindMap,
        edges: [...activeProject.mindMap.edges, newEdge]
      }
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
  };

  // --- Drag and Drop Handlers for Tasks ---

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) updateTaskStatus(taskId, status);
  };

  // --- Views ---

  const renderDashboard = () => {
    if (!activeProject) return <div className="text-center text-neutral-500 mt-20 font-mono uppercase tracking-widest">Select or create a project to begin.</div>;
    
    const totalTasks = activeProject.tasks.length;
    const doneTasks = activeProject.tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    const totalTime = activeProject.tasks.reduce((acc, t) => acc + t.timeTracked, 0);
    
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-brand-600/10 rounded-bl-full transition-transform group-hover:scale-150" />
             <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Progress</div>
             <div className="text-4xl font-bold mt-1 font-mono">{progress}%</div>
             <div className="w-full bg-neutral-800 h-1 mt-4">
                <div className="bg-brand-600 h-1 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
             </div>
          </Card>
          <Card className="relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-green-600/10 rounded-bl-full transition-transform group-hover:scale-150" />
             <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">Tracked Time</div>
             <div className="text-4xl font-bold mt-1 font-mono">{formatTime(totalTime)}</div>
             <div className="text-xs text-neutral-500 mt-4 font-mono">{activeProject.tasks.filter(t => t.timeTracked > 0).length} Active Tasks</div>
          </Card>
          <Card className="relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-amber-600/10 rounded-bl-full transition-transform group-hover:scale-150" />
             <div className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Pending</div>
             <div className="text-4xl font-bold mt-1 font-mono">{totalTasks - doneTasks}</div>
             <div className="text-xs text-neutral-500 mt-4 font-mono">{activeProject.tasks.filter(t => t.priority === Priority.CRITICAL).length} Critical Items</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card title="Recent Activity" className="h-full">
             <div className="space-y-0 divide-y divide-neutral-800">
               {activeProject.tasks.slice(0, 5).map(task => (
                 <div key={task.id} className="flex items-center justify-between py-3 hover:bg-neutral-800/30 px-2 -mx-2 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-none ${task.status === TaskStatus.DONE ? 'bg-brand-600' : 'bg-neutral-600'}`} />
                      <span className={`font-medium text-sm ${task.status === TaskStatus.DONE ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>{task.title}</span>
                    </div>
                    <Badge variant={task.priority === Priority.CRITICAL ? 'danger' : 'default'}>{task.priority}</Badge>
                 </div>
               ))}
             </div>
           </Card>
           
           <Card title="Resource Allocation" className="h-full">
              <div className="space-y-0 divide-y divide-neutral-800">
                 {activeProject.resources.slice(0, 5).map(res => (
                   <div key={res.id} className="flex items-center gap-4 py-3 hover:bg-neutral-800/30 px-2 -mx-2 group">
                      <div className="text-neutral-500 group-hover:text-brand-600 transition-colors">
                        {res.type === 'PERSON' ? <User className="w-4 h-4"/> : <Briefcase className="w-4 h-4"/>}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="font-medium text-sm text-neutral-300 truncate">{res.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500">{res.type}</div>
                      </div>
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-brand-600 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    if (!activeProject) return null;
    const columns = [
      { id: TaskStatus.TODO, label: 'Backlog', color: 'border-neutral-600' },
      { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'border-brand-600' },
      { id: TaskStatus.DONE, label: 'Completed', color: 'border-green-600' }
    ];

    return (
      <div className="flex flex-col h-full">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><ListTodo className="w-5 h-5 text-brand-600"/> Task Management</h2>
           <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-neutral-900 rounded-sm p-1 px-3 border border-neutral-700">
                <Filter className="w-3 h-3 text-neutral-500"/>
                <select 
                  value={filterPriority} 
                  onChange={e => setFilterPriority(e.target.value as Priority | 'ALL')}
                  className="bg-transparent text-xs font-mono text-neutral-300 focus:outline-none uppercase"
                >
                  <option value="ALL">All Priorities</option>
                  <option value={Priority.CRITICAL}>Critical</option>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.LOW}>Low</option>
                </select>
             </div>
             <button 
               onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
               className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
             >
               <PlusCircle className="w-4 h-4" /> Add Task
             </button>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
          {columns.map(col => (
            <div 
              key={col.id} 
              className="flex flex-col h-full bg-dark-900 border border-neutral-800 rounded-sm overflow-hidden"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className={`p-4 border-b border-neutral-800 font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${col.color} border-t-2 bg-black/20`}>
                {col.label}
                <span className="ml-auto font-mono text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-sm">
                  {filteredTasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iIzIyMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]">
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    className={`bg-black p-4 rounded-sm border cursor-grab active:cursor-grabbing hover:border-brand-600 transition-all group shadow-lg
                      ${isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'border-red-900' : 'border-neutral-800'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border 
                        ${task.priority === Priority.CRITICAL ? 'bg-red-950 text-red-500 border-red-900' : 
                          task.priority === Priority.HIGH ? 'bg-amber-950 text-amber-500 border-amber-900' : 
                          'bg-neutral-900 text-neutral-500 border-neutral-800'}`}>
                        {task.priority}
                      </span>
                      {task.assignedResourceIds.length > 0 && (
                        <div className="flex -space-x-2">
                          {task.assignedResourceIds.slice(0,3).map(rid => (
                            <div key={rid} className="w-5 h-5 rounded-sm bg-neutral-800 border border-neutral-900 flex items-center justify-center text-[10px] text-neutral-300 font-mono">
                              {activeProject.resources.find(r => r.id === rid)?.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-neutral-200 mb-2 leading-snug font-mono">{task.title}</h4>
                    <div className="flex items-center gap-3 mb-4">
                      {task.dueDate && (
                        <div className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== TaskStatus.DONE ? 'text-red-500' : 'text-neutral-600'}`}>
                           <Calendar className="w-3 h-3"/> {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-900">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTaskTimer(task.id); }}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm transition-colors ${task.isTracking ? 'bg-brand-900 text-brand-400' : 'bg-neutral-900 text-neutral-500 hover:text-white'}`}
                      >
                        {task.isTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span className="font-mono">{formatTime(task.timeTracked)}</span>
                      </button>
                      <div className="text-[10px] text-neutral-600 font-mono">
                        {task.estimatedHours}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
         </div>
      </div>
    );
  };

  const renderMindMap = () => {
    if (!activeProject) return null;
    
    const selectedNode = selectedNodeId ? activeProject.mindMap.nodes.find(n => n.id === selectedNodeId) : null;
    const relatedTask = selectedNode?.relatedId ? activeProject.tasks.find(t => t.id === selectedNode.relatedId) : undefined;
    const relatedResource = selectedNode?.relatedId ? activeProject.resources.find(r => r.id === selectedNode.relatedId) : undefined;

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><Network className="w-5 h-5 text-brand-600"/> Infinite Canvas</h2>
          <div className="text-[10px] font-mono text-neutral-500 uppercase">Drag BG to Pan • Drag Node to Move • Drag Handle to Connect</div>
        </div>
        
        <div className="flex-1 flex gap-6 min-h-0 relative">
           {/* The Whiteboard */}
           <div className={`flex-1 rounded-sm border border-neutral-800 bg-black overflow-hidden relative transition-all ${selectedNode ? 'mr-[360px]' : ''}`}>
             <MindMap 
              nodes={activeProject.mindMap.nodes} 
              edges={activeProject.mindMap.edges}
              onUpdate={(newNodes, newEdges) => updateProject({ ...activeProject, mindMap: { nodes: newNodes, edges: newEdges } })}
              onConnect={handleConnectNodes}
              onNodeSelect={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
             />
           </div>

           {/* Side Panel for Details/Notes */}
           {selectedNode && (
             <div className="absolute right-0 top-0 bottom-0 w-[350px] z-40 border-l border-neutral-800 shadow-2xl">
                <NodeDetailsPanel 
                  node={selectedNode}
                  relatedTask={relatedTask}
                  relatedResource={relatedResource}
                  onClose={() => setSelectedNodeId(null)}
                  onSave={updateMindMapNode}
                  onDelete={deleteMindMapNode}
                />
             </div>
           )}
        </div>
      </div>
    );
  };
  
  const renderResources = () => {
     if (!activeProject) return null;

     const tabs: { id: ResourceType | 'ALL'; label: string; icon: React.ElementType }[] = [
        { id: 'ALL', label: 'All', icon: Box },
        { id: 'PERSON', label: 'People', icon: User },
        { id: 'GENIUS', label: 'Genius', icon: Lightbulb },
        { id: 'BLOG', label: 'Blogs', icon: Globe },
        { id: 'VIDEO', label: 'Videos', icon: Video },
        { id: 'PROJECT', label: 'Projects', icon: Layout },
        { id: 'GITHUB', label: 'GitHub', icon: Github },
        { id: 'BOOK', label: 'Books', icon: Book },
        { id: 'LINK', label: 'Links', icon: Link },
        { id: 'TOOL', label: 'Tools', icon: Wrench },
        { id: 'BUDGET', label: 'Budget', icon: DollarSign },
        { id: 'MATERIAL', label: 'Materials', icon: Briefcase },
     ];

     return (
       <div className="space-y-6 h-full flex flex-col">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-600"/> Resources</h2>
             <button 
              onClick={() => { 
                setEditingResource(resourceTab === 'ALL' ? null : { type: resourceTab } as Resource); 
                setIsResourceModalOpen(true); 
              }} 
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2"
             >
               <PlusCircle className="w-4 h-4" /> Add
             </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-800 custom-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setResourceTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
                    ${resourceTab === tab.id 
                      ? 'bg-neutral-800 text-brand-500 border-b-2 border-brand-600' 
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
                >
                  <Icon className="w-3 h-3"/> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-dark-900 border border-neutral-800 rounded-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 gap-px bg-neutral-800">
                {filteredResources.map(res => {
                  const tab = tabs.find(t => t.id === res.type);
                  const Icon = tab ? tab.icon : Briefcase;
                  return (
                    <div key={res.id} className="bg-dark-900 p-4 flex items-center gap-6 hover:bg-neutral-900 transition-colors group">
                       <div className="w-10 h-10 rounded-sm bg-black border border-neutral-800 flex items-center justify-center shrink-0 text-neutral-400">
                         <Icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="font-bold text-sm text-white truncate font-mono">{res.name}</div>
                            <Badge variant="info">{res.type}</Badge>
                          </div>
                          <div className="text-xs text-neutral-500 truncate font-mono">{res.details}</div>
                       </div>
                       <div className="flex items-center gap-4">
                          {res.url && (
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                              <ExternalLink className="w-3 h-3"/> Open
                            </a>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity border-l border-neutral-800 pl-4">
                            <button onClick={() => { setEditingResource(res); setIsResourceModalOpen(true); }} className="p-2 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white"><Wrench className="w-4 h-4"/></button>
                            <button onClick={() => deleteResource(res.id)} className="p-2 hover:bg-red-950 rounded-sm text-red-500"><Trash2 className="w-4 h-4"/></button>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 opacity-50">
                   <Briefcase className="w-8 h-8"/>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest">No resources initialized</p>
              </div>
            )}
          </div>
       </div>
     )
  };

  const renderTable = () => {
    if (!activeProject) return null;
    return (
       <div className="space-y-6 h-full flex flex-col">
         <div className="flex justify-between items-center">
           <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><TableIcon className="w-5 h-5 text-brand-600"/> Master Data View</h2>
         </div>
         <div className="bg-dark-900 border border-neutral-800 rounded-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
           <div className="p-3 bg-neutral-900 border-b border-neutral-800 font-bold text-xs text-brand-600 uppercase tracking-widest sticky top-0">Tasks & Deliverables</div>
           <table className="w-full text-left text-xs font-mono mb-8">
              <thead className="bg-black text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                   <th className="p-4">Task</th>
                   <th className="p-4">Status</th>
                   <th className="p-4">Priority</th>
                   <th className="p-4">Due Date</th>
                   <th className="p-4">Assigned</th>
                   <th className="p-4">Est. Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {activeProject.tasks.map(t => (
                  <tr key={t.id} className="hover:bg-neutral-800/50">
                    <td className="p-4 font-bold">{t.title}</td>
                    <td className="p-4"><span className={`text-[10px] px-2 py-1 rounded-sm uppercase ${t.status === 'DONE' ? 'bg-green-950 text-green-400' : 'bg-neutral-800 text-neutral-400'}`}>{t.status}</span></td>
                    <td className="p-4">{t.priority}</td>
                    <td className="p-4">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="p-4 opacity-50">{t.assignedResourceIds.length}</td>
                    <td className="p-4">{t.estimatedHours}h</td>
                  </tr>
                ))}
              </tbody>
           </table>

           <div className="p-3 bg-neutral-900 border-y border-neutral-800 font-bold text-xs text-green-600 uppercase tracking-widest sticky top-0">Resources Inventory</div>
           <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                   <th className="p-4">Name</th>
                   <th className="p-4">Type</th>
                   <th className="p-4">URL</th>
                   <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {activeProject.resources.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-800/50">
                    <td className="p-4 font-bold">{r.name}</td>
                    <td className="p-4"><Badge>{r.type}</Badge></td>
                    <td className="p-4">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                          LINK <ExternalLink className="w-3 h-3"/>
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-neutral-500 truncate max-w-xs">{r.details}</td>
                  </tr>
                ))}
              </tbody>
           </table>
         </div>
       </div>
    );
  }

  return (
    <div className="flex h-full bg-black text-white overflow-hidden selection:bg-brand-900 selection:text-brand-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-neutral-800 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <div className="flex items-center gap-2 text-brand-600">
            <Network className="w-5 h-5" />
            <span className="font-bold text-sm tracking-widest uppercase text-white">Smartix.ai</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-0 space-y-8 custom-scrollbar">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest px-6 mb-3">Workspace</div>
            {[
              { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'TASKS', icon: ListTodo, label: 'Task Board' },
              { id: 'MINDMAP', icon: Network, label: 'Visual Plan' },
              { id: 'RESOURCES', icon: Briefcase, label: 'Resources' },
              { id: 'TABLE', icon: TableIcon, label: 'Master Data' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 text-xs font-medium uppercase tracking-wider transition-all border-l-2 
                  ${view === item.id 
                    ? 'border-brand-600 bg-neutral-900 text-brand-500' 
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between px-6 mb-3">
              <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Projects</div>
              <button onClick={() => setShowPromptModal(true)} className="text-brand-600 hover:text-white transition-colors"><PlusCircle className="w-4 h-4"/></button>
            </div>
            <div className="space-y-1">
              {projects.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setActiveProjectId(p.id)}
                  className={`w-full text-left px-6 py-2 flex items-center gap-3 text-xs font-mono transition-all truncate border-l-2
                    ${activeProjectId === p.id ? 'border-neutral-600 text-white bg-neutral-900' : 'border-transparent text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'}`}
                >
                  <Box className="w-3 h-3 flex-shrink-0"/> {p.name}
                </button>
              ))}
              {projects.length === 0 && <div className="px-6 text-[10px] text-neutral-700 font-mono uppercase">No active projects</div>}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-900 bg-black space-y-3">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-8 h-8 rounded-sm bg-brand-900 border border-brand-800 flex items-center justify-center text-xs font-bold text-brand-500">
               {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
               <div className="text-xs font-bold text-white truncate uppercase tracking-wider">{user.name}</div>
               <div className="text-[10px] text-neutral-600 truncate font-mono">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={() => setShowPromptModal(true)}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3 h-3" /> New Plan
          </button>
          <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 text-neutral-600 hover:text-white text-[10px] font-bold uppercase tracking-wider py-2"
          >
             <LogOut className="w-3 h-3" /> {isDemo ? 'End Demo' : 'Disconnect'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-black">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 bg-black flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
             <h1 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                {activeProject ? activeProject.name : 'Dashboard'}
             </h1>
             {activeProject && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-neutral-500">
             <div>REGION: US-EAST-1</div>
             <div>ENV: {isDemo ? 'DEMO_VIEW' : 'PRODUCTION'}</div>
             <div className="text-brand-600 font-bold">{new Date().toLocaleDateString()}</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-black relative custom-scrollbar">
           {/* Grid Pattern Background */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
           
           <div className="relative z-10 h-full">
              {view === 'DASHBOARD' && renderDashboard()}
              {view === 'TASKS' && renderTasks()}
              {view === 'MINDMAP' && renderMindMap()}
              {view === 'RESOURCES' && renderResources()}
              {view === 'TABLE' && renderTable()}
           </div>
        </div>
      </main>

      {/* Modals */}
      <TaskEditModal 
        task={editingTask}
        resources={activeProject?.resources || []}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={saveTask}
        onDelete={deleteTask}
      />

      <ResourceEditModal 
        resource={editingResource}
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSave={saveResource}
      />

      {/* AI Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-neutral-800 rounded-sm w-full max-w-lg p-0 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-brand-600">
                 <Sparkles className="w-5 h-5" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-white">Generate Project Architecture</h2>
              </div>
              <button onClick={() => !isGenerating && setShowPromptModal(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6">
              <p className="text-neutral-400 text-xs mb-4 font-mono leading-relaxed">
                Initialize autonomous agent. System will generate tasks, dependencies, and resource graphs based on input parameters.
              </p>
              
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="> Input objective: Build a marketing dashboard for..."
                className="w-full bg-black border border-neutral-800 rounded-sm p-4 text-brand-500 font-mono text-sm focus:outline-none focus:border-brand-600 h-40 resize-none mb-6 placeholder:text-neutral-700"
                disabled={isGenerating}
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowPromptModal(false)} 
                  className="px-4 py-2 rounded-sm text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                  disabled={isGenerating}
                >
                  Abort
                </button>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || !prompt.trim()}
                  className={`px-6 py-2 rounded-sm bg-brand-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-500'}`}
                >
                  {isGenerating ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                  ) : (
                    <>Execute <ChevronRight className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
