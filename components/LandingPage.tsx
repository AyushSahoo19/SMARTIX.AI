
import React from 'react';
import { Network, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SmartixWorkspace } from '../SmartixWorkspace';
import { Project, TaskStatus, Priority } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
}

const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-mars',
    name: 'Mars Colonization Hub',
    description: 'Establish initial infrastructure for sustainable off-world habitat.',
    ownerId: 'demo-user',
    createdAt: new Date().toISOString(),
    tasks: [
      { id: 't1', title: 'Site Selection Survey', description: 'Analyze surface topology for optimal landing and habitat zones.', status: TaskStatus.DONE, priority: Priority.CRITICAL, estimatedHours: 48, dependencies: [], assignedResourceIds: ['r1'], timeTracked: 172800, isTracking: false, dueDate: '2025-01-15' },
      { id: 't2', title: 'Deploy Solar Array', description: 'Install PV modules and connect to main power grid.', status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, estimatedHours: 72, dependencies: ['t1'], assignedResourceIds: ['r2', 'r3'], timeTracked: 36000, isTracking: true, dueDate: '2025-02-01' },
      { id: 't3', title: 'Hydroponics Setup', description: 'Initialize aeroponic growth chambers for food production.', status: TaskStatus.TODO, priority: Priority.MEDIUM, estimatedHours: 120, dependencies: ['t2'], assignedResourceIds: ['r1'], timeTracked: 0, isTracking: false, dueDate: '2025-03-10' },
      { id: 't4', title: 'Comms Relay Config', description: 'Establish high-bandwidth link with orbital orbiter.', status: TaskStatus.TODO, priority: Priority.HIGH, estimatedHours: 24, dependencies: [], assignedResourceIds: ['r3'], timeTracked: 0, isTracking: false, dueDate: '2025-01-20' },
    ],
    resources: [
      { id: 'r1', name: 'Dr. Elena V.', type: 'PERSON', details: 'Chief Exobiologist', url: '' },
      { id: 'r2', name: 'Rover Unit 7', type: 'TOOL', details: 'Autonomous Construction Bot', url: '' },
      { id: 'r3', name: 'Mark Watney', type: 'GENIUS', details: 'Botanist & Engineer', url: '' },
      { id: 'r4', name: 'SpaceX Starship', type: 'PROJECT', details: 'Heavy Lift Vehicle', url: 'https://spacex.com' },
      { id: 'r5', name: 'NASA API', type: 'GITHUB', details: 'Telemetry Data', url: 'https://github.com/nasa' },
    ],
    mindMap: {
      nodes: [
        { id: 'n1', label: 'Mars Base Alpha', type: 'ROOT', x: 0, y: 0 },
        { id: 'n2', label: 'Power Systems', type: 'TASK', x: -250, y: 100, relatedId: 't2' },
        { id: 'n3', label: 'Life Support', type: 'TASK', x: 250, y: 100, relatedId: 't3' },
        { id: 'n4', label: 'Rover Unit 7', type: 'RESOURCE', x: -400, y: 200, relatedId: 'r2' },
        { id: 'n5', label: 'Dr. Elena V.', type: 'RESOURCE', x: 400, y: 200, relatedId: 'r1' },
        { id: 'n6', label: 'Comms Uplink', type: 'TASK', x: 0, y: 250, relatedId: 't4' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n3', target: 'n5' },
        { id: 'e5', source: 'n1', target: 'n6' },
      ]
    }
  },
  {
    id: 'demo-saas',
    name: 'AI Analytics Platform',
    description: 'Launch MVP for enterprise-grade predictive analytics dashboard.',
    ownerId: 'demo-user',
    createdAt: new Date().toISOString(),
    tasks: [
      { id: 'st1', title: 'Core Architecture', description: 'Define system boundaries and microservices.', status: TaskStatus.DONE, priority: Priority.HIGH, estimatedHours: 80, dependencies: [], assignedResourceIds: ['sr1'], timeTracked: 288000, isTracking: false, dueDate: '2024-10-01' },
      { id: 'st2', title: 'Neural Weights API', description: 'Implement quantization endpoints.', status: TaskStatus.TODO, priority: Priority.MEDIUM, estimatedHours: 40, dependencies: ['st1'], assignedResourceIds: ['sr2'], timeTracked: 0, isTracking: false, dueDate: '2024-11-15' },
      { id: 'st3', title: 'Client Dashboard', description: 'React/Three.js visualization layer.', status: TaskStatus.IN_PROGRESS, priority: Priority.LOW, estimatedHours: 100, dependencies: ['st1'], assignedResourceIds: ['sr1'], timeTracked: 12000, isTracking: false, dueDate: '2024-12-20' }
    ],
    resources: [
      { id: 'sr1', name: 'Sarah Chen', type: 'PERSON', details: 'Senior Architect', url: '' },
      { id: 'sr2', name: 'TensorFlow Docs', type: 'BLOG', details: 'API Reference', url: 'https://www.tensorflow.org' },
      { id: 'sr3', name: 'AWS Cluster', type: 'TOOL', details: 'GPU Instances (p4d.24xlarge)', url: 'https://aws.amazon.com' },
      { id: 'sr4', name: 'GitHub Repo', type: 'GITHUB', details: 'Source Code', url: 'https://github.com' }
    ],
    mindMap: {
      nodes: [
        { id: 'sroot', label: 'Omni-Net', type: 'ROOT', x: 0, y: 0 },
        { id: 'sn1', label: 'Backend', type: 'TASK', x: -200, y: 100, relatedId: 'st1' },
        { id: 'sn2', label: 'Frontend', type: 'TASK', x: 200, y: 100, relatedId: 'st3' },
        { id: 'sn3', label: 'AWS', type: 'RESOURCE', x: -300, y: 200, relatedId: 'sr3' },
        { id: 'sn4', label: 'GitHub', type: 'RESOURCE', x: 0, y: 250, relatedId: 'sr4' }
      ],
      edges: [
        { id: 'se1', source: 'sroot', target: 'sn1' },
        { id: 'se2', source: 'sroot', target: 'sn2' },
        { id: 'se3', source: 'sn1', target: 'sn3' },
        { id: 'se4', source: 'sroot', target: 'sn4' }
      ]
    }
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-600 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-neutral-800 bg-black/90 backdrop-blur fixed w-full z-50">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-brand-600" />
            <span className="font-bold text-xl tracking-tight uppercase font-mono">SMARTIX.AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">Product</a>
            <a href="#" className="hover:text-white transition-colors">Solutions</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>

          <button 
            onClick={onGetStarted}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all rounded-sm"
          >
            Book a Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-neutral-800 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 mb-6 text-brand-600 font-mono text-sm font-bold tracking-wider uppercase">
             <Sparkles className="w-4 h-4" /> Intelligent Work OS
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
            Project infrastructure<br />
            that <span className="text-neutral-500">builds itself</span>
          </h1>
          
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl leading-relaxed font-light">
            Designed for modern builders, Smartix.ai leverages autonomous agents to plan, generate, and visualize production-grade workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-0 w-fit">
            <div className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest h-14 flex items-center justify-center min-w-[200px]">
              Waitlist
            </div>
            <button 
              onClick={onGetStarted}
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 h-14 flex items-center justify-center gap-4 transition-all group min-w-[200px]"
            >
              <span className="text-sm font-bold uppercase tracking-widest">Start Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-20" />
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 bg-neutral-950 border-b border-neutral-800 overflow-hidden relative">
         <div className="container mx-auto px-6">
           <div className="text-center mb-16">
              <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">Live Environment</div>
              <h2 className="text-4xl font-bold mb-4 text-white">Interactive Preview</h2>
              <p className="text-neutral-400 max-w-xl mx-auto">Experience the full power of the Smartix workspace. Interact with the mind map, manage tasks, and explore resources in this live sandbox.</p>
           </div>

           <div className="relative mx-auto border border-neutral-800 bg-black rounded-lg shadow-2xl overflow-hidden h-[800px] group">
              {/* Browser Chrome */}
              <div className="h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                 </div>
                 <div className="ml-4 flex-1 flex justify-center">
                    <div className="bg-black border border-neutral-800 rounded-sm px-3 py-0.5 text-[10px] font-mono text-neutral-500 w-64 text-center">app.smartix.ai/workspace</div>
                 </div>
              </div>
              
              {/* Embedded App */}
              <div className="h-[calc(100%-32px)]">
                 <SmartixWorkspace 
                    user={{ id: 'demo', name: 'Demo User', email: 'demo@smartix.ai' }} 
                    onLogout={() => {}} 
                    isDemo={true}
                    initialProjects={DEMO_PROJECTS}
                 />
              </div>
           </div>
         </div>
      </section>

      {/* Feature Grid (Bento Style) */}
      <section className="border-b border-neutral-800 bg-dark-900">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 container mx-auto border-x border-neutral-800">
          
          <div className="p-16">
            <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">Introducing Smartix</div>
            <h3 className="text-2xl font-bold mb-4">Autonomous Planning</h3>
            <p className="text-neutral-400 leading-relaxed mb-8">
              Simply describe your goal. Our AI agents instantly construct a complete project architecture, including task dependencies, resource allocation, and visual roadmaps.
            </p>
            
            <div className="space-y-3">
               <div className="text-xs font-bold text-brand-600 uppercase mb-4">Active Capabilities:</div>
               {['Context-Aware Task Generation', 'Intelligent Resource Sourcing', 'Dynamic Mind Mapping', 'Real-time Progress Tracking'].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                   <CheckCircle2 className="w-4 h-4 text-green-500" /> {item}
                 </div>
               ))}
            </div>
          </div>

          <div className="p-16 bg-black relative overflow-hidden group">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">Visual Intelligence</div>
                  <h3 className="text-2xl font-bold mb-2">Infinite Canvas</h3>
                  <p className="text-neutral-400 text-sm">Drag, drop, and connect ideas on a boundless plane.</p>
                </div>
                
                {/* Abstract UI Element */}
                <div className="mt-12 border border-neutral-800 bg-dark-900 p-4 rounded-sm">
                   <div className="flex items-center gap-4 mb-4 border-b border-neutral-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="ml-auto font-mono text-xs text-neutral-500">READ-ONLY</div>
                   </div>
                   <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between"><span className="text-brand-600">root</span> <span>initialized</span></div>
                      <div className="flex justify-between text-neutral-500"><span>└─ tasks</span> <span>[5 items]</span></div>
                      <div className="flex justify-between text-neutral-500"><span>└─ resources</span> <span>[12 active]</span></div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Integration Strip */}
      <section className="border-b border-neutral-800 py-12 bg-black">
         <div className="container mx-auto px-6">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-8">Trusted by Data Leaders</div>
            <div className="flex flex-wrap gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Mock Logos */}
               <div className="flex items-center gap-2 text-xl font-bold"><div className="w-6 h-6 bg-white/20" /> ACME Corp</div>
               <div className="flex items-center gap-2 text-xl font-bold"><div className="w-6 h-6 bg-white/20" /> Globex</div>
               <div className="flex items-center gap-2 text-xl font-bold"><div className="w-6 h-6 bg-white/20" /> Soylent</div>
               <div className="flex items-center gap-2 text-xl font-bold"><div className="w-6 h-6 bg-white/20" /> Umbrella</div>
               <div className="flex items-center gap-2 text-xl font-bold"><div className="w-6 h-6 bg-white/20" /> Initech</div>
            </div>
         </div>
      </section>

      <footer className="bg-black py-12 text-neutral-500 text-xs border-t border-neutral-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-2 text-white">
                <Network className="w-4 h-4 text-brand-600" />
                <span className="font-bold uppercase tracking-wider">SMARTIX.AI</span>
            </div>
            <p>Data infrastructure that builds itself.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-brand-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
