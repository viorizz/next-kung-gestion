"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxItem {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
    items,
    value,
    onChange,
    placeholder = "Select an option",
    emptyMessage = "No results found.",
    disabled = false,
    className,
  }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
  
    // Improved value comparison
    const selectedItem = items.find(item => 
      String(item.value) === String(value)
    )
  
    const handleSelect = (itemValue: string) => {
      if (itemValue === value) {
        onChange('') // Allow deselection
      } else {
        onChange(itemValue)
      }
      setOpen(false)
    }
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between", className)}
            onClick={() => !disabled && setOpen(true)}
          >
            {selectedItem ? selectedItem.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" forceMount>
          <Command value={value || ""}>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => handleSelect(item.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }