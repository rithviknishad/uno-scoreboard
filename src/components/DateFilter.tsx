import { useState } from 'react';
import { DateFilterPreset } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarBlank } from '@phosphor-icons/react';
import { getDateRangeLabel } from '@/lib/stats';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  preset: DateFilterPreset;
  onPresetChange: (preset: DateFilterPreset) => void;
  customStart?: Date;
  customEnd?: Date;
  onCustomRangeChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateFilter({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomRangeChange,
}: DateFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>(customStart);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(customEnd);

  const presets: { value: DateFilterPreset; label: string }[] = [
    { value: 'all-time', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-week', label: 'Last 7 Days' },
    { value: 'last-month', label: 'Last 30 Days' },
    { value: 'last-year', label: 'Last Year' },
  ];

  const handleApplyCustomRange = () => {
    if (tempStart && tempEnd) {
      onCustomRangeChange(tempStart, tempEnd);
      onPresetChange('custom');
      setIsCalendarOpen(false);
    }
  };

  const handlePresetClick = (value: DateFilterPreset) => {
    onPresetChange(value);
    if (value !== 'custom') {
      onCustomRangeChange(undefined, undefined);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((item) => (
        <Button
          key={item.value}
          variant={preset === item.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick(item.value)}
          className={cn(
            'transition-all',
            preset === item.value && 'shadow-md'
          )}
        >
          {item.label}
        </Button>
      ))}

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={preset === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all',
              preset === 'custom' && 'shadow-md'
            )}
          >
            <CalendarBlank className="w-4 h-4 mr-2" />
            {preset === 'custom'
              ? getDateRangeLabel('custom', customStart, customEnd)
              : 'Custom Range'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Start Date</p>
              <Calendar
                mode="single"
                selected={tempStart}
                onSelect={setTempStart}
                initialFocus
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">End Date</p>
              <Calendar
                mode="single"
                selected={tempEnd}
                onSelect={setTempEnd}
                disabled={(date) => {
                  if (!tempStart) return false;
                  return date < tempStart;
                }}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleApplyCustomRange}
              disabled={!tempStart || !tempEnd}
            >
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
