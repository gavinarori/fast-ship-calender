import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format dates
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to format time
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Helper function to check if a date is in the past
export function isDateInPast(date: string, time: string): boolean {
  const eventDate = new Date(`${date}T${time}`)
  return eventDate < new Date()
}

// Helper function to generate color based on priority
export function getPriorityColor(priority: string | undefined): string {
  switch (priority) {
    case "high":
      return "bg-red-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-green-500"
    default:
      return "bg-blue-500"
  }
}

// Helper function to generate color based on language
export function getLanguageColor(language: string | undefined): string {
  const colorMap: Record<string, string> = {
    JavaScript: "bg-yellow-500",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Java: "bg-orange-500",
    "C#": "bg-purple-500",
    PHP: "bg-indigo-500",
    Go: "bg-cyan-500",
    Ruby: "bg-red-500",
    Rust: "bg-amber-500",
    Swift: "bg-pink-500",
  }

  return language ? colorMap[language] || "bg-gray-500" : "bg-gray-500"
}

