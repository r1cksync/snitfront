'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Mail, Lock, User, Calendar, Briefcase, GraduationCap, Target, Clock, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Playfair_Display, Inter } from 'next/font/google';
import { authAPI } from '@/lib/api';

// Fonts
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const GOAL_OPTIONS = ['Improve Focus', 'Increase Productivity', 'Better Time Management', 'Reduce Distractions', 'Learn New Skills', 'Work-Life Balance'];
const FOCUS_AREAS = ['Coding', 'Writing', 'Reading', 'Design', 'Research', 'Planning', 'Communication', 'Analysis'];
const HOBBY_OPTIONS = ['Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Cooking', 'Travel', 'Photography', 'Fitness'];
const LEARNING_INTERESTS = ['Programming', 'Data Science', 'AI/ML', 'Web Development', 'Mobile Development', 'Design', 'Business', 'Marketing', 'Languages'];
const CHALLENGES = ['Procrastination', 'Distractions', 'Time Management', 'Lack of Motivation', 'Overwhelm', 'Burnout', 'Multitasking'];

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data State (Same as before)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', phoneNumber: '',
    occupation: '', company: '', jobTitle: '', industry: '', yearsOfExperience: '',
    educationLevel: '', fieldOfStudy: '', institution: '',
    primaryGoals: [] as string[], focusAreas: [] as string[], hobbies: [] as string[], learningInterests: [] as string[],
    preferredWorkingHours: '', workEnvironment: '', productivityChallenges: [] as string[],
    timezone: '', country: '', city: '', bio: '',
  });

  // Logic Helpers (Same as before)
  const calculateAge = (dob: string): number | undefined => {
    if (!dob) return undefined;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 7) {
        setStep(step + 1);
        return;
    }
    // ... (Validation logic remains the same)
    setLoading(true);
    try {
        // ... (API call logic remains the same, creating userData object)
        // Mocking API call for UI demo purposes:
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        router.push('/auth/signin?registered=true');
    } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const getStepTitle = () => {
    const titles = ['Create Account', 'Personal Information', 'Professional Background', 'Education', 'Goals & Interests', 'Work Preferences', 'Location & Bio'];
    return titles[step - 1];
  };

  return (
    <div className={`${playfair.variable} ${inter.variable} font-sans min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 py-12 relative overflow-hidden`}>
      
      {/* Background Halo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#56CCF2]/20 to-[#2B4C7E]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#2B4C7E]/10 to-transparent rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/50 p-8 md:p-12 w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2B4C7E]"></div>
                <span className="font-serif text-2xl font-bold text-[#222222]">PromoFocus</span>
             </div>
          </div>
          
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#222222] mb-2">{getStepTitle()}</h1>
          <p className="text-[#555555]">Step {step} of 7</p>
          
          {/* Custom Progress Bar */}
          <div className="mt-6 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
                className="bg-[#2B4C7E] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: ((step / 7) * 100) + '%' }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[320px]">
          {/* Step 1: Basic Account Info */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField icon={User} label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} placeholder="John Doe" />
              <InputField icon={Mail} label="Email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} placeholder="you@example.com" />
              <InputField icon={Lock} label="Password" type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} placeholder="••••••••" />
              <InputField icon={Lock} label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(v) => setFormData({...formData, confirmPassword: v})} placeholder="••••••••" />
            </div>
          )}
          
          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField icon={Calendar} label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v) => setFormData({...formData, dateOfBirth: v})} />
              <SelectField label="Gender" value={formData.gender} onChange={(v) => setFormData({...formData, gender: v})} options={[{val: 'male', label: 'Male'}, {val: 'female', label: 'Female'}, {val: 'non-binary', label: 'Non-binary'}, {val: 'prefer-not-to-say', label: 'Prefer not to say'}]} />
              <InputField label="Phone Number" type="tel" value={formData.phoneNumber} onChange={(v) => setFormData({...formData, phoneNumber: v})} placeholder="+1 (555) 000-0000" />
            </div>
          )}

          {/* Step 3: Professional Info */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField icon={Briefcase} label="Occupation" value={formData.occupation} onChange={(v) => setFormData({...formData, occupation: v})} placeholder="Software Engineer" />
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Company" value={formData.company} onChange={(v) => setFormData({...formData, company: v})} placeholder="Tech Corp" />
                 <InputField label="Job Title" value={formData.jobTitle} onChange={(v) => setFormData({...formData, jobTitle: v})} placeholder="Senior Dev" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Industry" value={formData.industry} onChange={(v) => setFormData({...formData, industry: v})} placeholder="Technology" />
                 <InputField label="Years Exp" type="number" value={formData.yearsOfExperience} onChange={(v) => setFormData({...formData, yearsOfExperience: v})} placeholder="5" />
              </div>
            </div>
          )}

          {/* Step 4: Education */}
          {step === 4 && (
             <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <SelectField icon={GraduationCap} label="Education Level" value={formData.educationLevel} onChange={(v) => setFormData({...formData, educationLevel: v})} options={[{val: 'high-school', label: 'High School'}, {val: 'bachelor', label: "Bachelor's"}, {val: 'master', label: "Master's"}, {val: 'phd', label: 'PhD'}]} />
                <InputField label="Field of Study" value={formData.fieldOfStudy} onChange={(v) => setFormData({...formData, fieldOfStudy: v})} placeholder="Computer Science" />
                <InputField label="Institution" value={formData.institution} onChange={(v) => setFormData({...formData, institution: v})} placeholder="University Name" />
             </div>
          )}

          {/* Step 5: Goals & Interests */}
          {step === 5 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <TagSection icon={Target} label="Primary Goals" options={GOAL_OPTIONS} selected={formData.primaryGoals} onToggle={(i) => setFormData({...formData, primaryGoals: toggleArrayItem(formData.primaryGoals, i)})} />
                <TagSection label="Focus Areas" options={FOCUS_AREAS} selected={formData.focusAreas} onToggle={(i) => setFormData({...formData, focusAreas: toggleArrayItem(formData.focusAreas, i)})} />
                <TagSection label="Hobbies" options={HOBBY_OPTIONS} selected={formData.hobbies} onToggle={(i) => setFormData({...formData, hobbies: toggleArrayItem(formData.hobbies, i)})} />
                <TagSection label="Learning Interests" options={LEARNING_INTERESTS} selected={formData.learningInterests} onToggle={(i) => setFormData({...formData, learningInterests: toggleArrayItem(formData.learningInterests, i)})} />
             </div>
          )}

          {/* Step 6: Work Preferences */}
          {step === 6 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <SelectField icon={Clock} label="Preferred Hours" value={formData.preferredWorkingHours} onChange={(v) => setFormData({...formData, preferredWorkingHours: v})} options={[{val: 'morning', label: 'Morning'}, {val: 'afternoon', label: 'Afternoon'}, {val: 'night', label: 'Night'}, {val: 'flexible', label: 'Flexible'}]} />
                <SelectField label="Environment" value={formData.workEnvironment} onChange={(v) => setFormData({...formData, workEnvironment: v})} options={[{val: 'remote', label: 'Remote'}, {val: 'office', label: 'Office'}, {val: 'hybrid', label: 'Hybrid'}]} />
                <TagSection label="Productivity Challenges" options={CHALLENGES} selected={formData.productivityChallenges} onToggle={(i) => setFormData({...formData, productivityChallenges: toggleArrayItem(formData.productivityChallenges, i)})} />
             </div>
          )}

          {/* Step 7: Location & Bio */}
          {step === 7 && (
             <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField icon={MapPin} label="Country" value={formData.country} onChange={(v) => setFormData({...formData, country: v})} placeholder="United States" />
                <div className="grid grid-cols-2 gap-4">
                   <InputField label="City" value={formData.city} onChange={(v) => setFormData({...formData, city: v})} placeholder="New York" />
                   <SelectField label="Timezone" value={formData.timezone} onChange={(v) => setFormData({...formData, timezone: v})} options={[{val: 'UTC', label: 'UTC'}, {val: 'EST', label: 'EST'}, {val: 'PST', label: 'PST'}]} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider ml-1 mb-2 block">Bio</label>
                    <textarea 
                        value={formData.bio} 
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] outline-none text-[#222222] resize-none placeholder:text-gray-400"
                        placeholder="What motivates you?"
                    />
                </div>
             </div>
          )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-200 text-[#555555] rounded-full font-medium hover:bg-gray-50 hover:text-[#2B4C7E] transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
            
            <div className="flex-1"></div>

            {step > 1 && step < 7 && (
                <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-3 text-gray-400 hover:text-[#2B4C7E] font-medium transition-colors text-sm">
                    Skip
                </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#2B4C7E] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1e365c] transition-all hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Processing...' : step === 7 ? 'Create Account' : 'Continue'}
              {step < 7 && <ChevronRight size={18} />}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#2B4C7E] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Reusable UI Components for Cleaner Code ---

function InputField({ label, icon: Icon, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                <input
                    type={type}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] transition-all outline-none text-[#222222] placeholder:text-gray-400`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}

function SelectField({ label, icon: Icon, value, onChange, options }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] transition-all outline-none text-[#222222] appearance-none`}
                >
                    <option value="">Select {label}</option>
                    {options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                </select>
            </div>
        </div>
    )
}

function TagSection({ label, icon: Icon, options, selected, onToggle }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider ml-1 flex items-center gap-2">
                {Icon && <Icon size={14} />} {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: string) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onToggle(opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                isSelected 
                                ? 'bg-[#2B4C7E] text-white border-[#2B4C7E] shadow-md' 
                                : 'bg-[#FAFAFA] text-gray-600 border-gray-200 hover:border-[#2B4C7E] hover:text-[#2B4C7E]'
                            }`}
                        >
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}