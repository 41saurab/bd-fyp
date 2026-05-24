import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Zap, Plus, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OrgEmergency() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    axios.get('/api/emergency/org/mine').then(r => setRequests(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const fulfill = async (id) => {
    try {
      await axios.patch(`/api/emergency/${id}/fulfill`);
      toast.success('Marked as fulfilled');
      fetchRequests();
    } catch { toast.error('Failed'); }
  };

  const urgencyColor = { critical: 'border-red-500 bg-red-50', urgent: 'border-orange-400 bg-orange-50', moderate: 'border-yellow-400 bg-yellow-50' };
  const statusColor = { active: 'bg-green-100 text-green-700', fulfilled: 'bg-stone-100 text-stone-500', expired: 'bg-red-100 text-red-600', cancelled: 'bg-stone-100 text-stone-500' };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-800">Emergency Requests</h1>
        <Link to="/organization/emergency/create" className="btn-primary flex items-center gap-2"><Zap className="w-4 h-4" /> New Request</Link>
      </div>
      {loading ? <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse"></div>)}</div> :
        requests.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-body text-lg mb-4">No emergency requests</p>
            <Link to="/organization/emergency/create" className="btn-primary">Post Emergency Request</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className={`card border-l-4 p-5 flex items-center gap-4 ${urgencyColor[r.urgencyLevel] || urgencyColor.urgent}`}>
                <div className="w-14 h-14 bg-crimson rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold font-sans text-lg">{r.bloodType}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-stone-800">{r.patientName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${statusColor[r.status]}`}>{r.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-bold uppercase ${r.urgencyLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>{r.urgencyLevel}</span>
                  </div>
                  <p className="text-sm text-stone-500 font-sans">{r.reason}</p>
                  <p className="text-xs text-stone-400 font-sans mt-1">{r.respondents?.length || 0} donors responding · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-display font-bold text-crimson">{r.unitsNeeded}</p>
                  <p className="text-xs text-stone-400 font-sans">units needed</p>
                  {r.status === 'active' && (
                    <button onClick={() => fulfill(r._id)} className="flex items-center gap-1 text-xs text-green-600 font-sans mt-2 hover:underline">
                      <CheckCircle className="w-3 h-3" /> Mark Fulfilled
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
