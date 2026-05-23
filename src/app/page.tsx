export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">IntGala</h1>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-white/60 hover:text-white transition">Login</a>
          <a href="/signup" className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition">Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 max-w-4xl mx-auto">
        <span className="text-xs font-medium bg-white/10 text-white/70 px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">Job Cracking OS for India</span>
        <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Jo placement cell<br />
          <span className="text-white/40">nahi diya,</span><br />
          woh hum denge.
        </h2>
        <p className="text-white/50 text-lg md:text-xl max-w-2xl mb-10">
          Fresh jobs. ATS CV checker. Interview prep. Cover letters. Community. Everything you need to crack your dream job — in one place.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a href="/signup" className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition">Start for free</a>
          <a href="#features" className="text-white/50 text-sm hover:text-white transition px-4 py-3.5">See how it works →</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <h3 className="text-center text-3xl font-bold mb-16">Everything in one place</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", title: "ATS CV Checker", desc: "Paste any job description. Get your match score, missing keywords, and line-by-line fixes instantly." },
            { icon: "💼", title: "Fresh Jobs Daily", desc: "Only jobs posted in last 3-5 days. No noise. Matched to your profile and target role." },
            { icon: "🤖", title: "AI Interview Prep", desc: "Role-specific questions, answer coaching, and mock interview simulator with real feedback." },
            { icon: "✉️", title: "Cover Letters", desc: "Generate personalized cover letters and post-interview thank you emails in 30 seconds." },
            { icon: "📊", title: "Application Tracker", desc: "Kanban board to track every application. Applied → HR Round → Technical → Offer." },
            { icon: "👥", title: "Real Community", desc: "Interest-specific group chats. Real identity. Referrals. Interview experiences. Success stories." },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h4 className="font-semibold text-lg mb-2">{f.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-24 border-t border-white/10">
        <h3 className="text-4xl font-bold mb-4">Ready to crack it?</h3>
        <p className="text-white/50 mb-8">Join thousands of job seekers who are done applying blindly.</p>
        <a href="/signup" className="bg-white text-black px-10 py-4 rounded-full font-semibold hover:bg-white/90 transition">Get started free →</a>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-white/30 text-sm border-t border-white/10">
        © 2026 IntGala. Built for India's job seekers.
      </footer>
    </main>
  )
}