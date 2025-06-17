import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {
  const [departments, setDepartments] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    apiClient.get('/departments').then(res => {
      setDepartments(res.data);
      setCurrent(res.data[0]?.id || null);
    });
  }, []);

  return (
    <DepartmentContext.Provider value={{ departments, current, setCurrent }}>
      {children}
    </DepartmentContext.Provider>
  );
}