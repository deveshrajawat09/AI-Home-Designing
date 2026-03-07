import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import HeaderBar from "./components/HeaderBar";
import Canvas2D from "./components/Canvas2D";
import Canvas3D from "./components/Canvas3D";
import CatalogPanel from "./components/CatalogPanel";
import ThemeTemplates from "./components/ThemeTemplates";
import CustomizationPanel from "./components/CustomizationPanel";
import ChatAssistant from "./components/ChatAssistant";
import SharePage from "./pages/SharePage";
import { useDesignerStore } from "./store/useDesignerStore";
import "./index.css";

const Dashboard = () => {
  const { view } = useDesignerStore();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid xl:grid-cols-[1.6fr_1fr] gap-6 p-6">
      <section className="glass rounded-3xl shadow-soft p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-500">Workspace</p>
            <h2 className="text-2xl font-semibold">Floor Plan</h2>
          </div>
          <div className="bg-slate-100 rounded-full p-1 flex items-center gap-1">
            <ToggleButton label="2D" active={view === "2d"} value="2d" />
            <ToggleButton label="3D" active={view === "3d"} value="3d" />
          </div>
        </div>
        <div className="h-[540px] rounded-2xl border border-slate-200 bg-white/80 overflow-hidden">
          {view === "2d" ? <Canvas2D /> : <Canvas3D />}
        </div>
      </section>

      <section className="space-y-4">
        <ThemeTemplates />
        <CatalogPanel />
        <CustomizationPanel />
        <ChatAssistant />
      </section>
    </motion.div>
  );
};

const ToggleButton = ({ label, active, value }) => {
  const { setView } = useDesignerStore();
  return (
    <button
      onClick={() => setView(value)}
      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
        active ? "bg-night text-white shadow" : "text-slate-600 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
};

const App = () => {
  const { loadDesignLocal } = useDesignerStore();

  useEffect(() => {
    loadDesignLocal();
  }, [loadDesignLocal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-sand text-night">
      <HeaderBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/share/:slug" element={<SharePage />} />
      </Routes>
    </div>
  );
};

export default App;
