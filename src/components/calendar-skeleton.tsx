interface CalendarSkeletonProps {
  timeSlotHeight: number
  startHour: number
  endHour: number
}

export default function CalendarSkeleton({ timeSlotHeight, startHour, endHour }: CalendarSkeletonProps) {
  // Generate time slots for full 24 hours
  const timeSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)

  // Generate random events for the skeleton
  const skeletonEvents = [
    { top: 1 * timeSlotHeight, height: timeSlotHeight * 0.8, width: "70%" },
    { top: 3 * timeSlotHeight + 15, height: timeSlotHeight * 1.5, width: "85%" },
    { top: 6 * timeSlotHeight + 30, height: timeSlotHeight, width: "60%" },
    { top: 8 * timeSlotHeight + 10, height: timeSlotHeight * 0.7, width: "75%" },
    { top: 12 * timeSlotHeight + 20, height: timeSlotHeight * 1.2, width: "65%" },
    { top: 16 * timeSlotHeight + 5, height: timeSlotHeight * 0.9, width: "80%" },
    { top: 20 * timeSlotHeight + 25, height: timeSlotHeight * 0.6, width: "55%" },
  ]

  // Format time for 24-hour display
  const formatTimeLabel = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
  }

  return (
    <div className="relative min-h-full animate-pulse">
      {/* Time Labels */}
      <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-dotted border-border z-10">
        {timeSlots.map((time, i) => (
          <div
            key={i}
            className="border-b border-dotted border-border pr-2 text-right text-xs flex items-center justify-end"
            style={{ height: `${timeSlotHeight}px` }}
          >
            <div className="h-4 w-10 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      {/* Events Container */}
      <div className="ml-16 relative">
        {/* Time Grid Lines */}
        {timeSlots.map((_, i) => (
          <div key={i} className="border-b border-dotted border-border" style={{ height: `${timeSlotHeight}px` }}></div>
        ))}

        {/* Skeleton Events */}
        {skeletonEvents.map((event, i) => (
          <div
            key={i}
            className="absolute left-1 rounded-md bg-muted"
            style={{
              top: `${event.top}px`,
              height: `${event.height}px`,
              width: event.width,
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

