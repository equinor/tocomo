import React, { useState } from 'react';


type Option = {
  value: string;
  label: string;
};

type DropdownProps = {
  label: string;
  options: Option[];
  placeholder?: string;
  onSelect: (value: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({ label, options, placeholder, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onSelect(value);
  };

  return (
    <>
      <p>{label}</p>
      <select value={selectedValue} onChange={handleChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default Dropdown;
