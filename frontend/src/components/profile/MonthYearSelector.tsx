import React, { useState, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const MonthYearSelector = ({ control, name, label = 'Expiration Date' }) => {
  const { field } = useController({
    name,
    control,
  });

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Sync local state with form field value
  useEffect(() => {
    if (field.value && typeof field.value === 'string') {
      const [year, month] = field.value.split('-');
      if (year) setSelectedYear(year);
      if (month) setSelectedMonth(month);
    }
  }, [field.value]);

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Handle month change
  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    updateFieldValue(newMonth, selectedYear);
  };

  // Handle year change
  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setSelectedYear(newYear);
    updateFieldValue(selectedMonth, newYear);
  };

  // Update form field value
  const updateFieldValue = (month, year) => {
    if (month && year) {
      const newValue = `${year}-${month}`;
      field.onChange(newValue);
    } else {
      field.onChange('');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Month Select */}
      <FormControl fullWidth>
        <InputLabel id="month-select-label">Month</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth}
          label="Month"
          onChange={handleMonthChange}
        >
          {months.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Year Select */}
      <FormControl fullWidth>
        <InputLabel id="year-select-label">Year</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          value={selectedYear}
          label="Year"
          onChange={handleYearChange}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year.toString()}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MonthYearSelector;
