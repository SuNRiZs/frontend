import React, { useEffect, useState } from 'react'
import axios from '../api'
import EmployeeModal from '../ui/EmployeeModal'

export default function EmployeesPage() {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = ()=> axios.get('/employees/').then(r=> setList(r.data))

  useEffect(load, [])

  const onDelete = id=>
    axios.delete(`/employees/${id}/`).then(load)

  const onSave = data=>{
    const req = editing
      ? axios.put(`/employees/${editing.id}/`, data)
      : axios.post('/employees/', data)
    req.then(()=>{
      setModalOpen(false)
      setEditing(null)
      load()
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Сотрудники</h1>
      <button
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={()=>{ setEditing(null); setModalOpen(true) }}
      >
        Добавить сотрудника
      </button>

      <table className="min-w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ФИО</th>
            <th className="p-2">Телефон</th>
            <th className="p-2">Отдел</th>
            <th className="p-2">Родился</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {list.map(emp=>(
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="p-2">{emp.full_name}</td>
              <td className="p-2">{emp.phone}</td>
              <td className="p-2">{emp.department || '-'}</td>
              <td className="p-2">{emp.birth_date||'-'}</td>
              <td className="p-2 space-x-2">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={()=>{ setEditing(emp); setModalOpen(true) }}
                >✎</button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={()=>onDelete(emp.id)}
                >🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={()=>setModalOpen(false)}
        employee={editing}
        onSave={onSave}
      />
    </div>
  )
}
