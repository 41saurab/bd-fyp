import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Building2, Shield, Heart, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-bold text-stone-800 mb-4">How BloodBridge Works</h1>
        <p className="text-stone-500 font-body text-lg max-w-2xl mx-auto">A complete ecosystem connecting blood donors, medical organizations, and our admin team to ensure safe and efficient blood donation.</p>
      </div>

      {/* For Donors */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Droplets className="w-5 h-5 text-crimson" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-800">For Donors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Register & Complete Profile', desc: 'Sign up with your blood type, city, and contact info. Take 2 minutes.' },
            { step: '2', title: 'Get Notified', desc: 'Receive email alerts for campaigns and emergencies matching your blood type in your area.' },
            { step: '3', title: 'Register for Campaigns', desc: 'Browse and register for donation drives organized by hospitals and blood banks.' },
            { step: '4', title: 'Donate & Earn Rewards', desc: 'Donate blood, earn points, unlock badges, and see your impact on the leaderboard.' },
          ].map(s => (
            <div key={s.step} className="card p-5 flex items-start gap-4">
              <div className="w-8 h-8 bg-crimson text-white rounded-full flex items-center justify-center text-sm font-bold font-sans flex-shrink-0">{s.step}</div>
              <div>
                <h3 className="font-display font-semibold text-stone-800 mb-1">{s.title}</h3>
                <p className="text-sm text-stone-500 font-body">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Organizations */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-800">For Organizations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Register with Documents', desc: 'Submit your legal registration documents for admin verification.' },
            { step: '2', title: 'Get Approved', desc: 'Our admin team reviews your documents within 24-48 hours and notifies you by email.' },
            { step: '3', title: 'Create Campaigns', desc: 'Set up donation drives with dates, venue, target blood types, and notify donors automatically.' },
            { step: '4', title: 'Post Emergency Requests', desc: 'Instantly notify compatible donors for urgent blood needs. Track respondents in real-time.' },
          ].map(s => (
            <div key={s.step} className="card p-5 flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold font-sans flex-shrink-0">{s.step}</div>
              <div>
                <h3 className="font-display font-semibold text-stone-800 mb-1">{s.title}</h3>
                <p className="text-sm text-stone-500 font-body">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points system */}
      <div className="card p-8 bg-gradient-to-r from-blood-50 to-red-50 border-red-100 mb-10">
        <h2 className="text-2xl font-display font-bold text-stone-800 mb-6">Points & Badges System</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[['🩸', 'First Drop', '1 donation'], ['💪', 'Life Saver', '5 donations'], ['🦸', 'Hero', '10 donations'], ['🏆', 'Champion', '25 donations'], ['⭐', 'Legend', '50 donations']].map(([icon, badge, req]) => (
            <div key={badge} className="text-center card p-4">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="font-sans font-semibold text-stone-700 text-sm">{badge}</p>
              <p className="text-xs text-stone-400 font-sans">{req}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-500 font-body mt-5">Each donation earns 10 points by default. Organizations can set higher point rewards for special campaigns.</p>
      </div>

      <div className="text-center">
        <Link to="/register/donor" className="btn-primary text-base px-10 py-3">Start Saving Lives Today →</Link>
      </div>
    </div>
  );
}
