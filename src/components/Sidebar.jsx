// src/components/Sidebar.jsx
import React from 'react';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const items = [
    { icon: <HomeIcon className="h-5 w-5" />, label: 'Сводка' },
    { icon: <UserGroupIcon className="h-5 w-5" />, label: 'Сотрудники' },
    { icon: <CalendarIcon className="h-5 w-5" />, label: 'Графики смен' },
    { icon: <ChartBarIcon className="h-5 w-5" />, label: 'Отчёты' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">TargControl</h2>
      <nav className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
            {it.icon}
            <span className="ml-3">{it.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
