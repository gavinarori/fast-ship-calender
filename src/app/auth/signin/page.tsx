"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: "/" })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Dev Calendar</CardTitle>
          <CardDescription className="text-center">
            Sign in to track your development tasks and GitHub projects
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" onClick={() => handleSignIn("github")} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
            Sign in with GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            By signing in, you'll be able to sync your GitHub repositories and issues
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

