"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus, Search, Settings, Sparkles, X, Pause } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CompactEventForm from "@/components/compact-event-form"
import SimpleEventForm from "@/components/simple-event-form"
import ReminderService from "@/components/reminder-service"
import Sidebar from "@/components/sidebar"
import EventCard from "@/components/event-card"
import type { Event } from "@/lib/models"
import { format, addDays, isToday } from "date-fns"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")

  // Constants for time display
  const START_HOUR = 8 // 8 AM
  const END_HOUR = 20 // 8 PM
  const TIME_SLOT_HEIGHT = 80 // pixels per hour

  useEffect(() => {
    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "Looks like you don't have that many coding sessions today. Shall I play some focus music to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/events")

        if (!response.ok) {
          throw new Error("Failed to fetch events")
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
    } catch (err) {
      console.error("Error creating event:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
    }
  }

  const handleUpdateEvent = async (eventData: Event) => {
    if (!eventData.id) return

    try {
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
      setEditingEvent(null)
      setSelectedEvent(null)
    } catch (err) {
      console.error("Error updating event:", err)
      setError(err instanceof Error ? err.message : "Failed to update event")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete event")
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setSelectedEvent(null)
      setEditingEvent(null)
    } catch (err) {
      console.error("Error deleting event:", err)
      setError(err instanceof Error ? err.message : "Failed to delete event")
    }
  }

  const handleEventDragEnd = async (event: Event, newStartTime: string, newEndTime: string) => {
    if (!event.id) return

    try {
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
    } catch (err) {
      console.error("Error updating event time:", err)
      setError(err instanceof Error ? err.message : "Failed to update event time")
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
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
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        event.codeLanguage?.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Then filter by current date
    const formattedCurrentDate = format(currentDate, "yyyy-MM-dd")
    return event.date === formattedCurrentDate
  })

  // Generate time slots
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4 lg:ml-64">
          <span className="text-2xl font-semibold text-white drop-shadow-lg hidden lg:block">Dev Calendar</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => {}}>
            <Settings className="h-6 w-6" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            D
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <Sidebar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onCreateEvent={() => setShowEventForm(true)}
        />

        {/* Calendar View */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                className="px-2 md:px-4 py-2 text-white bg-blue-500 rounded-md text-xs md:text-sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <div className="flex">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={goToNextDay}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <h2 className="text-base md:text-xl font-semibold text-white truncate">{formattedCurrentDate}</h2>
            </div>

            <div className="flex items-center">
              <Button
                className="flex items-center gap-2 bg-blue-500 text-white rounded-full p-2 md:px-4 md:py-2"
                onClick={() => setShowEventForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Event</span>
              </Button>
            </div>
          </div>

          {/* Day View */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading calendar...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-400">{error}</div>
              </div>
            ) : (
              <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full overflow-y-auto">
                {/* Time Grid */}
                <div className="relative min-h-full">
                  {/* Time Labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-black/30 border-r border-white/20 z-10">
                    {timeSlots.map((time, i) => (
                      <div
                        key={i}
                        className="h-20 border-b border-white/10 pr-2 text-right text-xs flex items-center justify-end"
                        style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                      >
                        <span className="text-white/70 pr-2">
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
                        className="border-b border-white/10"
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
                        <div className="absolute -left-1 -top-2 w-4 h-4 rounded-full bg-red-500"></div>
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
              </div>
            )}
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[300px] md:w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Music</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="bg-gray-900/90 backdrop-blur-lg border-gray-800 text-white max-w-md">
              <CompactEventForm
                event={selectedEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => setSelectedEvent(null)}
                onDelete={() => selectedEvent.id && handleDeleteEvent(selectedEvent.id)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Create Event Dialog - Now using SimpleEventForm */}
        <Dialog open={showEventForm} onOpenChange={(open) => !open && setShowEventForm(false)}>
          <DialogContent className="bg-gray-900/90 backdrop-blur-lg border-gray-800 text-white max-w-md">
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

