import React, { useState } from 'react';
import { FurnitureType } from './FloorCanvas';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = [
  {
    name: 'Living',
    items: [
      { id: 'sofa' as FurnitureType, label: 'Sofa', emoji: '🛋️' },
      { id: 'table' as FurnitureType, label: 'Coffee Table', emoji: '☕' },
      { id: 'chair' as FurnitureType, label: 'Chair', emoji: '🪑' },
      { id: 'tv' as FurnitureType, label: 'TV Unit', emoji: '📺' },
    ],
  },
  {
    name: 'Bedroom',
    items: [
      { id: 'bed' as FurnitureType, label: 'Bed', emoji: '🛏️' },
      { id: 'wardrobe' as FurnitureType, label: 'Wardrobe', emoji: '🚪' },
      { id: 'desk' as FurnitureType, label: 'Desk', emoji: '💻' },
    ],
  },
  {
    name: 'Kitchen',
    items: [
      { id: 'fridge' as FurnitureType, label: 'Fridge', emoji: '🧊' },
      { id: 'dining-table' as FurnitureType, label: 'Dining Table', emoji: '🍽️' },
    ],
  },
  {
    name: 'Bathroom',
    items: [
      { id: 'bathtub' as FurnitureType, label: 'Bathtub', emoji: '🛁' },
      { id: 'toilet' as FurnitureType, label: 'Toilet', emoji: '🚽' },
      { id: 'sink' as FurnitureType, label: 'Sink', emoji: '🚿' },
    ],
  },
];

interface Props {
  selectedFurniture: FurnitureType | null;
  onSelect: (f: FurnitureType) => void;
}

export function FurniturePanel({ selectedFurniture, onSelect }: Props) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<string[]>(['Living', 'Bedroom']);

  const toggleCat = (name: string) =>
    setExpanded(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      <div className={`text-xs font-medium px-1 mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Furniture (click to select, then place on canvas)
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat.name}>
          <button
            onClick={() => toggleCat(cat.name)}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat.name}
            <span className={`transition-transform ${expanded.includes(cat.name) ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {expanded.includes(cat.name) && (
            <div className="grid grid-cols-2 gap-1 px-1 pb-1">
              {cat.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    selectedFurniture === item.id
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : isDark
                        ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-800 border border-gray-700/50'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-[10px] text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {selectedFurniture && (
        <div className={`mt-2 p-2 rounded-lg border text-xs ${isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
          ✓ Selected: <strong>{selectedFurniture}</strong>
          <br />Click on canvas to place. Press R to rotate after placing.
        </div>
      )}
    </div>
  );
}
