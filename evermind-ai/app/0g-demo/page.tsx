"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Database, Upload, CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { storageService } from "@/lib/storage"
import { modelMetadataService } from "@/lib/model-metadata"

export default function ZeroGStorageDemoPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadResult, setUploadResult] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [privateKey, setPrivateKey] = useState("")
    const [isConfigured, setIsConfigured] = useState(false)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setSelectedFile(file)
        setError(null)
        setUploadResult(null)
    }

    const configureStorage = () => {
        if (!privateKey.trim()) {
            setError("Please enter a private key")
            return
        }

        // In a real app, you would store this securely
        localStorage.setItem('0g_private_key', privateKey)
        setIsConfigured(true)
        setError(null)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload")
            return
        }

        if (!isConfigured) {
            setError("Please configure 0G Storage first")
            return
        }

        setIsUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + 10
                })
            }, 200)

            // Validate file
            const validation = selectedFile.name.includes('model') || selectedFile.name.includes('dataset')
                ? selectedFile.name.includes('model')
                    ? modelMetadataService.validateModelFile(selectedFile)
                    : modelMetadataService.validateDatasetFile(selectedFile)
                : { valid: true }

            if (!validation.valid) {
                throw new Error(validation.error)
            }

            // Extract metadata
            const metadata = selectedFile.name.includes('model')
                ? await modelMetadataService.extractModelMetadata(selectedFile)
                : await modelMetadataService.extractDatasetMetadata(selectedFile)

            // Upload file
            const result = await storageService.uploadFile(selectedFile, {
                type: selectedFile.name.includes('model') ? 'ai-model' : 'dataset',
                ...metadata
            })

            clearInterval(progressInterval)
            setUploadProgress(100)
            setUploadResult(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">0G Storage Integration Demo</h1>
                <p className="text-muted-foreground">
                    Test the 0G Storage TypeScript SDK integration for AI models and datasets
                </p>
            </div>

            {/* Configuration Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        0G Storage Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure your 0G Storage credentials to enable file uploads
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="privateKey">Private Key</Label>
                        <Input
                            id="privateKey"
                            type="password"
                            placeholder="Enter your private key for 0G Storage"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your private key is stored locally and used only for 0G Storage operations
                        </p>
                    </div>
                    <Button onClick={configureStorage} disabled={!privateKey.trim()}>
                        Configure 0G Storage
                    </Button>
                    {isConfigured && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                0G Storage is configured and ready for uploads
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        File Upload
                    </CardTitle>
                    <CardDescription>
                        Upload AI models or datasets to 0G Storage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="file">Select File</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={handleFileSelect}
                            accept=".pt,.pth,.pkl,.onnx,.bin,.safetensors,.h5,.json,.csv,.txt,.jsonl,.parquet"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: AI models (.pt, .pth, .pkl, .onnx, .bin, .safetensors, .h5) and datasets (.json, .csv, .txt, .jsonl, .parquet)
                        </p>
                    </div>

                    {selectedFile && (
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                {selectedFile.name.includes('model') ? (
                                    <Brain className="h-4 w-4 text-purple-500" />
                                ) : (
                                    <Database className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="font-medium">{selectedFile.name}</span>
                                <Badge variant="outline">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </Badge>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !isConfigured || isUploading}
                        className="w-full"
                    >
                        {isUploading ? "Uploading..." : "Upload to 0G Storage"}
                    </Button>

                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Upload Progress</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Upload Result Section */}
            {uploadResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Upload Successful
                        </CardTitle>
                        <CardDescription>
                            Your file has been uploaded to 0G Storage
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>File Hash</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={uploadResult.hash} readOnly className="font-mono text-sm" />
                                    <Button size="sm" onClick={() => copyToClipboard(uploadResult.hash)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label>File Size</Label>
                                <Input value={`${(uploadResult.size / 1024 / 1024).toFixed(2)} MB`} readOnly />
                            </div>
                            <div>
                                <Label>File Type</Label>
                                <Input value={uploadResult.type} readOnly />
                            </div>
                            <div>
                                <Label>Storage URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={uploadResult.url} readOnly className="font-mono text-sm" />
                                    <Button size="sm" onClick={() => window.open(uploadResult.url, '_blank')}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {uploadResult.transactionHash && (
                            <div>
                                <Label>Transaction Hash</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={uploadResult.transactionHash} readOnly className="font-mono text-sm" />
                                    <Button size="sm" onClick={() => copyToClipboard(uploadResult.transactionHash)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your file is now stored on the 0G Storage network. The hash can be used to retrieve the file later.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle>0G Storage Features</CardTitle>
                    <CardDescription>
                        Learn about the capabilities of 0G Storage integration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2">Decentralized Storage</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Files stored on decentralized network</li>
                                <li>• Immutable and tamper-proof</li>
                                <li>• No single point of failure</li>
                                <li>• Censorship resistant</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">AI Model Support</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• PyTorch models (.pt, .pth)</li>
                                <li>• TensorFlow models (.h5, .keras)</li>
                                <li>• ONNX models (.onnx)</li>
                                <li>• Hugging Face models (.bin, .safetensors)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Dataset Support</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• JSON datasets (.json, .jsonl)</li>
                                <li>• CSV datasets (.csv)</li>
                                <li>• Text datasets (.txt)</li>
                                <li>• Parquet datasets (.parquet)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Blockchain Integration</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Content hashes stored on-chain</li>
                                <li>• NFT metadata integration</li>
                                <li>• Transparent file verification</li>
                                <li>• Immutable ownership records</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

