import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Download, Share2, Undo2, Redo2, Maximize2, X, Layers,
  Brain, Users, Grid3X3, Eye, Settings, ZoomIn, ZoomOut, Box,
  QrCode, FileImage, ChevronLeft, ChevronRight, Sparkles, Paintbrush
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp, FloorElement } from '../context/AppContext';
import { FloorCanvas, FloorCanvasRef, Tool, FurnitureType } from '../components/floor-planner/FloorCanvas';
import { FloorToolbar } from '../components/floor-planner/FloorToolbar';
import { FurniturePanel } from '../components/floor-planner/FurniturePanel';
import { AIGeneratePanel } from '../components/floor-planner/AIGeneratePanel';
import { CollabPanel } from '../components/collaboration/CollabPanel';
import { AIAssistant, AIAssistantButton } from '../components/ai/AIAssistant';
import { ThreePreview } from '../components/ThreePreview';
import { exportCanvasToPNG, exportCanvasToJPG, exportCanvasToPDF, generateShareURL } from '../utils/exportUtils';
import { QRCodeSVG } from 'qrcode.react';
import { toast, Toaster } from 'sonner';

type RightTab = 'furniture' | 'ai-gen' | 'collab' | 'settings';
type Mode = '2d' | '3d';

export default function FloorPlannerPage() {
  const location = useLocation();
  const { isDark } = useTheme();
  const { currentProject, saveFloorPlan, user } = useApp();

  const [tool, setTool] = useState<Tool>('select');
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType | null>(null);
  const [elements, setElements] = useState<FloorElement[]>(currentProject?.floorPlan || []);
  const [rightTab, setRightTab] = useState<RightTab>('furniture');
  const [mode, setMode] = useState<Mode>('2d');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [interiorStyle, setInteriorStyle] = useState(currentProject?.interiorStyle || 'modern');
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<FloorCanvasRef>(null);

  // Handle prompt from landing page
  useEffect(() => {
    const state = location.state as { prompt?: string } | null;
    if (state?.prompt) {
      setRightTab('ai-gen');
      setRightOpen(true);
    }
  }, []);

  const handleFurnitureSelect = (f: FurnitureType) => {
    setSelectedFurniture(f);
    setTool('furniture');
  };

  const handleSave = () => {
    if (currentProject) {
      saveFloorPlan(currentProject.id, elements);
    }
    setSaved(true);
    toast.success('Floor plan saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) exportCanvasToPNG(canvas, currentProject?.name || 'floor-plan');
    setShowExportMenu(false);
    toast.success('Exported as PNG!');
  };

  const handleExportPDF = async () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) await exportCanvasToPDF(canvas, currentProject?.name || 'Floor Plan');
    setShowExportMenu(false);
    toast.success('Exported as PDF!');
  };

  const handleShare = () => {
    const url = generateShareURL(currentProject?.id || 'demo');
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Share link copied!');
      setShowQR(true);
    });
    setShowExportMenu(false);
  };

  const rightTabs: { id: RightTab; icon: React.FC<any>; label: string }[] = [
    { id: 'furniture', icon: Layers, label: 'Furniture' },
    { id: 'ai-gen', icon: Brain, label: 'AI Generate' },
    { id: 'collab', icon: Users, label: 'Collab' },
    { id: 'settings', icon: Settings, label: 'Style' },
  ];

  return (
    <div className={`h-screen pt-14 flex flex-col overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />

      {/* Toolbar */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b shrink-0 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`flex items-center gap-1.5 text-sm font-medium truncate max-w-48 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          <Grid3X3 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="truncate">{currentProject?.name || 'New Floor Plan'}</span>
        </div>

        <div className={`h-4 w-px mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Mode switch */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <button
            onClick={() => setMode('2d')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === '2d' ? 'bg-indigo-500 text-white' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            2D Plan
          </button>
          <button
            onClick={() => setMode('3d')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === '3d' ? 'bg-indigo-500 text-white' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Box className="w-3 h-3" />
            3D View
          </button>
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => canvasRef.current?.undo()}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => canvasRef.current?.redo()}
          title="Redo"
          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className={`h-4 w-px mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Saved!' : 'Save'}
        </button>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className={`absolute right-0 top-full mt-1.5 w-40 rounded-xl border shadow-xl overflow-hidden z-50 ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                {[
                  { label: 'Export PNG', icon: FileImage, action: handleExportPNG },
                  { label: 'Export PDF', icon: Download, action: handleExportPDF },
                  { label: 'Share & QR', icon: Share2, action: handleShare },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Assistant toggle */}
        <button
          onClick={() => setShowAI(!showAI)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showAI
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              : 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Chat
        </button>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel - tools */}
        <div className={`relative flex shrink-0 transition-all duration-200 ${leftOpen ? 'w-16' : 'w-0'} overflow-hidden`}>
          <div className={`w-16 h-full border-r overflow-y-auto ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <FloorToolbar
              tool={tool}
              setTool={t => {
                setTool(t);
                if (t !== 'furniture') setSelectedFurniture(null);
              }}
              onUndo={() => canvasRef.current?.undo()}
              onRedo={() => canvasRef.current?.redo()}
              onClear={() => {
                if (confirm('Clear all elements?')) canvasRef.current?.clearAll();
              }}
            />
          </div>
        </div>

        {/* Toggle left panel */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className={`absolute left-${leftOpen ? '16' : '0'} top-1/2 -translate-y-1/2 z-20 w-4 h-10 flex items-center justify-center rounded-r-lg border-y border-r transition-all ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          style={{ left: leftOpen ? 64 : 0 }}
        >
          {leftOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {mode === '2d' ? (
            <FloorCanvas
              ref={canvasRef}
              tool={tool}
              selectedFurniture={selectedFurniture}
              elements={elements}
              onElementsChange={setElements}
            />
          ) : (
            <ThreePreview elements={elements} style={interiorStyle} />
          )}

          {/* Element count badge */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs ${
            isDark ? 'bg-gray-900/80 border border-gray-800 text-gray-400' : 'bg-white/80 border border-gray-200 text-gray-500'
          } backdrop-blur-sm`}>
            {elements.length} elements · {elements.filter(e => e.type === 'wall').length} walls · {elements.filter(e => e.type === 'furniture').length} furniture
          </div>

          {/* Mode indicator */}
          {mode === '3d' && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs backdrop-blur-sm">
              3D Preview · Drag orbit · Scroll zoom
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className={`relative flex shrink-0 transition-all duration-200 ${rightOpen ? 'w-56' : 'w-0'} overflow-hidden`}>
          <div className={`w-56 h-full flex flex-col border-l ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {/* Tabs */}
            <div className={`flex border-b shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              {rightTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  title={tab.label}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                    rightTab === tab.id
                      ? 'text-indigo-400 border-b-2 border-indigo-500'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'furniture' && (
                <FurniturePanel selectedFurniture={selectedFurniture} onSelect={handleFurnitureSelect} />
              )}
              {rightTab === 'ai-gen' && (
                <AIGeneratePanel
                  onGenerate={els => {
                    canvasRef.current?.loadElements(els);
                    setElements(els);
                    toast.success('Floor plan generated!');
                  }}
                />
              )}
              {rightTab === 'collab' && <CollabPanel isOpen />}
              {rightTab === 'settings' && (
                <div className="space-y-3">
                  <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Interior Style (for 3D)</div>
                  {['modern', 'minimal', 'luxury', 'traditional', 'scandinavian', 'industrial'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setInteriorStyle(s); if (mode === '2d') setMode('3d'); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg capitalize text-xs transition-colors ${
                        interiorStyle === s
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle right panel */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-20 w-4 h-10 flex items-center justify-center rounded-l-lg border-y border-l transition-all ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          style={{ right: rightOpen ? 224 : 0 }}
        >
          {rightOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* AI Assistant */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} context={{ currentProject, elements }} />

      {/* QR Code modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowQR(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative p-6 rounded-2xl border text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Share Design</h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Scan QR code to open on mobile</p>
              <div className="p-3 bg-white rounded-xl inline-block">
                <QRCodeSVG value={generateShareURL(currentProject?.id || 'demo')} size={160} />
              </div>
              <p className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Share URL copied to clipboard ✓</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}