"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Brain, Loader2, AlertCircle, Database } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storageService } from "@/lib/storage"
import { modelMetadataService } from "@/lib/model-metadata"

interface AgentMintingFormProps {
  onClose: () => void
}

export function AgentMintingForm({ onClose }: AgentMintingFormProps) {
  const { isConnected, account } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ model: number; dataset: number }>({ model: 0, dataset: 0 })
  const [uploadStatus, setUploadStatus] = useState<{ model: string; dataset: string }>({ model: '', dataset: '' })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modelFile: null as File | null,
    datasetFile: null as File | null,
  })

  const mintingFee = "0.000001" // ETH
  const computeCreditCost = "0.000001" // ETH per credit
  const storageCreditCost = "0.0000001" // ETH per credit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!formData.modelFile) {
      alert("Please upload an AI model file")
      return
    }

    setIsLoading(true)
    setUploadStatus({ model: 'Uploading model...', dataset: '' })

    try {
      let modelHash = ''
      let datasetHash = ''

      // Upload model file
      if (formData.modelFile) {
        setUploadProgress(prev => ({ ...prev, model: 0 }))

        // Validate model file
        const validation = modelMetadataService.validateModelFile(formData.modelFile)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Extract model metadata
        const modelMetadata = await modelMetadataService.extractModelMetadata(formData.modelFile)
        console.log('Model metadata:', modelMetadata)

        // Upload to storage
        const modelResult = await storageService.uploadFile(formData.modelFile, {
          type: 'ai-model',
          framework: modelMetadata.framework,
          version: modelMetadata.version
        })

        modelHash = modelResult.hash
        setUploadProgress(prev => ({ ...prev, model: 100 }))
        setUploadStatus(prev => ({
          ...prev,
          model: `Model uploaded successfully! Hash: ${modelResult.hash.substring(0, 10)}...`
        }))
      }

      // Upload dataset file if provided
      if (formData.datasetFile) {
        setUploadProgress(prev => ({ ...prev, dataset: 0 }))
        setUploadStatus(prev => ({ ...prev, dataset: 'Uploading dataset...' }))

        // Validate dataset file
        const validation = modelMetadataService.validateDatasetFile(formData.datasetFile)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Extract dataset metadata
        const datasetMetadata = await modelMetadataService.extractDatasetMetadata(formData.datasetFile)
        console.log('Dataset metadata:', datasetMetadata)

        // Upload to storage
        const datasetResult = await storageService.uploadFile(formData.datasetFile, {
          type: 'dataset',
          format: datasetMetadata.format,
          samples: datasetMetadata.samples
        })

        datasetHash = datasetResult.hash
        setUploadProgress(prev => ({ ...prev, dataset: 100 }))
        setUploadStatus(prev => ({
          ...prev,
          dataset: `Dataset uploaded successfully! Hash: ${datasetResult.hash.substring(0, 10)}...`
        }))
      }

      // Prepare metadata for smart contract
      const metadata = {
        name: formData.name,
        description: formData.description,
        modelType: formData.modelFile ? modelMetadataService.getFileExtension(formData.modelFile.name) : '',
        datasetType: formData.datasetFile ? modelMetadataService.getFileExtension(formData.datasetFile.name) : '',
        timestamp: Date.now()
      }

      const metadataString = JSON.stringify(metadata)
      const metadataHash = await generateHash(metadataString)

      // In real implementation, this would:
      // 1. Call smart contract mintAIAgent function with hashes
      // 2. Wait for transaction confirmation
      // 3. Update UI with success

      console.log('Minting with:', {
        name: formData.name,
        description: formData.description,
        modelHash,
        datasetHash,
        metadataHash,
        metadataString,
        modelTransactionHash: formData.modelFile ? 'Uploaded to 0G Storage' : null,
        datasetTransactionHash: formData.datasetFile ? 'Uploaded to 0G Storage' : null
      })

      // Simulate smart contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Agent minted successfully!")
      onClose()
    } catch (error) {
      console.error("Minting failed:", error)
      alert(`Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setUploadProgress({ model: 0, dataset: 0 })
      setUploadStatus({ model: '', dataset: '' })
    }
  }

  // Helper function to generate hash (placeholder)
  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFileChange = (field: "modelFile" | "datasetFile") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Create New AI Agent</CardTitle>
                <CardDescription>Mint your AI agent as an NFT on the blockchain</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please connect your wallet to mint an AI agent.</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Research Assistant"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your AI agent's capabilities and purpose..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div>
                <Label>AI Model File</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Brain className="w-8 h-8 mb-2 text-purple-500" />
                      <p className="text-sm text-muted-foreground">
                        {formData.modelFile ? formData.modelFile.name : "Upload AI model file"}
                      </p>
                      <p className="text-xs text-muted-foreground">Supported: .pkl, .pt, .onnx, .bin, .safetensors</p>
                      <p className="text-xs text-muted-foreground">Max size: 500MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pkl,.pt,.onnx,.bin,.safetensors,.h5,.tflite,.mlmodel"
                      onChange={handleFileChange("modelFile")}
                    />
                  </label>
                </div>
                {formData.modelFile && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">{formData.modelFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(formData.modelFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, modelFile: null }))}
                        className="h-6 w-6 p-0"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {uploadStatus.model && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{uploadStatus.model}</span>
                          <span>{uploadProgress.model}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1">
                          <div
                            className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.model}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Dataset File (Optional)</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Database className="w-8 h-8 mb-2 text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        {formData.datasetFile ? formData.datasetFile.name : "Upload training dataset"}
                      </p>
                      <p className="text-xs text-muted-foreground">Supported: .json, .csv, .txt, .jsonl, .parquet</p>
                      <p className="text-xs text-muted-foreground">Max size: 100MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.csv,.txt,.jsonl,.parquet,.arrow,.feather"
                      onChange={handleFileChange("datasetFile")}
                    />
                  </label>
                </div>
                {formData.datasetFile && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{formData.datasetFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(formData.datasetFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, datasetFile: null }))}
                        className="h-6 w-6 p-0"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {uploadStatus.dataset && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{uploadStatus.dataset}</span>
                          <span>{uploadProgress.dataset}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.dataset}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Minting Fee</span>
                  <Badge variant="outline">{mintingFee} ETH</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Initial Compute Credits (50)</span>
                  <Badge variant="outline">{(Number.parseFloat(computeCreditCost) * 50).toFixed(6)} ETH</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Initial Storage Credits (100)</span>
                  <Badge variant="outline">{(Number.parseFloat(storageCreditCost) * 100).toFixed(7)} ETH</Badge>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <Badge>
                    {(
                      Number.parseFloat(mintingFee) +
                      Number.parseFloat(computeCreditCost) * 50 +
                      Number.parseFloat(storageCreditCost) * 100
                    ).toFixed(6)}{" "}
                    ETH
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isConnected || isLoading || !formData.name || !formData.description}
                className="flex-1 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Mint Agent NFT
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
