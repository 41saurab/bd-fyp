import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-16 h-16 fill-crimson animate-heartbeat" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/>
          </svg>
        </div>
        <p className="font-display text-stone-500 text-lg">BloodBridge</p>
        <p className="text-sm text-stone-400 font-sans mt-1">Connecting hearts, saving lives...</p>
      </div>
    </div>
  );
}
