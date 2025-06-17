import React from 'react';
import EmployeeTable from '../components/employees/EmployeeTable';

export default function EmployeesPage() {
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Сотрудники</h2>
      <EmployeeTable />
    </div>
  );
}