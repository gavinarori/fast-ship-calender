import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET a specific event
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to fetch event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT (update) an event
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    // Check if event is in the past if date or time is being updated
    if (updates.date || updates.startTime) {
      const existingEvent = await prisma.event.findUnique({
        where: { id }
      })
      
      if (!existingEvent) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      
      const eventDate = updates.date || existingEvent.date
      const eventTime = updates.startTime || existingEvent.startTime

      const eventStart = new Date(`${eventDate}T${eventTime}`)
      const now = new Date()

      if (eventStart < now) {
        return NextResponse.json({ error: "Cannot reschedule to a time in the past" }, { status: 400 })
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updates
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE an event
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
