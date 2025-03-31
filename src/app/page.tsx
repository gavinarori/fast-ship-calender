"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CompactEventForm from "@/components/compact-event-form"
import SimpleEventForm from "@/components/simple-event-form"
import ReminderService from "@/components/reminder-service"
import Sidebar from "@/components/sidebar"
import EventCard from "@/components/event-card"
import ThemeToggle from "@/components/theme-toggle"
import EmptyState from "@/components/empty-state"
import CalendarSkeleton from "@/components/calendar-skeleton"
import type { Event } from "@/lib/models"
import { format, addDays, isToday } from "date-fns"
import { Button } from "@/components/ui/button"
import clsx from 'clsx';
import { FolderCode } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")

  // Constants for time display
  const START_HOUR = 8 // 8 AM
  const END_HOUR = 20 // 8 PM
  const TIME_SLOT_HEIGHT = 80 // pixels per hour

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/events")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch events")
        }

        const data = await response.json()
        setEvents(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleCreateEvent = async (eventData: Event) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      const newEvent = await response.json()
      setEvents((prev) => [...prev, newEvent])
      setShowEventForm(false)
      setError(null)
    } catch (err) {
      console.error("Error creating event:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEvent = async (eventData: Event) => {
    if (!eventData.id) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/events/${eventData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update event")
      }

      const updatedEvent = await response.json()
      setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
      setSelectedEvent(null)
      setError(null)
    } catch (err) {
      console.error("Error updating event:", err)
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete event")
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setSelectedEvent(null)
      setError(null)
    } catch (err) {
      console.error("Error deleting event:", err)
      setError(err instanceof Error ? err.message : "Failed to delete event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventDragEnd = async (event: Event, newStartTime: string, newEndTime: string) => {
    if (!event.id) return

    try {
      setIsLoading(true)
      const updatedEvent = { ...event, startTime: newStartTime, endTime: newEndTime }

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update event time")
      }

      const result = await response.json()
      setEvents((prev) => prev.map((e) => (e.id === result.id ? result : e)))
      setError(null)
    } catch (err) {
      console.error("Error updating event time:", err)
      setError(err instanceof Error ? err.message : "Failed to update event time")
    } finally {
      setIsLoading(false)
    }
  }

  // Format dates for display
  const formattedCurrentDate = format(currentDate, "EEEE, MMMM d, yyyy")

  // Navigate to previous/next day
  const goToPreviousDay = () => {
    setCurrentDate((prev) => addDays(prev, -1))
  }

  const goToNextDay = () => {
    setCurrentDate((prev) => addDays(prev, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Filter events for the current day view
  const todaysEvents = events.filter((event) => {
    // First apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        event.title.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Then filter by current date
    const formattedCurrentDate = format(currentDate, "yyyy-MM-dd")
    return event.date === formattedCurrentDate
  })

  // Generate time slots
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  // Determine if we should show the empty state
  const showEmptyState = !isLoading && !error && todaysEvents.length === 0

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Navigation */}
      <header className="border-b border-border border-dotted flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4 lg:ml-64">
        <div
      className={clsx(
        'flex flex-none items-center h-[40px] w-[40px] rounded-xl justify-center border border-neutral-200 bg-green-600 dark:border-neutral-700 ',
      )}
    >
      <FolderCode />
    </div>
          <span className="text-xl font-semibold">Dev Mode Calendar</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-[calc(100vh-4rem)] w-full flex">
        {/* Sidebar */}
        <Sidebar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onCreateEvent={() => setShowEventForm(true)}
          events={events}
        />

        {/* Calendar View */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-dotted border-border">
            <div className="flex items-center gap-2 md:gap-4">
              <Button className="px-2 md:px-4 py-2 rounded-md text-xs md:text-sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex">
                <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <h2 className="text-base md:text-xl font-semibold truncate">{formattedCurrentDate}</h2>
            </div>

            <div className="flex items-center">
              <Button
                className="flex items-center gap-2 rounded-full p-2 md:px-4 md:py-2"
                onClick={() => setShowEventForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Event</span>
              </Button>
            </div>
          </div>

          {/* Day View */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-destructive bg-destructive/10 p-4 rounded-md border border-destructive/20">
                  {error}
                  <Button variant="outline" className="ml-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {!error && (
              <div className="border border-dotted border-border rounded-xl h-full overflow-y-auto">
                {isLoading ? (
                  <CalendarSkeleton timeSlotHeight={TIME_SLOT_HEIGHT} startHour={START_HOUR} endHour={END_HOUR} />
                ) : showEmptyState ? (
                  <EmptyState onCreateEvent={() => setShowEventForm(true)} />
                ) : (
                  <div className="relative min-h-full">
                    {/* Time Labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-dotted border-border z-10">
                      {timeSlots.map((time, i) => (
                        <div
                          key={i}
                          className="border-b border-dotted border-border pr-2 text-right text-xs flex items-center justify-end"
                          style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                        >
                          <span className="text-muted-foreground pr-2">
                            {time > 12 ? `${time - 12} PM` : time === 12 ? "12 PM" : `${time} AM`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Events Container */}
                    <div className="ml-16 relative">
                      {/* Time Grid Lines */}
                      {timeSlots.map((_, i) => (
                        <div
                          key={i}
                          className="border-b border-dotted border-border"
                          style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                        ></div>
                      ))}

                      {/* Current Time Indicator */}
                      {isToday(currentDate) && (
                        <div
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                          style={{
                            top: `${(new Date().getHours() - START_HOUR + new Date().getMinutes() / 60) * TIME_SLOT_HEIGHT}px`,
                          }}
                        >
                          <div className="absolute -left-1 -top-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                            <Clock className="h-2 w-2 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Events */}
                      {todaysEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => setSelectedEvent(event)}
                          onDragEnd={(newStartTime, newEndTime) => handleEventDragEnd(event, newStartTime, newEndTime)}
                          timeSlotHeight={TIME_SLOT_HEIGHT}
                          startHour={START_HOUR}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="border-border max-w-md">
              <CompactEventForm
                event={selectedEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => setSelectedEvent(null)}
                onDelete={() => selectedEvent.id && handleDeleteEvent(selectedEvent.id)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Create Event Dialog - Using SimpleEventForm */}
        <Dialog open={showEventForm} onOpenChange={(open) => !open && setShowEventForm(false)}>
          <DialogContent className="border-border max-w-md">
            <h2 className="text-xl font-bold mb-4">Quick Add</h2>
            <SimpleEventForm onSubmit={handleCreateEvent} onCancel={() => setShowEventForm(false)} />
          </DialogContent>
        </Dialog>
      </main>

      {/* Reminder Service */}
      <ReminderService events={events} />
    </div>
  )
}

