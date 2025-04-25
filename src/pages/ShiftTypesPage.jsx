import React, { useEffect, useState } from 'react'
import axios from '../api'
import ShiftTypeModal from '../ui/ShiftTypeModal'

export default function ShiftTypesPage() {
  const [list, setList] = useState([])
  const [edit, setEdit] = useState(null)
  const [open, setOpen] = useState(false)

  const load = ()=>axios.get('/shift-types/').then(r=>setList(r.data))
  useEffect(load, [])

  const remove = id=> axios.delete(`/shift-types/${id}/`).then(load)
  const save   = data=>{
    const req = edit
      ? axios.put(`/shift-types/${edit.id}/`, data)
      : axios.post('/shift-types/', data)
    req.then(()=>{
      setOpen(false); setEdit(null); load()
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Типы смен</h1>
      <button
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={()=>{setEdit(null); setOpen(true)}}
      >Добавить тип смены</button>

      <table className="min-w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Название</th>
            <th className="p-2">Старт</th>
            <th className="p-2">Финиш</th>
            <th className="p-2">Цвет</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {list.map(t=>(
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="p-2">{t.name}</td>
              <td className="p-2">{t.start_time}</td>
              <td className="p-2">{t.end_time}</td>
              <td className="p-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor:t.color}}/>
              </td>
              <td className="p-2 space-x-2">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={()=>{setEdit(t); setOpen(true)}}
                >✎</button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={()=>remove(t.id)}
                >🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ShiftTypeModal
        isOpen={open}
        onClose={()=>setOpen(false)}
        shiftType={edit}
        onSave={save}
      />
    </div>
)
}
