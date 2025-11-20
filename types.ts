
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type ResourceType = 
  | 'PERSON' 
  | 'GENIUS' 
  | 'BLOG' 
  | 'VIDEO' 
  | 'PROJECT' 
  | 'GITHUB' 
  | 'BOOK' 
  | 'LINK' 
  | 'TOOL' 
  | 'BUDGET' 
  | 'MATERIAL';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  details: string;
  url?: string;
  cost?: number;
  allocated?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  dependencies: string[]; // IDs of tasks that must be completed before this
  assignedResourceIds: string[];
  timeTracked: number; // in seconds
  isTracking: boolean;
  dueDate?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'ROOT' | 'TASK' | 'RESOURCE' | 'NOTE';
  x: number;
  y: number;
  relatedId?: string; // Links back to a task or resource ID
  notes?: string;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  resources: Resource[];
  mindMap: {
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  };
  createdAt: string;
  ownerId: string; // User ID binding
}
