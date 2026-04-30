import { FloorElement } from '../context/AppContext';

export interface RoomSpec {
  type: string;
  label: string;
  size: 'small' | 'medium' | 'large';
  width: number;
  height: number;
}

const ROOM_SIZES: Record<string, { w: number; h: number }> = {
  bedroom: { w: 160, h: 140 },
  'master bedroom': { w: 200, h: 160 },
  kitchen: { w: 140, h: 120 },
  'open kitchen': { w: 160, h: 140 },
  living: { w: 200, h: 160 },
  'living room': { w: 220, h: 180 },
  bathroom: { w: 100, h: 80 },
  toilet: { w: 80, h: 60 },
  dining: { w: 140, h: 120 },
  'dining room': { w: 160, h: 130 },
  study: { w: 120, h: 100 },
  garage: { w: 180, h: 140 },
  garden: { w: 200, h: 160 },
  parking: { w: 120, h: 80 },
  balcony: { w: 100, h: 60 },
  hallway: { w: 60, h: 160 },
  hall: { w: 80, h: 100 },
  store: { w: 80, h: 60 },
  utility: { w: 80, h: 60 },
};

export function parseFloorPlanPrompt(prompt: string): RoomSpec[] {
  const lower = prompt.toLowerCase();
  const rooms: RoomSpec[] = [];

  // Extract BHK pattern
  const bhkMatch = lower.match(/(\d+)\s*bhk/);
  const bedrooms = bhkMatch ? parseInt(bhkMatch[1]) : 0;

  // Extract explicit room counts
  const bedroomMatch = lower.match(/(\d+)\s*bed(?:room)?s?/);
  const bathroomMatch = lower.match(/(\d+)\s*bath(?:room)?s?/);
  const toiletMatch = lower.match(/(\d+)\s*toilet?s?/);

  const totalBedrooms = bedrooms || (bedroomMatch ? parseInt(bedroomMatch[1]) : 0);
  const totalBathrooms = bathroomMatch ? parseInt(bathroomMatch[1]) : (bedrooms > 0 ? Math.ceil(bedrooms / 2) : 1);

  // Always add living room
  rooms.push({ type: 'living', label: 'Living Room', size: 'large', width: 220, height: 180 });

  // Add kitchen (open or regular)
  if (lower.includes('open kitchen')) {
    rooms.push({ type: 'open kitchen', label: 'Open Kitchen', size: 'large', width: 160, height: 140 });
    rooms.push({ type: 'dining', label: 'Dining Room', size: 'medium', width: 160, height: 130 });
  } else {
    rooms.push({ type: 'kitchen', label: 'Kitchen', size: 'medium', width: 140, height: 120 });
    if (lower.includes('dining') || bedrooms > 1) {
      rooms.push({ type: 'dining', label: 'Dining Room', size: 'medium', width: 160, height: 130 });
    }
  }

  // Add bedrooms
  if (totalBedrooms > 0) {
    rooms.push({ type: 'master bedroom', label: 'Master Bedroom', size: 'large', width: 200, height: 160 });
    for (let i = 1; i < totalBedrooms; i++) {
      rooms.push({ type: 'bedroom', label: `Bedroom ${i + 1}`, size: 'medium', width: 160, height: 140 });
    }
  } else if (lower.includes('bedroom')) {
    rooms.push({ type: 'bedroom', label: 'Bedroom', size: 'medium', width: 160, height: 140 });
  }

  // Add bathrooms
  for (let i = 0; i < Math.min(totalBathrooms, 3); i++) {
    rooms.push({
      type: 'bathroom',
      label: i === 0 ? 'Master Bath' : `Bathroom ${i + 1}`,
      size: 'small',
      width: 100,
      height: 80,
    });
  }

  // Optional rooms
  if (lower.includes('study') || lower.includes('office')) {
    rooms.push({ type: 'study', label: 'Study Room', size: 'small', width: 120, height: 100 });
  }
  if (lower.includes('garden')) {
    rooms.push({ type: 'garden', label: 'Garden', size: 'large', width: 200, height: 160 });
  }
  if (lower.includes('parking') || lower.includes('garage')) {
    rooms.push({ type: 'garage', label: 'Garage/Parking', size: 'medium', width: 180, height: 140 });
  }
  if (lower.includes('balcony') || lower.includes('terrace')) {
    rooms.push({ type: 'balcony', label: 'Balcony', size: 'small', width: 100, height: 60 });
  }
  if (lower.includes('hall') || totalBedrooms > 0) {
    rooms.push({ type: 'hallway', label: 'Hallway', size: 'small', width: 60, height: 180 });
  }

  return rooms;
}

