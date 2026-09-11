import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Terminal,
  Eye,
  MessageSquare,
  Code2,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 4 + 4,
}));

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Describe what you want to build and watch AI generate it in real-time.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "See your changes instantly with hot-reload preview in a live iframe.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Terminal,
    title: "Terminal Access",
    desc: "Full terminal access to install packages, run commands, and debug.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Code2,
    title: "File Explorer",
    desc: "Browse, view, and track every file the AI creates or modifies.",
    gradient: "from-orange-500 to-amber-500",
  },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateSandbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create sandbox");
      const data = await res.json();
      navigate(`/sandbox/${data.sandboxId}`, {
        state: { previewUrl: data.previewUrl },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-auto bg-[#0a0a0f] flex flex-col">
      {/* ─── Animated Background ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[200px]" />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/20 animate-float"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Codeora
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Development Environment
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-in-up text-5xl md:text-7xl font-extrabold leading-tight tracking-tight max-w-3xl"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="text-white">Build Frontend</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-shift">
            with AI Magic
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="animate-fade-in-up mt-6 text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed"
          style={{ animationDelay: "0.3s" }}
        >
          Describe your vision. Watch AI create it. Preview, edit, and deploy —
          all in one sandbox.
        </p>

        {/* CTA Button */}
        <div
          className="animate-fade-in-up mt-10"
          style={{ animationDelay: "0.45s" }}
        >
          <button
            onClick={handleCreateSandbox}
            disabled={loading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg
              bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
              shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40
              transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 animate-pulse-glow"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Sandbox...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Sandbox
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </div>

        {/* IDE Preview Mockup */}
        <div
          className="animate-fade-in-up mt-16 w-full max-w-4xl mx-auto"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-3 flex-1 h-6 rounded-md bg-white/5 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-mono">
                  codeora.dev/sandbox
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="flex h-64">
              {/* Sidebar */}
              <div className="w-48 border-r border-white/5 p-3 space-y-1.5 hidden sm:block">
                {[
                  "src/",
                  "  App.jsx",
                  "  index.css",
                  "  main.jsx",
                  "package.json",
                  "vite.config.js",
                ].map((f, i) => (
                  <div
                    key={i}
                    className={`text-xs font-mono px-2 py-1 rounded ${i === 1 ? "bg-purple-500/15 text-purple-300" : "text-gray-500"}`}
                  >
                    {f}
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Your AI workspace awaits...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Features ─── */}
      <section id="features" className="relative z-10 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            A complete development environment powered by AI, right in your
            browser.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group glass-panel rounded-xl p-5 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 text-center py-8 text-sm text-gray-600 border-t border-white/5">
        Built with <span className="text-purple-400">♥</span> by Codeora
      </footer>
    </div>
  );
}
