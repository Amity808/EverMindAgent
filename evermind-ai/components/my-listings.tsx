"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Eye, Plus, DollarSign } from "lucide-react"

interface MyListing {
  id: string
  tokenId: number
  name: string
  description: string
  image: string
  price: number
  currency: "ETH"
  status: "active" | "sold" | "cancelled"
  views: number
  favorites: number
  listedDate: Date
  lastActivity: Date
}

export function MyListings() {
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [editingListing, setEditingListing] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState("")

  // Mock user listings
  const [listings, setListings] = useState<MyListing[]>([
    {
      id: "1",
      tokenId: 3001,
      name: "My Research Assistant",
      description: "Custom-trained research assistant with specialized knowledge",
      image: "/ai-robot-research-assistant-custom.png",
      price: 0.15,
      currency: "ETH",
      status: "active",
      views: 45,
      favorites: 8,
      listedDate: new Date("2024-01-18"),
      lastActivity: new Date("2024-01-20"),
    },
    {
      id: "2",
      tokenId: 3002,
      name: "Code Review Bot",
      description: "Specialized in code review and quality assurance",
      image: "/ai-robot-code-review-bot.png",
      price: 0.22,
      currency: "ETH",
      status: "sold",
      views: 89,
      favorites: 15,
      listedDate: new Date("2024-01-10"),
      lastActivity: new Date("2024-01-16"),
    },
  ])

  const handleUpdatePrice = (listingId: string) => {
    if (!newPrice) return

    setListings((prev) =>
      prev.map((listing) => (listing.id === listingId ? { ...listing, price: Number.parseFloat(newPrice) } : listing)),
    )
    setEditingListing(null)
    setNewPrice("")
  }

  const handleCancelListing = (listingId: string) => {
    setListings((prev) =>
      prev.map((listing) => (listing.id === listingId ? { ...listing, status: "cancelled" } : listing)),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Listings</h2>
          <p className="text-sm text-muted-foreground">Manage your AI agent marketplace listings</p>
        </div>
        <Button onClick={() => setShowCreateListing(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {listings.filter((l) => l.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {listings.filter((l) => l.status === "sold").length}
            </div>
            <p className="text-sm text-muted-foreground">Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {listings.reduce((sum, listing) => sum + listing.views, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {listings.reduce((sum, listing) => sum + listing.favorites, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.name}
                  className="w-32 h-24 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{listing.name}</h3>
                      <p className="text-sm text-muted-foreground">Token #{listing.tokenId}</p>
                      <p className="text-sm text-muted-foreground mt-1">{listing.description}</p>
                    </div>
                    <Badge className={getStatusColor(listing.status)}>{listing.status.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-semibold">
                        {listing.price} {listing.currency}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Views:</span>
                      <div className="font-semibold">{listing.views}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Favorites:</span>
                      <div className="font-semibold">{listing.favorites}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Listed:</span>
                      <div className="font-semibold">{listing.listedDate.toLocaleDateString()}</div>
                    </div>
                  </div>

                  {editingListing === listing.id ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="new-price" className="text-sm">
                        New Price:
                      </Label>
                      <Input
                        id="new-price"
                        type="number"
                        step="0.001"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder={listing.price.toString()}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">ETH</span>
                      <Button size="sm" onClick={() => handleUpdatePrice(listing.id)}>
                        Update
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingListing(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {listing.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingListing(listing.id)}
                            className="gap-1 bg-transparent"
                          >
                            <Edit className="h-3 w-3" />
                            Edit Price
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelListing(listing.id)}
                            className="gap-1 bg-transparent text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                        <Eye className="h-3 w-3" />
                        View Listing
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first listing to start selling your AI agents
            </p>
            <Button onClick={() => setShowCreateListing(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Listing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Listing Modal */}
      {showCreateListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
              <CardDescription>List your AI agent for sale on the marketplace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Listing creation interface would be implemented here with agent selection, pricing, and metadata forms.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateListing(false)} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button className="flex-1">Create Listing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
