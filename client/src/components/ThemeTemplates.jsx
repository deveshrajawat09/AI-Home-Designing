import { templates } from "../data/templates";
import { useDesignerStore } from "../store/useDesignerStore";

const ThemeTemplates = () => {
  const { loadTemplate, room } = useDesignerStore();

  return (
    <div className="glass rounded-2xl border border-slate-200 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">Design Mapping & Themes</p>
          <h3 className="text-lg font-semibold">Smart room starters</h3>
        </div>
        <div className="flex items-center gap-1">
          {room.palette.map((c) => (
            <span key={c} className="h-5 w-5 rounded-full border" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => loadTemplate(tpl)}
            className="text-left border border-slate-200 rounded-xl p-3 bg-white hover:-translate-y-0.5 transition shadow-soft"
          >
            <p className="text-sm font-semibold">{tpl.name}</p>
            <p className="text-[11px] text-slate-500">Auto-fills {tpl.items.length} items</p>
            <div className="flex gap-1 mt-2">
              {tpl.palette.map((c) => (
                <span key={c} className="h-4 w-4 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeTemplates;
