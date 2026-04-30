import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Circle, Wifi, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MOCK_USERS = [
  { id: 'u2', name: 'Sarah K.', avatar: 'SK', color: '#f59e0b', cursor: { x: 340, y: 220 }, activity: 'Editing kitchen', online: true },
  { id: 'u3', name: 'Mike R.', avatar: 'MR', color: '#10b981', cursor: { x: 560, y: 380 }, activity: 'Moving sofa', online: true },
  { id: 'u4', name: 'Lisa P.', avatar: 'LP', color: '#ec4899', cursor: null, activity: 'Idle', online: false },
];

interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  time: string;
  color: string;
}

const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', userId: 'u2', name: 'Sarah K.', text: 'Should we extend the living room?', time: '2:14 PM', color: '#f59e0b' },
  { id: '2', userId: 'u3', name: 'Mike R.', text: 'Good idea! I\'ll add a wall segment.', time: '2:15 PM', color: '#10b981' },
];

interface Props {
  isOpen: boolean;
}

export function CollabPanel({ isOpen }: Props) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('users');
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');

  // Simulate real-time activity updates
  const [activities, setActivities] = useState<Record<string, string>>({
    u2: 'Editing kitchen',
    u3: 'Moving sofa',
  });

  useEffect(() => {
    if (!isOpen) return;
    const actions = [
      'Drawing wall segment', 'Moving furniture', 'Editing kitchen', 'Labeling room',
      'Resizing bedroom', 'Adding door', 'Viewing floor plan', 'Placing window',
    ];
    const interval = setInterval(() => {
      const user = Math.random() > 0.5 ? 'u2' : 'u3';
      setActivities(prev => ({
        ...prev,
        [user]: actions[Math.floor(Math.random() * actions.length)],
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `c-${Date.now()}`,
      userId: 'u1',
      name: 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: '#6366f1',
    };
    setChat(prev => [...prev, msg]);
    setChatInput('');
  };

  if (!isOpen) return null;

  return (
    <div className={`flex flex-col h-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-medium">Live Session</span>
        </div>
        <div className="ml-auto flex -space-x-1">
          {MOCK_USERS.filter(u => u.online).concat([{ id: 'u1', name: 'You', avatar: 'YO', color: '#6366f1', cursor: null, activity: 'Active', online: true }]).map(u => (
            <div
              key={u.id}
              className="w-5 h-5 rounded-full border-2 border-gray-950 flex items-center justify-center text-white text-[8px] font-bold"
              style={{ background: u.color }}
              title={u.name}
            >
              {u.avatar.charAt(0)}
            </div>
          ))}
        </div>
        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {MOCK_USERS.filter(u => u.online).length + 1} online
        </span>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'chat', label: 'Chat', icon: MessageCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'users' | 'chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* You */}
          <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'}`}>
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">YO</div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>You (Owner)</div>
              <div className={`text-[10px] truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</div>
            </div>
            <Circle className="w-2 h-2 text-green-400 fill-green-400" />
          </div>

          {MOCK_USERS.map(user => (
            <motion.div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: user.color }}
              >
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                {user.online ? (
                  <div className={`text-[10px] truncate`} style={{ color: user.color }}>
                    {activities[user.id] || user.activity}
                  </div>
                ) : (
                  <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Offline</div>
                )}
              </div>
              <Circle className={`w-2 h-2 ${user.online ? 'fill-green-400 text-green-400' : 'fill-gray-600 text-gray-600'}`} />
            </motion.div>
          ))}

          <div className={`mt-4 p-2 rounded-lg border text-[10px] ${isDark ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            <div className="font-medium mb-1">🔒 Conflict Resolution</div>
            <div>CRDT-based sync ensures no conflicts. Last write wins for positions, merge for deletions.</div>
          </div>

          <div className={`p-2 rounded-lg border text-[10px] ${isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
            <div className="font-medium mb-1">📡 Sync Status</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              All changes synced in real-time
            </div>
          </div>
        </div>
      )}

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chat.map(msg => (
              <div key={msg.id} className={`${msg.userId === 'u1' ? 'flex flex-row-reverse' : ''}`}>
                <div className={`max-w-[85%] ${msg.userId === 'u1' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className={`text-[10px] px-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={{ color: msg.color }}>
                    {msg.name} · {msg.time}
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl text-xs ${
                    msg.userId === 'u1'
                      ? 'bg-indigo-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex items-center gap-2 p-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Send message..."
              className={`flex-1 text-xs bg-transparent outline-none ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim()}
              className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white disabled:opacity-40"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
