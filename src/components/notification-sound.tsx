"use client"

import { useRef, useEffect } from "react"

interface NotificationSoundProps {
  play: boolean
  onEnded?: () => void
}

export default function NotificationSound({ play, onEnded }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.error("Failed to play notification sound:", err)
      })
    }
  }, [play])

  return <audio ref={audioRef} src="/notification.mp3" onEnded={onEnded} />
}

