// src/components/ScheduleTableView.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import Holidays from 'date-holidays'
import weekday from 'dayjs/plugin/weekday'
dayjs.extend(weekday)

export default function ScheduleTableView({ departmentId, view }) {
  const [employees, setEmployees]   = useState([])
  const [shiftTypes, setShiftTypes] = useState([])
  const [vacations, setVacations]   = useState({})
  const [schedule, setSchedule]     = useState({})
  const [current, setCurrent]       = useState(dayjs())
  const hd = new Holidays('RU')
  const WEEKDAYS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

  // 1️⃣ Генерация массива дат
  let dates = []
  if (view === 'day') {
    dates = [current.format('YYYY-MM-DD')]
  } else if (view === 'week') {
    const monday = current.weekday(1)
    dates = Array.from({ length: 7 }, (_, i) =>
      monday.add(i, 'day').format('YYYY-MM-DD')
    )
  } else {
    const dim = current.daysInMonth()
    dates = Array.from({ length: dim }, (_, i) =>
      current.date(i + 1).format('YYYY-MM-DD')
    )
  }

  // 2️⃣ Load справочников + отпусков
  useEffect(() => {
    Promise.all([
      axios.get('/api/shift-types/'),
      axios.get('/api/employees/', { params: { department: departmentId }}),
      axios.get('/api/vacations/',  { params: { department: departmentId }})
    ]).then(([stR, empR, vacR]) => {
      setShiftTypes(stR.data)
      setEmployees(empR.data)
      const vmap = {}
      vacR.data.forEach(v => {
        (vmap[v.employee] ||= []).push({ start: v.start_date, end: v.end_date })
      })
      setVacations(vmap)
    }).catch(console.error)
  }, [departmentId])

  // 3️⃣ Load расписания
  useEffect(() => {
    const params = { month: current.format('YYYY-MM') }
    if (departmentId) params.department = departmentId

    axios.get('/api/schedules/', { params }).then(({ data }) => {
      const map = {}
      data.forEach(({ employee, shifts }) => {
        map[employee.id] = { byDate: {}, shifts }
        shifts.forEach(sh => {
          const t = shiftTypes.find(x => x.name === sh.shift_type)
          map[employee.id].byDate[sh.date] = {
            id:    sh.id,
            color: t?.color || '#888',
            label: `${sh.shift_type} (${sh.hours_worked}ч)`
          }
        })
      })
      setSchedule(map)
    }).catch(console.error)
  }, [current, departmentId, shiftTypes])

  // Inline-edit
  const [editCell, setEditCell] = useState(null)

  // Drag&Drop
  const onDragStart = (e, cell, empId, date) => {
    e.dataTransfer.setData('application/json',
      JSON.stringify({ ...cell, empId, date }))
  }
  const onDragOver = e => e.preventDefault()
  const onDrop = (e, empId, date) => {
    const cell = JSON.parse(e.dataTransfer.getData('application/json'))
    // UI удаляем старую
    setSchedule(prev => {
      const nx = { ...prev }
      nx[cell.empId].byDate && delete nx[cell.empId].byDate[cell.date]
      nx[cell.empId].shifts = nx[cell.empId].shifts.filter(s => s.id !== cell.id)
      return nx
    })
    // бэк
    axios.delete(`/api/shifts/${cell.id}/`).catch(console.error).then(() =>
      axios.post('/api/schedules/bulk/', {
        entries: [{ employee: cell.empId, date, shift_type: shiftTypes.find(t=>t.color===cell.color).id }]
      })
    ).then(({ data:[newShift] }) => {
      const t = shiftTypes.find(x => x.id === newShift.shift_type)
      setSchedule(prev => {
        const nx = { ...prev }
        nx[empId].byDate[date] = {
          id:    newShift.id,
          color: t.color,
          label: `${t.name} (${newShift.hours_worked}ч)`
        }
        nx[empId].shifts = [...nx[empId].shifts, newShift]
        return nx
      })
    })
  }

  // Select-change
  const onSelectChange = (empId, date, stId) => {
    if (!stId) {
      const cell = schedule[empId].byDate[date]
      if (cell) {
        axios.delete(`/api/shifts/${cell.id}/`)
          .then(() => setSchedule(prev => {
            const nx = { ...prev }
            delete nx[empId].byDate[date]
            nx[empId].shifts = nx[empId].shifts.filter(s => s.id !== cell.id)
            return nx
          }))
      }
    } else {
      axios.post('/api/schedules/bulk/', {
        entries: [{ employee: empId, date, shift_type: stId }]
      }).then(({ data:[ns] }) => {
        const t = shiftTypes.find(x => x.id === ns.shift_type)
        setSchedule(prev => {
          const nx = { ...prev }
          nx[empId].byDate[date] = {
            id:    ns.id,
            color: t.color,
            label: `${t.name} (${ns.hours_worked}ч)`
          }
          nx[empId].shifts = [...nx[empId].shifts, ns]
          return nx
        })
      })
    }
    setEditCell(null)
  }

  // Helpers
  const isVacation = (eId, d) =>
    (vacations[eId]||[]).some(v=> d>=v.start && d<=v.end)

  const isBirthday = (birth, d) =>
    birth && dayjs(birth).format('MM-DD') === dayjs(d).format('MM-DD')

  // Навигация
  const [unit, stepCount] = view==='day' ? ['day',1] : view==='week' ? ['week',1] : ['month',1]

  return (
    <div className="p-4">
      {/* Навигация */}
      <div className="flex items-center mb-4 space-x-2">
        <button
          onClick={()=>setCurrent(c=>c.subtract(stepCount,unit))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >‹</button>
        <span className="text-lg font-medium">
          {view==='day'
            ? current.format('DD MMMM YYYY')
            : view==='week'
              ? `Неделя ${current.weekday(1).format('DD.MM')}–${current.weekday(7).format('DD.MM')}`
              : current.format('MMMM YYYY')
          }
        </span>
        <button
          onClick={()=>setCurrent(c=>c.add(stepCount,unit))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >›</button>
      </div>

      <div className="overflow-auto border rounded shadow-sm">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="sticky left-0 bg-gray-100 z-10 p-2 border">
                Сотрудник<br/>
                <span className="text-xs text-gray-500">ч/смены</span>
              </th>
              {dates.map(d => {
                const dt = dayjs(d)
                const weekend = [0,6].includes(dt.day())
                const holiday = !!hd.isHoliday(dt.toDate())
                return (
                  <th
                    key={d}
                    className={
                      `p-2 border text-center text-sm ` +
                      (holiday
                        ? 'bg-red-200'
                        : weekend
                          ? 'bg-gray-200'
                          : '')
                    }
                  >
                    <div>{dt.format('D')}</div>
                    <div className="text-xs">{WEEKDAYS[dt.day()]}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const empS = schedule[emp.id] || { byDate: {}, shifts: [] }
              const totalH = empS.shifts
                .reduce((s,sh)=>s + parseFloat(sh.hours_worked), 0)
                .toFixed(2)
              const cnt = empS.shifts.length

              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white z-5 p-2 border text-sm">
                    <div className="flex items-center">
                      {emp.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalH} ч / {cnt} смен
                    </div>
                  </td>

                  {dates.map(date => {
                    const cell = empS.byDate[date]
                    const vac  = isVacation(emp.id, date)
                    // inline-edit
                    if (editCell?.empId === emp.id && editCell.date === date) {
                      return (
                        <td key={date} className="p-1 border bg-yellow-50">
                          <select
                            autoFocus
                            className="w-full text-xs"
                            defaultValue={cell ? shiftTypes.find(t=>t.color===cell.color).id : ''}
                            onBlur={()=>setEditCell(null)}
                            onChange={e=>onSelectChange(emp.id,date,e.target.value)}
                          >
                            <option value="">—</option>
                            {shiftTypes.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </td>
                      )
                    }
                    return (
                      <td
                        key={date}
                        className={`relative p-0 border h-12 ${vac?'bg-gray-100':''}`}
                        onClick={()=>setEditCell({ empId: emp.id, date })}
                        onDragOver={onDragOver}
                        onDrop={e=>onDrop(e, emp.id, date)}
                      >
                        {isBirthday(emp.birth_date, date) && (
                          <span className="absolute top-0 right-0 m-1 text-pink-500 text-sm">🎂</span>
                        )}
                        {cell && (
                          <div
                            draggable
                            onDragStart={e=>onDragStart(e,cell,emp.id,date)}
                            className="h-full flex items-center justify-center text-xs text-white"
                            style={{ backgroundColor: cell.color }}
                            title={cell.label}
                          >
                            {cell.label.split(' ')[0]}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
