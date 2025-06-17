import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { DepartmentContext } from '../../contexts/DepartmentContext';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  parseISO,
  isWeekend,
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays
} from 'date-fns';
import { useMemo } from 'react';
import { ru } from 'date-fns/locale';

export default function VacationCalendar() {
  const { current: deptId } = useContext(DepartmentContext);
  const queryClient = useQueryClient();
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVac, setModalVac] = useState({
    id: null,
    employee: '',
    start_date: '',
    end_date: '',
  });
  const [conflicts, setConflicts] = useState([]);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Employee vacations list modal
  const [empVacModal, setEmpVacModal] = useState(null); // employee id
  const [vacYear, setVacYear] = useState(currentMonth.getFullYear());

  // Fetch shifts data
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts', deptId],
    queryFn: () =>
      apiClient.get(`/shifts?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });

  // Drag-selection state
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragEmpId, setDragEmpId] = useState(null);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);

  // Load data
  const { data: vacations = [], isLoading: loadingVac } = useQuery({
    queryKey: ['vacations', deptId],
    queryFn: () => apiClient.get(`/vacations?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });
  const { data: employees = [], isLoading: loadingEmp } = useQuery({
    queryKey: ['employees', deptId],
    queryFn: () => apiClient.get(`/employees?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });

  // Detect conflicts when date range changes
  useEffect(() => {
    if (!modalVac.start_date || !modalVac.end_date) return;
    const selStart = parseISO(modalVac.start_date);
    const selEnd = parseISO(modalVac.end_date);
    const overlapping = vacations
      .filter(v => {
        const vStart = parseISO(v.start_date);
        const vEnd = parseISO(v.end_date);
        return selStart <= vEnd && vStart <= selEnd && v.employee !== modalVac.employee;
      })
      .map(v => employees.find(e => e.id === v.employee)?.full_name || v.employee);
    setConflicts([...new Set(overlapping)]);
  }, [modalVac.start_date, modalVac.end_date, vacations, employees, modalVac.employee]);

  // Extend useEffect to warn about overlapping shifts
  const [shiftConflicts, setShiftConflicts] = useState([]);
  useEffect(() => {
    if (!modalVac.start_date || !modalVac.end_date) return;
    const selStart = parseISO(modalVac.start_date);
    const selEnd = parseISO(modalVac.end_date);
    const overlappingShifts = shifts.filter(s =>
      s.employee === modalVac.employee &&
      parseISO(s.date) >= selStart &&
      parseISO(s.date) <= selEnd
    ).map(s => format(parseISO(s.date), 'dd MMM yyyy', { locale: ru }));
    setShiftConflicts(overlappingShifts);
  }, [modalVac.start_date, modalVac.end_date, shifts, modalVac.employee]);

  if (loadingVac || loadingEmp || loadingShifts) {
    return <div className="p-4">Загрузка отпусков…</div>;
  }

  // Build calendar dates for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const dates = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Modal handlers
  const openModal = arg => {
    if (arg && arg.id) {
      // existing vacation
      setModalVac({
        id: arg.id,
        employee: arg.employee,
        start_date: arg.start_date,
        end_date: arg.end_date,
      });
    } else if (arg && arg.employee != null) {
      // range selection or new with employee
      setModalVac({
        id: null,
        employee: arg.employee,
        start_date: arg.start_date || '',
        end_date: arg.end_date || '',
      });
    } else {
      setModalVac({ id: null, employee: '', start_date: '', end_date: '' });
    }
    setConflicts([]);
    setShiftConflicts([]);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Save or update vacation
  const handleSave = async () => {
    const payload = {
      employee: modalVac.employee,
      start_date: modalVac.start_date,
      end_date: modalVac.end_date,
    };
    if (modalVac.id) {
      await apiClient.put(`/vacations/${modalVac.id}/`, payload, { params: { department: deptId } });
    } else {
      await apiClient.post('/vacations/', payload, { params: { department: deptId } });
    }
    queryClient.invalidateQueries(['vacations', deptId]);
    closeModal();
  };
  const handleDelete = async () => {
    if (!modalVac.id) return;
    await apiClient.delete(`/vacations/${modalVac.id}/`, { params: { department: deptId } });
    queryClient.invalidateQueries(['vacations', deptId]);
    closeModal();
  };

  const closeEmpVacModal = () => setEmpVacModal(null);

  return (
    <Box className="p-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <Button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</Button>
        <Typography variant="h6">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </Typography>
        <Button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</Button>
      </div>
      <div className="flex justify-end mb-2">
        <Button variant="contained" onClick={() => openModal(null)}>Добавить отпуск</Button>
      </div>
      <TableContainer component={Paper} className="w-full">
        <Table size="small" stickyHeader className="w-full table-fixed">
          <colgroup>
            {/* Fixed width for employee column */}
            <col style={{ width: 200 }} />
            {/* Equal distribution for date columns */}
            {dates.map(d => (
              <col key={d.toISOString()} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell className="p-1">Сотрудник</TableCell>
              {dates.map(d => (
                <TableCell
                  key={d.toISOString()}
                  align="center"
                  className="border border-gray-300 p-1 text-xs"
                  style={isWeekend(d) ? { backgroundColor: '#f3f4f6' } : {}}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{format(d, 'dd')}</span>
                    <span className="text-xs">{format(d, 'EE', { locale: ru }).toLowerCase()}</span>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(emp => (
              <TableRow key={emp.id}>
                <TableCell
                  className="cursor-pointer text-left p-1 break-words"
                  onClick={e => {
                    e.stopPropagation();
                    setEmpVacModal(emp.id);
                  }}
                >
                  {emp.full_name}
                </TableCell>
                {dates.map(d => {
                  const selStart = dragStartDate && parseISO(dragStartDate);
                  const selEnd = dragEndDate && parseISO(dragEndDate);
                  const isSelectingCell =
                    dragSelecting &&
                    dragEmpId === emp.id &&
                    selStart &&
                    selEnd &&
                    d >= (selStart < selEnd ? selStart : selEnd) &&
                    d <= (selStart < selEnd ? selEnd : selStart);

                  const isVac = vacations.some(v => {
                    const vStart = parseISO(v.start_date);
                    const vEnd = parseISO(v.end_date);
                    return v.employee === emp.id && d >= vStart && d <= vEnd;
                  });
                  return (
                    <TableCell
                      key={`${emp.id}-${d.toISOString()}`}
                      align="center"
                      className={`border border-gray-300 p-1${
                        isVac
                          ? ' bg-red-300'
                          : shifts.some(s => s.employee === emp.id && parseISO(s.date).toDateString() === d.toDateString())
                          ? ' bg-blue-300'
                          : ''
                      }${isSelectingCell ? ' bg-green-200' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        const existing = vacations.find(vac =>
                          vac.employee === emp.id &&
                          d >= parseISO(vac.start_date) &&
                          d <= parseISO(vac.end_date)
                        );
                        if (existing) {
                          openModal(existing);
                        } else {
                          openModal({
                            employee: emp.id,
                            start_date: format(d, 'yyyy-MM-dd'),
                            end_date: format(d, 'yyyy-MM-dd'),
                          });
                        }
                      }}
                      onMouseDown={e => {
                        if (e.button === 0) {
                          setDragSelecting(true);
                          setDragEmpId(emp.id);
                          setDragStartDate(format(d, 'yyyy-MM-dd'));
                          setDragEndDate(format(d, 'yyyy-MM-dd'));
                        }
                      }}
                      onMouseEnter={() => {
                        if (dragSelecting && dragEmpId === emp.id) {
                          setDragEndDate(format(d, 'yyyy-MM-dd'));
                        }
                      }}
                      onMouseUp={() => {
                        if (dragSelecting && dragEmpId === emp.id) {
                          setDragSelecting(false);
                          const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
                          const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;
                          openModal({ employee: emp.id, start_date: start, end_date: end });
                        }
                      }}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Vacation Modal */}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>{modalVac.id ? 'Редактировать отпуск' : 'Добавить отпуск'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Сотрудник"
            fullWidth
            margin="normal"
            value={modalVac.employee}
            onChange={e => setModalVac({ ...modalVac, employee: e.target.value })}
          >
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Дата начала"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={modalVac.start_date}
            onChange={e => setModalVac({ ...modalVac, start_date: e.target.value })}
          />
          <TextField
            label="Дата окончания"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={modalVac.end_date}
            onChange={e => setModalVac({ ...modalVac, end_date: e.target.value })}
          />
          {modalVac.start_date && modalVac.end_date && (
            <Box mt={1}>
              <Typography variant="body2">
                Всего дней: {differenceInCalendarDays(parseISO(modalVac.end_date), parseISO(modalVac.start_date)) + 1}
              </Typography>
            </Box>
          )}
          {conflicts.length > 0 && (
            <Box mt={2}>
              <Typography color="error">Конфликты с:</Typography>
              <ul className="list-disc ml-4">
                {conflicts.map((name, idx) => <li key={idx}>{name}</li>)}
              </ul>
            </Box>
          )}
          {shiftConflicts.length > 0 && (
            <Box mt={2}>
              <Typography color="warning.main">В эти даты есть смены:</Typography>
              <ul className="list-disc ml-4">
                {shiftConflicts.map((date, idx) => <li key={idx}>{date}</li>)}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {modalVac.id && <Button color="error" onClick={handleDelete}>Удалить</Button>}
          <Button onClick={closeModal}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Employee Vacations Modal */}
      <Dialog open={empVacModal != null} onClose={() => setEmpVacModal(null)} fullWidth maxWidth="sm">
        <DialogTitle>Отпуска {employees.find(e => e.id === empVacModal)?.full_name}</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              select
              label="Год"
              value={vacYear}
              onChange={e => setVacYear(Number(e.target.value))}
              fullWidth
              size="small"
            >
              {Array.from(new Set(vacations.map(v => parseISO(v.start_date).getFullYear())))
                .sort((a, b) => b - a)
                .map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
            </TextField>
          </Box>
          <List>
            {vacations
              .filter(v => v.employee === empVacModal && parseISO(v.start_date).getFullYear() === vacYear)
              .map(v => (
                <ListItem key={v.id} className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      closeEmpVacModal();
                      openModal(v);
                    }}
                  >
                    <ListItemText
                      primary={`${format(parseISO(v.start_date),'dd MMM yyyy',{locale:ru})} — ${format(parseISO(v.end_date),'dd MMM yyyy',{locale:ru})}`}
                      secondary={`Дней: ${differenceInCalendarDays(parseISO(v.end_date), parseISO(v.start_date)) + 1}`}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="small" onClick={() => { closeEmpVacModal(); openModal(v); }}>Ред.</Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm('Удалить этот отпуск?')) {
                          apiClient.delete(`/vacations/${v.id}/`, { params: { department: deptId } })
                            .then(() => queryClient.invalidateQueries(['vacations', deptId]));
                        }
                      }}
                    >Удал.</Button>
                  </div>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmpVacModal(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}