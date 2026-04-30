import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Grid3X3, Paintbrush, Building2, Trash2, Edit3, Clock, Users,
  Sparkles, TrendingUp, Layers, MoreVertical, Search, Filter, Star,
  ArrowRight, Brain, Download, Share2
} from 'lucide-react';
import { useApp, Project } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { day: 'Mon', designs: 3, views: 12 },
  { day: 'Tue', designs: 5, views: 18 },
  { day: 'Wed', designs: 2, views: 8 },
  { day: 'Thu', designs: 7, views: 25 },
  { day: 'Fri', designs: 4, views: 15 },
  { day: 'Sat', designs: 9, views: 32 },
  { day: 'Sun', designs: 6, views: 22 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, projects, createProject, deleteProject, setCurrentProject } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'residential' | 'commercial' | 'landscape'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<Project['type']>('residential');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.type === filter;
    return matchSearch && matchFilter;
  });

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    navigate('/floor-planner');
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const p = createProject(newProjectName, newProjectType);
    setCurrentProject(p);
    setShowNewModal(false);
    setNewProjectName('');
    navigate('/floor-planner');
  };

  const quickActions = [
    { label: 'New Floor Plan', icon: Grid3X3, gradient: 'from-blue-500 to-indigo-600', path: '/floor-planner' },
    { label: 'Interior Design', icon: Paintbrush, gradient: 'from-violet-500 to-purple-600', path: '/interior' },
    { label: 'Exterior Design', icon: Building2, gradient: 'from-emerald-500 to-teal-600', path: '/exterior' },
    { label: 'AI Generate', icon: Brain, gradient: 'from-orange-500 to-rose-600', path: '/floor-planner', ai: true },
  ];

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Layers, color: 'indigo' },
    { label: 'Collaborators', value: projects.reduce((s, p) => s + p.collaborators.length, 0), icon: Users, color: 'violet' },
    { label: 'Exports', value: 24, icon: Download, color: 'emerald' },
    { label: 'Shared', value: 8, icon: Share2, color: 'orange' },
  ];

  return (
    <div className={`min-h-screen pt-14 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Good morning, {user.name.split(' ')[0]} 👋
            </h1>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              You have {projects.length} active projects · {user.plan.toUpperCase()} plan
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-${s.color}-500/15 flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {s.value}
              </div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick actions */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-105 ${
                    isDark ? 'bg-gray-800/60 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs text-center leading-tight ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <div className={`lg:col-span-2 p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity (7 days)</h2>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Designs & Views</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#f3f4f6'} />
                <XAxis dataKey="day" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: 8,
                    color: isDark ? '#fff' : '#111',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#grad1)" strokeWidth={2} />
                <Area type="monotone" dataKey="designs" stroke="#8b5cf6" fill="url(#grad2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Projects</h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
              }`}>
                <Search className="w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`bg-transparent outline-none w-36 text-sm ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1">
                {['all', 'residential', 'commercial'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filter === f
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={`text-center py-20 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <Layers className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No projects found</h3>
              <button
                onClick={() => setShowNewModal(true)}
                className="text-indigo-400 text-sm hover:text-indigo-300"
              >
                Create your first project →
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                    isDark ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-36 overflow-hidden">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Grid3X3 className={`w-8 h-8 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Type badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      project.type === 'residential' ? 'bg-blue-500/80 text-white' :
                      project.type === 'commercial' ? 'bg-emerald-500/80 text-white' :
                      'bg-orange-500/80 text-white'
                    }`}>
                      {project.type}
                    </div>

                    {/* Menu */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === project.id ? null : project.id); }}
                        className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {activeMenu === project.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            className={`absolute right-0 top-8 w-36 rounded-xl border shadow-xl overflow-hidden z-10 ${
                              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenProject(project); setActiveMenu(null); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Open Editor
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); setActiveMenu(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Collaborators */}
                    {project.collaborators.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Users className="w-3 h-3 text-white/70" />
                        <span className="text-white/70 text-xs">{project.collaborators.length} collab</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-medium leading-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h3>
                        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenProject(project)}
                      className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      Open Editor <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNewModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>New Project</h2>
              <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create a new design project</p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                    placeholder="e.g. Modern Family Home"
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'residential', label: 'Residential', icon: '🏠' },
                      { value: 'commercial', label: 'Commercial', icon: '🏢' },
                      { value: 'landscape', label: 'Landscape', icon: '🌿' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setNewProjectType(t.value as Project['type'])}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all ${
                          newProjectType === t.value
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span className="text-xs">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewModal(false)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
