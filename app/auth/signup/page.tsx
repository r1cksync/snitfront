'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Mail, Lock, User, Calendar, Briefcase, GraduationCap, Target, Clock, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';

const GOAL_OPTIONS = ['Improve Focus', 'Increase Productivity', 'Better Time Management', 'Reduce Distractions', 'Learn New Skills', 'Work-Life Balance'];
const FOCUS_AREAS = ['Coding', 'Writing', 'Reading', 'Design', 'Research', 'Planning', 'Communication', 'Analysis'];
const HOBBY_OPTIONS = ['Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Cooking', 'Travel', 'Photography', 'Fitness'];
const LEARNING_INTERESTS = ['Programming', 'Data Science', 'AI/ML', 'Web Development', 'Mobile Development', 'Design', 'Business', 'Marketing', 'Languages'];
const CHALLENGES = ['Procrastination', 'Distractions', 'Time Management', 'Lack of Motivation', 'Overwhelm', 'Burnout', 'Multitasking'];

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info (Step 1)
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Info (Step 2)
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    
    // Professional Info (Step 3)
    occupation: '',
    company: '',
    jobTitle: '',
    industry: '',
    yearsOfExperience: '',
    
    // Education (Step 4)
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    
    // Goals & Interests (Step 5)
    primaryGoals: [] as string[],
    focusAreas: [] as string[],
    hobbies: [] as string[],
    learningInterests: [] as string[],
    
    // Preferences (Step 6)
    preferredWorkingHours: '',
    workEnvironment: '',
    productivityChallenges: [] as string[],
    
    // Location (Step 7)
    timezone: '',
    country: '',
    city: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate age from date of birth
  const calculateAge = (dob: string): number | undefined => {
    if (!dob) return undefined;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 7) {
      setStep(step + 1);
      return;
    }
    
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      
      // Add optional fields
      const calculatedAge = calculateAge(formData.dateOfBirth);
      if (calculatedAge) userData.age = calculatedAge;
      if (formData.dateOfBirth) userData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) userData.gender = formData.gender;
      if (formData.phoneNumber) userData.phoneNumber = formData.phoneNumber;
      if (formData.occupation) userData.occupation = formData.occupation;
      if (formData.company) userData.company = formData.company;
      if (formData.jobTitle) userData.jobTitle = formData.jobTitle;
      if (formData.industry) userData.industry = formData.industry;
      if (formData.yearsOfExperience) userData.yearsOfExperience = parseInt(formData.yearsOfExperience);
      if (formData.educationLevel) userData.educationLevel = formData.educationLevel;
      if (formData.fieldOfStudy) userData.fieldOfStudy = formData.fieldOfStudy;
      if (formData.institution) userData.institution = formData.institution;
      if (formData.primaryGoals.length > 0) userData.primaryGoals = formData.primaryGoals;
      if (formData.focusAreas.length > 0) userData.focusAreas = formData.focusAreas;
      if (formData.hobbies.length > 0) userData.hobbies = formData.hobbies;
      if (formData.learningInterests.length > 0) userData.learningInterests = formData.learningInterests;
      if (formData.preferredWorkingHours) userData.preferredWorkingHours = formData.preferredWorkingHours;
      if (formData.workEnvironment) userData.workEnvironment = formData.workEnvironment;
      if (formData.productivityChallenges.length > 0) userData.productivityChallenges = formData.productivityChallenges;
      if (formData.timezone) userData.timezone = formData.timezone;
      if (formData.country) userData.country = formData.country;
      if (formData.city) userData.city = formData.city;
      if (formData.bio) userData.bio = formData.bio;
      
      await authAPI.register(userData);

      // Redirect to sign in after successful registration
      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const getStepTitle = () => {
    const titles = [
      'Create Account',
      'Personal Information',
      'Professional Background',
      'Education',
      'Goals & Interests',
      'Work Preferences',
      'Location & Bio'
    ];
    return titles[step - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getStepTitle()}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Step {step} of 7 - Help us personalize your experience
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: ((step / 7) * 100) + '%' }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto px-2">
          
          {/* Step 1: Basic Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="you@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Date of Birth
                </label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white" />
                {formData.dateOfBirth && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Age: {calculateAge(formData.dateOfBirth)} years old
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          )}
          
          {/* Step 3: Professional Info */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Software Developer" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tech Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                  <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Senior Developer" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
                  <input type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
                  <input type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="5" />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Education */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select value={formData.educationLevel} onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="">Select education level</option>
                    <option value="high-school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field of Study</label>
                <input type="text" value={formData.fieldOfStudy} onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Computer Science" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
                <input type="text" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="University Name" />
              </div>
            </div>
          )}
          
          {/* Step 5: Goals & Interests */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Target className="inline w-4 h-4 mr-2" />
                  Primary Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryGoals: toggleArrayItem(formData.primaryGoals, goal) })}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                        (formData.primaryGoals.includes(goal) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Focus Areas</label>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setFormData({ ...formData, focusAreas: toggleArrayItem(formData.focusAreas, area) })}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                        (formData.focusAreas.includes(area) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hobbies</label>
                <div className="grid grid-cols-3 gap-2">
                  {HOBBY_OPTIONS.map(hobby => (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => setFormData({ ...formData, hobbies: toggleArrayItem(formData.hobbies, hobby) })}
                      className={'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                        (formData.hobbies.includes(hobby) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
                    >
                      {hobby}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Learning Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEARNING_INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => setFormData({ ...formData, learningInterests: toggleArrayItem(formData.learningInterests, interest) })}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                        (formData.learningInterests.includes(interest) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 6: Work Preferences */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Preferred Working Hours
                </label>
                <select value={formData.preferredWorkingHours} onChange={(e) => setFormData({ ...formData, preferredWorkingHours: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">Select preferred hours</option>
                  <option value="early-morning">Early Morning (5AM - 9AM)</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 9PM)</option>
                  <option value="night">Night (9PM - 12AM)</option>
                  <option value="late-night">Late Night (12AM - 5AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Environment</label>
                <select value={formData.workEnvironment} onChange={(e) => setFormData({ ...formData, workEnvironment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">Select environment</option>
                  <option value="remote">Remote / Work from Home</option>
                  <option value="office">Office</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="coworking">Co-working Space</option>
                  <option value="student">Student / Campus</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Productivity Challenges</label>
                <div className="grid grid-cols-2 gap-2">
                  {CHALLENGES.map(challenge => (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => setFormData({ ...formData, productivityChallenges: toggleArrayItem(formData.productivityChallenges, challenge) })}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                        (formData.productivityChallenges.includes(challenge) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 7: Location & Bio */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Country
                </label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="United States" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                  <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="">Select timezone</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell us about yourself
                </label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Share a bit about yourself, your aspirations, what motivates you..."
                />
                <p className="text-xs text-gray-500 mt-1">This helps our AI chatbot provide personalized assistance</p>
              </div>
            </div>
          )}
          
          {/* Remaining steps will be added in next part */}
          
          <div className="flex gap-4 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
            )}
            
            {step > 1 && step < 7 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
              >
                Skip
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : step === 7 ? 'Create Account' : 'Continue'}
              {step < 7 && <ChevronRight size={18} />}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
