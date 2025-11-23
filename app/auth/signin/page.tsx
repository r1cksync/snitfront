'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Playfair_Display, Inter } from 'next/font/google';

// Fonts
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${playfair.variable} ${inter.variable} font-sans min-h-screen bg-[#FAFAFA] relative flex items-center justify-center overflow-hidden p-4`}>
      
      {/* Background Halo Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#56CCF2] to-[#2B4C7E] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      {/* Back to Home */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#555555] hover:text-[#2B4C7E] transition-colors z-20">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#2B4C7E]/10 rounded-2xl flex items-center justify-center text-[#2B4C7E]">
                <div className="w-3 h-3 rounded-full bg-[#2B4C7E]"></div>
              </div>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#222222] mb-2">Welcome Back</h1>
            <p className="text-[#555555] text-sm">Sign in to continue your flow journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] transition-all outline-none text-[#222222] placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-[#2B4C7E] transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] transition-all outline-none text-[#222222] placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B4C7E] text-white py-3.5 rounded-full font-semibold hover:bg-[#1e365c] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#2B4C7E] font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}