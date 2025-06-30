import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Popover,
  RangeCalendar,
  OverlayArrow,
} from 'react-aria-components';
import {parseAbsoluteToLocal} from '@internationalized/date';
import React from "react";

import './DateRangePicker.css'

export default function DateRangePicker({ includedDates, dateRange, handleDateRangeChange }) {
    return (
        <AriaDateRangePicker 
            value={{
                start: parseAbsoluteToLocal(new Date(dateRange.startDate).toISOString()),
                end: parseAbsoluteToLocal(new Date(dateRange.endDate).toISOString())
            }}
            onChange={item => handleDateRangeChange({
                startDate: item.start.toDate().getTime(),
                endDate: item.end.toDate().getTime()
            })}
            granularity="day"
        >
            <Group>
                <DateInput slot="start">
                {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <span aria-hidden="true">-</span>
                <DateInput slot="end">
                {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <Button>▼</Button>
            </Group>
            {/* {description && <Text slot="description">{description}</Text>} */}
            <FieldError>Error</FieldError>
            <Popover>
                <OverlayArrow>
                    <svg width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                    </svg>
                </OverlayArrow>
                <Dialog>
                    <RangeCalendar firstDayOfWeek={'mon'}>
                        <header>
                        <Button slot="previous">◀</Button>
                        <Heading />
                        <Button slot="next">▶</Button>
                        </header>
                        <CalendarGrid>
                        {(date) => <CalendarCell date={date} className={(date) => includedDates.includes(date.date.toDate().getTime()) ? "react-aria-CalendarCell available" : "react-aria-CalendarCell"} />}
                        </CalendarGrid>
                    </RangeCalendar>
                </Dialog>
            </Popover>
        </AriaDateRangePicker>
    )
}