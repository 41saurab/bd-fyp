import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone } from 'lucide-react';

const BloodDropIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-crimson flex items-center justify-center">
                <BloodDropIcon />
              </div>
              <span className="font-display font-bold text-xl text-white">Blood<span className="text-blood-400">Bridge</span></span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed font-sans">
              Connecting blood donors with organizations to save lives every day.
            </p>
            <div className="mt-6 flex items-center gap-2 text-blood-400">
              <Heart className="w-4 h-4 fill-current animate-pulse-slow" />
              <span className="text-xs font-sans">Every drop counts</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">For Donors</h4>
            <ul className="space-y-2 text-sm font-sans">
              {[['Register as Donor', '/register/donor'], ['Find Campaigns', '/campaigns'], ['Emergency Requests', '/emergency'], ['Leaderboard', '/leaderboard'], ['How It Works', '/how-it-works']].map(([label, to]) => (
                <li key={to}><Link to={to} className="hover:text-blood-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">For Organizations</h4>
            <ul className="space-y-2 text-sm font-sans">
              {[['Register Organization', '/register/organization'], ['View Organizations', '/organizations'], ['Login', '/login']].map(([label, to]) => (
                <li key={to}><Link to={to} className="hover:text-blood-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm font-sans">
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-blood-400" />
                <span>support@bloodbridge.com</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <Phone className="w-4 h-4 text-blood-400" />
                <span>+1 (800) BLOOD-BD</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs text-stone-500 font-sans">Blood types we connect:</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                  <span key={bt} className="text-xs px-2 py-0.5 bg-stone-800 text-stone-300 rounded-full font-sans">{bt}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-500 font-sans">© {new Date().getFullYear()} BloodBridge. Saving lives together.</p>
          <p className="text-xs text-stone-500 font-sans">Built with ❤️ to connect donors and save lives</p>
        </div>
      </div>
    </footer>
  );
}
