'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowDown,
  Play,
  ChevronRight,
  Users,
  Award,
  Timer,
  Target,
} from 'lucide-react';

// --- Fonts ---
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Bubbles State
  const [bubbles, setBubbles] = useState<Array<{
    id: number; x: number; y: number; size: number; color: string; velocity: { x: number; y: number }; opacity: number;
  }>>([]);

  // Parallax Transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

  useEffect(() => {
    // Initialize PromoFocus Themed Bubbles
    const initialBubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 120 + 60,
      // Palette: Deep Blue, Cyan, Soft Blue
      color: ['#2B4C7E', '#56CCF2', '#1e365c', '#A5E7F9', '#2B4C7E'][i % 5],
      velocity: { x: 0, y: 0 },
      opacity: 0.05 + Math.random() * 0.1 // Kept subtle
    }));
    setBubbles(initialBubbles);

    const handleMouseMove = (e: MouseEvent) => {
      const newMousePos = { x: e.clientX, y: e.clientY };
      setMousePosition(newMousePos);

      setBubbles(prev => prev.map(bubble => {
        const dx = newMousePos.x - bubble.x;
        const dy = newMousePos.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = 250; 

        if (distance < influence) {
          const force = (influence - distance) / influence;
          const angle = Math.atan2(dy, dx);
          const pushX = -Math.cos(angle) * force * 3;
          const pushY = -Math.sin(angle) * force * 3;
          
          return {
            ...bubble,
            velocity: {
              x: bubble.velocity.x + pushX,
              y: bubble.velocity.y + pushY
            }
          };
        }
        return bubble;
      }));
    };

    const animateBubbles = () => {
      setBubbles(prev => prev.map(bubble => {
        let newX = bubble.x + bubble.velocity.x;
        let newY = bubble.y + bubble.velocity.y;

        // Bounce off edges
        if (newX < 0 || newX > window.innerWidth) {
          bubble.velocity.x *= -0.8;
          newX = Math.max(0, Math.min(window.innerWidth, newX));
        }
        if (newY < 0 || newY > window.innerHeight) {
          bubble.velocity.y *= -0.8;
          newY = Math.max(0, Math.min(window.innerHeight, newY));
        }

        const friction = 0.96;

        return {
          ...bubble,
          x: newX,
          y: newY,
          velocity: {
            x: bubble.velocity.x * friction,
            y: bubble.velocity.y * friction
          }
        };
      }));
    };

    const interval = setInterval(animateBubbles, 16);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <main className={`${playfair.variable} ${inter.variable} font-sans min-h-screen overflow-hidden bg-[#FAFAFA] text-[#555555] selection:bg-[#2B4C7E] selection:text-white`}>
      
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2B4C7E]"></div>
            <span className="font-serif text-2xl font-bold text-[#222222]">PromoFocus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm font-medium hover:text-[#2B4C7E] transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="bg-[#2B4C7E] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#1e365c] transition-all hover:shadow-lg hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Background Layer 1: Bubbles */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full blur-3xl"
            style={{
              left: bubble.x - bubble.size / 2,
              top: bubble.y - bubble.size / 2,
              width: bubble.size,
              height: bubble.size,
              background: bubble.color,
              opacity: bubble.opacity,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ scale, opacity }}
      >
        {/* Background Layer 2: Hero Gradient Wash */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F0F7FF] via-[#FAFAFA] to-white opacity-80"></div>
        
        {/* Background Layer 3: Decorative Mesh Blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#56CCF2]/10 to-[#2B4C7E]/10 rounded-full blur-[100px] -z-10"></div>

        <div className="text-center max-w-5xl mx-auto">
          
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "backOut" }}
            className="flex justify-center mb-8"
          >
            <motion.div className="relative" whileHover={{ scale: 1.05 }}>
              <div className="w-24 h-24 bg-gradient-to-br from-[#2B4C7E] to-[#1e365c] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#2B4C7E]/20">
                <Brain className="w-12 h-12 text-white" />
              </div>
              {/* Icon Glow */}
              <motion.div
                className="absolute -inset-4 bg-[#56CCF2]/30 rounded-3xl blur-xl -z-10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-[#222222] mb-8 leading-[1.1] tracking-tight"
          >
            Flow State
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2B4C7E] via-[#56CCF2] to-[#2B4C7E]"
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Facilitator
            </motion.span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-[#555555] mb-12 leading-relaxed max-w-3xl mx-auto font-light"
          >
            AI-driven focus monitoring that helps you enter and maintain 
            <span className="font-medium text-[#2B4C7E] bg-[#2B4C7E]/5 px-2 py-1 rounded-lg mx-1"> deep work states </span> 
            effortlessly.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup" className="group relative w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2B4C7E] to-[#56CCF2] rounded-full blur opacity-50 group-hover:opacity-75 transition"></div>
                <button className="relative w-full sm:w-auto bg-[#2B4C7E] text-white px-10 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#1e365c] transition-all">
                    Get Started Free <ChevronRight size={18} />
                </button>
            </Link>

            <Link href="#how-it-works" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-[#2B4C7E] bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all flex items-center justify-center gap-2 hover:shadow-md">
                 <Play size={16} fill="currentColor" /> How it Works
              </button>
            </Link>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#2B4C7E]/50"
            >
              <ArrowDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section - Added Subtle Grid Background */}
      <motion.section className="relative py-32 px-6 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#2B4C7E_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/50 to-transparent -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <motion.h2 className="font-serif text-4xl md:text-5xl font-bold text-[#222222] mb-6" style={{ y: y1 }}>
                Revolutionary Features
              </motion.h2>
              <motion.p className="text-lg text-[#555555] max-w-2xl mx-auto" style={{ y: y2 }}>
                Experience the future of productivity with minimalist, AI-powered tools.
              </motion.p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Brain} title="AI Flow Detection" 
              desc="Real-time analysis of your work patterns to detect when you enter flow state." 
              delay={0.1} 
            />
            <FeatureCard 
              icon={Shield} title="Distraction Shield" 
              desc="Smart notification blocking and environment locking during deep work." 
              delay={0.2} 
            />
            <FeatureCard 
              icon={Zap} title="Smart Recovery" 
              desc="Micro-breaks and exercises timed perfectly to extend your focus endurance." 
              delay={0.3} 
            />
            <FeatureCard 
              icon={TrendingUp} title="Deep Analytics" 
              desc="Detailed insights on your flow patterns and productivity trends." 
              delay={0.4} 
            />
          </div>
        </div>
      </motion.section>

      {/* How It Works - Added Connecting Lines */}
      <motion.section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-24">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#222222] mb-6">How It Works</h2>
              <p className="text-xl text-[#555555]">A seamless journey from distraction to deep focus.</p>
            </div>
          </ScrollReveal>

          {/* Central Connecting Line (Desktop) */}
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2B4C7E]/10 via-[#2B4C7E]/30 to-[#2B4C7E]/10 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-24">
              <AnimatedStep 
                number="01" title="Start Your Session" 
                desc="Begin monitoring your work patterns with a single click. Our AI starts learning your focus habits immediately."
                icon={Play} direction="left"
              />
              <AnimatedStep 
                number="02" title="Enter Flow State" 
                desc="As you work, the system detects when you enter flow through typing patterns and focus consistency."
                icon={Target} direction="right"
              />
              <AnimatedStep 
                number="03" title="Protected Focus" 
                desc="Once flow is detected, distractions are automatically blocked. Your environment is optimized for deep work."
                icon={Shield} direction="left"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section - Added Container & Soft Background */}
      <motion.section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-[3rem] p-12 md:p-16 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <StatCard value="50K+" label="Active Users" icon={Users} />
                    <StatCard value="2.5M+" label="Hours Focused" icon={Timer} />
                    <StatCard value="95%" label="Satisfaction" icon={Award} />
                </div>
            </div>
          </ScrollReveal>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section className="relative py-32 px-6 bg-[#2B4C7E] overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#56CCF2] rounded-full blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#56CCF2] rounded-full blur-[150px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.h2 
              className="font-serif text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Ready to maximize your potential?
            </motion.h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals reclaiming their workday from the chaos of modern digital life.
            </p>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#2B4C7E] px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-3 mx-auto"
              >
                Start Your Journey <ChevronRight />
              </motion.button>
            </Link>
          </ScrollReveal>
        </div>
      </motion.section>

    </main>
  );
}

