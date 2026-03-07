import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDesignerStore } from "../store/useDesignerStore";
import Canvas3D from "../components/Canvas3D";
import Canvas2D from "../components/Canvas2D";

const api = axios.create({ baseURL: "/api" });

const SharePage = () => {
  const { slug } = useParams();
  const { view, setView } = useDesignerStore();

  useEffect(() => {
    async function fetchDesign() {
      try {
        const res = await api.get(`/designs/${slug}`);
        useDesignerStore.setState({ items: res.data.items, room: res.data.room, selectedId: null });
      } catch (err) {
        console.error(err);
      }
    }
    fetchDesign();
  }, [slug]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Shared design</p>
          <h2 className="text-2xl font-semibold">Link: {slug}</h2>
        </div>
        <div className="bg-slate-100 rounded-full p-1 flex items-center gap-1">
          <button onClick={() => setView("2d")} className={`px-3 py-1 rounded-full text-sm ${view === "2d" ? "bg-night text-white" : "text-slate-600"}`}>2D</button>
          <button onClick={() => setView("3d")} className={`px-3 py-1 rounded-full text-sm ${view === "3d" ? "bg-night text-white" : "text-slate-600"}`}>3D</button>
        </div>
      </div>
      <div className="h-[520px] rounded-2xl border border-slate-200 bg-white/80 overflow-hidden">
        {view === "2d" ? <Canvas2D /> : <Canvas3D />}
      </div>
    </div>
  );
};

export default SharePage;
