'use client';

import { getRiskColor } from '@/lib/utils';

interface RiskDistributionProps {
  data: {
    prohibited: number;
    high: number;
    limited: number;
    minimal: number;
  };
}

export function RiskDistribution({ data }: RiskDistributionProps) {
  const total = data.prohibited + data.high + data.limited + data.minimal;

  const riskItems = [
    { label: 'Prohibited', value: data.prohibited, category: 'PROHIBITED' },
    { label: 'High Risk', value: data.high, category: 'HIGH' },
    { label: 'Limited Risk', value: data.limited, category: 'LIMITED' },
    { label: 'Minimal Risk', value: data.minimal, category: 'MINIMAL' },
  ];

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No AI systems registered yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {riskItems.map((item) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const colorClass = getRiskColor(item.category);

        return (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.value} ({percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass.split(' ')[0]} transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
