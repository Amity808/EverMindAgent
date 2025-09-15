"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Download, Zap, HardDrive, ShoppingCart, ArrowRight, ExternalLink } from "lucide-react"
import { useState } from "react"

interface Transaction {
  id: string
  type: "purchase" | "usage" | "transfer"
  creditType: "compute" | "storage"
  amount: number
  cost?: number
  from?: string
  to?: string
  agent?: string
  operation?: string
  timestamp: Date
  txHash?: string
  status: "completed" | "pending" | "failed"
}

export function CreditHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "purchase",
      creditType: "compute",
      amount: 100,
      cost: 0.0001,
      timestamp: new Date("2024-01-07T10:30:00"),
      txHash: "0x1234...abcd",
      status: "completed",
    },
    {
      id: "2",
      type: "usage",
      creditType: "compute",
      amount: -3,
      agent: "Research Assistant",
      operation: "Text analysis",
      timestamp: new Date("2024-01-07T09:15:00"),
      status: "completed",
    },
    {
      id: "3",
      type: "transfer",
      creditType: "storage",
      amount: 20,
      from: "Code Helper",
      to: "Creative Writer",
      timestamp: new Date("2024-01-06T16:45:00"),
      status: "completed",
    },
    {
      id: "4",
      type: "purchase",
      creditType: "storage",
      amount: 500,
      cost: 0.00005,
      timestamp: new Date("2024-01-06T14:20:00"),
      txHash: "0x5678...efgh",
      status: "completed",
    },
    {
      id: "5",
      type: "usage",
      creditType: "compute",
      amount: -5,
      agent: "Code Helper",
      operation: "Code generation",
      timestamp: new Date("2024-01-06T11:30:00"),
      status: "completed",
    },
    {
      id: "6",
      type: "usage",
      creditType: "storage",
      amount: -2,
      agent: "Research Assistant",
      operation: "Document upload",
      timestamp: new Date("2024-01-05T15:10:00"),
      status: "completed",
    },
  ]

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === "" ||
      tx.agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.operation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || tx.type === filterType
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-green-600" />
      case "usage":
        return transaction.creditType === "compute" ? (
          <Zap className="h-4 w-4 text-primary" />
        ) : (
          <HardDrive className="h-4 w-4 text-secondary" />
        )
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-accent" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case "purchase":
        return `Purchased ${transaction.amount} ${transaction.creditType} credits`
      case "usage":
        return `${transaction.agent} - ${transaction.operation}`
      case "transfer":
        return `Transfer from ${transaction.from} to ${transaction.to}`
      default:
        return "Unknown transaction"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium">{getTransactionDescription(transaction)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transaction.timestamp.toLocaleString()}</span>
                      {transaction.txHash && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <span className="font-mono">{transaction.txHash}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount} {transaction.creditType}
                    </div>
                    {transaction.cost && <div className="text-sm text-muted-foreground">{transaction.cost} ETH</div>}
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
