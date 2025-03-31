export interface Event {
  id?: string
  title: string
  startTime: string
  endTime: string
  date: string // YYYY-MM-DD format
  color: string
  description?: string
  isCompleted?: boolean
  priority?: "low" | "medium" | "high"
  reminderTime?: number // minutes before event
  notificationSent?: boolean
}

