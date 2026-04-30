import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FloorElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'furniture' | 'label';
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'residential' | 'commercial' | 'landscape';
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  floorPlan: FloorElement[];
  interiorStyle: string;
  exteriorConfig: any;
  collaborators: string[];
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  projectCount: number;
  joinedAt: string;
}

interface AppContextType {
  user: User;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (p: Project | null) => void;
  createProject: (name: string, type: Project['type']) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  saveFloorPlan: (projectId: string, elements: FloorElement[]) => void;
  updateUser: (data: Partial<User>) => void;
}

const defaultUser: User = {
  id: 'u1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'AM',
  plan: 'pro',
  projectCount: 7,
  joinedAt: '2024-01-15',
};

const sampleProjects: Project[] = [
  {
    id: 'p1',
    name: 'Modern 3BHK Villa',
    description: 'A luxury 3-bedroom villa with open kitchen and garden',
    type: 'residential',
    thumbnail: 'https://images.unsplash.com/photo-1766603636562-531bb3e1dda8?w=400',
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2025-04-28T14:30:00Z',
    floorPlan: [],
    interiorStyle: 'modern',
    exteriorConfig: { roofStyle: 'flat', texture: 'concrete', color: '#e8e0d5' },
    collaborators: ['Sarah K.', 'Mike R.'],
    tags: ['villa', 'modern', '3bhk'],
  },
  {
    id: 'p2',
    name: 'Minimal Studio Apartment',
    description: 'Compact studio with smart space utilization',
    type: 'residential',
    thumbnail: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?w=400',
    createdAt: '2025-03-22T09:00:00Z',
    updatedAt: '2025-04-20T11:00:00Z',
    floorPlan: [],
    interiorStyle: 'minimal',
    exteriorConfig: { roofStyle: 'gabled', texture: 'brick', color: '#c9b89a' },
    collaborators: [],
    tags: ['studio', 'minimal', 'compact'],
  },
  {
    id: 'p3',
    name: 'Commercial Office Space',
    description: 'Open-plan office with meeting rooms and breakout areas',
    type: 'commercial',
    thumbnail: 'https://images.unsplash.com/photo-1721244654195-943615c56ac4?w=400',
    createdAt: '2025-02-14T08:00:00Z',
    updatedAt: '2025-04-15T16:00:00Z',
    floorPlan: [],
    interiorStyle: 'industrial',
    exteriorConfig: { roofStyle: 'flat', texture: 'glass', color: '#2d3748' },
    collaborators: ['Team Alpha'],
    tags: ['office', 'commercial', 'open-plan'],
  },
  {
    id: 'p4',
    name: 'Luxury Penthouse',
    description: 'Top-floor penthouse with panoramic views',
    type: 'residential',
    thumbnail: 'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=400',
    createdAt: '2025-01-05T12:00:00Z',
    updatedAt: '2025-04-05T10:00:00Z',
    floorPlan: [],
    interiorStyle: 'luxury',
    exteriorConfig: { roofStyle: 'flat', texture: 'glass', color: '#1a202c' },
    collaborators: ['Jennifer L.'],
    tags: ['penthouse', 'luxury', 'views'],
  },
];

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultUser, ...parsed, avatar: parsed.name ? parsed.name.substring(0, 2).toUpperCase() : defaultUser.avatar };
      } catch (e) {}
    }
    return defaultUser;
  });
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const createProject = useCallback((name: string, type: Project['type']): Project => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name,
      description: '',
      type,
      thumbnail: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      floorPlan: [],
      interiorStyle: 'modern',
      exteriorConfig: {},
      collaborators: [],
      tags: [],
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    setCurrentProject(prev => prev?.id === id ? { ...prev, ...data } : prev);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setCurrentProject(prev => prev?.id === id ? null : prev);
  }, []);

  const saveFloorPlan = useCallback((projectId: string, elements: FloorElement[]) => {
    updateProject(projectId, { floorPlan: elements });
  }, [updateProject]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => {
      const newUser = { ...prev, ...data };
      if (data.name) {
        newUser.avatar = data.name.substring(0, 2).toUpperCase();
      }
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      user, projects, currentProject, setCurrentProject,
      createProject, updateProject, deleteProject, saveFloorPlan, updateUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
