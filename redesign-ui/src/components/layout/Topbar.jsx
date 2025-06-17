import React, { useContext } from 'react';
import { DepartmentContext } from '../../contexts/DepartmentContext';

export default function Topbar() {
  const { current: deptId, departments, setCurrent } = useContext(DepartmentContext);

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-bold">Планировщик смен</h1>
      <div className="flex items-center space-x-4">
        <label className="font-medium">Отдел:</label>
        <select
          value={deptId ?? ''}
          onChange={e => setCurrent(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value="" disabled>— выберите отдел —</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}