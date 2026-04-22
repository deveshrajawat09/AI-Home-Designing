import React from 'react';

/**
 * Drawing Tools Component
 * Provides UI for drawing tools (pen, eraser, rectangle, circle, etc.)
 */

export const DRAWING_TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  ERASER: 'eraser',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  TEXT: 'text'
};

export const DrawingToolbar = ({ 
  activeTool, 
  onToolChange, 
  onUndo, 
  onRedo, 
  onClear,
  canUndo = false,
  canRedo = false 
}) => {
  const tools = [
    { id: DRAWING_TOOLS.SELECT, label: 'Select', icon: '🔲' },
    { id: DRAWING_TOOLS.PEN, label: 'Draw', icon: '✏️' },
    { id: DRAWING_TOOLS.ERASER, label: 'Erase', icon: '🧹' },
    { id: DRAWING_TOOLS.RECTANGLE, label: 'Rectangle', icon: '▭' },
    { id: DRAWING_TOOLS.CIRCLE, label: 'Circle', icon: '◯' },
    { id: DRAWING_TOOLS.LINE, label: 'Line', icon: '│' },
    { id: DRAWING_TOOLS.TEXT, label: 'Text', icon: 'A' }
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Drawing Tools */}
      <div className="flex gap-1 border-r border-slate-200 pr-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
              activeTool === tool.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* History Controls */}
      <div className="flex gap-1 border-r border-slate-200 px-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            canUndo
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            canRedo
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* Clear Canvas */}
      <button
        onClick={onClear}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all"
        title="Clear Canvas"
      >
        🗑️
      </button>

      {/* Tool Info */}
      <div className="ml-auto text-sm text-slate-600 flex items-center">
        Current tool: <span className="font-semibold ml-1 text-slate-800">
          {tools.find(t => t.id === activeTool)?.label}
        </span>
      </div>
    </div>
  );
};

/**
 * Color Picker Component
 */
export const ColorPicker = ({ color, onChange, label = 'Color' }) => {
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#808080'
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700">{label}:</label>
      <div className="flex gap-1">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded border-2 transition-all ${
              color === c ? 'border-slate-800' : 'border-slate-300'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 cursor-pointer"
          title="Custom color"
        />
      </div>
    </div>
  );
};

/**
 * Brush Settings Component
 */
export const BrushSettings = ({ 
  brushSize = 2, 
  onBrushSizeChange,
  opacity = 100,
  onOpacityChange 
}) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Brush Size:</label>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm text-slate-600 min-w-[30px]">{brushSize}px</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Opacity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm text-slate-600 min-w-[40px]">{opacity}%</span>
      </div>
    </div>
  );
};

/**
 * Layers Panel Component
 */
export const LayersPanel = ({ layers = [], onLayerSelect, onLayerDelete, activeLayer }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
      <h3 className="font-semibold text-slate-700 mb-2">Layers ({layers.length})</h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {layers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No layers</p>
        ) : (
          layers.map((layer, idx) => (
            <div
              key={layer.id}
              onClick={() => onLayerSelect(layer.id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                activeLayer === layer.id
                  ? 'bg-teal-100 border border-teal-300'
                  : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className="text-sm text-slate-700">{layer.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerDelete(layer.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
