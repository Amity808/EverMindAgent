"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { NFTGallery } from "@/components/nft-gallery"
import { AgentListing } from "@/components/agent-listing"
import { MyListings } from "@/components/my-listings"
import { TransferInterface } from "@/components/transfer-interface"
import { Store, Search, Filter, Plus, TrendingUp } from "lucide-react"

export function MarketplaceInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            AI Agent Marketplace
          </h1>
          <p className="text-muted-foreground">Discover, buy, and sell AI agent NFTs</p>
        </div>
        <Button onClick={() => setShowTransferModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          List Agent
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Listed</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse" className="gap-2">
            <Store className="h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            NFT Gallery
          </TabsTrigger>
          <TabsTrigger value="my-listings" className="gap-2">
            <Plus className="h-4 w-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <AgentListing
            searchTerm={searchTerm}
            sortBy={sortBy}
            filterCategory={filterCategory}
            onSelectAgent={setSelectedAgent}
          />
        </TabsContent>

        <TabsContent value="gallery">
          <NFTGallery />
        </TabsContent>

        <TabsContent value="my-listings">
          <MyListings />
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending AI Agents</CardTitle>
              <CardDescription>Most popular agents in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Trending data coming soon</p>
                <p className="text-sm">Popular agents will be featured here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Modal */}
      {showTransferModal && <TransferInterface onClose={() => setShowTransferModal(false)} agentId={selectedAgent} />}
    </div>
  )
}
