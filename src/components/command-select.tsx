"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* =============================================================================
   TYPES
============================================================================= */

export type CommandOption = {
  label: string;               // search + accessibility
  value: string;
  description?: string;
  children?: React.ReactNode;  // custom render
};

export interface CommandSelectProps {
  options: CommandOption[];
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  onSearch?: (query: string) => void; // ✅ THIS WAS MISSING
  label?: string;
  disabled?: boolean;
  className?: string;
}

/* =============================================================================
   COMPONENT
============================================================================= */

const CommandSelect: React.FC<CommandSelectProps> = ({
  options,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  value,
  onChange,
  onSearch,
  label,
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] =
    React.useState<string | undefined>(value);
  const [search, setSearch] = React.useState("");

  /* sync controlled value */
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const selectedOption = options.find(
    (o) => o.value === internalValue
  );

  const handleSelect = (val: string) => {
    const next = val === internalValue ? undefined : val;
    setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSearch("");
      onSearch?.("");
    }
    setOpen(nextOpen);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearch?.(val);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className="text-sm font-medium">{label}</span>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedOption && "text-muted-foreground"
            )}
          >
            {selectedOption
              ? selectedOption.label
              : placeholder}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearch}
            />

            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>

              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() =>
                      handleSelect(option.value)
                    }
                    className="flex items-center justify-between gap-2"
                  >
                    {option.children ?? (
                      <span>{option.label}</span>
                    )}
                    {internalValue === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommandSelect;
