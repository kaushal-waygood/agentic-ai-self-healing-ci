import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Adjust path as needed

export const TechnologyInput = ({ field }) => {
  const { value: technologies = [], onChange } = field;

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTech = inputValue.trim();

      if (newTech && !technologies.includes(newTech)) {
        onChange([...technologies, newTech]);
      }

      setInputValue('');
    }
  };

  const removeTechnology = (techToRemove) => {
    onChange(technologies.filter((tech) => tech !== techToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md mb-2">
        {technologies.map((tech) => (
          <div
            key={tech}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full"
          >
            {tech}
            <button
              type="button"
              onClick={() => removeTechnology(tech)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Type a technology and press Enter..."
      />
      <p className="text-sm text-muted-foreground mt-1">
        Separate technologies with a comma or by pressing Enter.
      </p>
    </div>
  );
};

export const formatDateForMonthInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Handle invalid date strings
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so we add 1 and pad with a '0' if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (error) {
    console.error('Failed to format date:', dateString, error);
    return '';
  }
};
