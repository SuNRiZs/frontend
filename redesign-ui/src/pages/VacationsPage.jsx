import React from 'react';
import VacationCalendar from '../components/vacations/VacationCalendar';

export default function VacationsPage() {
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Отпуска</h2>
      <VacationCalendar />
    </div>
  );
}