import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Award, Calendar, Building2 } from 'lucide-react';

export default function DonorDonations() {
  const { profile } = useAuth();
  const [fullProfile, setFullProfile] = useState(null);

  useEffect(() => {
    axios.get('/api/donors/profile').then(r => setFullProfile(r.data)).catch(() => {});
  }, []);

  const history = fullProfile?.donationHistory || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Donation History</h1>
      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🩸</div>
          <p className="text-stone-500 font-body text-lg">No donations yet</p>
          <p className="text-stone-400 font-sans text-sm mt-2">Register for a campaign to start your journey!</p>
        </div>
      ) : (
        <div className="card divide-y divide-stone-50">
          {history.slice().reverse().map((d, i) => (
            <div key={i} className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🩸</span>
              </div>
              <div className="flex-1">
                <p className="font-sans font-medium text-stone-700">{d.campaign?.title || 'Blood Donation'}</p>
                <p className="text-sm text-stone-400 font-sans">{d.organization?.orgName || 'Organization'}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-400 font-sans">
                  <Calendar className="w-3 h-3" />
                  {d.date ? format(new Date(d.date), 'MMM d, yyyy') : 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 font-sans font-semibold text-sm">
                  <Award className="w-4 h-4" />
                  +{d.pointsEarned} pts
                </div>
                <p className="text-xs text-stone-400 font-sans">{d.units} unit(s)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
