'use client';

import './landing-animations.css';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowDown,
  Play,
  Star,
  ChevronRight,
  Globe,
  Users,
  Award,
  Timer,
  Target,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    velocity: { x: number; y: number };
    opacity: number;
  }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Initialize bubbles
    const initialBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 100 + 50,
      color: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'][i % 6],
      velocity: { x: 0, y: 0 },
      opacity: 0.3 + Math.random() * 0.4
    }));
    setBubbles(initialBubbles);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newMousePos = {
        x: e.clientX,
        y: e.clientY
      };
      setMousePosition(newMousePos);
      
      // Update bubbles based on mouse proximity
      setBubbles(prev => prev.map(bubble => {
        const dx = newMousePos.x - bubble.x;
        const dy = newMousePos.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = 150; // Bubble interaction radius
        
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
    
    // Animate bubbles
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
        
        // Apply friction
        const friction = 0.95;
        
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
    
    const bubbleInterval = setInterval(animateBubbles, 16); // 60fps
    
    // Smooth scroll behavior
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach((element: any) => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };
    
    // Add intersection observer for reveal animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-up, .reveal-scale').forEach((el) => {
      observer.observe(el);
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(bubbleInterval);
      observer.disconnect();
    };
  }, []);
  
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background with Parallax */}
      <motion.div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(16, 185, 129, 0.1) 100%)',
        }}
      />
      
      {/* Interactive Bubbles Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full mix-blend-multiply filter blur-sm"
            style={{
              left: bubble.x - bubble.size / 2,
              top: bubble.y - bubble.size / 2,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle, ${bubble.color}40, ${bubble.color}10)`,
              opacity: bubble.opacity,
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Mouse cursor glow effect */}
        <motion.div
          className="absolute w-32 h-32 rounded-full pointer-events-none"
          style={{
            left: mousePosition.x - 64,
            top: mousePosition.y - 64,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{ scale, opacity }}
      >
        <div className="text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: "backOut",
              delay: 0.2 
            }}
            className="flex justify-center mb-8"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <Brain className="w-24 h-24 text-blue-600" />
              <motion.div
                className="absolute -inset-4 bg-blue-600/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-8 leading-tight"
          >
            Flow State
            <motion.span
              className="block"
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Facilitator
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto px-4"
          >
            AI-driven focus monitoring that helps you enter and maintain 
            <motion.span
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {" "}deep work states
            </motion.span>
          </motion.p>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-md sm:max-w-2xl mx-auto px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }} // Reduced movement
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/auth/signup"
                className="group relative w-full sm:w-auto inline-block px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-blue-500/25 text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started Free
                  <motion.div
                    animate={{ x: [0, 3, 0] }} // Reduced movement
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }} // Reduced movement
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto inline-block px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-700 dark:text-white rounded-xl sm:rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 shadow-xl text-center"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-500 cursor-pointer"
            >
              <ArrowDown className="w-8 h-8" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section className="relative py-20 sm:py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-16 sm:mb-20">
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 px-4"
                style={{ y: y1 }}
              >
                Revolutionary Features
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4"
                style={{ y: y2 }}
              >
                Experience the future of productivity with AI-powered focus enhancement
              </motion.p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedFeatureCard
              icon={<Brain className="w-12 h-12" />}
              title="AI Flow Detection"
              description="Real-time analysis of your work patterns to detect when you enter flow state"
              delay={0.1}
            />
            <AnimatedFeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Distraction Protection"
              description="Smart notification blocking and environment locking during deep work"
              delay={0.2}
            />
            <AnimatedFeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="Smart Interventions"
              description="Micro-breaks and exercises timed perfectly to extend your focus"
              delay={0.3}
            />
            <AnimatedFeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Performance Analytics"
              description="Detailed insights on your flow patterns and productivity trends"
              delay={0.4}
            />
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section className="relative py-32 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-20">
              <motion.h2
                className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-12"
                style={{ y: y1 }}
              >
                How It Works
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
                style={{ y: y2 }}
              >
                A seamless journey from distraction to deep focus
              </motion.p>
            </div>
          </ScrollReveal>
          
          <div className="space-y-20">
            <AnimatedStep
              number="1"
              title="Start Your Session"
              description="Begin monitoring your work patterns with a single click. Our AI starts learning your focus habits immediately."
              icon={<Play className="w-8 h-8" />}
              direction="left"
            />
            <AnimatedStep
              number="2"
              title="Enter Flow State"
              description="As you work, the system detects when you enter flow through typing patterns, mouse activity, and focus consistency."
              icon={<Target className="w-8 h-8" />}
              direction="right"
            />
            <AnimatedStep
              number="3"
              title="Protected Focus"
              description="Once flow is detected, distractions are automatically blocked and your environment is optimized for deep work."
              icon={<Shield className="w-8 h-8" />}
              direction="left"
            />
            <AnimatedStep
              number="4"
              title="Smart Recovery"
              description="When fatigue is detected, receive timely micro-interventions to recharge and return to flow stronger."
              icon={<Sparkles className="w-8 h-8" />}
              direction="right"
            />
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section className="relative py-20 sm:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
              <AnimatedStat value="50K+" label="Active Users" icon={<Users />} />
              <AnimatedStat value="2.5M+" label="Hours Focused" icon={<Timer />} />
              <AnimatedStat value="95%" label="Satisfaction Rate" icon={<Award />} />
            </div>
          </ScrollReveal>
        </div>
      </motion.section>
      
      {/* Final CTA */}
      <motion.section className="relative py-24 sm:py-32 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <motion.div className="relative">
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                animate={{ scale: [1, 1.01, 1] }} // Reduced from 1.02 to 1.01
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready to maximize your potential?
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Join thousands of users who have transformed their focus and productivity
              </motion.p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  href="/auth/signup"
                  className="group relative inline-block px-10 sm:px-12 py-5 sm:py-6 bg-white text-blue-600 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-white/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Start Your Journey
                    <motion.div
                      animate={{ x: [0, 3, 0] }} // Reduced movement
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        </div>
      </motion.section>
    </main>
  );
}

