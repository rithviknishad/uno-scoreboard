import { useState } from 'react';
import { DateFilterPreset } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarBlank } from '@phosphor-icons/react';
import { getDateRangeForPreset } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateFilterProps {
  since: string | null;
  till: string | null;
}

export function DateFilter({ since, till }: DateFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>(
    since ? new Date(since) : undefined
  );
  const [tempEnd, setTempEnd] = useState<Date | undefined>(
    till ? new Date(till) : undefined
  );

  const presets: { value: DateFilterPreset; label: string }[] = [
    { value: 'all-time', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-week', label: 'Last 7 Days' },
    { value: 'last-month', label: 'Last 30 Days' },
    { value: 'last-year', label: 'Last Year' },
  ];

  const updateQueryParams = (newSince: string | null, newTill: string | null) => {
    const params = new URLSearchParams(window.location.search);
    
    if (newSince) {
      params.set('since', newSince);
    } else {
      params.delete('since');
    }
    
    if (newTill) {
      params.set('till', newTill);
    } else {
      params.delete('till');
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.pushState({}, '', newUrl);
    // Trigger a re-render by dispatching a custom event
    window.dispatchEvent(new Event('popstate'));
  };

  const handleApplyCustomRange = () => {
    if (tempStart && tempEnd) {
      updateQueryParams(
        format(tempStart, "yyyy-MM-dd"),
        format(tempEnd, "yyyy-MM-dd")
      );
      setIsCalendarOpen(false);
    }
  };

  const handlePresetClick = (value: DateFilterPreset) => {
    const { since: newSince, till: newTill } = getDateRangeForPreset(value);
    updateQueryParams(newSince, newTill);
  };

  // Determine if we're in a custom range (not matching any preset)
  const isCustomRange = since && till && !presets.some((preset) => {
    const range = getDateRangeForPreset(preset.value);
    return range.since === since && range.till === till;
  });

  // Determine active preset
  const activePreset = presets.find((preset) => {
    const range = getDateRangeForPreset(preset.value);
    return range.since === since && range.till === till;
  })?.value;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((item) => (
        <Button
          key={item.value}
          variant={activePreset === item.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick(item.value)}
          className={cn(
            'transition-all',
            activePreset === item.value && 'shadow-md'
          )}
        >
          {item.label}
        </Button>
      ))}

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomRange ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all',
              isCustomRange && 'shadow-md'
            )}
          >
            <CalendarBlank className="w-4 h-4 mr-2" />
            {isCustomRange && since && till
              ? `${format(new Date(since), 'MMM d, yyyy')} - ${format(new Date(till), 'MMM d, yyyy')}`
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
