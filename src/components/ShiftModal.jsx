// src/components/ShiftModal.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

export default function ShiftModal({ isOpen, onClose, date, employees, shiftTypes, onSave }) {
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    axios.get(`/api/schedules/?month=${date.slice(0,7)}`)
      .then(({ data }) => {
        const init = {};
        data.forEach(empEntry => {
          empEntry.shifts.forEach(s => {
            if (s.date === date) {
              init[empEntry.employeeId] = s.shiftTypeId;
            }
          });
        });
        setSelections(init);
      });
  }, [isOpen, date]);

  const handleChange = (empId, shiftTypeId) => {
    setSelections(prev => ({ ...prev, [empId]: shiftTypeId }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(selections).map(([empId, shiftTypeId]) => ({
      date,
      employeeId: empId,
      shiftTypeId
    }));
    axios.post('/api/schedules/', payload)
      .then(() => {
        onSave();
        onClose();
      });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child> {/* фон */}
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <span className="inline-block h-screen align-middle">&#8203;</span>
          <Transition.Child>
            <Dialog.Panel className="inline-block w-full max-w-md p-6 bg-white rounded shadow">
              <Dialog.Title>Смены на {date}</Dialog.Title>
              <div className="mt-4 space-y-2">
                {employees.map(emp => (
                  <div key={emp.id} className="flex justify-between items-center">
                    <span>{emp.name}</span>
                    <select
                      value={selections[emp.id] || ''}
                      onChange={e => handleChange(emp.id, e.target.value)}
                    >
                      <option value="">–</option>
                      {shiftTypes.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button onClick={onClose}>Отмена</button>
                <button onClick={handleSubmit}>Сохранить</button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
