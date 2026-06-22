"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-black/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-sm">
            E
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            EcoPulse AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8">
            🌍 AI-Powered Sustainability Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Track Your{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Carbon Footprint
            </span>
            <br />
            With AI Insights
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            EcoPulse AI helps you understand, track, and reduce your environmental impact
            through personalized recommendations, eco-challenges, and real-time analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              🚀 Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-white/20 hover:border-emerald-500/50 text-white rounded-xl font-semibold text-lg transition-all hover:bg-white/5"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-black/20 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          {[
            { value: "12,400+", label: "Users Tracking" },
            { value: "850 t", label: "CO₂ Saved" },
            { value: "3,200+", label: "Challenges Completed" },
            { value: "4.8★", label: "Average Rating" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-emerald-400">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Go Green</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A full-stack sustainability toolkit, powered by Gemini AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📊",
                title: "Carbon Calculator",
                desc: "Log emissions from transport, food, electricity and shopping. Get instant breakdowns.",
                href: "/calculator",
              },
              {
                icon: "🤖",
                title: "AI Sustainability Coach",
                desc: "Get personalized nudges and actionable tips from our Gemini-powered AI coach.",
                href: "/dashboard",
              },
              {
                icon: "✅",
                title: "Habit Tracker",
                desc: "Build eco-friendly habits with daily check-ins and streak rewards.",
                href: "/habits",
              },
              {
                icon: "🏆",
                title: "Eco Challenges",
                desc: "Join weekly sustainability challenges, earn badges, and climb the leaderboard.",
                href: "/challenges",
              },
              {
                icon: "📈",
                title: "Progress Analytics",
                desc: "Visual charts, forecasts, and weekly reports to measure your real-world impact.",
                href: "/reports",
              },
              {
                icon: "🏅",
                title: "Global Leaderboard",
                desc: "Compete and collaborate with a global community of eco-conscious users.",
                href: "/leaderboard",
              },
            ].map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of people taking action against climate change — one habit at a time.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/25"
          >
            Start Tracking Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2025 EcoPulse AI. Built with 💚 for the planet.</p>
      </footer>
    </div>
  );
}
