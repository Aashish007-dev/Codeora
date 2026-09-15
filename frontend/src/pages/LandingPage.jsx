import { useState, useEffect } from "react";
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
  Plus,
  FolderOpen,
  Clock,
  Trash2,
  X,
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
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const navigate = useNavigate();

  // Fetch existing projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/sandbox/projects", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Create a new project, then start sandbox
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Step 1: Create the project
      const projectRes = await fetch("/api/sandbox/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: projectTitle.trim() }),
      });
      if (!projectRes.ok) {
        const errData = await projectRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create project");
      }
      const projectData = await projectRes.json();
      const projectId = projectData.project._id;

      // Step 2: Start sandbox with the project ID
      const sandboxRes = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!sandboxRes.ok) {
        const errData = await sandboxRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create sandbox");
      }
      const sandboxData = await sandboxRes.json();

      navigate(`/sandbox/${sandboxData.sandboxId}`, {
        state: { previewUrl: sandboxData.previewUrl },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Start sandbox from an existing project
  const handleOpenProject = async (projectId) => {
    setLoadingProjectId(projectId);
    setError(null);
    try {
      const res = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create sandbox");
      }
      const data = await res.json();
      navigate(`/sandbox/${data.sandboxId}`, {
        state: { previewUrl: data.previewUrl },
      });
    } catch (err) {
      setError(err.message);
      setLoadingProjectId(null);
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
          <a href="#projects" className="hover:text-white transition-colors">
            Projects
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

        {/* CTA: New Project */}
        <div
          className="animate-fade-in-up mt-10"
          style={{ animationDelay: "0.45s" }}
        >
          {!showNewProject ? (
            <button
              onClick={() => setShowNewProject(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg
                bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40
                transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] animate-pulse-glow"
            >
              <Plus className="w-5 h-5" />
              New Project
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <form
              onSubmit={handleCreateProject}
              className="flex items-center gap-3 animate-fade-in-up"
            >
              <div className="relative">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title..."
                  autoFocus
                  disabled={loading}
                  className="w-72 px-5 py-3.5 rounded-xl bg-white/[0.06] border border-white/10
                    text-white placeholder-gray-500 text-base font-medium
                    focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                    transition-all duration-200 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !projectTitle.trim()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold
                  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                  shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create & Launch
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false);
                  setProjectTitle("");
                  setError(null);
                }}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </div>

        {/* ─── Projects List ─── */}
        <div
          id="projects"
          className="animate-fade-in-up mt-16 w-full max-w-4xl mx-auto"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-gray-200">
                Your Projects
              </span>
              <span className="ml-auto text-xs text-gray-500">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Projects content */}
            <div className="p-4 min-h-[200px]">
              {projectsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="ml-3 text-gray-400 text-sm">
                    Loading projects...
                  </span>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mb-3">
                    <Code2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    No projects yet. Create your first one above!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleOpenProject(project._id)}
                      disabled={loadingProjectId === project._id}
                      className="group flex items-center gap-3 p-4 rounded-xl
                        bg-white/[0.02] border border-white/5
                        hover:bg-white/[0.05] hover:border-purple-500/20
                        transition-all duration-200 hover:-translate-y-0.5
                        disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/15 flex items-center justify-center shrink-0 group-hover:border-purple-500/30 transition-colors">
                        <Code2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                          {project.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                          {project._id}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {loadingProjectId === project._id ? (
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
