import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import ShiftModal from './ShiftModal';

export default function CalendarView() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [employees, setEmployees] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');

  // загрузка списков департаментов и типов смен
  useEffect(() => {
    axios.get('/api/departments/').then(res => setDepartments(res.data));
    axios.get('/api/shift-types/').then(res => setShiftTypes(res.data));
  }, []);

  // загрузка сотрудников при смене отдела
  useEffect(() => {
    if (!selectedDept) return;
    axios.get(`/api/employees/?department=${selectedDept}`)
         .then(res => setEmployees(res.data));
  }, [selectedDept]);

  // загрузка событий при смене месяца или отдела
  useEffect(() => {
    const monthStr = currentMonth.toISOString().slice(0,7);
    const params = new URLSearchParams({ month: monthStr });
    if (selectedDept) params.append('department', selectedDept);
    axios.get(`/api/schedules/?${params.toString()}`)
      .then(({ data }) => {
        const evts = data.flatMap(empEntry =>
          empEntry.shifts.map(s => ({
            id: `${empEntry.employee.id}-${s.date}`,
            title: empEntry.employee.full_name,
            start: s.date,
            backgroundColor: shiftTypes.find(st => st.name === s.shift_type)?.color,
          }))
        );
        setEvents(evts);
      });
  }, [currentMonth, selectedDept, shiftTypes]);

  const handleDatesSet = arg => setCurrentMonth(arg.start);

  const handleDateClick = info => {
    setModalDate(info.dateStr);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    // после save календарь обновится автоматически через useEffect
  };

  return (
    <>
      <div className="flex items-center mb-4 space-x-2">
        <label>Отдел:</label>
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Все</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        datesSet={handleDatesSet}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="auto"
      />
      <ShiftModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={modalDate}
        employees={employees}
        shiftTypes={shiftTypes}
        onSave={handleModalSave}
      />
    </>
  );
}
