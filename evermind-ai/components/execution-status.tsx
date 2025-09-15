"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, HardDrive, Clock } from "lucide-react"
import { useState, useEffect } from "react"

export function ExecutionStatus() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("Initializing...")

  const steps = [
    "Initializing execution...",
    "Uploading data to 0G Storage...",
    "Connecting to 0G Compute...",
    "Processing with AI model...",
    "Generating response...",
    "Finalizing results...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 15, 95)
        const stepIndex = Math.floor((newProgress / 100) * steps.length)
        setCurrentStep(steps[stepIndex] || steps[steps.length - 1])
        return newProgress
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          Executing AI Operation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{currentStep}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 p-2 rounded bg-background/50">
            <Zap className="h-3 w-3 text-primary" />
            <span>3 compute credits</span>
          </div>
          <div className="flex items-center gap-1 p-2 rounded bg-background/50">
            <HardDrive className="h-3 w-3 text-secondary" />
            <span>1 storage credit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Est. completion: 30s</span>
        </div>
      </CardContent>
    </Card>
  )
}
