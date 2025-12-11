import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, X, Plus, Search } from "lucide-react"
import { TransactionStatus, Transaction, SortField, SortOrder } from "@/lib/types"
import Link from "next/link"
import { copyToClipboard, truncateAddress, formatAmount, formatDate, getStatusBadge } from "@/lib/utils"


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
                <TableHead></TableHead>
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
                        <Link href={`/transactions/${transaction.id}`}>
                            <span className="text-blue-500 hover:underline">--{truncateAddress(transaction.id)}</span>
                        </Link>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                        <span>{truncateAddress(transaction.hash || transaction.id)}</span>
                        <button
                            onClick={() =>
                            copyToClipboard(transaction.hash || transaction.id, transaction.id, setCopiedId, toast)
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
                            copyToClipboard(transaction.fromAddress, `from-${transaction.id}`, setCopiedId, toast)
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
                            copyToClipboard(transaction.toAddress, `to-${transaction.id}`, setCopiedId, toast)
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