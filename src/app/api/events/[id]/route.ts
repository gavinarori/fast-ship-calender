import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"

// GET a specific event
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession()

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        repository: {
          select: {
            name: true,
            fullName: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user has access to this event
    if (session?.user?.id && event.userId && event.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to fetch event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT (update) an event
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const session = await getServerSession()

    // Check if event exists and user has access
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user has access to this event
    if (session?.user?.id && existingEvent.userId && existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updates,
      include: {
        repository: {
          select: {
            name: true,
            fullName: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE an event
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession()

    // Check if event exists and user has access
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user has access to this event
    if (session?.user?.id && existingEvent.userId && existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
