import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder = "••••••••", required = true, label = "Password", className = "" }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-surface-300 mb-2">{label}</label>}
      <div className="relative">
        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type={showPassword ? 'text' : 'password'}
          required={required}
          className="input-dark pl-11 pr-11"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