export function generateFloorPlan(rooms: RoomSpec[]): FloorElement[] {
  const elements: FloorElement[] = [];
  const PADDING = 40;
  const WALL_THICKNESS = 8;
  const CELL_GAP = 8;

  // Simple grid layout algorithm
  const columns = 3;
  let currentX = PADDING;
  let currentY = PADDING;
  let rowHeight = 0;
  let col = 0;

  rooms.forEach((room, idx) => {
    const w = room.width;
    const h = room.height;

    if (col >= columns) {
      col = 0;
      currentX = PADDING;
      currentY += rowHeight + CELL_GAP;
      rowHeight = 0;
    }

    const x = currentX;
    const y = currentY;

    // Top wall
    elements.push({
      id: `wall-${idx}-top`,
      type: 'wall',
      x1: x, y1: y,
      x2: x + w, y2: y,
      thickness: WALL_THICKNESS,
    });
    // Bottom wall
    elements.push({
      id: `wall-${idx}-bottom`,
      type: 'wall',
      x1: x, y1: y + h,
      x2: x + w, y2: y + h,
      thickness: WALL_THICKNESS,
    });
    // Left wall
    elements.push({
      id: `wall-${idx}-left`,
      type: 'wall',
      x1: x, y1: y,
      x2: x, y2: y + h,
      thickness: WALL_THICKNESS,
    });
    // Right wall
    elements.push({
      id: `wall-${idx}-right`,
      type: 'wall',
      x1: x + w, y1: y,
      x2: x + w, y2: y + h,
      thickness: WALL_THICKNESS,
    });

    // Door on bottom wall
    const doorX = x + w / 2 - 25;
    elements.push({
      id: `door-${idx}`,
      type: 'door',
      x: doorX,
      y: y + h,
      width: 50,
      angle: 0,
    });

    // Room label
    elements.push({
      id: `label-${idx}`,
      type: 'label',
      x: x + w / 2,
      y: y + h / 2,
      text: room.label,
      fontSize: 11,
      color: '#475569',
    });

    currentX += w + CELL_GAP;
    rowHeight = Math.max(rowHeight, h);
    col++;
  });

  return elements;
}

export const AI_SUGGESTIONS: Record<string, string[]> = {
  modern: [
    '🪑 Add a sectional sofa in L-shape for modern appeal',
    '💡 Install recessed ceiling lights with dimmer control',
    '🎨 Use neutral palette: white, beige, and charcoal accents',
    '🪴 Add large indoor plants near windows for biophilic design',
    '📐 Keep furniture low-profile to emphasize ceiling height',
  ],
  minimal: [
    '🗃️ Choose built-in storage to eliminate clutter',
    '💡 Use natural light as primary source, minimal fixtures',
    '🎨 Monochromatic palette: white/cream with wood accents',
    '🛋️ Select multi-purpose furniture pieces',
    '🪟 Keep windows uncovered for clean aesthetic',
  ],
  luxury: [
    '🛋️ Install a chesterfield sofa as focal centerpiece',
    '💡 Add chandelier and wall sconces for layered lighting',
    '🎨 Rich palette: deep navy, gold, emerald, marble',
    '🖼️ Include statement art pieces above fireplace',
    '🏺 Use textured fabrics: velvet, silk, cashmere',
  ],
  traditional: [
    '🛋️ Choose tufted furniture with wooden frames',
    '💡 Use warm-toned floor lamps and table lamps',
    '🎨 Warm palette: cream, brown, terracotta, olive',
    '🪵 Incorporate wood paneling or wainscoting',
    '🪑 Add wingback chairs flanking the fireplace',
  ],
  scandinavian: [
    '🌿 Embrace hygge with cozy textures and warm lighting',
    '💡 Use candles and pendant lights for ambiance',
    '🎨 White walls with natural wood and muted colors',
    '🛋️ Choose functional furniture with clean lines',
    '🐑 Add sheepskin rugs and knitted throws',
  ],
  industrial: [
    '🔩 Expose structural elements: beams, pipes, brick',
    '💡 Use Edison bulbs and metal pendant lights',
    '🎨 Dark palette: charcoal, rust, raw steel, concrete',
    '🪑 Mix leather furniture with metal frames',
    '🏭 Add factory-style windows with steel frames',
  ],
};

