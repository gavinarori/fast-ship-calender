"use client"

import type React from "react"

import { useRef, useCallback } from "react"

interface UseDragProps {
  ref: React.RefObject<HTMLElement>
  onDragStart?: () => void
  onDragMove?: (offsetX: number, offsetY: number) => void
  onDragEnd?: (offsetX: number, offsetY: number) => void
}

export function useDrag({ ref, onDragStart, onDragMove, onDragEnd }: UseDragProps) {
  const initialPositionRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()

      // Get client position based on event type
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      initialPositionRef.current = { x: clientX, y: clientY }
      isDraggingRef.current = true

      if (onDragStart) {
        onDragStart()
      }

      // Add event listeners for move and end events
      const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return

        // Get client position based on event type
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

        offsetRef.current = {
          x: clientX - initialPositionRef.current.x,
          y: clientY - initialPositionRef.current.y,
        }

        if (onDragMove) {
          onDragMove(offsetRef.current.x, offsetRef.current.y)
        }
      }

      const handleMouseUp = () => {
        if (!isDraggingRef.current) return

        isDraggingRef.current = false

        if (onDragEnd) {
          onDragEnd(offsetRef.current.x, offsetRef.current.y)
        }

        // Clean up event listeners
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("touchmove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchend", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("touchmove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchend", handleMouseUp)
    },
    [onDragStart, onDragMove, onDragEnd],
  )

  return { handleMouseDown }
}

