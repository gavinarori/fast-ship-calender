import { Octokit } from "octokit"

// GitHub API client
export const getOctokit = (accessToken: string) => {
  return new Octokit({ auth: accessToken })
}

// Fetch user repositories
export async function getUserRepositories(accessToken: string) {
  const octokit = getOctokit(accessToken)
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  })
  return data
}

// Fetch repository issues
export async function getRepositoryIssues(accessToken: string, owner: string, repo: string) {
  const octokit = getOctokit(accessToken)
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    per_page: 100,
  })
  return data
}

// Fetch repository pull requests
export async function getRepositoryPullRequests(accessToken: string, owner: string, repo: string) {
  const octokit = getOctokit(accessToken)
  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 100,
  })
  return data
}

// Convert GitHub issue to calendar event
export function issueToEvent(issue: any, repoFullName: string): any {
  // Calculate estimated duration based on labels or use default
  const durationHours = estimateIssueDuration(issue)

  // Create start and end times
  const startTime = new Date()
  startTime.setHours(10, 0, 0, 0) // Default to 10 AM

  const endTime = new Date(startTime)
  endTime.setHours(startTime.getHours() + durationHours)

  // Format times for the event
  const formatTimeForEvent = (date: Date) => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  return {
    title: issue.title,
    description: `GitHub Issue: ${issue.html_url}\n\n${issue.body?.substring(0, 200) || ""}...`,
    date: new Date().toISOString().split("T")[0],
    startTime: formatTimeForEvent(startTime),
    endTime: formatTimeForEvent(endTime),
    color: getColorForIssue(issue),
    priority: getPriorityFromIssue(issue),
    githubIssueId: issue.id.toString(),
    githubIssueUrl: issue.html_url,
    repository: repoFullName,
  }
}

// Estimate issue duration based on labels
function estimateIssueDuration(issue: any): number {
  // Check for time estimate labels
  const timeLabels = issue.labels.filter(
    (label: any) => label.name.toLowerCase().includes("time:") || label.name.toLowerCase().includes("estimate:"),
  )

  if (timeLabels.length > 0) {
    const timeLabel = timeLabels[0].name.toLowerCase()
    if (timeLabel.includes("1h")) return 1
    if (timeLabel.includes("2h")) return 2
    if (timeLabel.includes("4h")) return 4
    if (timeLabel.includes("8h")) return 8
  }

  // Default duration based on issue complexity
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("bug"))) return 2
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("feature"))) return 4
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("enhancement"))) return 3

  return 2 // Default to 2 hours
}

// Get color based on issue type
function getColorForIssue(issue: any): string {
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("bug"))) return "bg-red-500"
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("feature"))) return "bg-green-500"
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("enhancement"))) return "bg-blue-500"
  if (issue.labels.some((l: any) => l.name.toLowerCase().includes("documentation"))) return "bg-purple-500"

  return "bg-indigo-500" // Default color
}

// Get priority from issue labels
function getPriorityFromIssue(issue: any): "low" | "medium" | "high" {
  if (
    issue.labels.some(
      (l: any) =>
        l.name.toLowerCase().includes("high") ||
        l.name.toLowerCase().includes("urgent") ||
        l.name.toLowerCase().includes("priority:high"),
    )
  )
    return "high"

  if (
    issue.labels.some(
      (l: any) => l.name.toLowerCase().includes("medium") || l.name.toLowerCase().includes("priority:medium"),
    )
  )
    return "medium"

  if (
    issue.labels.some((l: any) => l.name.toLowerCase().includes("low") || l.name.toLowerCase().includes("priority:low"))
  )
    return "low"

  return "medium" // Default priority
}

// Calculate project progress
export function calculateProjectProgress(issues: any[]): number {
  if (issues.length === 0) return 100

  const totalIssues = issues.length
  const closedIssues = issues.filter((issue) => issue.state === "closed").length

  return Math.round((closedIssues / totalIssues) * 100)
}

// Identify lagging projects
export function identifyLaggingProjects(repositories: any[], threshold = 7): any[] {
  return repositories.filter((repo) => {
    // Check if project has had no activity for more than threshold days
    const lastUpdated = new Date(repo.updated_at)
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

    return daysSinceUpdate > threshold && repo.open_issues_count > 0
  })
}

