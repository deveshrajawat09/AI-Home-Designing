import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Paintbrush, Sparkles, Lightbulb, Check, RefreshCw, Copy, Palette,
  Zap, ArrowRight, Brain, Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AI_SUGGESTIONS, COLOR_PALETTES } from '../utils/aiUtils';
import { ThreePreview } from '../components/ThreePreview';
import { useApp } from '../context/AppContext';

const STYLES = [
  { id: 'modern', name: 'Modern', emoji: '🏙️', desc: 'Clean lines, neutral palette, minimal decor' },
  { id: 'minimal', name: 'Minimal', emoji: '◻️', desc: 'Less is more, pure forms, natural light' },
  { id: 'luxury', name: 'Luxury', emoji: '✨', desc: 'Rich textures, bold colors, statement pieces' },
  { id: 'traditional', name: 'Traditional', emoji: '🏡', desc: 'Classic elegance, warm tones, detailed craftsmanship' },
  { id: 'scandinavian', name: 'Scandinavian', emoji: '🌿', desc: 'Hygge vibes, natural materials, cozy atmosphere' },
  { id: 'industrial', name: 'Industrial', emoji: '🏭', desc: 'Raw materials, exposed elements, urban aesthetic' },
];

const ROOMS = ['Living Room', 'Master Bedroom', 'Kitchen', 'Dining Room', 'Bathroom', 'Study Room'];

const LIGHTING_PRESETS = [
  { id: 'natural', name: 'Natural', desc: 'Floor-to-ceiling windows, skylights, minimal artificial' },
  { id: 'warm', name: 'Warm & Cozy', desc: 'Edison bulbs, table lamps, warm 2700K temperature' },
  { id: 'bright', name: 'Bright & Airy', desc: 'Recessed LED panels, 4000K daylight, even distribution' },
  { id: 'ambient', name: 'Layered Ambient', desc: '3 light layers: ambient + task + accent strips' },
];

const INTERIOR_IMG = 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?w=800';
const BEDROOM_IMG = 'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800';
const KITCHEN_IMG = 'https://images.unsplash.com/photo-1649083048391-1c9e82472f65?w=800';

const ROOM_IMAGES: Record<string, string> = {
  'Living Room': INTERIOR_IMG,
  'Master Bedroom': BEDROOM_IMG,
  'Kitchen': KITCHEN_IMG,
  'Dining Room': INTERIOR_IMG,
  'Bathroom': BEDROOM_IMG,
  'Study Room': KITCHEN_IMG,
};

