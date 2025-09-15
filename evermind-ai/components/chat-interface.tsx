"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChatMessage } from "@/components/chat-message"
import { ExecutionStatus } from "@/components/execution-status"
import { FileUpload } from "@/components/file-upload"
import { Send, Paperclip, Brain, Zap, HardDrive, AlertCircle, RefreshCw } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"
import { useZGCompute } from "@/hooks/use-0g-compute"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  type: "user" | "agent" | "system"
  content: string
  timestamp: Date
  agentId?: string
  executionId?: string
  files?: File[]
  status?: "pending" | "executing" | "completed" | "failed"
  credits?: {
    compute: number
    storage: number
  }
}

export function ChatInterface() {
  const { isConnected } = useWeb3()
  const {
    isInitialized,
    isLoading,
    error,
    services,
    selectedService,
    accountBalance,
    selectService,
    sendInference,
    refreshServices
  } = useZGCompute()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedService || !isConnected || !isInitialized) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setUploadedFiles([])
    setIsExecuting(true)

    // Create execution message
    const executionMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "system",
      content: "Executing AI operation on 0G Network...",
      timestamp: new Date(),
      agentId: selectedService.provider,
      executionId: `exec_${Date.now()}`,
      status: "executing",
      credits: {
        compute: 1, // Will be updated based on actual usage
        storage: uploadedFiles.length > 0 ? 1 : 0,
      },
    }

    setMessages((prev) => [...prev, executionMessage])

    try {
      // Send real inference request to 0G Compute
      const response = await sendInference({
        messages: [
          {
            role: "user",
            content: inputValue
          }
        ],
        model: selectedService.model,
        temperature: 0.7,
        max_tokens: 1000
      })

      // Update execution status to completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === executionMessage.id ? { ...msg, status: "completed", content: "Execution completed" } : msg,
        ),
      )

      // Add AI response
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: "agent",
        content: response.choices[0]?.message?.content || "No response received",
        timestamp: new Date(),
        agentId: selectedService.provider,
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Inference error:', error)

      // Update execution status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === executionMessage.id ? {
            ...msg,
            status: "failed",
            content: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          } : msg,
        ),
      )
    } finally {
      setIsExecuting(false)
    }
  }

  const generateMockResponse = (userInput: string, agentName: string): string => {
    const responses = [
      `As ${agentName}, I've analyzed your request: "${userInput}". Here's my detailed response with insights and recommendations based on my specialized knowledge.`,
      `Thank you for your question about "${userInput}". Based on my training and expertise, I can provide you with comprehensive information and actionable insights.`,
      `I've processed your request regarding "${userInput}" using advanced AI algorithms. Here are the key findings and my recommendations for your consideration.`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center">
              Please connect your wallet to start chatting with AI agents on the 0G Network
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="container px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Initializing 0G Compute</h3>
            <p className="text-muted-foreground text-center">
              {isLoading ? "Setting up AI inference services..." : "Please wait while we initialize the 0G Compute Network"}
            </p>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin mt-2" />}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">0G Compute Error</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={refreshServices} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Service Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">0G AI Services</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshServices}
                  disabled={isLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedService?.provider || ""}
                onValueChange={(provider) => {
                  const service = services.find(s => s.provider === provider)
                  if (service) selectService(service)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.provider} value={service.provider}>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{service.model}</span>
                          <span className="text-xs text-muted-foreground">
                            {service.verifiability === 'TeeML' ? 'Verified' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedService && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedService.verifiability === 'TeeML' ? 'default' : 'secondary'}>
                      {selectedService.verifiability === 'TeeML' ? 'TEE Verified' : 'Standard'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Provider: {selectedService.provider.slice(0, 6)}...{selectedService.provider.slice(-4)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 p-2 rounded-lg bg-primary/5">
                      <Zap className="h-3 w-3 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Input Price</p>
                        <p className="text-sm font-medium">
                          {Number(selectedService.inputPrice) / 1e18} OG
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 p-2 rounded-lg bg-secondary/5">
                      <HardDrive className="h-3 w-3 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Output Price</p>
                        <p className="text-sm font-medium">
                          {Number(selectedService.outputPrice) / 1e18} OG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Balance */}
          {accountBalance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="font-medium">
                      {(Number(accountBalance.balance) / 1e18).toFixed(4)} OG
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Locked</span>
                    <span>{(Number(accountBalance.locked) / 1e18).toFixed(4)} OG</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{(Number(accountBalance.totalbalance) / 1e18).toFixed(4)} OG</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Status */}
          {isExecuting && <ExecutionStatus />}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  0G AI Chat Interface
                </CardTitle>
                {selectedService && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Brain className="h-3 w-3" />
                      {selectedService.model}
                    </Badge>
                    {selectedService.verifiability === 'TeeML' && (
                      <Badge variant="default" className="text-xs">
                        TEE Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground">
                    {selectedService
                      ? "Send a message to start chatting with the AI service"
                      : "Select an AI service to begin"}
                  </p>
                </div>
              ) : (
                messages.map((message) => <ChatMessage key={message.id} message={message} />)
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {file.name}
                      <button type="button" onClick={() => removeFile(index)} className="ml-1 hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                  className="shrink-0 bg-transparent"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedService ? "Type your message..." : "Select a service first..."}
                  disabled={!selectedService || isExecuting}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !selectedService || isExecuting}
                  className="shrink-0 gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && <FileUpload onUpload={handleFileUpload} onClose={() => setShowFileUpload(false)} />}
    </div>
  )
}
