import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Award, Droplets, MapPin } from 'lucide-react';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';

const BADGE_ICONS = { 'First Drop': '🩸', 'Life Saver': '💪', 'Hero': '🦸', 'Champion': '🏆', 'Legend': '⭐' };
const RANK_STYLES = ['bg-yellow-100 text-yellow-700 border-yellow-300', 'bg-stone-100 text-stone-600 border-stone-300', 'bg-orange-100 text-orange-600 border-orange-300'];

export default function Leaderboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/donors/leaderboard').then(r => setDonors(r.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-4xl font-display font-bold text-stone-800 mb-2">Donor Leaderboard</h1>
        <p className="text-stone-500 font-body">Our top heroes ranked by donation points</p>
      </div>

      {/* Top 3 */}
      {donors.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {[donors[1], donors[0], donors[2]].map((d, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={d._id} className={`flex-1 max-w-36 text-center`}>
                <div className="mb-2">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 font-sans font-bold text-lg ${RANK_STYLES[rank - 1]}`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                  </div>
                  <p className="text-sm font-sans font-semibold text-stone-700 mt-2 truncate">{d.user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-stone-400 font-sans">{d.points} pts</p>
                </div>
                <div className={`${heights[rank - 1]} rounded-t-xl flex items-center justify-center ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-stone-300' : 'bg-orange-300'}`}>
                  <span className="text-2xl font-display font-bold text-white">#{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="card divide-y divide-stone-50">
        {loading ? [...Array(10)].map((_, i) => <div key={i} className="p-4 animate-pulse"><div className="h-10 bg-stone-100 rounded"></div></div>) :
          donors.map((d, i) => (
            <div key={d._id} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans border ${i < 3 ? RANK_STYLES[i] : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center flex-shrink-0">
                <span className="text-crimson font-bold font-sans text-sm">{d.bloodType}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-stone-700 truncate">{d.user?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Droplets className="w-3 h-3 text-crimson" />
                  <span className="text-xs text-stone-400 font-sans">{d.totalDonations} donations</span>
                  {d.user?.city && (
                    <>
                      <span className="text-stone-300">·</span>
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span className="text-xs text-stone-400 font-sans">{d.user.city}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {d.badges?.slice(-3).map(b => <span key={b} title={b} className="text-base">{BADGE_ICONS[b] || '🏅'}</span>)}
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-crimson">{d.points}</p>
                <p className="text-xs text-stone-400 font-sans">points</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
