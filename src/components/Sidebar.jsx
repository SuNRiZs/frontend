// src/components/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'   // ← теперь можно использовать NavLink
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const items = [
    { to: '/',        icon: <HomeIcon />,      label: 'Сводка' },
    { to: '/employees', icon: <UserGroupIcon />, label: 'Сотрудники' },
    { to: '/schedule',  icon: <CalendarIcon/>,  label: 'Графики смен' },
    { to: '/reports',   icon: <ChartBarIcon/>,  label: 'Отчёты' },
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Ай Системс</h2>
      <nav className="space-y-2">
        {items.map((it, i) => (
          <NavLink
            key={i}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            {React.cloneElement(it.icon, { className: 'h-5 w-5' })}
            <span className="ml-3">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
