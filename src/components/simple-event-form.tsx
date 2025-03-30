"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Event } from "@/lib/models"
import { Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface SimpleEventFormProps {
  onSubmit: (event: Event) => void
  onCancel: () => void
}

// Predefined categories with their colors
const categories = [
  { name: "Coding Sessions", color: "bg-blue-500", value: "coding" },
  { name: "GitHub PRs", color: "bg-green-500", value: "github" },
  { name: "Meetings", color: "bg-purple-500", value: "meetings" },
  { name: "Deployments", color: "bg-orange-500", value: "deployments" },
]

export default function SimpleEventForm({ onSubmit, onCancel }: SimpleEventFormProps) {
  const [formData, setFormData] = useState<Event>({
    title: "",
    startTime: "",
    endTime: "",
    date: "",
    color: "bg-blue-500",
    description: "",
    location: "",
    attendees: [],
    organizer: "You",
    tags: [],
    priority: "medium",
    reminderTime: 15,
  })

  const [formError, setFormError] = useState("")
  const [category, setCategory] = useState("coding")

  useEffect(() => {
    // Set default date to today
    const today = new Date()
    const formattedDate = format(today, "yyyy-MM-dd")

    // Set default times to next hour rounded to nearest 30 min
    const nextHour = new Date()
    nextHour.setHours(nextHour.getHours() + 1)
    nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 30) * 30)
    nextHour.setSeconds(0)

    const endTime = new Date(nextHour)
    endTime.setHours(endTime.getHours() + 1)

    const formatTimeForInput = (date: Date) => {
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    }

    setFormData((prev) => ({
      ...prev,
      date: formattedDate,
      startTime: formatTimeForInput(nextHour),
      endTime: formatTimeForInput(endTime),
      color: "bg-blue-500", // Default color for Coding Sessions
    }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)

    // Set color based on category
    const selectedCategory = categories.find((cat) => cat.value === value)
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        color: selectedCategory.color,
        tags: [...(prev.tags || []), selectedCategory.name],
      }))
    }
  }

  const validateForm = () => {
    if (!formData.title) {
      setFormError("Title is required")
      return false
    }
    if (!formData.startTime) {
      setFormError("Start time is required")
      return false
    }
    if (!formData.endTime) {
      setFormError("End time is required")
      return false
    }

    // Check if end time is after start time
    const eventStart = new Date(`${formData.date}T${formData.startTime}`)
    const eventEnd = new Date(`${formData.date}T${formData.endTime}`)
    if (eventEnd <= eventStart) {
      setFormError("End time must be after start time")
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-foreground">
      {formError && (
        <div className="bg-destructive/20 border border-destructive p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{formError}</span>
        </div>
      )}

      <div>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="bg-background/10 border-border text-foreground text-lg font-medium"
          placeholder="What are you working on?"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="bg-background/10 border-border text-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="bg-background/10 border-border text-foreground"
          />
        </div>
      </div>

      <div>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="bg-background/10 border-border text-foreground">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${cat.color}`}></div>
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-background/10 border-border text-foreground"
          placeholder="Add details (optional)"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  )
}

