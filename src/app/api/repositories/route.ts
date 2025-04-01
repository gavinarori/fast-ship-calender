import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { getUserRepositories } from "@/lib/github"

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

    // Get repositories from database
    const repositories = await prisma.repository.findMany({
      where: { userId: user.id },
      orderBy: { lastUpdated: "desc" },
    })

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Failed to fetch repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession()

    if (!session || !session.user || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch repositories from GitHub
    const githubRepos = await getUserRepositories(session.accessToken as string)

    // Update repositories in database
    const updatedRepos = await Promise.all(
      githubRepos.map(async (repo: any) => {
        return prisma.repository.upsert({
          where: { fullName: repo.full_name },
          update: {
            name: repo.name,
            description: repo.description || "",
            url: repo.html_url,
            lastUpdated: new Date(repo.updated_at),
            openIssuesCount: repo.open_issues_count,
            language: repo.language,
            lastSynced: new Date(),
          },
          create: {
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || "",
            url: repo.html_url,
            lastUpdated: new Date(repo.updated_at),
            openIssuesCount: repo.open_issues_count,
            language: repo.language,
            userId: user.id,
          },
        })
      }),
    )

    return NextResponse.json(updatedRepos)
  } catch (error) {
    console.error("Failed to sync repositories:", error)
    return NextResponse.json({ error: "Failed to sync repositories" }, { status: 500 })
  }
}

