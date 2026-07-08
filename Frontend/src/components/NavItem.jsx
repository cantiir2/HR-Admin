import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const NavItem = ({ item, setSidebarOpen }) => {
  const location = useLocation();
  const isChildActive = item.subItems?.some(sub => location.pathname === sub.to);
  const [isOpen, setIsOpen] = useState(isChildActive || false);

  if (!item.subItems) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
            : 'text-surface-400 hover:text-white hover:bg-white/[0.06]'
          }`
        }
      >
        <item.icon size={18} />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isChildActive || isOpen
            ? 'text-white bg-white/[0.06]'
            : 'text-surface-400 hover:text-white hover:bg-white/[0.06]'
          }`}
      >
        <div className="flex items-center gap-3">
          <item.icon size={18} />
          {item.label}
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="ml-5 pl-4 py-1 border-l border-white/[0.1] space-y-1">
          {item.subItems.map(subItem => (
            <NavLink
              key={subItem.to}
              to={subItem.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
                  : 'text-surface-400 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <subItem.icon size={16} />
              {subItem.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavItem;
