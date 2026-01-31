import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100'
}: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {trend !== undefined && (
              <p className="mt-2 text-sm">
                <span
                  className={cn(
                    'font-medium',
                    isPositive && 'text-green-600',
                    isNegative && 'text-red-600',
                    !isPositive && !isNegative && 'text-gray-600'
                  )}
                >
                  {isPositive && '+'}
                  {trend}%
                </span>
                <span className="text-gray-500 ml-1">{trendLabel}</span>
              </p>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
