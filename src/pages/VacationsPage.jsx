import React, { useEffect, useState } from 'react'
import axios from '../api'
import VacationModal from '../ui/VacationModal'

export default function VacationsPage() {
  const [vacations, setVacations] = useState([])
  const [employees, setEmployees] = useState([])
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  // Загрузить справочники
  useEffect(() => {
    axios.get('/employees/').then(r => setEmployees(r.data))
    loadVacations()
  }, [])

  function loadVacations() {
    axios.get('/vacations/').then(r => setVacations(r.data))
  }

  function handleDelete(id) {
    axios.delete(`/vacations/${id}/`).then(loadVacations)
  }

  function handleSave(data) {
    const req = editing
      ? axios.put(`/vacations/${editing.id}/`, data)
      : axios.post('/vacations/', data)
    req.then(() => {
      setOpen(false)
      setEditing(null)
      loadVacations()
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Отпуска</h1>
      <button
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => { setEditing(null); setOpen(true) }}
      >
        Добавить отпуск
      </button>

      <table className="min-w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Сотрудник</th>
            <th className="p-2">С</th>
            <th className="p-2">По</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {vacations.map(v => {
            const emp = employees.find(e => e.id === v.employee)
            return (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="p-2">{emp?.full_name || v.employee}</td>
                <td className="p-2">{v.start_date}</td>
                <td className="p-2">{v.end_date}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded"
                    onClick={() => { setEditing(v); setOpen(true) }}
                  >✎</button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(v.id)}
                  >🗑</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <VacationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        vacation={editing}
        employees={employees}
        onSave={handleSave}
      />
    </div>
  )
}
