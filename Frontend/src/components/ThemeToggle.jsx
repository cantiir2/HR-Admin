import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-surface-400 hover:text-brand-400 hover:bg-white/[0.1] transition-colors"
      aria-label={isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Icon size={18} />
    </button>
  );
};

export default ThemeToggle;
