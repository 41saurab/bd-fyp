import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';
import { format } from 'date-fns';

const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodType: '', city: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDonors = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, ...filters });
    axios.get(`/api/admin/donors?${params}`)
      .then(r => { setDonors(r.data.donors || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDonors(); }, [page, filters]);

  const toggleUser = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/toggle`);
      toast.success('User status updated');
      fetchDonors();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Donor Management</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select className="input-field w-auto" value={filters.bloodType} onChange={e => setFilters(f => ({ ...f, bloodType: e.target.value }))}>
          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt || 'All Blood Types'}</option>)}
        </select>
        <input className="input-field w-48" placeholder="Filter by city..." value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
        <span className="text-sm text-stone-500 font-sans self-center">{total} donors found</span>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Donor', 'Blood Type', 'City', 'Donations', 'Points', 'Badges', 'Joined', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-sans font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? [...Array(8)].map((_,i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-stone-100 rounded animate-pulse"></div></td></tr>) :
              donors.map(d => (
                <tr key={d._id} className={`hover:bg-stone-50 transition-colors ${!d.user?.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-sans font-medium text-stone-700 text-sm">{d.user?.name}</p>
                    <p className="font-sans text-xs text-stone-400">{d.user?.email}</p>
                  </td>
                  <td className="px-4 py-3"><BloodTypeBadge type={d.bloodType} /></td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-500">{d.city || d.user?.city || '-'}</td>
                  <td className="px-4 py-3 text-sm font-sans text-stone-700 font-semibold">{d.totalDonations}</td>
                  <td className="px-4 py-3 text-sm font-sans text-green-600 font-semibold">{d.points}</td>
                  <td className="px-4 py-3 text-sm font-sans">{d.badges?.join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-xs text-stone-400 font-sans">{d.user?.createdAt ? format(new Date(d.user.createdAt), 'MMM d, yyyy') : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleUser(d.user?._id)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                      {d.user?.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-stone-400" />}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {donors.length === 0 && !loading && <div className="text-center py-12 text-stone-400 font-sans">No donors found</div>}
      </div>
      {total > 15 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(total / 15))].map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)}
              className={`w-9 h-9 rounded-lg text-sm font-sans ${page === i+1 ? 'bg-crimson text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-crimson'}`}>
              {i+1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
