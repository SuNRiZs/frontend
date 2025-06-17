import React from 'react';
import ShiftTypeTable from '../components/shiftTypes/ShiftTypeTable';

export default function ShiftTypesPage() {
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Типы смен</h2>
      <ShiftTypeTable />
    </div>
  );
}