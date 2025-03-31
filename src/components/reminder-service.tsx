"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/lib/models"
import NotificationSound from "./notification-sound"
import { X } from "lucide-react"

interface ReminderServiceProps {
  events: Event[]
}

export default function ReminderService({ events }: ReminderServiceProps) {
  const [notifications, setNotifications] = useState<Event[]>([])
  const [playSound, setPlaySound] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission)

      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          setPermission(perm)
        })
      }
    }
  }, [])

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const upcomingEvents = events.filter((event) => {
        if (event.notificationSent) return false

        const eventDate = new Date(`${event.date}T${event.startTime}`)
        const reminderTime = event.reminderTime || 15 // Default to 15 minutes
        const reminderDate = new Date(eventDate.getTime() - reminderTime * 60000)

        // Check if it's time for the reminder
        return now >= reminderDate && now < eventDate
      })

      if (upcomingEvents.length > 0) {
        setNotifications(upcomingEvents)
        setPlaySound(true)

        // Mark these events as notified
        upcomingEvents.forEach(async (event) => {
          if (event.id) {
            try {
              await fetch(`/api/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationSent: true }),
              })
            } catch (error) {
              console.error("Failed to update notification status:", error)
            }
          }
        })

        // Show browser notifications if permitted
        if (permission === "granted") {
          upcomingEvents.forEach((event) => {
            new Notification(`Reminder: ${event.title}`, {
              body: `Starting in ${event.reminderTime} minutes at ${event.startTime}`,
              icon: "/favicon.ico",
            })
          })
        }
      }
    }

    // Check for reminders every minute
    const intervalId = setInterval(checkReminders, 60000)
    // Also check immediately on mount or when events change
    checkReminders()

    return () => clearInterval(intervalId)
  }, [events, permission])

  const handleSoundEnded = () => {
    setPlaySound(false)
  }

  const dismissNotification = (eventId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== eventId))
  }

  if (notifications.length === 0) {
    return <NotificationSound play={playSound} onEnded={handleSoundEnded} />
  }

  return (
    <>
      <NotificationSound play={playSound} onEnded={handleSoundEnded} />

      <div className="fixed bottom-8 left-8 z-20 space-y-4">
        {notifications.map((event) => (
          <div key={event.id} className={`${event.color} p-4 rounded-lg shadow-lg max-w-sm animate-fade-in`}>
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white">{event.title}</h4>
              <button onClick={() => dismissNotification(event.id!)} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-white/90 text-sm mt-1">
              Starting in {event.reminderTime} minutes at {event.startTime}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

