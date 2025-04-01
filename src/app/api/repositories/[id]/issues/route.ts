import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { getRepositoryIssues } from "@/lib/github"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session || !session.user || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get repository from database
    const repository = await prisma.repository.findUnique({
      where: { id },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Extract owner and repo name from fullName (owner/repo)
    const [owner, repo] = repository.fullName.split("/")

    // Fetch issues from GitHub
    const issues = await getRepositoryIssues(session.accessToken as string, owner, repo)

    return NextResponse.json(issues)
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

