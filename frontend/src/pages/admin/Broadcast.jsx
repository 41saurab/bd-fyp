import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function AdminBroadcast() {
  const [result, setResult] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/admin/broadcast', data);
      toast.success(res.data.message);
      setResult(res.data.message);
      reset();
    } catch { toast.error('Broadcast failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Send className="w-5 h-5 text-blue-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-stone-800">Broadcast Message</h1>
      </div>
      <div className="card p-8">
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-sans text-sm">
            ✅ {result}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Subject *</label>
            <input {...register('subject', { required: 'Required' })} className="input-field" placeholder="Message subject" />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea {...register('message', { required: 'Required' })} rows={6} className="input-field resize-none" placeholder="Write your message to all donors..." />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-sans">
            ⚠️ This message will be sent to ALL registered donors via email and in-app notification.
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send to All Donors'}
          </button>
        </form>
      </div>
    </div>
  );
}
