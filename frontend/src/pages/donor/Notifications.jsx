import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const typeStyles = { info: 'bg-blue-50 border-blue-200', success: 'bg-green-50 border-green-200', warning: 'bg-yellow-50 border-yellow-200', emergency: 'bg-red-50 border-red-200', campaign: 'bg-purple-50 border-purple-200', approval: 'bg-green-50 border-green-200', badge: 'bg-yellow-50 border-yellow-200' };
const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', emergency: '🚨', campaign: '🩸', approval: '✅', badge: '🏆' };

export default function DonorNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/notifications').then(r => setNotifs(r.data || [])).finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await axios.patch('/api/notifications/mark-all-read');
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-800">Notifications</h1>
          {unread > 0 && <p className="text-sm text-stone-500 font-sans mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-2 text-sm text-crimson hover:underline font-sans">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse"></div>)}</div> :
        notifs.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-body">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map(n => (
              <div key={n._id} className={clsx('card p-4 border flex items-start gap-3', typeStyles[n.type] || typeStyles.info, !n.read && 'ring-1 ring-offset-1')}>
                <span className="text-xl flex-shrink-0">{typeIcons[n.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-stone-700 text-sm">{n.title}</p>
                  <p className="font-sans text-stone-500 text-xs mt-0.5">{n.message}</p>
                  <p className="text-xs text-stone-400 font-sans mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-crimson rounded-full flex-shrink-0 mt-1.5"></span>}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
