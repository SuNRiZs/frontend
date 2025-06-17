import React, { useState, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { DepartmentContext } from '../../contexts/DepartmentContext';
import InputMask from 'react-input-mask';
import InputAdornment from '@mui/material/InputAdornment';
import TelegramIcon from '@mui/icons-material/Telegram';

export default function EmployeeTable() {
  const { current: deptId } = useContext(DepartmentContext);
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', deptId],
    queryFn: () => apiClient.get(`/employees?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmp, setModalEmp] = useState({
    id: null,
    full_name: '',
    phone: '',
    telegram_id: '',
    position: '',
    birth_date: '',
    extra_info: ''
  });

  const openModal = (emp = null) => {
    if (emp) {
      setModalEmp({
        id: emp.id,
        full_name: emp.full_name,
        phone: emp.phone || '',
        telegram_id: emp.telegram_id || '',
        position: emp.position || '',
        birth_date: emp.birth_date || '',
        extra_info: emp.extra_info || ''
      });
    } else {
      setModalEmp({ id: null, full_name: '', phone: '', telegram_id: '', position: '', birth_date: '', extra_info: '' });
    }
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Handle phone input with mask and auto-correct leading "8" to "+7"
  const handlePhoneChange = e => {
    let val = e.target.value;
    if (val.startsWith('8')) {
      // replace leading "8" with "+7"
      val = '+7' + val.slice(1);
    }
    setModalEmp(prev => ({ ...prev, phone: val }));
  };

  const handleSave = async () => {
    const payload = {
      full_name: modalEmp.full_name,
      phone: modalEmp.phone,
      telegram_id: modalEmp.telegram_id,
      position: modalEmp.position,
      department: deptId,
      birth_date: modalEmp.birth_date,
      extra_info: modalEmp.extra_info
    };
    if (modalEmp.id) {
      await apiClient.put(`/employees/${modalEmp.id}/`, payload);
    } else {
      await apiClient.post('/employees/', payload);
    }
    queryClient.invalidateQueries(['employees', deptId]);
    closeModal();
  };
  const handleDelete = async () => {
    if (!modalEmp.id) return;
    await apiClient.delete(`/employees/${modalEmp.id}/`);
    queryClient.invalidateQueries(['employees', deptId]);
    closeModal();
  };

  if (isLoading) {
    return <div className="p-4">Загрузка сотрудников…</div>;
  }

  return (
    <Box className="p-4">
      <div className="flex justify-end mb-4">
        <Button variant="contained" onClick={() => openModal(null)}>
          Добавить сотрудника
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>ФИО</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Telegram ID</TableCell>
              <TableCell>Должность</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(emp => (
              <TableRow key={emp.id} hover onClick={() => openModal(emp)} style={{ cursor: 'pointer' }}>
                <TableCell>{emp.full_name}</TableCell>
                <TableCell>{emp.phone || '-'}</TableCell>
                <TableCell>{emp.telegram_id || '-'}</TableCell>
                <TableCell>{emp.position || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Employee Modal */}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>
          {modalEmp.id ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4">
            <TextField
              label="ФИО"
              fullWidth
              value={modalEmp.full_name}
              onChange={e => setModalEmp({ ...modalEmp, full_name: e.target.value })}
            />
            <InputMask
              mask="+7 (999) 999-99-99"
              maskChar="_"
              value={modalEmp.phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneChange}
            >
              {() => (
                <TextField
                  label="Телефон"
                  fullWidth
                  error={modalEmp.phone && modalEmp.phone.includes('_')}
                  helperText={
                    modalEmp.phone && modalEmp.phone.includes('_')
                      ? 'Неполный номер'
                      : ''
                  }
                />
              )}
            </InputMask>
            <TextField
              label="Telegram ID"
              fullWidth
              value={modalEmp.telegram_id}
              onChange={e => setModalEmp({ ...modalEmp, telegram_id: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
                endAdornment: <InputAdornment position="end"><TelegramIcon /></InputAdornment>,
              }}
            />
            <TextField
              label="Должность"
              fullWidth
              value={modalEmp.position}
              onChange={e => setModalEmp({ ...modalEmp, position: e.target.value })}
            />
            <TextField
              label="Дата рождения"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={modalEmp.birth_date}
              onChange={e => setModalEmp({ ...modalEmp, birth_date: e.target.value })}
            />
            <TextField
              label="Доп. информация"
              multiline
              rows={4}
              fullWidth
              value={modalEmp.extra_info}
              onChange={e => setModalEmp({ ...modalEmp, extra_info: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {modalEmp.id && (
            <IconButton edge="start" color="error" onClick={handleDelete}>
              Удалить
            </IconButton>
          )}
          <Button onClick={closeModal}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}