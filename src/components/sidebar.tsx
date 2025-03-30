"use client"

import { useState } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Menu, X, Code, Github, Calendar, Terminal } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  onCreateEvent: () => void
  className?: string
}

export default function Sidebar({ currentDate, setCurrentDate, onCreateEvent, className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentMonth = format(currentDate, "MMMM yyyy")

  // Generate mini calendar days
  const generateMiniCalendarDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayOffset = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday, etc.

    return Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
      i < firstDayOffset ? null : i - firstDayOffset + 1,
    )
  }

  const miniCalendarDays = generateMiniCalendarDays()

  // Sample my calendars
  const myCalendars = [
    { name: "Coding Sessions", color: "bg-blue-500", icon: <Code className="h-4 w-4" /> },
    { name: "GitHub PRs", color: "bg-green-500", icon: <Github className="h-4 w-4" /> },
    { name: "Meetings", color: "bg-purple-500", icon: <Calendar className="h-4 w-4" /> },
    { name: "Deployments", color: "bg-orange-500", icon: <Terminal className="h-4 w-4" /> },
  ]

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const selectDay = (day: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Dev Calendar</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
          onClick={() => {
            onCreateEvent()
            setIsOpen(false)
          }}
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Button>

        {/* Mini Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">{currentMonth}</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="p-1 rounded-full hover:bg-white/20 text-white"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 rounded-full hover:bg-white/20 text-white"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-xs text-white/70 font-medium py-1">
                {day}
              </div>
            ))}

            {miniCalendarDays.map((day, i) => {
              if (!day) return <div key={i} className="invisible w-7 h-7"></div>

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const isCurrentDay =
                date.getDate() === currentDate.getDate() &&
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear()

              return (
                <div
                  key={i}
                  className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer
                    ${isCurrentDay ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>

        {/* My Calendars */}
        <div>
          <h3 className="text-white font-medium mb-3">My calendars</h3>
          <div className="space-y-3">
            {myCalendars.map((cal, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                <div className="flex items-center gap-2 text-white text-sm">
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
        className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start"
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
        className="lg:hidden text-white absolute top-6 left-4 z-20"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="bg-black/90 backdrop-blur-lg border-r border-white/20 p-6 w-[280px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:block w-64 h-full bg-black/80 backdrop-blur-lg p-6 shadow-xl border-r border-white/20 rounded-tr-3xl",
          className,
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}

