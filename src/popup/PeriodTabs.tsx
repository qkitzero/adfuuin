import { STATS_PERIODS, type StatsPeriod } from '../shared/stats';

interface PeriodTabsProps {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export const PeriodTabs = ({ period, onPeriodChange }: PeriodTabsProps) => (
  <div role="tablist" className="flex gap-0.5 rounded-lg bg-gray-200/70 p-0.5">
    {STATS_PERIODS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={period === key}
        onClick={() => onPeriodChange(key)}
        className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
          period === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
