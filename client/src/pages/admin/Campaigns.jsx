import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/campaigns').then(r => setCampaigns(r.data || [])).finally(() => setLoading(false));
  }, []);

  const statusColor = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-stone-100 text-stone-500', cancelled: 'bg-red-100 text-red-600' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Campaign Overview</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Campaign', 'Organization', 'Blood Types', 'Progress', 'Dates', 'City', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-sans font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-stone-100 rounded animate-pulse"></div></td></tr>) :
              campaigns.map(c => (
                <tr key={c._id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-sans font-medium text-stone-700 text-sm">{c.title}</p>
                    <p className="font-sans text-xs text-stone-400">{c.registeredDonors?.length || 0} registered</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-500">{c.organization?.orgName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.targetBloodTypes?.slice(0,3).map(bt => <BloodTypeBadge key={bt} type={bt} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-sans font-semibold text-crimson">{c.collectedUnits}/{c.targetUnits}</p>
                    <div className="w-16 h-1.5 bg-stone-100 rounded-full mt-1">
                      <div className="h-full bg-crimson rounded-full" style={{ width: `${Math.min(100,(c.collectedUnits/c.targetUnits)*100)}%` }}></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400 font-sans">
                    <p>{format(new Date(c.startDate), 'MMM d')}</p>
                    <p>→ {format(new Date(c.endDate), 'MMM d, yyyy')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-500">{c.city}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${statusColor[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
        {campaigns.length === 0 && !loading && <div className="text-center py-12 text-stone-400 font-sans">No campaigns found</div>}
      </div>
    </div>
  );
}
