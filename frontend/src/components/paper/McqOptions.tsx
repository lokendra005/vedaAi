interface McqOptionsProps {
  options: string[];
}

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f'];

export function McqOptions({ options }: McqOptionsProps) {
  return (
    <ul className="mt-3 space-y-2 list-none pl-2">
      {options.map((opt, i) => (
        <li key={i} className="flex gap-3 text-sm text-text-primary">
          <span className="font-semibold shrink-0 w-6">({LABELS[i]})</span>
          <span className="leading-relaxed">{opt}</span>
        </li>
      ))}
    </ul>
  );
}
