import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(type: 'item' | 'container', name: string): string {
  // Create a simple colored placeholder based on the name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]

  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  const color = colors[Math.abs(hash) % colors.length]

  // Create a simple SVG placeholder
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}"/>
      <text x="50" y="55" font-family="Arial" font-size="10" fill="white" text-anchor="middle">
        ${type === 'item' ? 'BOX' : 'FOLDER'}
      </text>
    </svg>
  `

  // Encode SVG to base64 - use Buffer in Node.js, btoa in browser
  const encodedSvg = typeof Buffer !== 'undefined'
    ? Buffer.from(svg).toString('base64')
    : btoa(svg)

  return `data:image/svg+xml;base64,${encodedSvg}`
}