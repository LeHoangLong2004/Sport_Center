import React, { useEffect, useState } from "react";

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value?: string;
  onChange?: (value: string) => void;
};

function toIsoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function toDisplayDate(value?: string): string {
  if (!value) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function normalizeDraft(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 8 && !value.includes("/")) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
  return value.slice(0, 10);
}

export function DateInput({ value = "", onChange, className = "", placeholder = "dd/mm/yyyy", ...props }: DateInputProps) {
  const [draft, setDraft] = useState(() => toDisplayDate(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDraft(toDisplayDate(value));
  }, [value, isEditing]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Keep the exact text/caret position while editing. Formatting on every
    // keystroke moves slashes and makes replacing just the day/month/year hard.
    const nextDraft = event.target.value.slice(0, 10);
    setDraft(nextDraft);
    const isoValue = toIsoDate(nextDraft);
    onChange?.(isoValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const normalized = normalizeDraft(draft);
    const isoValue = toIsoDate(normalized);
    setDraft(isoValue ? toDisplayDate(isoValue) : normalized);
    onChange?.(isoValue);
    props.onBlur?.(event);
  };

  return (
    <>
      <input
        {...props}
        name={undefined}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={handleChange}
        onFocus={(event) => {
          setIsEditing(true);
          props.onFocus?.(event);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        maxLength={10}
      />
      {props.name && <input type="hidden" name={props.name} value={toIsoDate(draft)} />}
    </>
  );
}

