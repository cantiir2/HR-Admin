import Select from 'react-select';
import { useTheme } from '../context/ThemeContext';

const toOptions = (options = []) => options.map(option => (
  Array.isArray(option) ? { value: option[0], label: option[1] } : option
));

const AppSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  className = '',
  isClearable = false,
  required = false
}) => {
  const { isDark } = useTheme();
  const normalizedOptions = toOptions(options);
  const selected = normalizedOptions.find(option => option.value === value) || null;
  const colors = isDark
    ? {
        control: '#111827',
        controlHover: '#1f2937',
        border: 'rgba(255,255,255,0.10)',
        borderFocus: 'rgba(239,54,84,0.70)',
        text: '#ffffff',
        muted: '#94a3b8',
        menu: '#0f172a',
        option: '#0f172a',
        optionFocus: 'rgba(255,255,255,0.08)',
        optionSelected: '#dc002b',
        shadow: '0 20px 45px rgba(0,0,0,0.35)',
        ring: '0 0 0 2px rgba(239,54,84,0.35)'
      }
    : {
        control: '#ffffff',
        controlHover: '#ffffff',
        border: '#cbd5e1',
        borderFocus: '#dc002b',
        text: '#111827',
        muted: '#64748b',
        menu: '#ffffff',
        option: '#ffffff',
        optionFocus: '#fff1f3',
        optionSelected: '#dc002b',
        shadow: '0 14px 35px rgba(15,23,42,0.14)',
        ring: '0 0 0 2px rgba(220,0,43,0.18)'
      };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 46,
      backgroundColor: state.isFocused ? colors.controlHover : colors.control,
      borderColor: state.isFocused ? colors.borderFocus : colors.border,
      borderRadius: isDark ? 12 : 8,
      boxShadow: state.isFocused ? colors.ring : 'none',
      color: colors.text,
      cursor: 'pointer',
      transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
      '&:hover': {
        borderColor: colors.borderFocus,
        backgroundColor: colors.controlHover
      }
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 16px'
    }),
    input: base => ({
      ...base,
      color: colors.text
    }),
    singleValue: base => ({
      ...base,
      color: colors.text
    }),
    placeholder: base => ({
      ...base,
      color: colors.muted
    }),
    menu: base => ({
      ...base,
      backgroundColor: colors.menu,
      border: `1px solid ${colors.border}`,
      borderRadius: isDark ? 12 : 8,
      boxShadow: colors.shadow,
      overflow: 'hidden',
      zIndex: 9999
    }),
    menuPortal: base => ({
      ...base,
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? colors.optionSelected
        : state.isFocused
          ? colors.optionFocus
          : colors.option,
      color: state.isSelected ? '#ffffff' : colors.text,
      cursor: 'pointer',
      fontSize: 14,
      ':active': {
        backgroundColor: state.isSelected ? colors.optionSelected : colors.optionFocus
      }
    }),
    indicatorSeparator: base => ({
      ...base,
      backgroundColor: colors.border
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? colors.borderFocus : colors.muted,
      '&:hover': {
        color: colors.borderFocus
      }
    }),
    clearIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? colors.borderFocus : colors.muted,
      '&:hover': {
        color: colors.borderFocus
      }
    }),
    noOptionsMessage: base => ({
      ...base,
      color: colors.muted
    })
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-surface-300 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Select
        classNamePrefix="app-select"
        value={selected}
        onChange={option => onChange(option?.value ?? '')}
        options={normalizedOptions}
        placeholder={placeholder}
        isClearable={isClearable}
        required={required}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={selectStyles}
      />
    </div>
  );
};

export default AppSelect;
