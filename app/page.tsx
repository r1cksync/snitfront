'use client'
import { Play, Shield, Zap, BellOff, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClarityLandingPage() {
  const [time, setTime] = useState(1500); // 25 mins
  const [running, setRunning] = useState(false);


  useEffect(() => {
  if (!running) return;
  const interval = setInterval(() => setTime(t => Math.max(t - 1, 0)), 1000);
  return () => clearInterval(interval);
  }, [running]);


  const minutes = String(Math.floor(time / 60)).padStart(2,'0');
  const seconds = String(time % 60).padStart(2,'0');

  return (
    <div className="bg-[#FAFAFA] text-[#555555] overflow-x-hidden selection:bg-[#2B4C7E] selection:text-white">
      
      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 w-full bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">


      <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#2B4C7E]"></div>
      <span className="font-serif text-2xl font-bold text-[#222222]">PromoFocus</span>
      </div>


      <div className="hidden md:flex items-center gap-8 font-medium text-sm"></div>


      <div className="flex items-center gap-4">
      <Link href="/auth/signin" className="text-sm font-medium hover:text-[#2B4C7E]">Sign In</Link>
      <Link href="/auth/signup" className="bg-[#2B4C7E] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#1e365c] transition">Sign Up</Link>
      </div>
      </div>
      </nav>
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce">
            <Sparkles size={16} />
            <span>AI-Powered Focus Assistant</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#222222] leading-[1.1] mb-6 tracking-tight">
            Reclaim Your Attention <br /> in a Noisy World.
          </h1>
          <p className="text-lg md:text-xl text-[#555555] max-w-2xl mx-auto leading-relaxed mb-10">
            PromoFocus is the intelligent workspace that filters distractions, structures deep work, and helps you achieve sustained flow states effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a 
              href="#focus-timer" 
              className="w-full sm:w-auto bg-[#2B4C7E] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#1e365c] transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Your Focus Session
            </a>

            <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 text-[#2B4C7E] px-8 py-3.5 rounded-full font-medium hover:bg-blue-50 transition-colors">
            <div className="w-6 h-6 rounded-full border border-[#2B4C7E] flex items-center justify-center">
              <Play size={10} fill="currentColor" />
            </div>
            Before you start
          </a>

          </div>
        </div>

        {/* The Halo & Hero Image */}
        <div className="max-w-6xl mx-auto relative mt-8">
          {/* THE HALO: Blurred Radial Gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] aspect-square bg-gradient-to-r from-[#56CCF2] to-[#2B4C7E] rounded-full blur-[100px] opacity-40 z-0 pointer-events-none animate-pulse-slow"></div>
          
          {/* Main Image Container */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden aspect-[16/10] group">
            {/* Abstract UI Representation for Placeholder */}
            <div className="w-full h-full bg-white flex flex-col">
               {/* Fake Browser Toolbar */}
               <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="bg-gray-50 px-4 py-1 rounded-md text-xs text-gray-400 mx-auto w-64 text-center">PromoFocus.app/focus</div>
               </div>
               
               {/* Fake App Interface */}
               <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                  
                  {/* Focus Timer UI */}
                  <div className="max-w-4xl mx-auto text-center relative z-10" id="focus-timer">
                  <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#222222] leading-[1.1] mb-6">Deep Focus Mode</h1>
                  <p className="text-lg md:text-xl text-[#555555] max-w-2xl mx-auto leading-relaxed mb-10">A minimal workspace designed to help you lock in and get meaningful work done.</p>


                  <div className="flex flex-col items-center justify-center gap-6 mb-20">
                  <div className="text-7xl font-mono text-[#2B4C7E]">{minutes}:{seconds}</div>


                  <div className="flex gap-4">
                  <button onClick={() => setRunning(true)} className="bg-[#2B4C7E] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#1e365c] transition">Start</button>
                  <button onClick={() => setRunning(false)} className="px-8 py-3.5 rounded-full font-semibold text-[#2B4C7E] border border-[#2B4C7E] hover:bg-blue-50 transition">Pause</button>
                  <button onClick={() => { setTime(1500); setRunning(false); }} className="px-8 py-3.5 rounded-full font-semibold text-gray-600 border hover:bg-gray-100 transition">Reset</button>
                  </div>
                  </div>
                  </div>

                  {/* Decorative blurred elements representing blocked noise */}
                  <div className="absolute top-20 left-20 w-32 h-12 bg-red-100 rounded-lg blur-sm opacity-20 rotate-[-12deg]"></div>
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-100 rounded-full blur-md opacity-20"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Social Proof --- */}
      <section className="py-10 border-y border-gray-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-400 mb-6">TRUSTED BY PRODUCTIVE TEAMS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Text placeholders for logos using a heavy font to simulate logos */}
             {['Stripe', 'Notion', 'Shopify', 'Linear', 'Vercel'].map((brand) => (
                <span key={brand} className="text-xl md:text-2xl font-bold font-serif text-[#222222]">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* --- Problem / Solution (Triptych) --- */}
      <section className="py-24 px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#222222] mb-4">Why your brain needs Clarity.</h2>
            <p className="text-[#555555] max-w-2xl mx-auto">Modern work is broken. We fix the environment so you can fix your focus.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: BellOff, 
                title: "Eliminate Digital Noise", 
                desc: "Automatically silence notifications and block distracting websites during your deep work sessions." 
              },
              { 
                icon: Zap, 
                title: "Trigger Flow States", 
                desc: " scientifically-backed soundscapes and timers designed to help you enter the zone faster." 
              },
              { 
                icon: Shield, 
                title: "Protect Your Energy", 
                desc: "Set strict boundaries with auto-replies and calendar blocking to prevent burnout." 
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2B4C7E] mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#222222] mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How It Works (Z-Pattern) --- */}
      <section className="py-24 px-6 overflow-hidden" id="how-it-works">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Block 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 pr-0 md:pr-10">
              <div className="text-[#2B4C7E] font-medium mb-2 uppercase tracking-wider text-sm">Step 01</div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#222222] mb-6">Intention Setting</h2>
              <p className="text-lg mb-6">
                Before you dive in, PromoFocus asks you to define your single goal. This simple psychological priming prepares your brain for the task at hand.
              </p>
              <ul className="space-y-3">
                {['Goal visualization', 'Task estimation', 'Warm-up breathwork'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-[#2B4C7E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-[#56CCF2] blur-[60px] opacity-20 rounded-full"></div>
               <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 aspect-[4/3] flex items-center justify-center p-8">
                  <div className="text-center w-full">
                     <div className="text-sm text-gray-400 mb-4">What is your main focus?</div>
                     <div className="text-2xl font-serif text-[#222222] border-b border-gray-200 pb-2">Write Q4 Strategy Report</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Block 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 pl-0 md:pl-10">
              <div className="text-[#2B4C7E] font-medium mb-2 uppercase tracking-wider text-sm">Step 02</div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#222222] mb-6">Sustained Flow</h2>
              <p className="text-lg mb-6">
                PromoFocus tracks your focus levels. If you tab away to a distracting site, a gentle nudge brings you back before you lose your train of thought.
              </p>
              <button className="text-[#2B4C7E] font-semibold flex items-center gap-2 group">
                Learn about our blocking tech <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-[#2B4C7E] blur-[60px] opacity-10 rounded-full"></div>
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
                   {/* Abstract Wave Visualization */}
                   <div className="flex items-end gap-1 h-32">
                      {[40, 60, 45, 80, 100, 90, 70, 85, 60, 50].map((h, i) => (
                        <div key={i} style={{height: `${h}%`}} className="w-4 bg-[#2B4C7E] rounded-t-full opacity-80"></div>
                      ))}
                   </div>
                   <div className="absolute bottom-4 text-xs font-mono text-gray-400">FLOW STATE DETECTED</div>
                </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- Footer Precursor --- */}
      <section className="py-24 px-6 bg-[#2B4C7E]/5 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#222222] mb-6">Ready to find your flow?</h2>
          <p className="text-lg text-[#555555] mb-10">Join thousands of professionals reclaiming their workday from the chaos of modern digital life.</p>
          <Link 
            href="/auth/signup" 
            className="bg-[#2B4C7E] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#1e365c] transition-all hover:shadow-xl hover:-translate-y-1"
          >
            Get Started
          </Link>

          <p className="mt-6 text-sm text-gray-400">No credit card required • 14-day free trial</p>
        </div>
      </section>
    </div>
  );
}