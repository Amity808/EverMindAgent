"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Plus, Minus, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { useZGCompute } from "@/hooks/use-0g-compute"
import { ethers } from "ethers"

export function ZGAccountManagement() {
    const {
        accountBalance,
        isLoading,
        error,
        addFunds,
        requestRefund,
        refreshBalance
    } = useZGCompute()

    const [fundAmount, setFundAmount] = useState("")
    const [refundAmount, setRefundAmount] = useState("")
    const [refundServiceType, setRefundServiceType] = useState("inference")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showFundDialog, setShowFundDialog] = useState(false)
    const [showRefundDialog, setShowRefundDialog] = useState(false)

    const handleAddFunds = async () => {
        if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
            return
        }

        setIsProcessing(true)
        try {
            await addFunds(fundAmount)
            setFundAmount("")
            setShowFundDialog(false)
        } catch (error) {
            console.error('Failed to add funds:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRequestRefund = async () => {
        if (!refundAmount || isNaN(Number(refundAmount)) || Number(refundAmount) <= 0) {
            return
        }

        setIsProcessing(true)
        try {
            await requestRefund(refundServiceType, refundAmount)
            setRefundAmount("")
            setShowRefundDialog(false)
        } catch (error) {
            console.error('Failed to request refund:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const formatBalance = (balance: bigint) => {
        return (Number(balance) / 1e18).toFixed(6)
    }

    const getAvailableBalance = () => {
        if (!accountBalance) return "0.000000"
        return formatBalance(accountBalance.balance)
    }

    const getTotalBalance = () => {
        if (!accountBalance) return "0.000000"
        return formatBalance(accountBalance.totalbalance)
    }

    const getLockedBalance = () => {
        if (!accountBalance) return "0.000000"
        return formatBalance(accountBalance.locked)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        <CardTitle className="text-lg">0G Account</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshBalance}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <CardDescription>
                    Manage your 0G Compute Network account balance and transactions
                </CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="balance" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="balance">Balance</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="balance" className="space-y-4">
                        {/* Balance Overview */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 rounded-lg bg-primary/5">
                                <p className="text-sm text-muted-foreground">Available</p>
                                <p className="text-lg font-semibold">{getAvailableBalance()} OG</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-secondary/5">
                                <p className="text-sm text-muted-foreground">Locked</p>
                                <p className="text-lg font-semibold">{getLockedBalance()} OG</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-accent/5">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-lg font-semibold">{getTotalBalance()} OG</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Funds
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Funds to 0G Account</DialogTitle>
                                        <DialogDescription>
                                            Add OG tokens to your account to pay for AI inference services
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="fundAmount">Amount (OG)</Label>
                                            <Input
                                                id="fundAmount"
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={fundAmount}
                                                onChange={(e) => setFundAmount(e.target.value)}
                                                placeholder="0.1"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAddFunds}
                                                disabled={!fundAmount || isProcessing}
                                                className="flex-1"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Add Funds'
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowFundDialog(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex-1 gap-2">
                                        <Minus className="h-4 w-4" />
                                        Request Refund
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Refund</DialogTitle>
                                        <DialogDescription>
                                            Request a refund for unused funds from a specific service
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="refundServiceType">Service Type</Label>
                                            <select
                                                id="refundServiceType"
                                                value={refundServiceType}
                                                onChange={(e) => setRefundServiceType(e.target.value)}
                                                className="w-full p-2 border rounded-md"
                                            >
                                                <option value="inference">Inference</option>
                                                <option value="storage">Storage</option>
                                                <option value="training">Training</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="refundAmount">Amount (OG)</Label>
                                            <Input
                                                id="refundAmount"
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={refundAmount}
                                                onChange={(e) => setRefundAmount(e.target.value)}
                                                placeholder="0.05"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleRequestRefund}
                                                disabled={!refundAmount || isProcessing}
                                                className="flex-1"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Request Refund'
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowRefundDialog(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Recommended Actions */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFundAmount("0.1")}
                                >
                                    Add 0.1 OG (~100 requests)
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFundAmount("0.5")}
                                >
                                    Add 0.5 OG (~500 requests)
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFundAmount("1.0")}
                                >
                                    Add 1.0 OG (~1000 requests)
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                        <div className="text-center py-8">
                            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                            <p className="text-muted-foreground">
                                Transaction history will be available soon. Check your wallet for transaction details.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
