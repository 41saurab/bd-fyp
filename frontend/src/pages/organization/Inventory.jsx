import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function OrgInventory() {
  const { profile } = useAuth();
  const [inventory, setInventory] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.bloodInventory) setInventory(profile.bloodInventory);
  }, [profile]);

  const update = async () => {
    setSaving(true);
    try {
      await axios.patch('/api/organizations/inventory', inventory);
      toast.success('Inventory updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-3">Blood Inventory</h1>
      <p className="text-stone-500 font-body mb-8">Track current blood unit availability in your facility</p>
      <div className="card p-8">
        <div className="grid grid-cols-2 gap-5 mb-8">
          {BLOOD_TYPES.map(bt => {
            const units = inventory[bt] || 0;
            return (
              <div key={bt} className={`p-4 rounded-xl border-2 transition-all ${units === 0 ? 'border-red-200 bg-red-50' : units < 5 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-sans text-stone-800 text-lg">{bt}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${units === 0 ? 'bg-red-200 text-red-700' : units < 5 ? 'bg-yellow-200 text-yellow-700' : 'bg-green-200 text-green-700'}`}>
                    {units === 0 ? 'Empty' : units < 5 ? 'Low' : 'Adequate'}
                  </span>
                </div>
                <input
                  type="number" min="0"
                  value={units}
                  onChange={e => setInventory(inv => ({ ...inv, [bt]: parseInt(e.target.value) || 0 }))}
                  className="input-field text-center text-xl font-display font-bold"
                />
                <p className="text-xs text-center text-stone-400 font-sans mt-1">units</p>
              </div>
            );
          })}
        </div>
        <button onClick={update} disabled={saving} className="btn-primary w-full py-3 text-base">
          {saving ? 'Saving...' : 'Update Inventory'}
        </button>
      </div>
    </div>
  );
}
