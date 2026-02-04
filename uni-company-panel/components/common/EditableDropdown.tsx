'use client';

interface EditableDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

const EditableDropdown = ({
    value,
    onChange,
    options,
    placeholder = 'Select option',
    className = '',
}: EditableDropdownProps) => {
    const baseClasses = 'w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

    return (
        <select
            className={`${baseClasses} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default EditableDropdown;