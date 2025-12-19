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

export type CommandOption = {
  label: string;
  value: string;
  description?: string;
};

interface CommandSelectProps {
  options: CommandOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const CommandSelect: React.FC<CommandSelectProps> = ({
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  value,
  onChange,
  label,
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    value
  );
  const [search, setSearch] = React.useState("");

  // sync when controlled from outside
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const selectedOption = options.find((o) => o.value === internalValue);

  const handleSelect = (val: string) => {
    const nextValue = val === internalValue ? undefined : val;

    setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // clear search whenever the popover is opened
    if (nextOpen) {
      setSearch("");
    }
    setOpen(nextOpen);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedOption && "text-muted-foreground"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="flex flex-col items-start gap-0.5"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>{option.label}</span>
                      {internalValue === option.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
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

