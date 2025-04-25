import React, { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from '../api'

export default function EmployeeModal({ isOpen, onClose, employee, onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    telegram_id: '',
    department: '',
    position: '',
    birth_date: '',
    extra_info: ''
  })
  const [departments, setDepartments] = useState([])

  useEffect(()=>{
    axios.get('/departments/').then(r=>setDepartments(r.data))
  },[])

  useEffect(()=>{
    if(employee) setForm(employee)
    else setForm(f=>({
      ...f, full_name:'', phone:'', telegram_id:'', department:'', position:'', birth_date:'', extra_info:''
    }))
  },[employee])

  const change = (k,v)=> setForm(f=>({...f,[k]:v}))

  const submit = ()=> onSave(form)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-50"
            leave="ease-in duration-200" leaveFrom="opacity-50" leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <div className="bg-white rounded p-6 w-full max-w-lg">
              <Dialog.Title className="text-lg font-medium mb-4">
                {employee ? 'Редактировать' : 'Новый'} сотрудник
              </Dialog.Title>

              <div className="space-y-3">
                <input
                  type="text" placeholder="ФИО"
                  className="w-full border px-2 py-1"
                  value={form.full_name}
                  onChange={e=>change('full_name', e.target.value)}
                />
                <input
                  type="text" placeholder="Телефон"
                  className="w-full border px-2 py-1"
                  value={form.phone}
                  onChange={e=>change('phone', e.target.value)}
                />
                <select
                  className="w-full border px-2 py-1"
                  value={form.department}
                  onChange={e=>change('department', e.target.value)}
                >
                  <option value="">— Отдел —</option>
                  {departments.map(d=>(
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="w-full border px-2 py-1"
                  value={form.birth_date||''}
                  onChange={e=>change('birth_date', e.target.value)}
                />
                <textarea
                  placeholder="Доп. информация"
                  className="w-full border px-2 py-1"
                  rows={3}
                  value={form.extra_info||''}
                  onChange={e=>change('extra_info', e.target.value)}
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
