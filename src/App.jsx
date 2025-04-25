// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import EmployeesPage from './pages/EmployeesPage'
import ShiftTypesPage from './pages/ShiftTypesPage'
import VacationsPage  from './pages/VacationsPage'
import CalendarView    from './components/CalendarView'
import ScheduleTableView from './components/ScheduleTableView'

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4 overflow-auto">
        <Routes>
          <Route path="/" element={
            <>
              <ScheduleTableView/>
            </>
          }/>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/shift-types" element={<ShiftTypesPage />} />
          <Route path="/vacations" element={<VacationsPage />} />
        </Routes>
      </div>
    </div>
  )
}
