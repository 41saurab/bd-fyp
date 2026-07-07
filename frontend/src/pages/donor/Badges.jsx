import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ALL_BADGES = [
  { name: 'First Drop', icon: '🩸', required: 1, desc: 'Complete your first blood donation' },
  { name: 'Life Saver', icon: '💪', required: 5, desc: 'Donate blood 5 times' },
  { name: 'Hero', icon: '🦸', required: 10, desc: 'Donate blood 10 times' },
  { name: 'Champion', icon: '🏆', required: 25, desc: 'Donate blood 25 times' },
  { name: 'Legend', icon: '⭐', required: 50, desc: 'Donate blood 50 times — the ultimate hero' },
];

export default function DonorBadges() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/donors/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const earned = stats?.badges || [];
  const count = stats?.totalDonations || 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-2">My Badges</h1>
      <p className="text-stone-500 font-body mb-8">Unlock achievements through your donations</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ALL_BADGES.map(b => {
          const isEarned = earned.includes(b.name);
          const progress = Math.min(100, (count / b.required) * 100);
          return (
            <div key={b.name} className={`card p-6 transition-all ${isEarned ? 'ring-2 ring-yellow-300 bg-yellow-50/50' : 'opacity-70'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-4xl ${!isEarned && 'grayscale opacity-40'}`}>{b.icon}</div>
                <div>
                  <p className={`font-display font-bold ${isEarned ? 'text-yellow-700' : 'text-stone-500'}`}>{b.name}</p>
                  {isEarned && <span className="text-xs text-green-600 font-sans font-medium">✓ Earned</span>}
                </div>
              </div>
              <p className="text-sm text-stone-500 font-body mb-4">{b.desc}</p>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isEarned ? 'bg-yellow-400' : 'bg-stone-300'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-1">{Math.min(count, b.required)}/{b.required} donations</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
