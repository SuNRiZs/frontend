import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';

export function GenerationSettingsDialog({
  open,
  settings,
  onClose,
  onSubmit,
}) {
  const [local, setLocal] = useState({
    skip_vacations: true,
    treat_birthdays_as_off: true,
  });

  useEffect(() => {
    if (settings) {
      setLocal(settings);
    }
  }, [settings]);

  const handleChange = (field) => (event) => {
    setLocal((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleApply = () => {
    onSubmit(local);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Параметры генерации расписания</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Switch
              checked={local.skip_vacations}
              onChange={handleChange('skip_vacations')}
            />
          }
          label="Пропускать отпуска"
        />
        <FormControlLabel
          control={
            <Switch
              checked={local.treat_birthdays_as_off}
              onChange={handleChange('treat_birthdays_as_off')}
            />
          }
          label="Дни рождения как выходные"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleApply} variant="contained">
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
