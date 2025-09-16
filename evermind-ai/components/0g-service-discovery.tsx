"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Search, RefreshCw, Shield, Zap, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { useZGCompute } from "@/hooks/use-0g-compute"
import { ServiceInfo } from "@/lib/0g-compute"

export function ZGServiceDiscovery() {
    const {
        services,
        selectedService,
        isLoading,
        error,
        selectService,
        refreshServices
    } = useZGCompute()

    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [sortBy, setSortBy] = useState("name")

    // Filter and sort services
    const filteredServices = services
        .filter(service => {
            const matchesSearch = service.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.provider.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === "all" ||
                (filterType === "verified" && service.verifiability === "TeeML") ||
                (filterType === "standard" && service.verifiability !== "TeeML")
            return matchesSearch && matchesType
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.model.localeCompare(b.model)
                case "price":
                    return Number(a.inputPrice) - Number(b.inputPrice)
                case "verification":
                    return b.verifiability.localeCompare(a.verifiability)
                default:
                    return 0
            }
        })

    const formatPrice = (price: bigint) => {
        return (Number(price) / 1e18).toFixed(6)
    }

    const getVerificationBadge = (verifiability: string) => {
        if (verifiability === "TeeML") {
            return (
                <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    TEE Verified
                </Badge>
            )
        }
        return (
            <Badge variant="secondary">
                Standard
            </Badge>
        )
    }

    const getPriceRange = (service: ServiceInfo) => {
        const inputPrice = formatPrice(service.inputPrice)
        const outputPrice = formatPrice(service.outputPrice)
        return `${inputPrice} - ${outputPrice} OG`
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        <CardTitle className="text-lg">0G AI Services</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshServices}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <CardDescription>
                    Discover and select AI models available on the 0G Compute Network
                </CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!error && services.length === 0 && !isLoading && (
                    <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Initializing 0G Compute services...</AlertDescription>
                    </Alert>
                )}

                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search models or providers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="verification">Verification</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading services...</span>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-8">
                            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? "Try adjusting your search terms" : "No AI services are currently available"}
                            </p>
                        </div>
                    ) : (
                        filteredServices.map((service) => (
                            <Card
                                key={service.provider}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedService?.provider === service.provider
                                    ? 'ring-2 ring-primary bg-primary/5'
                                    : 'hover:bg-muted/50'
                                    }`}
                                onClick={() => selectService(service)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold">{service.model}</h3>
                                                {getVerificationBadge(service.verifiability)}
                                                {selectedService?.provider === service.provider && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Zap className="h-3 w-3" />
                                                    <span>Price: {getPriceRange(service)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Updated: {new Date(Number(service.updatedAt)).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Provider: {service.provider.slice(0, 6)}...{service.provider.slice(-4)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant={selectedService?.provider === service.provider ? "default" : "outline"}
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    selectService(service)
                                                }}
                                            >
                                                {selectedService?.provider === service.provider ? "Selected" : "Select"}
                                            </Button>
                                            {selectedService?.provider === service.provider && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.location.href = '/chat'
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Start Chat
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Service Statistics */}
                {services.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{services.length}</p>
                                <p className="text-sm text-muted-foreground">Total Services</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {services.filter(s => s.verifiability === "TeeML").length}
                                </p>
                                <p className="text-sm text-muted-foreground">Verified</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {services.filter(s => s.verifiability !== "TeeML").length}
                                </p>
                                <p className="text-sm text-muted-foreground">Standard</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
