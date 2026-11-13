import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'bg-primary-50 text-primary-600',
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <h4 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h4>
        {change && (
          <p className="text-xs font-medium flex items-center gap-1">
            <span className={cn(isPositive ? 'text-emerald-600' : 'text-rose-600')}>
              {isPositive ? '↑' : '↓'} {change}
            </span>
            <span className="text-slate-400">vs last month</span>
          </p>
        )}
      </div>
      <div className={cn('p-3.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm', iconColor)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

