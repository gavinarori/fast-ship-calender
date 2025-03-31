"use client"

import { useState, useRef } from "react"
import type { Event } from "@/lib/models"
import { formatTime, getPriorityColor } from "@/lib/utils"
import { Clock, Grip } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDrag } from "@/hooks/use-drag"

interface EventCardProps {
  event: Event
  onClick: () => void
  onDragEnd: (newStartTime: string, newEndTime: string) => void
  timeSlotHeight: number
  startHour: number
}

export default function EventCard({ event, onClick, onDragEnd, timeSlotHeight, startHour }: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const eventColor = event.color || getPriorityColor(event.priority)

  // Calculate position and height
  const calculatePosition = () => {
    const [startHourVal, startMinuteVal] = event.startTime.split(":").map(Number)
    const [endHourVal, endMinuteVal] = event.endTime.split(":").map(Number)

    const start = startHourVal + startMinuteVal / 60
    const end = endHourVal + endMinuteVal / 60

    const top = (start - startHour) * timeSlotHeight
    const height = (end - start) * timeSlotHeight

    return { top, height }
  }

  const { top, height } = calculatePosition()

  // Handle drag functionality
  const { handleMouseDown } = useDrag({
    ref: cardRef as any,
    onDragStart: () => setIsDragging(true),
    onDragEnd: (offsetY) => {
      setIsDragging(false)

      // Calculate new times based on drag offset
      const hourOffset = offsetY / timeSlotHeight

      const [startHourVal, startMinuteVal] = event.startTime.split(":").map(Number)
      const [endHourVal, endMinuteVal] = event.endTime.split(":").map(Number)

      const newStartHour = Math.floor(startHourVal + hourOffset)
      const newStartMinute = Math.round(((startHourVal + hourOffset) % 1) * 60)

      const duration = endHourVal + endMinuteVal / 60 - (startHourVal + startMinuteVal / 60)
      const newEndHour = Math.floor(newStartHour + duration)
      const newEndMinute = Math.round(((newStartHour + duration) % 1) * 60)

      // Format times properly
      const formatTimeValue = (hour: number, minute: number) => {
        const adjustedHour = Math.max(0, Math.min(23, hour))
        const adjustedMinute = Math.max(0, Math.min(59, minute))
        return `${String(adjustedHour).padStart(2, "0")}:${String(adjustedMinute).padStart(2, "0")}`
      }

      const newStartTime = formatTimeValue(newStartHour, newStartMinute)
      const newEndTime = formatTimeValue(newEndHour, newEndMinute)

      onDragEnd(newStartTime, newEndTime)
    },
  })

  return (
    <div
      ref={cardRef}
      className={cn(
        `absolute left-1 right-1 rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all`,
        eventColor,
        isDragging ? "opacity-70 shadow-lg z-50" : "hover:translate-y-[-2px] hover:shadow-lg",
        event.isCompleted ? "opacity-60" : "",
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
      onClick={() => !isDragging && onClick()}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium truncate">{event.title}</h3>
        <div className="cursor-move touch-none" onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
          <Grip className="h-3 w-3 text-white/70" />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1 text-white/80">
        <Clock className="h-3 w-3" />
        <span className="text-[10px]">{formatTime(event.startTime)}</span>
      </div>

      {event.description && <div className="mt-1 text-[10px] text-white/80 line-clamp-2">{event.description}</div>}

      {event.priority && (
        <div className="absolute bottom-1 right-1 text-[8px] font-medium bg-white/20 px-1 rounded">
          {event.priority}
        </div>
      )}
    </div>
  )
}

