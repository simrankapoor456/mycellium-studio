"use client";

import { useMemo, useRef, useState } from "react";

import { FormField } from "@/components/ui/FormField";

export function ComboboxField({
  error,
  hint,
  id,
  label,
  name,
  onValueChange,
  options,
  placeholder,
  requirement = "optional",
  value,
}: Readonly<{
  error?: string | undefined;
  hint?: string | undefined;
  id: string;
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string | undefined;
  requirement?: "required" | "optional" | undefined;
  value: string;
}>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const filteredOptions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    const matches = query ? options.filter((option) => option.toLocaleLowerCase().includes(query)) : options;
    return matches.slice(0, 10);
  }, [options, value]);
  const descriptionId = `${id}-description`;
  const listboxId = `${id}-options`;
  const activeOption = filteredOptions[activeIndex];

  function choose(option: string) {
    onValueChange(option);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <FormField error={error} hint={hint} htmlFor={id} label={label} requirement={requirement}>
      <div
        className="form-combobox"
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        ref={rootRef}
      >
        <input
          aria-activedescendant={open && activeOption ? `${listboxId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-describedby={error || hint ? descriptionId : undefined}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-required={requirement === "required"}
          className="form-control mt-2"
          id={id}
          name={name}
          onChange={(event) => { onValueChange(event.currentTarget.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
            if (event.key === "Enter" && open && activeOption) { event.preventDefault(); choose(activeOption); }
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          role="combobox"
          required={requirement === "required"}
          value={value}
        />
        {open && filteredOptions.length > 0 ? (
          <div className="form-combobox__options" id={listboxId} role="listbox">
            {filteredOptions.map((option, index) => (
              <button
                aria-selected={value === option}
                id={`${listboxId}-${index}`}
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                role="option"
                type="button"
              >{option}</button>
            ))}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
