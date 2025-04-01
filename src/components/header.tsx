"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Github, Menu, X, Calendar, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import clsx from 'clsx';
import { FolderCode } from 'lucide-react';

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onGithubClick: () => void
}

export default function Header({ activeTab, onTabChange, onGithubClick }: HeaderProps) {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border border-dotted flex items-center justify-between px-4 lg:px-8 py-4">
      <div className="flex items-center gap-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2">
        <div
      className={clsx(
        'flex flex-none items-center h-[40px] w-[40px] rounded-xl justify-center border border-neutral-200 bg-green-600 dark:border-neutral-700 ',
      )}
    >
      <FolderCode />
    </div>
          <span className="text-xl font-semibold hidden sm:inline">Dev Calendar</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex ml-6">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* GitHub Button */}
        <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2" onClick={onGithubClick}>
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onGithubClick} className="md:hidden">
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub Projects</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => signIn("github")}>
            Sign In
          </Button>
        )}

        {/* Mobile Menu - Positioned to not overlap with Today button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden z-20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Dev Calendar</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    onTabChange(value)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    onGithubClick()
                    setMobileMenuOpen(false)
                  }}
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub Projects</span>
                </Button>
              </div>

              <div className="mt-auto">
                {status === "authenticated" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={() => signIn("github")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

