import React from 'react';
import { Tool } from './FloorCanvas';
import {
  MousePointer2, Minus, Square, Columns, Move, Type, Eraser,
  ZoomIn, ZoomOut, RotateCcw, Trash2, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  tool: Tool;
  setTool: (t: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const tools: { id: Tool; icon: React.FC<any>; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'S' },
  { id: 'wall', icon: Minus, label: 'Draw Wall', shortcut: 'W' },
  { id: 'door', icon: Square, label: 'Place Door', shortcut: 'D' },
  { id: 'window', icon: Columns, label: 'Place Window', shortcut: 'N' },
  { id: 'furniture', icon: Move, label: 'Furniture', shortcut: 'F' },
  { id: 'label', icon: Type, label: 'Add Label', shortcut: 'L' },
  { id: 'erase', icon: Eraser, label: 'Erase', shortcut: 'E' },
];

export function FloorToolbar({ tool, setTool, onUndo, onRedo, onClear }: Props) {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col gap-1 p-2 h-full`}>
      <div className={`text-xs font-medium px-1 mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Tools</div>

      {tools.map(t => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={`${t.label} (${t.shortcut})`}
          className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            tool === t.id
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <t.icon className="w-4 h-4" />
          <span className="text-[10px] leading-none">{t.label.split(' ')[0]}</span>

          {/* Tooltip */}
          <div className={`absolute left-full ml-2 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
            isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
          }`}>
            {t.label}
            <span className={`ml-1 px-1 rounded text-[10px] ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{t.shortcut}</span>
          </div>
        </button>
      ))}

      <div className={`w-full h-px my-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

      <div className={`text-xs font-medium px-1 mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Edit</div>

      <button
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
          isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-[10px]">Undo</span>
      </button>

      <button
        onClick={onRedo}
        title="Redo (Ctrl+Y)"
        className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
          isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <RotateCcw className="w-4 h-4 scale-x-[-1]" />
        <span className="text-[10px]">Redo</span>
      </button>

      <button
        onClick={onClear}
        title="Clear All"
        className="group relative flex flex-col items-center gap-1 p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-[10px]">Clear</span>
      </button>

      <div className={`w-full h-px my-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

      {/* Keyboard hints */}
      <div className={`mt-auto p-2 rounded-lg text-[10px] leading-relaxed ${isDark ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
        <div className="flex items-center gap-1 mb-1">
          <Info className="w-2.5 h-2.5" />
          <span className="font-medium">Hints</span>
        </div>
        <div>• Delete: remove selected</div>
        <div>• R: rotate furniture</div>
        <div>• Ctrl+Z: undo</div>
        <div>• Scroll: zoom</div>
        <div>• Drag: move</div>
      </div>
    </div>
  );
}
