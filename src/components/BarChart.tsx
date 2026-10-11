export interface Bar {
  label: string;
  value: number;
  tone: 'brand' | 'slate' | 'muted' | 'bad';
}

interface Props {
  title: string;
  bars: Bar[];
  format: (n: number) => string;
}

/** Simple bars. Every value is also written as text, so the chart never relies on colour alone. */
export function BarChart({ title, bars, format }: Props) {
  const max = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <ul>
        {bars.map((b) => {
          const w = b.value === 0 ? 0 : Math.max(1.5, (Math.abs(b.value) / max) * 100);
          return (
            <li key={b.label}>
              <div className="bar-head">
                <span>{b.label}</span>
                <strong>{format(b.value)}</strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div className={`bar-fill tone-${b.tone}`} style={{ width: `${w}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