export default function InteriorDesignPage() {
  const { isDark } = useTheme();
  const { currentProject } = useApp();

  const [activeStyle, setActiveStyle] = useState('modern');
  const [activeRoom, setActiveRoom] = useState('Living Room');
  const [activeLighting, setActiveLighting] = useState('natural');
  const [suggestions, setSuggestions] = useState<string[]>(AI_SUGGESTIONS.modern);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'lighting' | '3d'>('style');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleStyleChange = async (style: string) => {
    setActiveStyle(style);
    setGenerating(true);
    await new Promise(r => setTimeout(r, 800));
    setSuggestions(AI_SUGGESTIONS[style] || AI_SUGGESTIONS.modern);
    setGenerating(false);
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const palette = COLOR_PALETTES[activeStyle as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.modern;

  return (
    <div className={`min-h-screen pt-14 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div className={`sticky top-14 z-30 border-b ${isDark ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-xl`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-4 h-12">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold">Interior Design Studio</span>
            </div>

            {/* Room selector */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {ROOMS.map(room => (
                <button
                  key={room}
                  onClick={() => setActiveRoom(room)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeRoom === room
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <button
                onClick={() => setActiveTab('3d')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Eye className="w-3.5 h-3.5" />
                3D Preview
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {[
              { id: 'style', label: 'Style Presets', icon: Sparkles },
              { id: 'colors', label: 'Color Palette', icon: Palette },
              { id: 'lighting', label: 'Lighting', icon: Lightbulb },
              { id: '3d', label: '3D Preview', icon: Eye },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-400'
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">

        {/* Style Presets Tab */}
        {activeTab === 'style' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLES.map(style => (
                  <motion.button
                    key={style.id}
                    onClick={() => handleStyleChange(style.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeStyle === style.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : isDark
                          ? 'border-gray-800 bg-gray-900 hover:border-gray-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.emoji}</div>
                    <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{style.name}</div>
                    <div className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{style.desc}</div>
                    {activeStyle === style.id && (
                      <div className="mt-2 flex items-center gap-1 text-violet-400 text-[11px]">
                        <Check className="w-3 h-3" /> Active
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Room preview */}
              <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeRoom} Preview</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-50 text-violet-600'
                  }`}>{activeStyle} Style</span>
                </div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={ROOM_IMAGES[activeRoom] || INTERIOR_IMG}
                    alt={activeRoom}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${
                    activeStyle === 'luxury' ? 'bg-indigo-900/40' :
                    activeStyle === 'industrial' ? 'bg-gray-900/50' :
                    activeStyle === 'minimal' ? 'bg-white/10' :
                    'bg-gradient-to-t from-black/20 to-transparent'
                  }`} />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {(COLOR_PALETTES[activeStyle as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.modern).slice(0, 4).map(c => (
                      <div key={c.hex} className="w-5 h-5 rounded-full border-2 border-white/40 shadow-lg" style={{ background: c.hex }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions panel */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Suggestions</span>
                </div>
                <button
                  onClick={() => handleStyleChange(activeStyle)}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-8 rounded-lg animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {suggestions.map((s, i) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                          isDark ? 'bg-gray-800/60 text-gray-300' : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <ArrowRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                        {s}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`mt-4 p-3 rounded-xl border ${isDark ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
                  Style: {STYLES.find(s => s.id === activeStyle)?.name}
                </div>
                <div className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {STYLES.find(s => s.id === activeStyle)?.desc}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('3d')}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview in 3D
              </button>
            </div>
          </div>
        )}

        {/* Color Palette Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(COLOR_PALETTES).map(([styleName, colors]) => (
                <motion.div
                  key={styleName}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeStyle === styleName
                      ? 'border-violet-500 bg-violet-500/10'
                      : isDark ? 'border-gray-800 bg-gray-900 hover:border-gray-700' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setActiveStyle(styleName)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{styleName}</span>
                    {activeStyle === styleName && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <div className="flex gap-2">
                    {colors.map(c => (
                      <button
                        key={c.hex}
                        onClick={e => { e.stopPropagation(); copyColor(c.hex); }}
                        title={`${c.name} · ${c.hex}`}
                        className="group relative w-9 h-9 rounded-lg border-2 border-white/20 shadow-md hover:scale-110 transition-transform"
                        style={{ background: c.hex }}
                      >
                        {copiedColor === c.hex && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1">
                    {colors.slice(0, 3).map(c => (
                      <div key={c.hex} className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm" style={{ background: c.hex }} />
                          {c.name}
                        </div>
                        <span className={`font-mono text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{c.hex}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Active palette detail */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-base font-semibold mb-4 capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeStyle} Palette — Full Details
              </h3>
              <div className="grid sm:grid-cols-5 gap-3">
                {palette.map(color => (
                  <div key={color.hex} className="space-y-2">
                    <div
                      className="h-24 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: color.hex }}
                      onClick={() => copyColor(color.hex)}
                    />
                    <div className={`text-xs text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{color.name}</div>
                    <div
                      className={`text-[10px] text-center font-mono cursor-pointer flex items-center justify-center gap-1 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                      onClick={() => copyColor(color.hex)}
                    >
                      {copiedColor === color.hex ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" />{color.hex}</>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lighting Tab */}
        {activeTab === 'lighting' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Lighting Presets</h3>
              {LIGHTING_PRESETS.map(preset => (
                <motion.button
                  key={preset.id}
                  onClick={() => setActiveLighting(preset.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    activeLighting === preset.id
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : isDark ? 'border-gray-800 bg-gray-900 hover:border-gray-700' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeLighting === preset.id ? 'bg-yellow-500/20' : isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <Lightbulb className={`w-5 h-5 ${activeLighting === preset.id ? 'text-yellow-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{preset.name}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{preset.desc}</div>
                    </div>
                    {activeLighting === preset.id && <Check className="w-4 h-4 text-yellow-400 ml-auto" />}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Lighting Analysis</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Ambient Light', value: 75, color: '#f59e0b' },
                  { label: 'Task Lighting', value: 60, color: '#6366f1' },
                  { label: 'Accent Lighting', value: 40, color: '#8b5cf6' },
                  { label: 'Natural Light', value: 85, color: '#10b981' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.value}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-100'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  💡 AI Recommendation
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  For {activeRoom} in {activeStyle} style: Use 3-layer lighting with 4000K recessed LEDs as ambient,
                  directional pendants for task areas, and warm LED strips at 2700K for accent lighting to create depth and ambiance.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Preview Tab */}
        {activeTab === '3d' && (
          <div className="space-y-4">
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'}`} style={{ height: 480 }}>
              <ThreePreview elements={currentProject?.floorPlan || []} style={activeStyle} />
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>3D Preview Settings</h3>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStyle(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      activeStyle === s.id
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}