import React, { useState, useEffect } from 'react';
import { useController } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    updateFieldValue(newMonth, selectedYear);
  };

  // Handle year change
  const handleYearChange = (newYear) => {
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
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-4">
        {/* Month Select */}
        <div className="flex-1">
          <Label
            htmlFor="month-select"
            className="text-sm font-medium mb-2 block"
          >
            Month
          </Label>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger id="month-select">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Select */}
        <div className="flex-1">
          <Label
            htmlFor="year-select"
            className="text-sm font-medium mb-2 block"
          >
            Year
          </Label>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger id="year-select">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export { MonthYearSelector };
