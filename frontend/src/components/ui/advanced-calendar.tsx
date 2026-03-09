'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthYearPickerProps {
  date?: Date;
  setDate: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  maxDate?: Date;
}

export function MonthYearPicker({
  date,
  setDate,
  placeholder = 'Select month & year',
  disabled = false,
  className,
  fromYear = 1950,
  toYear = new Date().getFullYear() + 10,
  maxDate,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    date ? date.getMonth() : new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(
    date ? date.getFullYear() : new Date().getFullYear(),
  );

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // const years = Array.from(
  //   { length: toYear - fromYear + 1 },
  //   (_, i) => fromYear + i,
  // );

  // Filter years based on maxDate
  const years = React.useMemo(() => {
    let maxYear = maxDate ? maxDate.getFullYear() : toYear;
    return Array.from(
      { length: maxYear - fromYear + 1 },
      (_, i) => fromYear + i,
    );
  }, [fromYear, maxDate, toYear]);

  // Validate selected date against maxDate
  const isValidDate = (year: number, month: number) => {
    if (!maxDate) return true;
    const selectedDate = new Date(year, month, 1);
    return selectedDate <= maxDate;
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(parseInt(month));
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleApply = () => {
    if (!isValidDate(selectedYear, selectedMonth)) {
      // Show error or just don't apply
      return;
    }
    const newDate = new Date(selectedYear, selectedMonth, 1);
    const formatted = format(newDate, 'yyyy-MM');
    setDate(formatted);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (date) {
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    } else {
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(new Date().getFullYear());
    }
    setIsOpen(false);
  };

  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block w-full">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal',
          !date && 'text-muted-foreground',
          className,
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, 'MMMM yyyy') : placeholder}
      </Button>

      {isOpen && !disabled && position && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/10"
            onClick={handleCancel}
          />

          <div
            className="fixed z-[9999] bg-white rounded-lg border shadow-2xl p-4 w-72"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">
                Select Month & Year
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Month
                  </label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={6}
                      className="bg-white max-h-60 overflow-y-auto z-[10000]"
                      align="start"
                    >
                      {/* {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))} */}
                      {months.map((month, index) => {
                        const isDisabled = maxDate
                          ? !isValidDate(selectedYear, index)
                          : false;
                        return (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            disabled={isDisabled}
                          >
                            {month}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Year
                  </label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={6}
                      className="bg-white max-h-60 overflow-y-auto z-[10000]"
                      align="start"
                    >
                      {/* {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))} */}
                      {years.map((year) => {
                        const isDisabled = maxDate
                          ? !isValidDate(year, selectedMonth)
                          : false;
                        return (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            disabled={isDisabled}
                          >
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!isValidDate(selectedYear, selectedMonth) && maxDate && (
                <p className="text-xs text-red-500">
                  Cannot select date after {format(maxDate, 'MMMM yyyy')}
                </p>
              )}{' '}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={!isValidDate(selectedYear, selectedMonth)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
