import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Palette, TreeDeciduous, Car, Home, ChevronRight, Check,
  Sparkles, RefreshCw, Download, Eye, Layers, ArrowRight, Brush
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1766603636562-531bb3e1dda8?w=800';

const ROOF_STYLES = [
  { id: 'flat', name: 'Flat Roof', emoji: '▬', desc: 'Modern & minimalist' },
  { id: 'gabled', name: 'Gabled', emoji: '▲', desc: 'Classic triangular peak' },
  { id: 'hip', name: 'Hip Roof', emoji: '◆', desc: 'Slopes on all sides' },
  { id: 'mansard', name: 'Mansard', emoji: '🏛', desc: 'French baroque style' },
  { id: 'shed', name: 'Shed Roof', emoji: '↗', desc: 'Single sloping plane' },
];

const TEXTURES = [
  { id: 'brick', name: 'Brick', color: '#c4704a', pattern: 'brick' },
  { id: 'concrete', name: 'Concrete', color: '#9ca3af', pattern: 'concrete' },
  { id: 'wood', name: 'Wood Cladding', color: '#a0714f', pattern: 'wood' },
  { id: 'glass', name: 'Glass & Steel', color: '#bfdbfe', pattern: 'glass' },
  { id: 'plaster', name: 'White Plaster', color: '#f5f0eb', pattern: 'plaster' },
  { id: 'stone', name: 'Natural Stone', color: '#b8a99a', pattern: 'stone' },
];

const GARDEN_ELEMENTS = [
  { id: 'lawn', name: 'Lawn', emoji: '🌿' },
  { id: 'trees', name: 'Trees', emoji: '🌳' },
  { id: 'flower', name: 'Flower Beds', emoji: '🌸' },
  { id: 'pool', name: 'Swimming Pool', emoji: '🏊' },
  { id: 'path', name: 'Garden Path', emoji: '🪨' },
  { id: 'fence', name: 'Boundary Fence', emoji: '🏗' },
];

const DRIVEWAY_STYLES = [
  { id: 'concrete', name: 'Concrete', color: '#9ca3af' },
  { id: 'asphalt', name: 'Asphalt', color: '#374151' },
  { id: 'paver', name: 'Paving Stones', color: '#b8a99a' },
  { id: 'gravel', name: 'Gravel', color: '#d1c4b6' },
];

const WALL_COLORS = [
  '#f5f0eb', '#e8e0d5', '#c9b89a', '#a0714f', '#4a3728',
  '#2d3748', '#1a1a2e', '#e2f0cb', '#c8e6c9', '#bbdefb',
];

interface ExteriorConfig {
  roofStyle: string;
  texture: string;
  wallColor: string;
  roofColor: string;
  garden: string[];
  driveway: string;
  parking: boolean;
  boundaryWall: boolean;
  floors: number;
}

