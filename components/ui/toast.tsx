import * as React from "react"

export type ToastProps = {
  id?: string
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement
