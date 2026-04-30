import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Sparkles, ArrowRight, Check, Grid3X3, Paintbrush, Building2,
  Brain, Users, Zap, Shield, Download, Share2, Star, ChevronRight,
  Play, Cpu, Layers, Move, MessageSquare, RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1766603636562-531bb3e1dda8?w=1200';
const INTERIOR_IMG = 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?w=600';
const FLOOR_IMG = 'https://images.unsplash.com/photo-1721244654195-943615c56ac4?w=600';
const BEDROOM_IMG = 'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=600';
const KITCHEN_IMG = 'https://images.unsplash.com/photo-1649083048391-1c9e82472f65?w=600';

const features = [
  {
    icon: Grid3X3,
    title: 'AI Floor Planner',
    desc: 'Generate complete floor plans from text descriptions. Drag-and-drop walls, rooms, and furniture on an intelligent canvas.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Paintbrush,
    title: 'Interior Design AI',
    desc: 'Get AI-powered style suggestions for furniture, color palettes, and lighting. Apply Modern, Minimal, Luxury, or Traditional themes instantly.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Building2,
    title: 'Exterior Configurator',
    desc: 'Design house elevations, select roof styles, exterior textures, and generate landscaping plans with one click.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    desc: 'Work simultaneously with your team. See live cursors, chat, and sync changes instantly—like Google Docs for floor plans.',
    gradient: 'from-orange-500 to-rose-600',
  },
  {
    icon: Cpu,
    title: 'AI Auto-Generation',
    desc: 'Type "3BHK with open kitchen and garden" and watch complete, optimized floor plans materialize in seconds.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Layers,
    title: '3D Preview & Export',
    desc: 'Instantly switch between 2D plans and immersive 3D walkthroughs. Export as PDF, PNG, or share via QR code.',
    gradient: 'from-rose-500 to-pink-600',
  },
];

const stats = [
  { value: '50K+', label: 'Designs Created' },
  { value: '12K+', label: 'Active Users' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '3sec', label: 'Avg. AI Generate Time' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Interior Designer',
    avatar: 'SC',
    text: 'HomeAI completely transformed my workflow. What used to take days now takes minutes. The AI suggestions are incredibly accurate.',
    rating: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'Real Estate Developer',
    avatar: 'MW',
    text: 'The collaboration feature is a game-changer. My entire team can work on floor plans simultaneously without any conflicts.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Architect',
    avatar: 'PP',
    text: 'Best floor planning tool I\'ve used. The AI auto-generation is frighteningly good—it understands spatial relationships perfectly.',
    rating: 5,
  },
];

const plans = [
  {
    name: 'Free',
    price: '0',
    features: ['3 Projects', 'Basic Floor Planner', 'PNG Export', '2D View Only', 'Community Support'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    features: ['Unlimited Projects', 'AI Floor Generation', 'PDF & PNG Export', '3D Preview', 'Real-time Collaboration', 'AI Design Assistant', 'Priority Support'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    features: ['Everything in Pro', 'Custom AI Training', 'API Access', 'Admin Dashboard', 'SSO Integration', 'Dedicated Support', 'Custom Branding'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState('');
  const [typing, setTyping] = useState(false);

  // Animated background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const handleGenerateDemo = () => {
    if (!prompt.trim()) return;
    setTyping(true);
    setTimeout(() => { setTyping(false); navigate('/floor-planner', { state: { prompt } }); }, 1200);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Home Design Platform
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`text-5xl sm:text-6xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Design Your Dream Home with{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Generate complete floor plans, design interiors and exteriors, collaborate in real-time,
                and export professional designs — all powered by advanced AI. Just describe your vision.
              </motion.p>

              {/* Prompt input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`flex gap-2 p-1.5 rounded-2xl border ${
                  isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-200'
                } backdrop-blur-sm mb-6`}
              >
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    placeholder='Try: "Modern 3BHK with open kitchen and garden"'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerateDemo()}
                    className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                  />
                </div>
                <button
                  onClick={handleGenerateDemo}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                  {typing ? (
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate
                    </>
                  )}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Start Designing <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/floor-planner')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-all ${
                    isDark ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  View Demo
                </button>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mt-8 flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <div className="flex -space-x-2">
                  {['SC','MW','PP','AR'].map((a, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-950">
                      {a}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span>Loved by 12,000+ designers</span>
                </div>
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={HERO_IMG} alt="Modern house" className="w-full h-[420px] object-cover" />
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`absolute -left-8 top-1/4 p-3 rounded-xl border shadow-xl ${
                    isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Generated</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Floor plan ready</div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse ml-2" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className={`absolute -right-6 bottom-1/4 p-3 rounded-xl border shadow-xl ${
                    isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>3 collaborating</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time sync</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className={`absolute left-1/4 -bottom-4 p-3 rounded-xl border shadow-xl ${
                    isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>2.8s generation</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI optimized layout</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map(stat => (
              <div key={stat.label} className={`text-center p-4 rounded-xl ${
                isDark ? 'bg-gray-900/60 border border-gray-800' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {stat.value}
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-24 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Powerful Features
            </div>
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Everything You Need to Design
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              From AI-generated floor plans to real-time collaboration, HomeAI gives you professional-grade tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border group hover:scale-[1.02] transition-transform cursor-pointer ${
                  isDark ? 'bg-gray-900 border-gray-800 hover:border-indigo-500/30' : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm mb-4">
              <Zap className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              From Idea to Blueprint in 3 Steps
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MessageSquare,
                title: 'Describe Your Vision',
                desc: 'Type a natural language description of your dream home. "Modern 3BHK villa with open kitchen, 2 bathrooms, and a garden." Our AI understands context and requirements.',
                color: 'indigo',
              },
              {
                step: '02',
                icon: Cpu,
                title: 'AI Generates Plan',
                desc: 'Our spatial optimization engine parses your requirements, applies adjacency rules, and generates an optimized floor plan with proper room sizing and flow.',
                color: 'violet',
              },
              {
                step: '03',
                icon: Move,
                title: 'Edit & Collaborate',
                desc: 'Fine-tune the generated plan with our canvas editor. Add furniture, adjust rooms, apply styles, and collaborate with your team in real-time.',
                color: 'purple',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`relative p-6 rounded-2xl border ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`text-6xl font-black opacity-10 absolute top-4 right-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {step.step}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${step.color}-500/20 flex items-center justify-center mb-4`}>
                  <step.icon className={`w-6 h-6 text-${step.color}-400`} />
                </div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className={`py-24 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Stunning Designs Created with HomeAI
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[HERO_IMG, INTERIOR_IMG, FLOOR_IMG, BEDROOM_IMG].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl overflow-hidden aspect-square group cursor-pointer"
              >
                <img src={img} alt="Design" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              What Our Users Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={`py-24 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-4">
              <Shield className="w-3.5 h-3.5" />
              Pricing Plans
            </div>
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Simple, Transparent Pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border ${
                  plan.popular
                    ? 'border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-violet-500/10'
                    : isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90'
                      : isDark
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-12 rounded-3xl border relative overflow-hidden ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Ready to Design Your Dream Home?
              </h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Join 12,000+ designers using HomeAI to create stunning designs in minutes.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition-opacity text-base"
              >
                Start Designing for Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span>HomeAI • AI-Powered Home Design Platform</span>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact', 'Blog'].map(l => (
              <button key={l} className="hover:text-indigo-400 transition-colors">{l}</button>
            ))}
          </div>
          <div>© 2025 HomeAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
