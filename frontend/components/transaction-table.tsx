import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, X, Plus, Search } from "lucide-react"

type SortField = "date" | "amount" | "status"
type SortOrder = "asc" | "desc"

type TransactionStatus = "pending" | "confirmed" | "failed"


interface Transaction {
  id: string
  fromAddress: string
  toAddress: string
  amount: string
  gasLimit: string
  gasPrice: string
  status: TransactionStatus
  timestamp: string
  hash?: string
}


export default function TransactionTable({ transactions, sortField, sortOrder, onSortChange }: { transactions: Transaction[], sortField: SortField, sortOrder: SortOrder, onSortChange: (field: SortField, order: SortOrder) => void }) {

    const {toast} = useToast()
    const [copiedId, setCopiedId] = useState<string | null>(null)



    const handleSort = (field: SortField) => {
        if (sortField === field) {
        onSortChange(field, sortOrder === "asc" ? "desc" : "asc")
        } else {
        onSortChange(field, "desc")
        }
    }

    const copyToClipboard = async (text: string, id: string) => {
        try {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
        toast({
            title: "Error",
            description: "Failed to copy to clipboard",
            variant: "destructive",
        })
        }
    }

    const truncateAddress = (address: string) => {
        if (!address) return ""
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const formatAmount = (amount: string) => {
        const num = parseFloat(amount)
        return `${num.toFixed(4)} ETH`
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return "just now"
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const getStatusBadge = (status: TransactionStatus) => {
        const variants = {
        pending: "pending" as const,
        confirmed: "success" as const,
        failed: "destructive" as const,
        }

        return (
        <Badge variant={variants[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        )
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
        return sortOrder === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
        <ArrowDown className="ml-2 h-4 w-4" />
        )
    }



    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>
                <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => handleSort("amount")}
                >
                    Amount
                    {getSortIcon("amount")}
                </button>
                </TableHead>
                <TableHead>
                <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => handleSort("status")}
                >
                    Status
                    {getSortIcon("status")}
                </button>
                </TableHead>
                <TableHead>
                <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => handleSort("date")}
                >
                    Date
                    {getSortIcon("date")}
                </button>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                <TableCell>
                    <div className="flex items-center gap-2">
                    <span>{truncateAddress(transaction.hash || transaction.id)}</span>
                    <button
                        onClick={() =>
                        copyToClipboard(transaction.hash || transaction.id, transaction.id)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copiedId === transaction.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                        ) : (
                        <Copy className="h-4 w-4" />
                        )}
                    </button>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                    <span>{truncateAddress(transaction.fromAddress)}</span>
                    <button
                        onClick={() =>
                        copyToClipboard(transaction.fromAddress, `from-${transaction.id}`)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copiedId === `from-${transaction.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                        ) : (
                        <Copy className="h-4 w-4" />
                        )}
                    </button>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                    <span>{truncateAddress(transaction.toAddress)}</span>
                    <button
                        onClick={() =>
                        copyToClipboard(transaction.toAddress, `to-${transaction.id}`)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copiedId === `to-${transaction.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                        ) : (
                        <Copy className="h-4 w-4" />
                        )}
                    </button>
                    </div>
                </TableCell>
                <TableCell className="font-semibold">
                    {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}