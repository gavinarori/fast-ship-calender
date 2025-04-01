"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserRepositories, identifyLaggingProjects } from "@/lib/github"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function ProjectDashboard() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<any[]>([])
  const [laggingProjects, setLaggingProjects] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [syncing, setSyncing] = useState<boolean>(false)

  useEffect(() => {
    async function fetchData() {
      if (session?.accessToken) {
        try {
          setLoading(true)
          const repos = await getUserRepositories(session.accessToken as string)
          setRepositories(repos)

          // Identify lagging projects
          const lagging = identifyLaggingProjects(repos)
          setLaggingProjects(lagging)
        } catch (err) {
          console.error("Error fetching project data:", err)
          toast.error("Failed to load projects")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [session])

  // Calculate project health score (0-100)
  const calculateProjectHealth = (repo: any) => {
    // Factors: recent commits, open issues ratio, time since last update
    const lastUpdated = new Date(repo.updated_at)
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

    let score = 100

    // Deduct points for days since update
    if (daysSinceUpdate > 30) score -= 40
    else if (daysSinceUpdate > 14) score -= 20
    else if (daysSinceUpdate > 7) score -= 10

    // Deduct points for open issues
    if (repo.open_issues_count > 20) score -= 30
    else if (repo.open_issues_count > 10) score -= 15
    else if (repo.open_issues_count > 5) score -= 5

    return Math.max(0, Math.min(100, score))
  }

  // Get health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Healthy", color: "bg-green-500" }
    if (score >= 50) return { label: "Needs Attention", color: "bg-yellow-500" }
    return { label: "Critical", color: "bg-red-500" }
  }

  // Sync repositories
  const handleSync = async () => {
    if (!session?.accessToken) return

    try {
      setSyncing(true)
      const repos = await getUserRepositories(session.accessToken as string)
      setRepositories(repos)

      // Identify lagging projects
      const lagging = identifyLaggingProjects(repos)
      setLaggingProjects(lagging)

      toast.success("Projects synced successfully")
    } catch (err) {
      console.error("Error syncing projects:", err)
      toast.error("Failed to sync projects")
    } finally {
      setSyncing(false)
    }
  }

  // Filter repositories based on active tab
  const filteredRepositories = repositories.filter((repo) => {
    if (activeTab === "all") return true
    if (activeTab === "lagging") return laggingProjects.some((p) => p.id === repo.id)
    if (activeTab === "active") {
      const lastUpdated = new Date(repo.updated_at)
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceUpdate <= 7
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
        <Button variant="outline" className="flex items-center gap-2" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          <span>Sync Projects</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{repositories.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Lagging Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{laggingProjects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="lagging">Lagging</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredRepositories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRepositories.map((repo) => {
                    const healthScore = calculateProjectHealth(repo)
                    const healthStatus = getHealthStatus(healthScore)
                    const lastUpdated = new Date(repo.updated_at)
                    const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <Card key={repo.id} className="overflow-hidden">
                        <div className={`h-1 ${healthStatus.color}`}></div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{repo.name}</CardTitle>
                            <Badge variant={healthScore >= 80 ? "outline" : "secondary"}>{healthStatus.label}</Badge>
                          </div>
                          <CardDescription className="line-clamp-1">
                            {repo.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Health</span>
                              <span>{healthScore}%</span>
                            </div>
                            <Progress value={healthScore} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span>{repo.open_issues_count} open issues</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>{daysSinceUpdate} days ago</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(repo.html_url, "_blank")}
                          >
                            View Project
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No projects found</div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

