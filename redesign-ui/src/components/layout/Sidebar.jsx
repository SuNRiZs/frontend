import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/schedule', label: 'Расписание' },
  { to: '/employees', label: 'Сотрудники' },
  { to: '/shift-types', label: 'Типы смен' },
  { to: '/vacations', label: 'Отпуска' },
];

export default function Sidebar() {
  return (
    <div className="w-56 bg-white border-r">
      <nav className="mt-4">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 mb-1 hover:bg-gray-100 ${
                isActive ? 'font-semibold bg-gray-200' : ''
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}