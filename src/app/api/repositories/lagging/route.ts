import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { subDays } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find repositories that haven't been updated in 7 days and have open issues
    const sevenDaysAgo = subDays(new Date(), 7)

    const laggingRepositories = await prisma.repository.findMany({
      where: {
        userId: user.id,
        lastUpdated: {
          lt: sevenDaysAgo,
        },
        openIssuesCount: {
          gt: 0,
        },
        isActive: true,
      },
      orderBy: {
        lastUpdated: "asc",
      },
      include: {
        events: {
          where: {
            date: {
              gte: new Date().toISOString().split("T")[0], // Today or future events
            },
          },
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    })

    return NextResponse.json(laggingRepositories)
  } catch (error) {
    console.error("Failed to fetch lagging repositories:", error)
    return NextResponse.json({ error: "Failed to fetch lagging repositories" }, { status: 500 })
  }
}

