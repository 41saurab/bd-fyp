import React from 'react';
import clsx from 'clsx';

const btColors = {
  'A+': 'bg-red-100 text-red-700 border-red-200',
  'A-': 'bg-red-200 text-red-800 border-red-300',
  'B+': 'bg-blue-100 text-blue-700 border-blue-200',
  'B-': 'bg-blue-200 text-blue-800 border-blue-300',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-purple-200 text-purple-800 border-purple-300',
  'O+': 'bg-orange-100 text-orange-700 border-orange-200',
  'O-': 'bg-orange-200 text-orange-800 border-orange-300',
  'All': 'bg-stone-100 text-stone-600 border-stone-200',
};

export default function BloodTypeBadge({ type, size = 'sm' }) {
  return (
    <span className={clsx(
      'inline-flex items-center font-semibold font-sans border rounded-full',
      btColors[type] || btColors['All'],
      size === 'lg' ? 'text-base px-3 py-1' : 'text-xs px-2 py-0.5'
    )}>
      {type}
    </span>
  );
}
