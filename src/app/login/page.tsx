import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold">
              E
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EcoPulse AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <form action="/dashboard" method="GET" className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Register for free
            </Link>
          </div>

          {/* Demo shortcut */}
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm text-emerald-400 font-medium mb-2">🚀 Just want to explore?</p>
            <Link
              href="/dashboard"
              className="text-sm text-emerald-300 hover:text-emerald-200 underline"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2025 EcoPulse AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
