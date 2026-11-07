import React, { useState, useEffect } from "react"

const COLORS = [
  "#059669", // emerald-600
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#d97706", // amber-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
  "#e11d48", // rose-600
]

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLORS.length
  return COLORS[index]
}

export function UserAvatar({
  src,
  name,
  className = "",
  style = {},
  onClick,
}: {
  src?: string | null
  name: string
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [src])

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : "?"
  const bgColor = stringToColor(name || "User")

  if (src && !error && src.trim() !== "" && !src.includes("ui-avatars.com")) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={style}
        onClick={onClick}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-white shrink-0 ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ backgroundColor: bgColor, ...style }}
      title={name}
      onClick={onClick}
    >
      {initial}
    </div>
  )
}
