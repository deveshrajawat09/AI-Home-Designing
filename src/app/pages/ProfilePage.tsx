import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  User, Mail, Calendar, Star, Edit3, Save, Shield, Bell,
  Moon, Sun, Grid3X3, Layers, Download, Share2, Zap, Crown,
  Check, Camera, Lock, Cpu, Paintbrush, LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, projects, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user.name, email: user.email });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security'>('overview');

  const handleSave = () => {
    updateUser(editData);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const planColors = { free: 'gray', pro: 'indigo', enterprise: 'violet' };
  const planColor = planColors[user.plan];

  const stats = [
    { label: 'Projects', value: projects.length, icon: Layers, color: 'blue' },
    { label: 'Exports', value: 24, icon: Download, color: 'emerald' },
    { label: 'Shared', value: 8, icon: Share2, color: 'violet' },
    { label: 'AI Credits', value: 450, icon: Cpu, color: 'orange' },
  ];

  return (
    <div className={`min-h-screen pt-14 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border mb-6 relative overflow-hidden ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.avatar}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1">
              {editing ? (
                <div className="space-y-2 mb-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className={`w-full px-3 py-1.5 rounded-lg border text-sm outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                  <input
                    type="email"
                    value={editData.email}
                    onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                    className={`w-full px-3 py-1.5 rounded-lg border text-sm outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              ) : (
                <>
                  <h1 className={`text-xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</h1>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${planColor}-500/20 text-${planColor}-400 border border-${planColor}-500/30`}>
                  <Crown className="w-3 h-3" />
                  {user.plan.toUpperCase()} Plan
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30"
            >
              <Check className="w-3 h-3" /> Saved!
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border text-center ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl bg-${stat.color}-500/15 flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <div className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-0 border-b mb-6 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'settings', label: 'Settings', icon: Shield },
            { id: 'security', label: 'Security', icon: Lock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Plan details */}
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Plan</h3>
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
              }`}>
                <div>
                  <div className={`text-base font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{user.plan.toUpperCase()} Plan</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Unlimited projects · AI generation · 3D preview</div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">$29/mo</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {['Unlimited Projects', 'AI Floor Generation', '3D Preview', 'Collaboration', 'PDF Export', 'QR Sharing'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent projects */}
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Projects</h3>
              <div className="space-y-2">
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}`}>
                    <div className={`w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      {p.thumbnail && <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      p.type === 'residential' ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600' :
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    }`}>{p.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Dark Mode</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Toggle between light and dark theme</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                    isDark ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isDark ? <><Moon className="w-4 h-4" /> Dark</> : <><Sun className="w-4 h-4" /> Light</>}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
              {[
                { label: 'Collaboration Updates', desc: 'When team members edit your projects', on: true },
                { label: 'AI Generation Complete', desc: 'When AI finishes generating floor plans', on: true },
                { label: 'Project Shared', desc: 'When someone views your shared design', on: false },
                { label: 'Marketing Emails', desc: 'Product updates and new features', on: false },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</div>
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${item.on ? 'bg-indigo-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${item.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Password & Authentication</h3>
              <div className="space-y-3">
                {[
                  { label: 'Change Password', desc: 'Last changed 30 days ago', icon: Lock },
                  { label: 'Two-Factor Authentication', desc: 'Add extra security to your account', icon: Shield },
                  { label: 'Active Sessions', desc: '2 active sessions', icon: Zap },
                ].map(item => (
                  <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} flex items-center justify-center`}>
                        <item.icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</div>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-xs border transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                      Manage
                    </button>
                  </div>
                ))}
                <div className={`flex items-center justify-between p-3 rounded-xl border border-red-500/20 ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-red-500/10' : 'bg-red-100'} flex items-center justify-center`}>
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-500">Sign Out</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Log out of this device</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border border-rose-500/20 ${isDark ? 'bg-rose-500/5' : 'bg-rose-50'}`}>
              <h3 className="text-sm font-semibold text-rose-500 mb-2">Danger Zone</h3>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>These actions are irreversible. Please proceed with caution.</p>
              <button className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 text-xs hover:bg-rose-500/10 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
