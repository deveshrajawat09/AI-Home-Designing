import { useDesignerStore } from "../store/useDesignerStore";
import axios from "axios";
import { ArrowDownTrayIcon, CloudArrowUpIcon, ArrowPathIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

const api = axios.create({ baseURL: "/api" });

const HeaderBar = () => {
  const { items, room, saveDesignLocal, setUser, user } = useDesignerStore();

  const handleSave = async () => {
    try {
      saveDesignLocal();
      const res = await api.post("/designs", { items, room });
      const url = `${window.location.origin}/share/${res.data.slug}`;
      await navigator.clipboard.writeText(url);
      alert("Design saved. Share link copied!\n" + url);
    } catch (err) {
      console.error(err);
      alert("Saved locally. Configure backend + Mongo to persist to cloud.");
    }
  };

  const handleShare = async () => {
    const url = window.location.origin + window.location.pathname + "?shared=true";
    await navigator.clipboard.writeText(url);
    alert("Shareable link copied: " + url);
  };

  const handleExport = () => {
    window.print();
  };

  const handleBuyAll = () => {
    const total = items.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(0);
    alert(`Shopping list ready. Estimated total $${total}.`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-night text-white grid place-items-center font-bold">HD</div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">HomeDesigner</p>
            <h1 className="text-xl font-semibold">HomeDesigner Pro</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={handleBuyAll} className="btn ghost">
            <ShoppingBagIcon className="h-5 w-5" /> Buy all
          </button>
          <button onClick={handleSave} className="btn ghost">
            <CloudArrowUpIcon className="h-5 w-5" /> Save
          </button>
          <button onClick={handleShare} className="btn ghost">
            <ArrowPathIcon className="h-5 w-5" /> Share
          </button>
          <button onClick={handleExport} className="btn primary">
            <ArrowDownTrayIcon className="h-5 w-5" /> Export
          </button>
          <AuthPill user={user} setUser={setUser} />
        </div>
      </div>
    </header>
  );
};

const AuthPill = ({ user, setUser }) => {
  const handleLogin = () => {
    setUser({ name: "Demo Designer" });
    window.location.href = "/auth/google"; // backend route placeholder
  };

  return user ? (
    <div className="px-3 py-1 rounded-full bg-night text-white text-sm">{user.name}</div>
  ) : (
    <button onClick={handleLogin} className="btn ghost">Sign in</button>
  );
};

export default HeaderBar;