// SVG House Elevation Generator
function HouseElevation({ config }: { config: ExteriorConfig }) {
  const { isDark } = useTheme();
  const texturePatterns: Record<string, string> = {
    brick: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px), repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.1) 12px, rgba(0,0,0,0.1) 13px)',
    concrete: 'none',
    wood: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.12) 20px, rgba(0,0,0,0.12) 21px)',
    glass: 'none',
    plaster: 'none',
    stone: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 7px)',
  };

  const wallH = 60 * config.floors;
  const totalH = wallH + (config.roofStyle !== 'flat' ? 50 : 20) + 40;
  const roofY = 40;

  const TEXTURE_COLORS: Record<string, string> = {
    brick: '#c4704a', concrete: '#9ca3af', wood: '#a0714f',
    glass: '#bfdbfe', plaster: '#f5f0eb', stone: '#b8a99a',
  };
  const wallColor = config.wallColor || TEXTURE_COLORS[config.texture] || '#e8e0d5';

  return (
    <svg viewBox="0 0 400 260" className="w-full h-full" style={{ maxHeight: 260 }}>
      {/* Sky */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#0f172a' : '#e0f2fe'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#bae6fd'} />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.roofColor || '#374151'} />
          <stop offset="100%" stopColor={config.roofColor ? config.roofColor + '99' : '#1f2937'} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#sky)" />

      {/* Ground */}
      <rect x="0" y="220" width="400" height="40" fill={isDark ? '#1e2d1e' : '#86efac'} opacity="0.8" />
      <rect x="0" y="220" width="400" height="4" fill={isDark ? '#166534' : '#4ade80'} />

      {/* Driveway */}
      {config.driveway && (
        <>
          <rect x="280" y="180" width="80" height="44" fill={
            config.driveway === 'asphalt' ? '#374151' :
            config.driveway === 'paver' ? '#b8a99a' :
            config.driveway === 'gravel' ? '#d1c4b6' : '#9ca3af'
          } />
          {config.parking && (
            <>
              <rect x="290" y="185" width="60" height="35" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3" opacity="0.6" />
              <text x="320" y="207" textAnchor="middle" fill="white" fontSize="8" opacity="0.7">P</text>
            </>
          )}
        </>
      )}

      {/* Boundary wall */}
      {config.boundaryWall && (
        <>
          <rect x="20" y="205" width="360" height="15" fill="#6b7280" />
          <rect x="20" y="200" width="360" height="6" fill="#9ca3af" />
        </>
      )}

      {/* Trees/Garden */}
      {config.garden.includes('trees') && (
        <>
          <ellipse cx="45" cy="180" rx="20" ry="30" fill="#16a34a" opacity="0.9" />
          <rect x="42" y="190" width="6" height="20" fill="#92400e" />
          <ellipse cx="355" cy="185" rx="18" ry="25" fill="#15803d" opacity="0.9" />
          <rect x="352" y="195" width="6" height="18" fill="#92400e" />
        </>
      )}
      {config.garden.includes('lawn') && (
        <rect x="20" y="215" width="260" height="6" fill="#22c55e" opacity="0.6" />
      )}
      {config.garden.includes('flower') && (
        <>
          {[50, 70, 90].map(x => (
            <g key={x}>
              <circle cx={x} cy={210} r={4} fill={['#f472b6','#fb923c','#facc15'][Math.floor(x/50-1)]} />
              <rect x={x-0.5} y={212} width={1} height={8} fill="#16a34a" />
            </g>
          ))}
        </>
      )}

      {/* Main house walls */}
      <rect
        x="60" y={220 - wallH}
        width="220" height={wallH}
        fill={wallColor}
        style={{ backgroundImage: texturePatterns[config.texture] || 'none' }}
      />
      {config.texture === 'brick' && (
        <g opacity="0.2">
          {Array.from({ length: Math.ceil(wallH / 10) }).map((_, i) =>
            Array.from({ length: 9 }).map((__, j) => (
              <rect key={`${i}-${j}`} x={60 + j * 25 + (i % 2 === 0 ? 0 : 12)} y={220 - wallH + i * 10} width={22} height={8} fill="none" stroke="#7c3d1f" strokeWidth="0.5" />
            ))
          )}
        </g>
      )}

      {/* Roof */}
      {config.roofStyle === 'flat' && (
        <rect x="55" y={220 - wallH - 15} width="230" height="15" fill="url(#roofGrad)" />
      )}
      {config.roofStyle === 'gabled' && (
        <polygon points={`60,${220 - wallH} 280,${220 - wallH} 170,${220 - wallH - 55}`} fill="url(#roofGrad)" />
      )}
      {config.roofStyle === 'hip' && (
        <polygon points={`60,${220 - wallH} 280,${220 - wallH} 255,${220 - wallH - 40} 85,${220 - wallH - 40}`} fill="url(#roofGrad)" />
      )}
      {config.roofStyle === 'mansard' && (
        <>
          <rect x="70" y={220 - wallH - 35} width="200" height="35" fill="url(#roofGrad)" />
          <rect x="55" y={220 - wallH - 8} width="230" height="8" fill="url(#roofGrad)" />
        </>
      )}
      {config.roofStyle === 'shed' && (
        <polygon points={`55,${220 - wallH} 285,${220 - wallH} 285,${220 - wallH - 20} 55,${220 - wallH - 50}`} fill="url(#roofGrad)" />
      )}

      {/* Windows — per floor */}
      {Array.from({ length: config.floors }).map((_, floor) => {
        const fy = 220 - 60 * (floor + 1) + 15;
        return (
          <g key={floor}>
            {[90, 150, 210].map(wx => (
              config.texture === 'glass'
                ? <rect key={wx} x={wx} y={fy} width={30} height={28} fill="#bfdbfe" opacity="0.8" stroke="#93c5fd" strokeWidth="1" />
                : (
                  <g key={wx}>
                    <rect x={wx} y={fy} width={30} height={28} fill="#bfdbfe" opacity={isDark ? '0.4' : '0.7'} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
                    <line x1={wx+15} y1={fy} x2={wx+15} y2={fy+28} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1" />
                    <line x1={wx} y1={fy+14} x2={wx+30} y2={fy+14} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1" />
                  </g>
                )
            ))}
          </g>
        );
      })}

      {/* Door */}
      <rect x="155" y={220 - 45} width="30" height="45" rx="3" fill={isDark ? '#4b2f1a' : '#7c3d1f'} />
      <circle cx="180" cy="197" r="2.5" fill={isDark ? '#fbbf24' : '#f59e0b'} />
      <line x1="170" y1="175" x2="170" y2="220" stroke={isDark ? '#2d1a0e' : '#5c2d0e'} strokeWidth="1" />

      {/* Steps */}
      <rect x="148" y={216} width="44" height="4" fill={isDark ? '#374151' : '#9ca3af'} />
      <rect x="152" y={218} width="36" height="4" fill={isDark ? '#4b5563' : '#d1d5db'} />

      {/* Swimming pool */}
      {config.garden.includes('pool') && (
        <ellipse cx="350" cy="205" rx="30" ry="15" fill="#38bdf8" opacity="0.7" stroke="#0ea5e9" strokeWidth="1.5" />
      )}

      {/* Garden path */}
      {config.garden.includes('path') && (
        <path d="M 170 220 L 160 240" stroke={isDark ? '#6b7280' : '#d1d5db'} strokeWidth="12" strokeLinecap="round" />
      )}

      {/* Label */}
      <text x="200" y="253" textAnchor="middle" fill={isDark ? '#6b7280' : '#9ca3af'} fontSize="8" fontFamily="Inter, sans-serif">
        HomeAI • {config.floors}-Floor {config.roofStyle.charAt(0).toUpperCase() + config.roofStyle.slice(1)} Roof • {config.texture.charAt(0).toUpperCase() + config.texture.slice(1)} Texture
      </text>
    </svg>
  );
}

