'use client'

export default function Dashboard() {
  const features = [
    { icon: '🎯', title: 'ATS CV Checker', desc: 'Check your CV against any job', href: '/ats-checker' },
    { icon: '💼', title: 'Browse Jobs', desc: 'Fresh jobs from last 3-5 days', href: '/jobs' },
    { icon: '✉️', title: 'Cover Letter', desc: 'Generate in 30 seconds', href: '/cover-letter' },
    { icon: '🤖', title: 'Interview Prep', desc: 'Role specific questions', href: '/interview-prep' },
    { icon: '📊', title: 'Application Tracker', desc: 'Track all your applications', href: '/tracker' },
    { icon: '👥', title: 'Community', desc: 'Connect with job seekers', href: '/community' },
  ]

  const stats = [
    { label: 'ATS Checks', value: '0', sub: 'of 3 free' },
    { label: 'Jobs Saved', value: '0', sub: 'this week' },
    { label: 'Applications', value: '0', sub: 'tracking' },
    { label: 'Cover Letters', value: '0', sub: 'generated' },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold">IntGala</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/50">Hey, Amogh 👋</span>
          <a href="/" className="text-sm text-white/40 hover:text-white transition">Logout</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
          <p className="text-white/50">Everything you need to crack your dream job.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map((item, i) => (
            <a key={i} href={item.href} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-white/40 text-sm">{item.desc}</p>
              <div className="mt-4 text-white/30 text-sm group-hover:text-white transition">Open →</div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/40 text-xs mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-white/30 text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-white/50 text-sm">No activity yet.</p>
            <p className="text-white/30 text-xs mt-1">Start by checking your CV or browsing jobs.</p>
            <a href="/ats-checker" className="mt-4 text-sm bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-white/90 transition">
              Check my CV →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}