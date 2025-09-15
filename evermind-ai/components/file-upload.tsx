"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, File, ImageIcon, FileText, Brain, Database, AlertCircle } from "lucide-react"

interface FileUploadProps {
  onUpload: (files: File[]) => void
  onClose: () => void
  uploadType?: 'general' | 'ai-model' | 'dataset'
  maxFileSize?: number // in MB
}

export function FileUpload({ onUpload, onClose, uploadType = 'general', maxFileSize = 100 }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<string[]>([])

  const getAcceptedTypes = () => {
    switch (uploadType) {
      case 'ai-model':
        return '.pkl,.pt,.onnx,.bin,.safetensors,.h5,.tflite,.mlmodel'
      case 'dataset':
        return '.json,.csv,.txt,.jsonl,.parquet,.arrow,.feather'
      default:
        return 'image/*,.pdf,.txt,.json,.csv,.md,.doc,.docx'
    }
  }

  const getFileTypeDescription = () => {
    switch (uploadType) {
      case 'ai-model':
        return 'AI model files (.pkl, .pt, .onnx, .bin, .safetensors)'
      case 'dataset':
        return 'Dataset files (.json, .csv, .txt, .jsonl, .parquet)'
      default:
        return 'images, documents, text files, and more'
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File ${file.name} exceeds maximum size of ${maxFileSize}MB`
    }

    // Check file type based on upload type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const acceptedTypes = getAcceptedTypes().split(',')

    if (!acceptedTypes.some(type => extension === type)) {
      return `File ${file.name} has unsupported format. Accepted: ${getFileTypeDescription()}`
    }

    return null
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      const validFiles: File[] = []
      const newErrors: string[] = []

      files.forEach(file => {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      setErrors(newErrors)
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }, [maxFileSize, uploadType])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const validFiles: File[] = []
      const newErrors: string[] = []

      files.forEach(file => {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      setErrors(newErrors)
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    onUpload(selectedFiles)
    setSelectedFiles([])
  }

  const getFileIcon = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (uploadType === 'ai-model') {
      return <Brain className="h-4 w-4 text-purple-500" />
    }

    if (uploadType === 'dataset') {
      return <Database className="h-4 w-4 text-blue-500" />
    }

    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (file.type.includes("text") || file.type.includes("json")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {uploadType === 'ai-model' && 'Upload AI Model'}
                {uploadType === 'dataset' && 'Upload Dataset'}
                {uploadType === 'general' && 'Upload Files'}
              </CardTitle>
              <CardDescription>
                {uploadType === 'ai-model' && 'Upload your trained AI model files'}
                {uploadType === 'dataset' && 'Upload your training dataset files'}
                {uploadType === 'general' && 'Add files to your message for AI analysis'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadType === 'ai-model' && <Brain className="h-8 w-8 mx-auto mb-4 text-purple-500" />}
            {uploadType === 'dataset' && <Database className="h-8 w-8 mx-auto mb-4 text-blue-500" />}
            {uploadType === 'general' && <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />}
            <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to select</p>
            <p className="text-xs text-muted-foreground">{getFileTypeDescription()}</p>
            <p className="text-xs text-muted-foreground">Max size: {maxFileSize}MB per file</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={getAcceptedTypes()}
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Upload Errors</h4>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(file)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={selectedFiles.length === 0} className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
