import { useState } from 'react';
import { MESSAGE_TYPES, sendMessage } from '../shared/messages';
import {
  formatAdCount,
  formatDuration,
  STATS_PERIODS,
  sumStats,
  type ServiceStats,
  type StatsPeriod,
} from '../shared/stats';

interface StatsSummaryProps {
  stats: ServiceStats;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export const StatsSummary = ({ stats, period, onPeriodChange }: StatsSummaryProps) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const { ms, count } = sumStats(stats);

  const handleReset = () => {
    if (!isConfirmingReset) {
      setIsConfirmingReset(true);
      return;
    }
    sendMessage({ type: MESSAGE_TYPES.RESET_STATS });
    setIsConfirmingReset(false);
  };

  return (
    <section className="rounded-xl bg-gray-50 p-4 space-y-3">
      <div role="tablist" className="flex gap-1 rounded-lg bg-gray-200/70 p-0.5">
        {STATS_PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={period === key}
            onClick={() => onPeriodChange(key)}
            className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200 ${
              period === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-3xl font-bold tracking-tight text-gray-800 tabular-nums">
          {formatDuration(ms)}
        </p>
        <p className="text-xs text-gray-500">of ads muted · {formatAdCount(count)}</p>
      </div>

      <button
        type="button"
        onClick={handleReset}
        onBlur={() => setIsConfirmingReset(false)}
        className={`text-xs transition-colors duration-200 ${
          isConfirmingReset ? 'font-medium text-red-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {isConfirmingReset ? 'Click again to reset all stats' : 'Reset stats'}
      </button>
    </section>
  );
};
