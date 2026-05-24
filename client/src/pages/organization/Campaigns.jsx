import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';

export default function OrgCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/campaigns/org/mine').then(r => setCampaigns(r.data || [])).finally(() => setLoading(false));
  }, []);

  const statusColor = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-stone-100 text-stone-500', cancelled: 'bg-red-100 text-red-600' };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-800">My Campaigns</h1>
        <Link to="/organization/campaigns/create" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Campaign</Link>
      </div>
      {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse"></div>)}</div> :
        campaigns.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-body text-lg mb-4">No campaigns yet</p>
            <Link to="/organization/campaigns/create" className="btn-primary">Create Your First Campaign</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(c => (
              <div key={c._id} className="card p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-crimson/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-crimson" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-stone-800 truncate">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium flex-shrink-0 ${statusColor[c.status]}`}>{c.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-400 font-sans">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(c.startDate), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.registeredDonors?.length || 0} donors</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.targetBloodTypes?.slice(0,4).map(bt => <BloodTypeBadge key={bt} type={bt} />)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-display font-bold text-crimson">{c.collectedUnits}</p>
                  <p className="text-xs text-stone-400 font-sans">of {c.targetUnits} units</p>
                  <div className="w-24 h-1.5 bg-stone-100 rounded-full mt-2">
                    <div className="h-full bg-crimson rounded-full" style={{ width: `${Math.min(100, (c.collectedUnits/c.targetUnits)*100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
