type Props = {
  percent: number;
  expectedPercent?: number;
  className?: string;
};

export default function ProgressBar({ percent, expectedPercent, className = "" }: Props) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const isOnPace = expectedPercent === undefined || clamped >= expectedPercent;

  return (
    <div className={`relative h-2.5 w-full rounded-full bg-lace overflow-hidden ${className}`}>
      {expectedPercent !== undefined && (
        <div
          className="absolute top-0 h-full w-0.5 bg-bark-muted/40 z-10"
          style={{ left: `${Math.min(expectedPercent, 100)}%` }}
        />
      )}
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isOnPace ? "bg-sage" : "bg-blush"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
