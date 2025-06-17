import React, { useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DepartmentContext } from '../contexts/DepartmentContext';
import ScheduleView from '../components/schedule/ScheduleView';
import { apiClient } from '../api/client';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export default function SchedulePage() {
  const { current: deptId, departments, setCurrent } = useContext(DepartmentContext);
  const [view, setView] = useState('month'); // 'month' или 'week'
  const [baseDate, setBaseDate] = useState(new Date());

  // Навигация назад
  const goPrev = useCallback(() => {
    setBaseDate(d => view === 'month' ? subMonths(d, 1) : subWeeks(d, 1));
  }, [view]);
  // Навигация вперёд
  const goNext = useCallback(() => {
    setBaseDate(d => view === 'month' ? addMonths(d, 1) : addWeeks(d, 1));
  }, [view]);

  // Загрузка смен
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts', deptId, view, baseDate.toISOString()],
    queryFn: () =>
      apiClient
        .get(`/shifts?department=${deptId}`)
        .then(r => r.data),
    enabled: !!deptId,
  });

  // Загрузка сотрудников
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', deptId],
    queryFn: () =>
      apiClient
        .get(`/employees?department=${deptId}`)
        .then(r => r.data),
    enabled: !!deptId,
  });

  // Загрузка типов смен (если требуется внутри ScheduleView)
  const { data: shiftTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['shiftTypes', deptId],
    queryFn: () =>
      apiClient
        .get(`/shift-types?department=${deptId}`)
        .then(r => r.data),
    enabled: !!deptId,
  });

  if (loadingShifts || loadingEmployees || loadingTypes) {
    return <div className="p-4">Loading…</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Отдел и переключатель вида */}
      <div className="flex items-center justify-between bg-white p-4 border-b">
        <div className="flex items-center space-x-4">
          <label className="font-medium">Отдел:</label>
          <select
            value={deptId ?? ''}
            onChange={e => setCurrent(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value="" disabled>— выберите отдел —</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded ${view==='month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Месяц
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded ${view==='week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Неделя
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={goPrev} className="px-2">‹</button>
          <span className="font-medium">
            {view === 'month'
              ? format(baseDate, 'LLLL yyyy', { locale: ru })
              : `${format(startOfWeek(baseDate, { locale: ru }), 'dd MMM')} – ${format(
                  endOfWeek(baseDate, { locale: ru }),
                  'dd MMM'
                )}`}
          </span>
          <button onClick={goNext} className="px-2">›</button>
        </div>
      </div>

      {/* Календарь */}
      <div className="flex-1 overflow-auto">
        <ScheduleView
          shifts={shifts}
          employees={employees}
          shiftTypes={shiftTypes}
          view={view}
          baseDate={baseDate}
        />
      </div>
    </div>
  );
}