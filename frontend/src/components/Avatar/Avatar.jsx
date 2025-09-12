// src/components/Avatar/Avatar.jsx
import React from 'react';

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl'
};

const statusSizes = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4'
};

export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  showStatus = false, 
  isOnline = false,
  className = '',
  onClick
}) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-red-400',
      'bg-yellow-400', 
      'bg-green-400',
      'bg-blue-400',
      'bg-indigo-400',
      'bg-purple-400',
      'bg-pink-400'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          rounded-full 
          flex 
          items-center 
          justify-center 
          font-medium 
          text-white
          ${src ? '' : getBackgroundColor(name)}
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        `}
        onClick={onClick}
        title={name}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span 
          className={`${src ? 'hidden' : 'flex'} items-center justify-center h-full w-full`}
          style={{ display: src ? 'none' : 'flex' }}
        >
          {initials}
        </span>
      </div>
      
      {showStatus && (
        <span
          className={`
            absolute 
            ${statusSizes[size]}
            ${isOnline ? 'bg-green-400' : 'bg-gray-400'}
            border-2 
            border-white 
            rounded-full 
            -bottom-0.5 
            -right-0.5
          `}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}