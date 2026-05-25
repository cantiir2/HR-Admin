const UserAvatar = ({ name = '', photo, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-14 h-14 rounded-2xl text-xl',
    lg: 'w-24 h-24 rounded-2xl text-3xl'
  };

  return (
    <div className={`${sizes[size] || sizes.md} overflow-hidden gradient-brand flex items-center justify-center font-bold shadow-lg shadow-brand-500/20 flex-shrink-0 ${className}`}>
      {photo ? (
        <img src={photo} alt={name || 'User'} className="w-full h-full object-cover" />
      ) : (
        name?.charAt(0)?.toUpperCase()
      )}
    </div>
  );
};

export default UserAvatar;
