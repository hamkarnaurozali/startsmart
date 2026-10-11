interface FieldProps {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
  error?: string | null;
}

export function Field({ id, label, help, value, onChange, unit, placeholder, error }: FieldProps) {
  const describedBy = [help ? `${id}-h` : '', error ? `${id}-e` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {help && (
        <p id={`${id}-h`} className="help">
          {help}
        </p>
      )}
      <div className="input-wrap">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          value={value}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="unit" aria-hidden="true">
          {unit}
        </span>
      </div>
      {error && (
        <p id={`${id}-e`} className="error" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
