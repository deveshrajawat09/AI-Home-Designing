import { useState } from "react";
import { useDesignerStore } from "../store/useDesignerStore";

const systemIdeas = [
  "Float the sofa off the wall to create a better walkway.",
  "Layer a large rug to anchor the seating zone.",
  "Use warm 3000K lighting for a cozier mood.",
  "Add plants near windows for natural height variation.",
  "Keep 36 inches clearance around dining tables."
];

const ChatAssistant = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const { items } = useDesignerStore();

  const handleSend = () => {
    if (!input.trim()) return;
    const suggestion = generateSuggestion(input, items);
    setHistory((h) => [...h, { role: "user", text: input }, { role: "assistant", text: suggestion }]);
    setInput("");
  };

  return (
    <div className="glass rounded-2xl border border-slate-200 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-slate-500">AI Design Assistant</p>
          <h3 className="text-lg font-semibold">Ask for layout help</h3>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto space-y-2 text-sm mb-2">
        {history.length === 0 && <p className="text-slate-500">Try: "Make this bedroom more cozy"</p>}
        {history.map((m, idx) => (
          <div key={idx} className={`p-2 rounded-xl ${m.role === "assistant" ? "bg-slate-100" : "bg-white"}`}>
            <strong className="uppercase text-[10px] text-slate-500">{m.role}</strong>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm"
          placeholder="Optimize this living room for 4 people"
        />
        <button onClick={handleSend} className="btn primary">Send</button>
      </div>
    </div>
  );
};

const generateSuggestion = (prompt, items) => {
  const hasSofa = items.some((i) => i.category === "Seating");
  const hasDining = items.some((i) => i.category === "Tables");
  const base = systemIdeas[Math.floor(Math.random() * systemIdeas.length)];
  const lower = prompt.toLowerCase();
  if (lower.includes("cozy")) {
    return "Lower lights to 3000K, add two lamps at opposite corners, and choose a plush rug under the seating.";
  }
  if (lower.includes("optimize") && hasSofa) {
    return "Rotate the sofa 15° toward the focal wall, leave 36 in. clearance behind, and cluster seating around a 6x9 rug.";
  }
  if (lower.includes("office") && hasDining) {
    return "Use the existing table as a shared desk, add task lighting at 4000K, and place storage along the perimeter to free central flow.";
  }
  return base;
};

export default ChatAssistant;
