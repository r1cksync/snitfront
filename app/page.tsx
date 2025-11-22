'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Brain, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Brain className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Flow State Facilitator
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12">
            AI-driven focus monitoring that helps you enter and maintain deep work states
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <FeatureCard
            icon={<Brain className="w-12 h-12" />}
            title="AI Flow Detection"
            description="Real-time analysis of your work patterns to detect when you enter flow state"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Distraction Protection"
            description="Smart notification blocking and environment locking during deep work"
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="Smart Interventions"
            description="Micro-breaks and exercises timed perfectly to extend your focus"
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12" />}
            title="Performance Analytics"
            description="Detailed insights on your flow patterns and productivity trends"
          />
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto space-y-12">
            <Step
              number="1"
              title="Start Your Session"
              description="Begin monitoring your work patterns with a single click. Our AI starts learning your focus habits immediately."
            />
            <Step
              number="2"
              title="Enter Flow State"
              description="As you work, the system detects when you enter flow through typing patterns, mouse activity, and focus consistency."
            />
            <Step
              number="3"
              title="Protected Focus"
              description="Once flow is detected, distractions are automatically blocked and your environment is optimized for deep work."
            />
            <Step
              number="4"
              title="Smart Recovery"
              description="When fatigue is detected, receive timely micro-interventions to recharge and return to flow stronger."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to maximize your potential?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who have transformed their focus and productivity
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: any) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{description}</p>
      </div>
    </div>
  );
}
