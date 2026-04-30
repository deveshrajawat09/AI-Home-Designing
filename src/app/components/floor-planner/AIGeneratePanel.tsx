import React, { useState } from 'react';
import { Sparkles, Brain, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { parseFloorPlanPrompt, generateFloorPlan } from '../../utils/aiUtils';
import { FloorElement } from '../../context/AppContext';

const SAMPLE_PROMPTS = [
  'Modern 3BHK with open kitchen and garden',
  'Studio apartment with study room',
  '4BHK luxury villa with 3 bathrooms and garage',
  'Small 2BHK flat with balcony',
  '2BHK with dining room and parking',
];

interface Props {
  onGenerate: (elements: FloorElement[]) => void;
}

export function AIGeneratePanel({ onGenerate }: Props) {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');
  const [rooms, setRooms] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setRooms([]);

    await new Promise(res => setTimeout(res, 1200));

    const parsedRooms = parseFloorPlanPrompt(prompt);
    const elements = generateFloorPlan(parsedRooms);

    setRooms(parsedRooms);
    setLastGenerated(prompt);
    onGenerate(elements);
    setGenerating(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Floor Generator</div>
          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Describe your floor plan</div>
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder='e.g. "Modern 3BHK with open kitchen, 2 bathrooms, and garden"'
        rows={3}
        className={`w-full px-2 py-2 rounded-lg border text-xs outline-none resize-none focus:ring-1 focus:ring-indigo-500 ${
          isDark ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
        }`}
      />

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generating}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {generating ? (
          <>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Floor Plan
          </>
        )}
      </button>

      {/* Sample prompts */}
      <div>
        <div className={`text-[10px] font-medium mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Try these:</div>
        <div className="flex flex-col gap-1">
          {SAMPLE_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-left transition-colors ${
                isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <ChevronRight className="w-2.5 h-2.5 shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Generated rooms list */}
      {rooms.length > 0 && (
        <div className={`p-2 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`flex items-center gap-1.5 mb-2 text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            <Zap className="w-3 h-3" />
            Generated {rooms.length} rooms:
          </div>
          <div className="flex flex-wrap gap-1">
            {rooms.map((r, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                {r.label}
              </span>
            ))}
          </div>
          <div className={`mt-1.5 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Floor plan placed on canvas. You can now edit it.
          </div>
        </div>
      )}
    </div>
  );
}
