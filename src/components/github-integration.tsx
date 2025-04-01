"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Github, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { issueToEvent } from "@/lib/github"
import { Skeleton } from "@/components/ui/skeleton"

interface GithubIntegrationProps {
  onAddEvent: (event: any) => void
}

export default function GithubIntegration({ onAddEvent }: GithubIntegrationProps) {
  const { data: session, status } = useSession()
  const [repositories, setRepositories] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [syncingRepos, setSyncingRepos] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [laggingProjects, setLaggingProjects] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")
  const [activeTab, setActiveTab] = useState<string>("repositories")

  // Fetch repositories when session is available
  useEffect(() => {
    async function fetchRepositories() {
      if (status === "authenticated") {
        try {
          setLoading(true)
          const response = await fetch("/api/repositories")

          if (!response.ok) {
            throw new Error("Failed to fetch repositories")
          }

          const repos = await response.json()
          setRepositories(repos)

          // Fetch lagging projects
          const laggingResponse = await fetch("/api/repositories/lagging")
          if (laggingResponse.ok) {
            const laggingRepos = await laggingResponse.json()
            setLaggingProjects(laggingRepos)
          }

          setError(null)
        } catch (err) {
          console.error("Error fetching repositories:", err)
          setError("Failed to load your GitHub repositories")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchRepositories()
  }, [status])

  // Fetch issues when repository is selected
  useEffect(() => {
    async function fetchIssues() {
      if (!selectedRepo) return

      try {
        setLoading(true)
        const response = await fetch(`/api/repositories/${selectedRepo}/issues`)

        if (!response.ok) {
          throw new Error("Failed to fetch issues")
        }

        const repoIssues = await response.json()
        setIssues(repoIssues)
        setError(null)
      } catch (err) {
        console.error("Error fetching issues:", err)
        setError("Failed to load issues for this repository")
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [selectedRepo])

  // Sync repositories with GitHub
  const syncRepositories = async () => {
    if (status !== "authenticated") return

    try {
      setSyncingRepos(true)
      const response = await fetch("/api/repositories", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to sync repositories")
      }

      const updatedRepos = await response.json()
      setRepositories(updatedRepos)
      setError(null)

      // Refresh lagging projects
      const laggingResponse = await fetch("/api/repositories/lagging")
      if (laggingResponse.ok) {
        const laggingRepos = await laggingResponse.json()
        setLaggingProjects(laggingRepos)
      }
    } catch (err) {
      console.error("Error syncing repositories:", err)
      setError("Failed to sync repositories with GitHub")
    } finally {
      setSyncingRepos(false)
    }
  }

  // Handle adding an issue as an event
  const handleAddIssueAsEvent = (issue: any) => {
    const selectedRepository = repositories.find((repo) => repo.id === selectedRepo)
    if (!selectedRepository) return

    const event = issueToEvent(issue, selectedRepository.fullName)
    event.repositoryId = selectedRepo
    onAddEvent(event)
  }

  // Filter repositories based on active/completed status
  const filteredRepositories = repositories.filter((repo) => {
    if (filter === "all") return true
    if (filter === "active") return repo.isActive
    if (filter === "completed") return !repo.isActive
    return true
  })

  // Calculate project progress
  const calculateProgress = (repo: any) => {
    if (repo.openIssuesCount === 0) return 100
    // Estimate total issues based on open issues (this is an approximation)
    const estimatedTotalIssues = repo.openIssuesCount * 1.5
    return Math.round(((estimatedTotalIssues - repo.openIssuesCount) / estimatedTotalIssues) * 100)
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">Sign in with GitHub to access your repositories and issues</p>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => signIn("github")}>
          <Github className="h-4 w-4" />
          <span>Sign in with GitHub</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">GitHub Projects</h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: "all" | "active" | "completed") => setFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={syncRepositories} disabled={syncingRepos}>
            <RefreshCw className={`h-4 w-4 ${syncingRepos ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {laggingProjects.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lagging Projects</AlertTitle>
          <AlertDescription>
            You have {laggingProjects.length} projects that haven't been updated in over a week.
            <ul className="mt-2 list-disc list-inside">
              {laggingProjects.slice(0, 3).map((repo) => (
                <li key={repo.id}>
                  {repo.name} ({repo.openIssuesCount} open issues)
                  {repo.events.length > 0 ? (
                    <span className="text-xs ml-2">
                      {repo.events.length} scheduled task{repo.events.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-xs ml-2 text-destructive">No scheduled tasks</span>
                  )}
                </li>
              ))}
              {laggingProjects.length > 3 && <li>...and {laggingProjects.length - 3} more</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredRepositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRepositories.map((repo) => (
                <Card
                  key={repo.id}
                  className={`cursor-pointer hover:border-primary transition-colors ${selectedRepo === repo.id ? "border-primary" : ""}`}
                  onClick={() => setSelectedRepo(repo.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                      <Badge variant={repo.openIssuesCount > 0 ? "outline" : "secondary"}>
                        {repo.openIssuesCount} issues
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-1">{repo.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(repo)}%</span>
                    </div>
                    <Progress value={calculateProgress(repo)} className="h-2" />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last updated: {new Date(repo.lastUpdated).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {error ? (
                <div>
                  <p>{error}</p>
                  <Button variant="outline" className="mt-4" onClick={syncRepositories}>
                    Retry
                  </Button>
                </div>
              ) : (
                <p>No repositories found. Sync with GitHub to see your repositories.</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues">
          {!selectedRepo ? (
            <div className="text-center py-8 text-muted-foreground">Select a repository to view issues</div>
          ) : loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.map((issue: any) => (
                <div key={issue.id} className="p-3 border border-border rounded-md flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-sm">{issue.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      #{issue.number} opened by {issue.user.login}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAddIssueAsEvent(issue)}>
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No open issues found for this repository</div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

