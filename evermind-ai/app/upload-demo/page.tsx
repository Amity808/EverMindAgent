"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { Brain, Database, Upload } from "lucide-react"

export default function UploadDemoPage() {
    const [showModelUpload, setShowModelUpload] = useState(false)
    const [showDatasetUpload, setShowDatasetUpload] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<{ models: File[]; datasets: File[] }>({
        models: [],
        datasets: []
    })

    const handleModelUpload = (files: File[]) => {
        setUploadedFiles(prev => ({
            ...prev,
            models: [...prev.models, ...files]
        }))
        setShowModelUpload(false)
    }

    const handleDatasetUpload = (files: File[]) => {
        setUploadedFiles(prev => ({
            ...prev,
            datasets: [...prev.datasets, ...files]
        }))
        setShowDatasetUpload(false)
    }

    const removeModel = (index: number) => {
        setUploadedFiles(prev => ({
            ...prev,
            models: prev.models.filter((_, i) => i !== index)
        }))
    }

    const removeDataset = (index: number) => {
        setUploadedFiles(prev => ({
            ...prev,
            datasets: prev.datasets.filter((_, i) => i !== index)
        }))
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">AI Model & Dataset Upload Demo</h1>
                <p className="text-muted-foreground">
                    Test the enhanced file upload functionality for AI models and datasets
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Model Upload */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Brain className="h-6 w-6 text-purple-500" />
                            <div>
                                <CardTitle>AI Model Upload</CardTitle>
                                <CardDescription>
                                    Upload trained AI models in various formats
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => setShowModelUpload(true)}
                            className="w-full gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload AI Model
                        </Button>

                        {uploadedFiles.models.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Uploaded Models ({uploadedFiles.models.length})</h4>
                                <div className="space-y-1">
                                    {uploadedFiles.models.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-purple-500" />
                                                <span className="text-sm font-medium">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeModel(index)}
                                                className="h-6 w-6 p-0"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dataset Upload */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-6 w-6 text-blue-500" />
                            <div>
                                <CardTitle>Dataset Upload</CardTitle>
                                <CardDescription>
                                    Upload training datasets in various formats
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => setShowDatasetUpload(true)}
                            className="w-full gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Dataset
                        </Button>

                        {uploadedFiles.datasets.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Uploaded Datasets ({uploadedFiles.datasets.length})</h4>
                                <div className="space-y-1">
                                    {uploadedFiles.datasets.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDataset(index)}
                                                className="h-6 w-6 p-0"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Supported Formats Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Supported Formats</CardTitle>
                    <CardDescription>
                        File formats supported by the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-500" />
                                AI Models
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• PyTorch: .pt, .pth, .pkl</li>
                                <li>• TensorFlow: .h5, .keras, .pb</li>
                                <li>• ONNX: .onnx</li>
                                <li>• Hugging Face: .bin, .safetensors</li>
                                <li>• CoreML: .mlmodel</li>
                                <li>• TensorFlow Lite: .tflite</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4 text-blue-500" />
                                Datasets
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• JSON: .json, .jsonl</li>
                                <li>• CSV: .csv</li>
                                <li>• Text: .txt</li>
                                <li>• Parquet: .parquet</li>
                                <li>• Arrow: .arrow, .feather</li>
                                <li>• HDF5: .h5, .hdf5</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Modals */}
            {showModelUpload && (
                <FileUpload
                    onUpload={handleModelUpload}
                    onClose={() => setShowModelUpload(false)}
                    uploadType="ai-model"
                    maxFileSize={500}
                />
            )}

            {showDatasetUpload && (
                <FileUpload
                    onUpload={handleDatasetUpload}
                    onClose={() => setShowDatasetUpload(false)}
                    uploadType="dataset"
                    maxFileSize={100}
                />
            )}
        </div>
    )
}

