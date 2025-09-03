import { useMemo } from 'react';
import * as dates from 'date-arithmetic';
import { Navigate, DateLocalizer } from 'react-big-calendar';
// @ts-ignore - TimeGrid doesn't have proper type definitions
import TimeGrid from 'react-big-calendar/lib/TimeGrid';

interface WeekdayViewProps {
  date: Date;
  localizer: DateLocalizer;
  max?: Date;
  min?: Date;
  scrollToTime?: Date;
  [key: string]: any;
}

function WeekdayView({
  date,
  localizer,
  max = localizer.endOf(new Date(), 'day'),
  min = localizer.startOf(new Date(), 'day'),
  scrollToTime = localizer.startOf(new Date(), 'day'),
  ...props
}: WeekdayViewProps) {
  const currRange = useMemo(
    () => WeekdayView.range(date, { localizer }),
    [date, localizer]
  );

  return (
    <TimeGrid
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  );
}

// Static methods for the custom view
WeekdayView.range = (date: Date, { localizer: _localizer }: { localizer: DateLocalizer }) => {
  // Find Monday of the current week
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday (0), go back 6 days
  const monday = dates.add(date, mondayOffset, 'day');
  
  // Create range from Monday to Friday
  const range: Date[] = [];
  for (let i = 0; i < 5; i++) {
    range.push(dates.add(monday, i, 'day'));
  }

  return range;
};

WeekdayView.navigate = (date: Date, action: string, { localizer }: { localizer: DateLocalizer }) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -7, 'day'); // Go to previous week
    case Navigate.NEXT:
      return localizer.add(date, 7, 'day'); // Go to next week
    default:
      return date;
  }
};

WeekdayView.title = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  // Find Monday of the current week
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = dates.add(date, mondayOffset, 'day');
  const friday = dates.add(monday, 4, 'day');
  
  const startStr = localizer.format(monday, 'DD MMM');
  const endStr = localizer.format(friday, 'DD MMM YYYY');
  
  return `Haftaiçi: ${startStr} - ${endStr}`;
};

export default WeekdayView;
