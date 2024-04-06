import { ChangeEvent, FC } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  defaultValue: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const Select: FC<SelectProps> = ({ options, defaultValue, onChange }) => {
  return (
    <select defaultValue={defaultValue} onChange={onChange}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
