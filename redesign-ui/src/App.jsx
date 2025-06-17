import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DepartmentProvider } from './contexts/DepartmentContext';
import Layout from './components/layout/Layout';
import SchedulePage from './pages/SchedulePage';
import EmployeesPage from './pages/EmployeesPage';
import ShiftTypesPage from './pages/ShiftTypesPage';
import VacationsPage from './pages/VacationsPage';

export default function App() {
  return (
    <DepartmentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/schedule" replace />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="shift-types" element={<ShiftTypesPage />} />
            <Route path="vacations" element={<VacationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DepartmentProvider>
  );
}