export default function ExteriorDesignPage() {
  const { isDark } = useTheme();
  const [config, setConfig] = useState<ExteriorConfig>({
    roofStyle: 'gabled',
    texture: 'brick',
    wallColor: '',
    roofColor: '#374151',
    garden: ['lawn', 'trees'],
    driveway: 'concrete',
    parking: true,
    boundaryWall: true,
    floors: 2,
  });
  const [generating, setGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const update = (key: keyof ExteriorConfig, value: any) => setConfig(prev => ({ ...prev, [key]: value }));

  const toggleGarden = (id: string) =>
    update('garden', config.garden.includes(id) ? config.garden.filter(g => g !== id) : [...config.garden, id]);

  const generateAISuggestion = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    const suggestions = [
      `For a ${config.floors}-floor home with ${config.texture} texture and ${config.roofStyle} roof: Consider adding climbing plants on the north facade, a pergola over the entrance, and warm exterior lighting at eave level. The ${config.texture} texture pairs beautifully with dark-framed windows.`,
      `Your ${config.roofStyle} roof design with ${config.texture} exterior will achieve a timeless aesthetic. AI recommends: contrasting window frames in charcoal, copper downspouts for accent, and native plantings for the boundary garden.`,
      `Optimal color pairing for ${config.texture} texture: Try Benjamin Moore 'White Dove' for main walls with a slate-gray roof. Add navy shutters and brass hardware for a premium finish. Expected curb appeal score: 9.2/10.`,
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setGenerating(false);
  };

  return (
    <div className={`min-h-screen pt-14 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div className={`sticky top-14 z-30 border-b ${isDark ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-xl`}>
        <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-3 h-12">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold">Exterior Design Studio</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
            Live Preview
          </span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">

            {/* Roof style */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Home className="w-4 h-4 text-emerald-400" /> Roof Style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {ROOF_STYLES.map(roof => (
                  <button
                    key={roof.id}
                    onClick={() => update('roofStyle', roof.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      config.roofStyle === roof.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : isDark ? 'border-gray-800 text-gray-400 hover:border-gray-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{roof.emoji}</div>
                    <div className="text-[10px] font-medium">{roof.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Textures */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Brush className="w-4 h-4 text-emerald-400" /> Exterior Texture
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TEXTURES.map(tex => (
                  <button
                    key={tex.id}
                    onClick={() => { update('texture', tex.id); update('wallColor', tex.color); }}
                    className={`p-2 rounded-xl border transition-all ${
                      config.texture === tex.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-6 rounded-md mb-1" style={{ background: tex.color }} />
                    <div className={`text-[10px] font-medium ${config.texture === tex.id ? 'text-emerald-400' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tex.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wall colors */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Palette className="w-4 h-4 text-emerald-400" /> Wall Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {WALL_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => update('wallColor', color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                      config.wallColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={config.wallColor || '#e8e0d5'}
                  onChange={e => update('wallColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Custom color</span>
              </div>
            </div>

            {/* Floors */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Number of Floors</h3>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => update('floors', n)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      config.floors === n
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : isDark ? 'border-gray-700 text-gray-300 hover:border-gray-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {n} Floor{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Garden */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TreeDeciduous className="w-4 h-4 text-emerald-400" /> Garden & Landscape
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {GARDEN_ELEMENTS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGarden(g.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition-all ${
                      config.garden.includes(g.id)
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : isDark ? 'border-gray-800 text-gray-400 hover:border-gray-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{g.emoji}</span>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Driveway */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Car className="w-4 h-4 text-emerald-400" /> Driveway & Parking
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {DRIVEWAY_STYLES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => update('driveway', d.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all ${
                      config.driveway === d.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : isDark ? 'border-gray-800 text-gray-400 hover:border-gray-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-4 h-4 rounded" style={{ background: d.color }} />
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={config.parking} onChange={e => update('parking', e.target.checked)} className="accent-emerald-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Parking space</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={config.boundaryWall} onChange={e => update('boundaryWall', e.target.checked)} className="accent-emerald-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Boundary wall</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 space-y-4">
            {/* Live elevation */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Elevation Preview</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <div className="p-4" style={{ height: 280 }}>
                <HouseElevation config={config} />
              </div>
            </div>

            {/* Roof color */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Roof Color</h3>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.roofColor}
                  onChange={e => update('roofColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <div className="flex gap-2">
                  {['#374151', '#7c3d1f', '#dc2626', '#1e40af', '#15803d', '#111827'].map(c => (
                    <button
                      key={c}
                      onClick={() => update('roofColor', c)}
                      className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform ${config.roofColor === c ? 'border-white' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Design Insights</span>
                </div>
                <button
                  onClick={generateAISuggestion}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                    isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                  Generate
                </button>
              </div>

              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ width: `${[100, 85, 70][i]}%` }} />
                    ))}
                  </motion.div>
                ) : aiSuggestion ? (
                  <motion.p
                    key="content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {aiSuggestion}
                  </motion.p>
                ) : (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Click "Generate" to get AI-powered exterior design insights for your configuration.
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Design Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Roof Style', value: config.roofStyle },
                  { label: 'Texture', value: config.texture },
                  { label: 'Floors', value: config.floors },
                  { label: 'Driveway', value: config.driveway },
                  { label: 'Garden Elements', value: config.garden.join(', ') || 'None' },
                  { label: 'Features', value: [config.parking && 'Parking', config.boundaryWall && 'Boundary Wall'].filter(Boolean).join(', ') || 'None' },
                ].map(item => (
                  <div key={item.label} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`font-medium capitalize mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                    <div className={`capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}