import React from 'react';
import Sidebar from './components/Sidebar';
import ViewTabs from './components/ViewTabs';
import CalendarView from './components/CalendarView';
import ScheduleTableView from './components/ScheduleTableView';
import ShiftModal from './components/ShiftModal';
import './App.css';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
        <ViewTabs />
        {/* Здесь можно переключаться между видами */}
        <CalendarView />
        <ScheduleTableView />
        <ShiftModal />
      </div>
    </div>
  );
}

export default App;
