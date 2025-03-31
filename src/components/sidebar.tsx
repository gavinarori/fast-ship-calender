"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Menu, X, Code, Github, Calendar, Terminal } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Event } from "@/lib/models"

interface SidebarProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  onCreateEvent: () => void
  events: Event[]
  className?: string
}

export default function Sidebar({ currentDate, setCurrentDate, onCreateEvent, events, className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentViewMonth, setCurrentViewMonth] = useState(new Date(currentDate))
  const currentMonth = format(currentViewMonth, "MMMM yyyy")

  // Reset view month when current date changes significantly
  useEffect(() => {
    if (
      currentViewMonth.getFullYear() !== currentDate.getFullYear() ||
      currentViewMonth.getMonth() !== currentDate.getMonth()
    ) {
      setCurrentViewMonth(new Date(currentDate))
    }
  }, [currentDate, currentViewMonth])

  // Generate mini calendar days
  const generateMiniCalendarDays = () => {
    const firstDayOfMonth = new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth() + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayOffset = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday, etc.

    return Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
      i < firstDayOffset ? null : i - firstDayOffset + 1,
    )
  }

  const miniCalendarDays = generateMiniCalendarDays()

  // Check if a date has events
  const hasEvents = (day: number | null) => {
    if (!day) return false

    const checkDate = new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth(), day)
    const formattedDate = format(checkDate, "yyyy-MM-dd")

    return events.some((event) => event.date === formattedDate)
  }

  // Sample my calendars
  const myCalendars = [
    { name: "Coding Sessions", color: "bg-blue-500", icon: <Code className="h-4 w-4" /> },
    { name: "GitHub PRs", color: "bg-green-500", icon: <Github className="h-4 w-4" /> },
    { name: "Meetings", color: "bg-purple-500", icon: <Calendar className="h-4 w-4" /> },
    { name: "Deployments", color: "bg-orange-500", icon: <Terminal className="h-4 w-4" /> },
  ]

  const goToPreviousMonth = () => {
    setCurrentViewMonth(subMonths(currentViewMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentViewMonth(addMonths(currentViewMonth, 1))
  }

  const selectDay = (day: number) => {
    setCurrentDate(new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth(), day))
    setIsOpen(false)
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Dev Calendar</h2>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          className="mb-6 flex items-center justify-center gap-2 rounded-full px-4 py-3 w-full"
          onClick={() => {
            onCreateEvent()
            setIsOpen(false)
          }}
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Button>

        {/* Mini Calendar */}
        <div className="mb-6 border-b border-dotted border-border pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{currentMonth}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="p-1 rounded-full" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="p-1 rounded-full" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-xs text-muted-foreground font-medium py-1">
                {day}
              </div>
            ))}

            {miniCalendarDays.map((day, i) => {
              if (!day) return <div key={i} className="invisible w-7 h-7"></div>

              const date = new Date(currentViewMonth.getFullYear(), currentViewMonth.getMonth(), day)
              const isCurrentDay = isSameDay(date, currentDate)
              const dayHasEvents = hasEvents(day)

              return (
                <div
                  key={i}
                  className={cn(
                    "text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative",
                    isCurrentDay ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  onClick={() => selectDay(day)}
                >
                  {day}
                  {dayHasEvents && (
                    <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* My Calendars */}
        <div>
          <h3 className="font-medium mb-3">My calendars</h3>
          <div className="space-y-3">
            {myCalendars.map((cal, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                <div className="flex items-center gap-2 text-sm">
                  {cal.icon}
                  <span>{cal.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create button at bottom */}
      <Button
        className="mt-6 flex items-center justify-center gap-2 rounded-full p-4 w-14 h-14 self-start"
        onClick={() => {
          onCreateEvent()
          setIsOpen(false)
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )

  // For mobile: use Sheet component
  // For desktop: render directly
  return (
    <>
      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden absolute top-4 left-4 z-20"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="border-r border-dotted border-border p-6 w-[280px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn("hidden lg:block w-64 h-full p-6 shadow-sm border-r border-dotted border-border", className)}>
        {sidebarContent}
      </div>
    </>
  )
}

