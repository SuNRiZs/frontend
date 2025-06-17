import React, { useState, useContext, useCallback } from 'react';
import { format } from 'date-fns';
import Paper from '@mui/material/Paper';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  TableContainer,
} from '@mui/material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { DepartmentContext } from '../../contexts/DepartmentContext';
import { apiClient } from '../../api/client';

export default function ScheduleView({
  shifts = [],
  employees = [],
  shiftTypes = [],
  view = 'month',
  baseDate = new Date(),
}) {
  // Department context and queryClient for refetch
  const { current: deptId } = useContext(DepartmentContext);
  const queryClient = useQueryClient();

  const { data: vacations = [] } = useQuery({
    queryKey: ['vacations', deptId],
    queryFn: () => apiClient.get(`/vacations?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });

  // State for Add Shift modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  // Selected shift type for creation
  const [selectedTypeId, setSelectedTypeId] = useState(shiftTypes[0]?.id || null);

  // State for editing an existing shift
  const [modalShift, setModalShift] = useState(null);

  const openModal = (emp, date, shift = null) => {
    setModalEmp(emp);
    setModalDate(date);
    setModalShift(shift);
    setSelectedTypeId(shift ? shift.shift_type : shiftTypes[0]?.id);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalEmp(null);
    setModalDate(null);
    setModalShift(null);
  };
  // Save new shift using default hours from shiftTypes lookup
  const handleSave = async () => {
    if (!selectedTypeId || !modalEmp || !modalDate) return;
    const payload = {
      employee: modalEmp.id,
      shift_type: selectedTypeId,
      date: format(modalDate, 'yyyy-MM-dd'),
    };
    if (modalShift) {
      // Update existing shift
      await apiClient.put(`/shifts/${modalShift.id}/`, payload, {
        params: { department: deptId },
      });
    } else {
      // Create new shift
      await apiClient.post('/shifts/', payload, {
        params: { department: deptId },
      });
    }
    queryClient.invalidateQueries(['shifts', deptId], { exact: false });
    closeModal();
  };

  const handleDelete = async () => {
    if (!modalShift) return;
    await apiClient.delete(`/shifts/${modalShift.id}/`, {
      params: { department: deptId },
    });
    queryClient.invalidateQueries(['shifts', deptId], { exact: false });
    closeModal();
  };

  // Handle drag & drop of shifts
  const handleDragDrop = useCallback(
    async (srcEmpId, srcDate, destEmpId, destDate) => {
      const shift = shifts.find(
        s =>
          s.employee === srcEmpId &&
          s.date === srcDate
      );
      if (!shift) return;
      await apiClient.put(
        `/shifts/${shift.id}/`,
        { employee: destEmpId, shift_type: shift.shift_type, date: destDate },
        { params: { department: deptId } }
      );
      queryClient.invalidateQueries(['shifts', deptId], { exact: false });
    },
    [shifts, deptId, queryClient]
  );

  // Initialize holidays for Russia
  const hd = new Holidays('RU');
  const holidayMap = hd.getHolidays(baseDate.getFullYear()).reduce((map, h) => {
    map[h.date] = h.localName;
    return map;
  }, {});

  // Build a lookup map for shift types by ID
  const shiftTypeMap = shiftTypes.reduce((map, type) => {
    map[type.id] = type;
    return map;
  }, {});

  // Build the range of dates
  let dates = [];
  if (view === 'month') {
    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);
    dates = eachDayOfInterval({ start, end });
  } else {
    const start = startOfWeek(baseDate, { locale: ru });
    const end = endOfWeek(baseDate, { locale: ru });
    dates = eachDayOfInterval({ start, end });
  }

  // Map employee->set of vacation dates (ISO strings)
  const vacMap = vacations.reduce((m, v) => {
    const empId = v.employee;
    const start = new Date(v.start_date);
    const end = new Date(v.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      m[empId] = m[empId] || new Set();
      m[empId].add(d.toISOString().slice(0,10));
    }
    return m;
  }, {});

  return (
    <Box className="p-4 flex-1 flex flex-col min-h-0">
      <TableContainer component={Paper} className="flex-1 w-full overflow-auto min-h-0">
        <Table
          stickyHeader
          sx={{ tableLayout: 'fixed', width: '100%', minWidth: 0 }}
        >
          <colgroup>
            <col style={{ width: 160 }} />  {/* Employee */}
            <col style={{ width: 64 }} />   {/* Shifts/Hours */}
            {dates.map(d => (
              <col key={d.toISOString()} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell component="th" className="border px-2 py-1 text-left whitespace-normal">
                Сотрудник
              </TableCell>
              <TableCell component="th" className="border px-2 py-1 text-center">
                Смены/Часы
              </TableCell>
              {dates.map(date => {
                const dayStr = format(date, 'EEE', { locale: ru });
                const dayNum = format(date, 'dd', { locale: ru });
                const iso = date.toISOString().slice(0,10);
                const isWeekend = [0,6].includes(date.getDay());
                const isHoliday = !!holidayMap[iso];
                return (
                  <TableCell
                    key={date.toISOString()}
                    component="th"
                    className={`border px-1 py-1 text-center ${
                      isWeekend ? 'bg-gray-200' : ''
                    } ${isHoliday ? 'bg-red-200' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{dayStr}</span>
                      <span>{dayNum}</span>
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(emp => (
              <TableRow key={emp.id} hover>
                <TableCell className="border px-2 py-1 whitespace-normal">{emp.full_name}</TableCell>
                {(() => {
                  const empShifts = shifts.filter(s => s.employee === emp.id && 
                    new Date(s.date) >= dates[0] && new Date(s.date) <= dates[dates.length - 1]);
                  const count = empShifts.length;
                  const hours = empShifts.reduce((sum, s) => sum + parseFloat(s.hours_worked || 0), 0);
                  return (
                    <TableCell className="border px-2 py-1 text-center">
                      {count} / {hours.toFixed(2)}
                    </TableCell>
                  );
                })()}
                {dates.map(date => {
                  const shift = shifts.find(
                    s =>
                      s.employee === emp.id &&
                      new Date(s.date).toDateString() === date.toDateString()
                  );
                  const label = shift
                    ? (shiftTypeMap[shift.shift_type]?.name || '')
                    : '';
                  const color = shift
                    ? (shiftTypeMap[shift.shift_type]?.color || '')
                    : '';
                  const iso = date.toISOString().slice(0,10);
                  const isWeekend = [0,6].includes(date.getDay());
                  const isHoliday = !!holidayMap[iso];
                  return (
                    <TableCell
                      key={`${emp.id}-${date.toISOString()}`}
                      className={`border px-1 py-1 text-center ${
                        isWeekend ? 'bg-gray-100' : ''
                      } ${isHoliday ? 'bg-red-100' : ''}`}
                      draggable
                      onDragStart={e =>
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            empId: emp.id,
                            date: format(date, 'yyyy-MM-dd'),
                          })
                        )
                      }
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        const { empId: srcEmpId, date: srcDate } = JSON.parse(
                          e.dataTransfer.getData('application/json')
                        );
                        const destDate = format(date,'yyyy-MM-dd');
                        // skip if destination already has a shift or vacation
                        const destHasShift = shifts.some(s => s.employee===emp.id && s.date===destDate);
                        const destOnVacation = vacMap[emp.id]?.has(destDate);
                        if (!destHasShift && !destOnVacation) {
                          handleDragDrop(srcEmpId, srcDate, emp.id, destDate);
                        }
                      }}
                      style={{
                        backgroundColor: color || undefined,
                        ...(vacMap[emp.id]?.has(format(date,'yyyy-MM-dd')) ? { opacity: 0.5, backgroundColor: 'gray' } : {})
                      }}
                      onClick={() => {
                        const existing = shifts.find(
                          s =>
                            s.employee === emp.id &&
                            new Date(s.date).toDateString() === date.toDateString() &&
                            s.shift_type === selectedTypeId
                        );
                        openModal(emp, date, existing);
                      }}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>{modalShift ? 'Редактировать смену' : 'Добавить смену'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Тип смены"
            select
            fullWidth
            value={selectedTypeId}
            onChange={e => setSelectedTypeId(Number(e.target.value))}
            SelectProps={{ native: true }}
          >
            {shiftTypes
              .filter(t =>
                !shifts.some(
                  s =>
                    s.employee === modalEmp?.id &&
                    s.date === format(modalDate, 'yyyy-MM-dd') &&
                    s.shift_type === t.id
                ) || (modalShift && modalShift.shift_type === t.id)
              )
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Отмена</Button>
          {modalShift && (
            <Button color="error" onClick={handleDelete}>
              Удалить
            </Button>
          )}
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}