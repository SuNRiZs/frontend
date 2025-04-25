import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from '../api'

export default function VacationModal({
  isOpen,
  onClose,
  vacation,     // { id, employee, start_date, end_date } или null
  employees,    // справочник сотрудников [{id, full_name},...]
  onSave        // callback(data)
}) {
  const [form, setForm] = useState({
    employee: '',
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    if (vacation) {
      setForm({
        employee: vacation.employee,
        start_date: vacation.start_date,
        end_date: vacation.end_date
      })
    } else {
      setForm({ employee:'', start_date:'', end_date:'' })
    }
  }, [vacation])

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = () => onSave(form)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-50"
            leave="ease-in duration-200"  leaveFrom="opacity-50" leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <div className="bg-white rounded p-6 w-full max-w-sm">
              <Dialog.Title className="text-lg font-medium mb-4">
                {vacation ? 'Редактировать отпуск' : 'Новый отпуск'}
              </Dialog.Title>

              <div className="space-y-3">
                <select
                  className="w-full border px-2 py-1"
                  value={form.employee}
                  onChange={e => change('employee', e.target.value)}
                >
                  <option value="">— Сотрудник —</option>
                  {employees.map(e=>(
                    <option key={e.id} value={e.id}>{e.full_name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="w-full border px-2 py-1"
                  value={form.start_date}
                  onChange={e => change('start_date', e.target.value)}
                />
                <input
                  type="date"
                  className="w-full border px-2 py-1"
                  value={form.end_date}
                  onChange={e => change('end_date', e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                  Отмена
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>
                  Сохранить
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
