// src/components/ShiftModal.jsx
import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from 'axios'

export default function ShiftModal({
  isOpen,
  onClose,
  date,
  employees = [],
  shiftTypes = [],
  onSave
}) {
  const [selections, setSelections] = useState({})

  useEffect(() => {
    if (!isOpen) return
    // загрузить текущие смены на эту дату
    axios.get(`/api/schedules/?month=${date.slice(0,7)}`)
      .then(({ data }) => {
        const init = {}
        data.forEach(({ employee, shifts }) => {
          init[employee.id] = ''
          shifts.forEach(s => {
            if (s.date === date) init[employee.id] = s.shift_type
          })
        })
        setSelections(init)
      })
  }, [isOpen, date])

  const handleChange = (empId, val) => {
    setSelections(prev => ({ ...prev, [empId]: val }))
  }

  const handleSubmit = () => {
    const entries = Object.entries(selections).map(
      ([empId, stName]) => ({
        employee: +empId,
        date,
        shift_type: shiftTypes.find(t => t.name === stName)?.id || null
      })
    )
    onSave(entries)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* подложка */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="ease-in duration-200"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black" />
          </Transition.Child>

          {/* само окно */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded p-6 w-full max-w-md mx-auto">
              <Dialog.Title className="text-lg font-medium mb-4">
                Редактировать смены: {date}
              </Dialog.Title>
              <div className="space-y-3 max-h-80 overflow-auto">
                {employees.map(emp => (
                  <div key={emp.id} className="flex justify-between items-center">
                    <span>{emp.full_name}</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={selections[emp.id] || ''}
                      onChange={e => handleChange(emp.id, e.target.value)}
                    >
                      <option value="">—</option>
                      {shiftTypes.map(st => (
                        <option key={st.id} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSubmit}
                >
                  Сохранить
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
