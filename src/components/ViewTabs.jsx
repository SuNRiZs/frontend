// src/components/ViewTabs.jsx
import React from 'react';

export default function ViewTabs({ current, onChange }) {
  const tabs = [
    { key: 'day',   label: 'День' },
    { key: 'week',  label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
  ];

  return (
    <div className="flex space-x-2">
      {tabs.map(t => (
        <button
          key={t.key}
          className={
            'px-4 py-1 rounded ' +
            (current === t.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300')
          }
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
