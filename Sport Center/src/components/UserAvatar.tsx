import React, { useState } from 'react';

const COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', 
  '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', 
  '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export function UserAvatar({
  src,
  name,
  className = "",
  style = {},
  onClick
}: {
  src?: string | null;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const bgColor = stringToColor(name || 'User');

  if (src && !error && src.trim() !== '') {
    return (
      <img 
        src={src} 
        alt={name} 
        className={className} 
        style={style}
        onClick={onClick}
        onError={() => setError(true)} 
      />
    );
  }

  return (
    <div 
      className={`flex items-center justify-center font-bold text-white shrink-0 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: bgColor, ...style }}
      title={name}
      onClick={onClick}
    >
      {initial}
    </div>
  );
}