// Animated Components
function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 75 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 75 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedFeatureCard({ icon, title, description, delay = 0 }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 45 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: 45 }}
      transition={{ duration: 0.8, delay, ease: "backOut" }}
      whileHover={{ y: -5, scale: 1.02, rotateY: 2 }} // Reduced movement and scale
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-white/20"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      
      <motion.div
        className="relative z-10"
        animate={isHovered ? { rotateY: 10 } : { rotateY: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-blue-600 mb-6 relative"
          animate={isHovered ? { scale: 1.2, rotateZ: 5 } : { scale: 1, rotateZ: 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
          <motion.div
            className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg"
            animate={isHovered ? { scale: 1.5, opacity: 0.6 } : { scale: 1, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}

function AnimatedStep({ number, title, description, icon, direction }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isLeft = direction === 'left';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -100 : 100, rotateY: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: isLeft ? -100 : 100, rotateY: isLeft ? -30 : 30 }}
      transition={{ duration: 0.8, ease: "backOut" }}
      className={`flex items-center gap-12 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <motion.div
        className="flex-shrink-0"
        whileHover={{ scale: 1.1, rotateZ: 5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-3xl flex items-center justify-center font-bold text-2xl shadow-2xl">
            {number}
          </div>
          <motion.div
            className="absolute -inset-2 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl blur-lg"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
      
      <motion.div
        className="flex-1 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 rounded-3xl p-8 shadow-2xl border border-white/20"
        whileHover={{ scale: 1.01, y: -2 }} // Reduced movement
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="text-blue-600">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}

function AnimatedStat({ value, label, icon }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const target = parseInt(value.replace(/\D/g, ''));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCount(Math.floor(current));
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.5, rotateY: 90 }}
      transition={{ duration: 0.8, ease: "backOut" }}
      whileHover={{ scale: 1.05, rotateY: 5 }} // Reduced rotation
      className="text-center bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 rounded-3xl p-8 shadow-2xl border border-white/20"
    >
      <motion.div
        className="text-blue-600 mb-4 flex justify-center"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <motion.h3
        className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
        animate={isInView ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {value.includes('K') || value.includes('M') || value.includes('%') 
          ? `${count}${value.replace(/\d/g, '')}` 
          : count}
      </motion.h3>
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        {label}
      </p>
    </motion.div>
  );
}
