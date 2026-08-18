import { icons } from 'lucide-react';

/**
 * Renders a lucide-react icon dynamically by its PascalCase name string.
 * Falls back to CircleDot if the name is not found.
 */
const DynamicIcon = ({ name, size = 18, className = '' }) => {
  const IconComponent = icons[name];
  if (!IconComponent) {
    const Fallback = icons['CircleDot'];
    return <Fallback size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;