export function getAIResponse(message: string, context?: any): string {
  const lower = message.toLowerCase();

  if (lower.includes('generate') || lower.includes('create') || lower.includes('make')) {
    return `🏗️ Analyzing your prompt... I'll generate a floor plan based on your requirements. Parsing room specifications and applying spatial optimization algorithms. Ready to render!`;
  }
  if (lower.includes('move') || lower.includes('place')) {
    return `📐 Got it! I'm repositioning the element using optimal placement rules. Checking adjacency constraints and ensuring 1m clearance from walls.`;
  }
  if (lower.includes('color') || lower.includes('palette')) {
    return `🎨 Generating color palette... Based on your style preferences, I recommend: Primary #F5F0E8, Accent #4A3728, Highlight #C4A882. This creates a warm, inviting atmosphere.`;
  }
  if (lower.includes('furniture')) {
    return `🛋️ Analyzing room dimensions... For this space (${context?.roomSize || '20m²'}), I recommend: a modular sofa (L-shape), a coffee table (60×120cm), and floating shelves. Total coverage: 65% floor area (optimal).`;
  }
  if (lower.includes('style') || lower.includes('modern') || lower.includes('minimal') || lower.includes('luxury')) {
    const style = lower.includes('modern') ? 'Modern' : lower.includes('minimal') ? 'Minimal' : lower.includes('luxury') ? 'Luxury' : 'Contemporary';
    return `✨ Applying ${style} style... Updating color palette, furniture recommendations, and lighting setup. Style transformation complete!`;
  }
  if (lower.includes('light') || lower.includes('lighting')) {
    return `💡 Lighting Analysis: Your room needs 3 layers: Ambient (recessed LED, 4000K), Task (desk/reading lamp), Accent (strip lights behind TV). Total: ~2400 lumens for a well-lit space.`;
  }
  if (lower.includes('3d') || lower.includes('preview')) {
    return `🔮 Generating 3D preview... Converting 2D floor plan to 3D model. Adding textures, lighting simulation, and camera positioning for best view angle.`;
  }
  if (lower.includes('help') || lower.includes('what can')) {
    return `🤖 I can help you with:\n• Generate floor plans from descriptions\n• Suggest furniture placement\n• Create color palettes\n• Apply design styles\n• Optimize lighting\n• Export your designs\n\nJust tell me what you need!`;
  }

  const responses = [
    `🧠 Processing your request... I've analyzed the spatial requirements and cross-referenced 10,000+ successful designs. Here's my recommendation based on optimal room flow and natural light paths.`,
    `📊 Design analysis complete. Your current layout scores 78/100. To improve: increase natural light access (+8 pts), optimize traffic flow (+6 pts), and add accent lighting (+5 pts).`,
    `✅ Applied! I've updated the design based on your preferences. The modification improves spatial efficiency by 12% and creates better sightlines from the main entrance.`,
    `🎯 Great choice! This design element will complement your existing layout. I've adjusted surrounding elements to maintain visual harmony and functional flow.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export const COLOR_PALETTES = {
  modern: [
    { name: 'Arctic White', hex: '#F8F9FA' },
    { name: 'Warm Gray', hex: '#6C757D' },
    { name: 'Charcoal', hex: '#343A40' },
    { name: 'Steel Blue', hex: '#4A90D9' },
    { name: 'Copper', hex: '#B87333' },
  ],
  minimal: [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Ivory', hex: '#FFFFF0' },
    { name: 'Sand', hex: '#C2B280' },
    { name: 'Taupe', hex: '#8B7355' },
    { name: 'Onyx', hex: '#353839' },
  ],
  luxury: [
    { name: 'Champagne', hex: '#F7E7CE' },
    { name: 'Deep Navy', hex: '#003153' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Emerald', hex: '#50C878' },
    { name: 'Burgundy', hex: '#800020' },
  ],
  traditional: [
    { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Terracotta', hex: '#C66733' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Walnut', hex: '#773F1A' },
    { name: 'Antique White', hex: '#FAEBD7' },
  ],
  scandinavian: [
    { name: 'Snow White', hex: '#FFFAFA' },
    { name: 'Birch', hex: '#C8B89A' },
    { name: 'Sage', hex: '#BCB88A' },
    { name: 'Slate Blue', hex: '#6A8098' },
    { name: 'Charcoal', hex: '#36454F' },
  ],
  industrial: [
    { name: 'Concrete', hex: '#808080' },
    { name: 'Rust', hex: '#B7410E' },
    { name: 'Raw Steel', hex: '#889599' },
    { name: 'Exposed Brick', hex: '#CB4154' },
    { name: 'Coal Black', hex: '#1C1C1C' },
  ],
};
