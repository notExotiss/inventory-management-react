"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  value: string
  placeholder?: string
  className?: string
  onChange: (value: string) => void
  onClear?: () => void
}

export function SearchBar({
  value,
  placeholder = "Search items...",
  className = "",
  onChange,
  onClear
}: SearchBarProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleClear = () => {
    onChange("")
    onClear?.()
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute left-2.5 top-2.5 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>

      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-8 pr-8 w-full h-9 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
      />

      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 hover:bg-muted"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}