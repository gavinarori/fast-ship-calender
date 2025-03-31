"use client"

import { CalendarX, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onCreateEvent: () => void
  message?: string
}

export default function EmptyState({ onCreateEvent, message = "No events scheduled for today" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <CalendarX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your schedule is clear. Add an event to start planning your day.
      </p>
      <Button onClick={onCreateEvent} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span>Create Event</span>
      </Button>
    </div>
  )
}

