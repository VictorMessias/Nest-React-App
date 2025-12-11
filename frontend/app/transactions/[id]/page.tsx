"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { transactionsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import { Transaction, TransactionStatus } from "@/lib/types"
import { copyToClipboard, formatAmount, formatDate, getStatusBadge } from "@/lib/utils"

export default function TransactionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const loadTransaction = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await transactionsAPI.getById(id)
      setTransaction(response.data.data)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load transaction details")
      toast({
        title: "Error",
        description: "Failed to load transaction details. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadTransaction()
    }
  }, [id])


  const calculateTransactionFee = () => {
    if (!transaction) return "0"
    const limit = parseFloat(transaction.gasLimit)
    const price = parseFloat(transaction.gasPrice)
    const fee = limit * price
    return fee.toFixed(8)
  }

  const getStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: "text-orange-500",
      confirmed: "text-green-500",
      failed: "text-red-500",
    }
    return colors[status]
  }

  const openExplorer = () => {
    const hash = transaction?.hash || transaction?.id
    window.open(`https://etherscan.io/tx/${hash}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Error loading Transaction</h3>
              <p className="text-sm text-muted-foreground">
                {error || "Transaction not found"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadTransaction}>Retry</Button>
              <Button variant="outline" onClick={() => router.push("/transactions")}>
                Back to Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Information</CardTitle>
              <CardDescription>Details for transaction {transaction.id}</CardDescription>
            </div>
                <Badge variant={getStatusBadge(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction Hash</Label>
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              <code className="flex-1 text-sm break-all">
                {transaction.hash || transaction.id}
              </code>
              <button
                onClick={() => copyToClipboard(transaction.hash || transaction.id, "hash", setCopied, toast)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {copied === "hash" ? (<Check className="h-4 w-4 text-green-500" />) : (<Copy className="h-4 w-4" />)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">From Address</Label>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <code className="flex-1 text-sm break-all">
                  {transaction.fromAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(transaction.fromAddress, "from", setCopied, toast)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  {copied === "from" ? (<Check className="h-4 w-4 text-green-500" />) : (<Copy className="h-4 w-4" />)}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">To Address</Label>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <code className="flex-1 text-sm break-all">
                  {transaction.toAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(transaction.toAddress, "to", setCopied, toast)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  {copied === "to" ? (<Check className="h-4 w-4 text-green-500" />) : (<Copy className="h-4 w-4" />)}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount</Label>
            <div className="p-3 rounded-md bg-muted">
              <p className="text-2xl font-bold">{formatAmount(transaction.amount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(transaction.status).replace('text-', 'bg-')}`} />
              <p className={`text-sm font-semibold ${getStatusColor(transaction.status)}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gas Limit</Label>
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm font-mono">{transaction.gasLimit}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Gas Price</Label>
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm font-mono">{transaction.gasPrice} ETH</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction Fee</Label>
            <div className="p-3 rounded-md bg-muted">
              <p className="text-lg font-semibold">{calculateTransactionFee()} ETH</p>
              <p className="text-xs text-muted-foreground mt-1">
                Gas Limit × Gas Price
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Timestamp</Label>
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">{formatDate(transaction.timestamp)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button variant="outline" onClick={() => router.push("/transactions")}>
              Close
            </Button>
            <Button onClick={openExplorer}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