// --- Reusable Components ---

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -8 }}
            // Changed: Added background opacity and colored border on hover
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#2B4C7E]/30 hover:bg-[#F0F7FF]/50 hover:shadow-xl hover:shadow-[#2B4C7E]/5 transition-all duration-300"
        >
            <div className="w-14 h-14 bg-[#FAFAFA] rounded-2xl flex items-center justify-center text-[#2B4C7E] shadow-sm mb-6">
                <Icon size={28} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#222222] mb-3">{title}</h3>
            <p className="text-sm text-[#555555] leading-relaxed">{desc}</p>
        </motion.div>
    )
}

function AnimatedStep({ number, title, desc, icon: Icon, direction }: any) {
    const isLeft = direction === 'left';
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center gap-10 md:gap-20 ${!isLeft && 'md:flex-row-reverse'}`}
        >
            {/* Added white background circle behind icons to cover connecting line */}
            <div className="flex-shrink-0 relative bg-[#FAFAFA] p-4 rounded-full z-10">
                <div className="text-8xl font-serif font-bold text-[#E5E7EB] select-none absolute -top-6 -left-6 z-0 opacity-50">
                    {number}
                </div>
                <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-[#2B4C7E] to-[#1e365c] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-[#2B4C7E]/20">
                    <Icon size={40} />
                </div>
            </div>
            <div className="text-center md:text-left bg-white/50 p-8 rounded-3xl border border-transparent hover:border-gray-100 transition-colors">
                <h3 className="font-serif text-3xl font-bold text-[#222222] mb-4">{title}</h3>
                <p className="text-lg text-[#555555] leading-relaxed max-w-md">{desc}</p>
            </div>
        </motion.div>
    )
}

function StatCard({ value, label, icon: Icon }: any) {
    return (
        <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[#2B4C7E] mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} />
            </div>
            <h3 className="font-serif text-5xl font-bold text-[#222222] mb-2">{value}</h3>
            <p className="text-[#555555] font-medium uppercase tracking-wider text-sm">{label}</p>
        </div>
    )
}