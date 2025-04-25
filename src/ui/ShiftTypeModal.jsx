import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from '../api'

export default function ShiftTypeModal({ isOpen, onClose, shiftType, onSave }) {
  const [form, setForm] = useState({
    name: '', start_time:'', end_time:'', color:'#000000'
  })

  useEffect(()=>{
    if(shiftType) setForm(shiftType)
    else setForm({name:'', start_time:'', end_time:'', color:'#000000'})
  },[shiftType])

  const change = (k,v)=> setForm(f=>({...f,[k]:v}))

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-50"
            leave="ease-in duration-200" leaveFrom="opacity-50" leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black"/>
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <div className="bg-white rounded p-6 w-full max-w-sm">
              <Dialog.Title className="text-lg font-medium mb-4">
                {shiftType ? 'Редактировать' : 'Новый'} тип смены
              </Dialog.Title>
              <div className="space-y-3">
                <input
                  type="text" placeholder="Название"
                  className="w-full border px-2 py-1"
                  value={form.name}
                  onChange={e=>change('name',e.target.value)}
                />
                <div className="flex space-x-2">
                  <input
                    type="time" className="border px-2 py-1 flex-1"
                    value={form.start_time}
                    onChange={e=>change('start_time',e.target.value)}
                  />
                  <input
                    type="time" className="border px-2 py-1 flex-1"
                    value={form.end_time}
                    onChange={e=>change('end_time',e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1">Цвет</label>
                  <input
                    type="color" className="w-12 h-8 p-0 border-0"
                    value={form.color}
                    onChange={e=>change('color',e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                  Отмена
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={()=>onSave(form)}
                >
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
