export interface Event {
  id?: string
  title: string
  startTime: string
  endTime: string
  date: string // YYYY-MM-DD format
  color: string
  description: string
  location: string
  attendees: string[]
  organizer: string
  isCompleted?: boolean
  tags?: string[]
  githubRepo?: string
  codeLanguage?: string
  priority?: "low" | "medium" | "high"
  reminderTime?: number // minutes before event
  notificationSent?: boolean
}

