'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, Phone, Briefcase, GraduationCap, Target, Clock, MapPin, Save, Edit2, X, Bell, BarChart3 } from 'lucide-react';
import { authAPI } from '@/lib/api';

const GOAL_OPTIONS = ['Improve Focus', 'Increase Productivity', 'Better Time Management', 'Reduce Distractions', 'Learn New Skills', 'Work-Life Balance'];
const FOCUS_AREAS = ['Coding', 'Writing', 'Reading', 'Design', 'Research', 'Planning', 'Communication', 'Analysis'];
const HOBBY_OPTIONS = ['Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Cooking', 'Travel', 'Photography', 'Fitness'];
const LEARNING_INTERESTS = ['Programming', 'Data Science', 'AI/ML', 'Web Development', 'Mobile Development', 'Design', 'Business', 'Marketing', 'Languages'];
const CHALLENGES = ['Procrastination', 'Distractions', 'Time Management', 'Lack of Motivation', 'Overwhelm', 'Burnout', 'Multitasking'];

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    occupation: '',
    company: '',
    jobTitle: '',
    industry: '',
    yearsOfExperience: '',
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    primaryGoals: [] as string[],
    focusAreas: [] as string[],
    hobbies: [] as string[],
    learningInterests: [] as string[],
    preferredWorkingHours: '',
    workEnvironment: '',
    productivityChallenges: [] as string[],
    timezone: '',
    country: '',
    city: '',
    bio: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadUserProfile();
    }
  }, [status, router]);

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

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      const user = response.data;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        phoneNumber: user.phoneNumber || '',
        occupation: user.occupation || '',
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        industry: user.industry || '',
        yearsOfExperience: user.yearsOfExperience?.toString() || '',
        educationLevel: user.educationLevel || '',
        fieldOfStudy: user.fieldOfStudy || '',
        institution: user.institution || '',
        primaryGoals: user.primaryGoals || [],
        focusAreas: user.focusAreas || [],
        hobbies: user.hobbies || [],
        learningInterests: user.learningInterests || [],
        preferredWorkingHours: user.preferredWorkingHours || '',
        workEnvironment: user.workEnvironment || '',
        productivityChallenges: user.productivityChallenges || [],
        timezone: user.timezone || '',
        country: user.country || '',
        city: user.city || '',
        bio: user.bio || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const updateData: any = {
        name: formData.name,
      };
      
      const calculatedAge = calculateAge(formData.dateOfBirth);
      if (calculatedAge) updateData.age = calculatedAge;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.occupation) updateData.occupation = formData.occupation;
      if (formData.company) updateData.company = formData.company;
      if (formData.jobTitle) updateData.jobTitle = formData.jobTitle;
      if (formData.industry) updateData.industry = formData.industry;
      if (formData.yearsOfExperience) updateData.yearsOfExperience = parseInt(formData.yearsOfExperience);
      if (formData.educationLevel) updateData.educationLevel = formData.educationLevel;
      if (formData.fieldOfStudy) updateData.fieldOfStudy = formData.fieldOfStudy;
      if (formData.institution) updateData.institution = formData.institution;
      if (formData.primaryGoals.length > 0) updateData.primaryGoals = formData.primaryGoals;
      if (formData.focusAreas.length > 0) updateData.focusAreas = formData.focusAreas;
      if (formData.hobbies.length > 0) updateData.hobbies = formData.hobbies;
      if (formData.learningInterests.length > 0) updateData.learningInterests = formData.learningInterests;
      if (formData.preferredWorkingHours) updateData.preferredWorkingHours = formData.preferredWorkingHours;
      if (formData.workEnvironment) updateData.workEnvironment = formData.workEnvironment;
      if (formData.productivityChallenges.length > 0) updateData.productivityChallenges = formData.productivityChallenges;
      if (formData.timezone) updateData.timezone = formData.timezone;
      if (formData.country) updateData.country = formData.country;
      if (formData.city) updateData.city = formData.city;
      if (formData.bio) updateData.bio = formData.bio;
      
      await authAPI.updateUserProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Quick Links */}
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <Link
            href="/settings/reminders"
            className="block bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Health & Wellness</h3>
                  <p className="text-white text-opacity-90 text-sm">
                    Configure wellness reminders
                  </p>
                </div>
              </div>
              <div className="text-white text-opacity-70 group-hover:text-opacity-100 transition-all">
                →
              </div>
            </div>
          </Link>

          <Link
            href="/settings/reports"
            className="block bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Reports & Analytics</h3>
                  <p className="text-white text-opacity-90 text-sm">
                    Email/SMS reports settings
                  </p>
                </div>
              </div>
              <div className="text-white text-opacity-70 group-hover:text-opacity-100 transition-all">
                →
              </div>
            </div>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your personal information and preferences</p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(false);
                    loadUserProfile();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
          
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={20} />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
              {formData.dateOfBirth && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Age: {calculateAge(formData.dateOfBirth)} years old
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={!editMode}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={20} />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., Tech Corp"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., Senior Developer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., Technology"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                disabled={!editMode}
                placeholder="5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap size={20} />
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Education Level</label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
                <option value="">Select level</option>
                <option value="high-school">High School</option>
                <option value="associate">Associate Degree</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field of Study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                disabled={!editMode}
                placeholder="e.g., University of Technology"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Goals & Interests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={20} />
            Goals & Interests
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goals</label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => editMode && setFormData({ ...formData, primaryGoals: toggleArrayItem(formData.primaryGoals, goal) })}
                    disabled={!editMode}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                      (formData.primaryGoals.includes(goal) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300') +
                      (editMode ? ' hover:opacity-80 cursor-pointer' : ' cursor-not-allowed opacity-70')}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focus Areas</label>
              <div className="grid grid-cols-2 gap-2">
                {FOCUS_AREAS.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => editMode && setFormData({ ...formData, focusAreas: toggleArrayItem(formData.focusAreas, area) })}
                    disabled={!editMode}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                      (formData.focusAreas.includes(area) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300') +
                      (editMode ? ' hover:opacity-80 cursor-pointer' : ' cursor-not-allowed opacity-70')}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hobbies</label>
              <div className="grid grid-cols-3 gap-2">
                {HOBBY_OPTIONS.map(hobby => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => editMode && setFormData({ ...formData, hobbies: toggleArrayItem(formData.hobbies, hobby) })}
                    disabled={!editMode}
                    className={'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                      (formData.hobbies.includes(hobby) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300') +
                      (editMode ? ' hover:opacity-80 cursor-pointer' : ' cursor-not-allowed opacity-70')}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Interests</label>
              <div className="grid grid-cols-2 gap-2">
                {LEARNING_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => editMode && setFormData({ ...formData, learningInterests: toggleArrayItem(formData.learningInterests, interest) })}
                    disabled={!editMode}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                      (formData.learningInterests.includes(interest) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300') +
                      (editMode ? ' hover:opacity-80 cursor-pointer' : ' cursor-not-allowed opacity-70')}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Work Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} />
            Work Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Working Hours</label>
              <select
                value={formData.preferredWorkingHours}
                onChange={(e) => setFormData({ ...formData, preferredWorkingHours: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
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
              <select
                value={formData.workEnvironment}
                onChange={(e) => setFormData({ ...formData, workEnvironment: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
                <option value="">Select environment</option>
                <option value="remote">Remote / Work from Home</option>
                <option value="office">Office</option>
                <option value="hybrid">Hybrid</option>
                <option value="coworking">Co-working Space</option>
                <option value="student">Student / Campus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Productivity Challenges</label>
              <div className="grid grid-cols-2 gap-2">
                {CHALLENGES.map(challenge => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => editMode && setFormData({ ...formData, productivityChallenges: toggleArrayItem(formData.productivityChallenges, challenge) })}
                    disabled={!editMode}
                    className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                      (formData.productivityChallenges.includes(challenge) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300') +
                      (editMode ? ' hover:opacity-80 cursor-pointer' : ' cursor-not-allowed opacity-70')}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Bio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Location & Bio
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!editMode}
                  placeholder="United States"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!editMode}
                  placeholder="New York"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!editMode}
                rows={4}
                placeholder="Share a bit about yourself, your aspirations, what motivates you..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
