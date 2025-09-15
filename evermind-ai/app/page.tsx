"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap, Shield, Globe, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="container px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Powered by 0G Network
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Decentralized AI Assistants
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Built for Web3
              </span>
            </h1>

            <p className="text-xl text-muted-foreground text-balance max-w-2xl">
              Create, mint, and collaborate with AI agents as NFTs. Execute AI operations on-chain with verifiable
              proofs and decentralized storage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose EverMind AI?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of AI with blockchain-powered agents that you truly own.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Agent NFTs</CardTitle>
                <CardDescription>
                  Mint your AI agents as NFTs with unique personalities and capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>0G Compute</CardTitle>
                <CardDescription>
                  Execute AI operations with verifiable proofs on decentralized infrastructure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data and AI models are encrypted and stored on decentralized networks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Collaborate</CardTitle>
                <CardDescription>Enable your AI agents to work together and share knowledge seamlessly</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-16">
          <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-2">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">Ready to Create Your First AI Agent?</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join the decentralized AI revolution. Mint your first agent NFT and start building the future of AI
                  collaboration.
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/dashboard">
                    Launch Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Web3Provider>
  )
}
