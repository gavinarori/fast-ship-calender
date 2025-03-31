import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET all events
export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST new event
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Validate event data
    if (!event.title || !event.startTime || !event.endTime || !event.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if event is in the past
    const eventStart = new Date(`${event.date}T${event.startTime}`)
    const now = new Date()

    if (eventStart < now) {
      return NextResponse.json({ error: "Cannot schedule events in the past" }, { status: 400 })
    }

    const newEvent = await prisma.event.create({
      data: {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: event.date,
        color: event.color,
        description: event.description || "",
        isCompleted: event.isCompleted || false,
        priority: event.priority || null,
        reminderTime: event.reminderTime || null,
        notificationSent: event.notificationSent || false,
      },
    })

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}

