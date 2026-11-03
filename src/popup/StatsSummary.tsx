import { useState } from 'react';
import { MESSAGE_TYPES, sendMessage } from '../shared/messages';
import { formatAdCount, formatDuration, sumStats, type ServiceStats } from '../shared/stats';

interface StatsSummaryProps {
  stats: ServiceStats;
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
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
    <section className="flex items-end justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-gray-800 tabular-nums">
          {formatDuration(ms)}
        </p>
        <p className="text-xs text-gray-500">of ads muted · {formatAdCount(count)}</p>
      </div>

      <button
        type="button"
        onClick={handleReset}
        onBlur={() => setIsConfirmingReset(false)}
        className={`shrink-0 text-xs transition-colors duration-200 ${
          isConfirmingReset ? 'font-medium text-red-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {isConfirmingReset ? 'Click again to confirm' : 'Reset all stats'}
      </button>
    </section>
  );
};
