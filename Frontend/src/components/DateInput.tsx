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

function formatDraft(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateInput({ value = "", onChange, className = "", placeholder = "dd/mm/yyyy", ...props }: DateInputProps) {
  const [draft, setDraft] = useState(() => toDisplayDate(value));

  useEffect(() => {
    setDraft(toDisplayDate(value));
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextDraft = formatDraft(event.target.value);
    setDraft(nextDraft);

    if (!nextDraft) {
      onChange?.("");
      return;
    }

    const isoValue = toIsoDate(nextDraft);
    if (isoValue) onChange?.(isoValue);
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
        placeholder={placeholder}
        className={className}
        maxLength={10}
      />
      {props.name && <input type="hidden" name={props.name} value={toIsoDate(draft)} />}
    </>
  );
}

