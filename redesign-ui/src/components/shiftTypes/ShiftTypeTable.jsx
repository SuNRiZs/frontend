// Normalize 3-digit hex colors (#rgb) to 6-digit (#rrggbb)
function normalizeColor(hex) {
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    return (
      '#' +
      hex[1] + hex[1] +
      hex[2] + hex[2] +
      hex[3] + hex[3]
    );
  }
  return hex;
}
import React, { useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { DepartmentContext } from '../../contexts/DepartmentContext';
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
  Switch,
  FormControlLabel
} from '@mui/material';

export default function ShiftTypeTable() {
  const { current: deptId } = useContext(DepartmentContext);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState({
    id: null,
    name: '',
    start_time: '',
    end_time: '',
    color: '#888',
    requires_hours: false,
  });

  const openModal = (type = null) => {
    if (type) {
      setModalType({
        id: type.id,
        name: type.name || '',
        start_time: type.start_time || '',
        end_time: type.end_time || '',
        color: type.color || '#888',
        requires_hours: type.requires_hours || false,
      });
    } else {
      setModalType({
        id: null,
        name: '',
        start_time: '',
        end_time: '',
        color: '#888',
        requires_hours: false,
      });
    }
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    const payload = {
      name: modalType.name,
      start_time: modalType.start_time,
      end_time: modalType.end_time,
      color: normalizeColor(modalType.color),
      requires_hours: modalType.requires_hours,
      departments: [deptId],
    };
    if (modalType.id) {
      await apiClient.put(`/shift-types/${modalType.id}/`, payload, { params: { department: deptId } });
    } else {
      await apiClient.post('/shift-types/', payload, { params: { department: deptId } });
    }
    queryClient.invalidateQueries(['shiftTypes', deptId]);
    closeModal();
  };

  const handleDelete = async () => {
    if (!modalType.id) return;
    await apiClient.delete(`/shift-types/${modalType.id}/`, { params: { department: deptId } });
    queryClient.invalidateQueries(['shiftTypes', deptId]);
    closeModal();
  };

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['shiftTypes', deptId],
    queryFn: () =>
      apiClient.get(`/shift-types?department=${deptId}`).then(r => r.data),
    enabled: !!deptId,
  });

  if (isLoading) {
    return <div className="p-4">Загрузка типов смен…</div>;
  }

  return (
    <Box className="p-4">
      <div className="flex justify-end items-center mb-4">
        <Button variant="contained" onClick={() => openModal(null)}>
          Новый тип смены
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Начало</TableCell>
              <TableCell>Конец</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map(t => (
              <TableRow
                key={t.id}
                hover
                className="cursor-pointer"
                onClick={() => openModal(t)}
              >
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.start_time}</TableCell>
                <TableCell>{t.end_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Shift Type Modal */}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>
          {modalType.id ? 'Редактировать тип смены' : 'Новый тип смены'}
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4">
            <TextField
              label="Название"
              fullWidth
              value={modalType.name}
              onChange={e => setModalType({ ...modalType, name: e.target.value })}
            />
            <TextField
              label="Время начала"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={modalType.start_time}
              onChange={e => setModalType({ ...modalType, start_time: e.target.value })}
            />
            <TextField
              label="Время окончания"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={modalType.end_time}
              onChange={e => setModalType({ ...modalType, end_time: e.target.value })}
            />
            <TextField
              label="Цвет"
              type="color"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={modalType.color}
              onChange={e => setModalType({ ...modalType, color: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={modalType.requires_hours}
                  onChange={e => setModalType({ ...modalType, requires_hours: e.target.checked })}
                />
              }
              label="Требует указания часов"
            />
          </div>
        </DialogContent>
        <DialogActions>
          {modalType.id && (
            <Button color="error" onClick={handleDelete}>
              Удалить
            </Button>
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