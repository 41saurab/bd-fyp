import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function AdminEmergency() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/emergency').then(r => setRequests(r.data || [])).finally(() => setLoading(false));
  }, []);

  const urgencyColor = { critical: 'bg-red-100 text-red-700', urgent: 'bg-orange-100 text-orange-700', moderate: 'bg-yellow-100 text-yellow-700' };
  const statusColor = { active: 'bg-green-100 text-green-700', fulfilled: 'bg-stone-100 text-stone-500', expired: 'bg-red-100 text-red-600' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Emergency Requests Overview</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Patient', 'Blood Type', 'Organization', 'City', 'Urgency', 'Respondents', 'Posted', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-sans font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-stone-100 rounded animate-pulse"></div></td></tr>) :
              requests.map(r => (
                <tr key={r._id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-sans font-medium text-stone-700 text-sm">{r.patientName}</p>
                    <p className="font-sans text-xs text-stone-400 truncate max-w-32">{r.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-crimson font-sans text-sm bg-red-50 px-2 py-0.5 rounded-full">{r.bloodType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-500">{r.organization?.orgName || '-'}</td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-500">{r.city}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium capitalize ${urgencyColor[r.urgencyLevel]}`}>{r.urgencyLevel}</span></td>
                  <td className="px-4 py-3 text-sm font-bold font-sans text-green-600">{r.respondents?.length || 0}</td>
                  <td className="px-4 py-3 text-xs text-stone-400 font-sans">{format(new Date(r.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${statusColor[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
        {requests.length === 0 && !loading && <div className="text-center py-12 text-stone-400 font-sans">No emergency requests</div>}
      </div>
    </div>
  );
}
