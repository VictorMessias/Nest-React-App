"use client"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { transactionsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, X, Plus, Search } from "lucide-react"
import TransactionTable from "@/components/transaction-table"
import { TransactionStatus, Transaction, SortField, SortOrder } from "@/lib/types"
import Filters from "@/components/filters"

const PAGINATION_ITEMS_PER_PAGE = 15

export default function TransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const [copiedId, setCopiedId] = useState<string | null>(null)


  const hasFilters = searchQuery.length > 0 || statusFilter !== "all" || dateFrom.length > 0 || dateTo.length > 0


  // Use effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])


  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, dateFrom, dateTo])


  const transactionsResult = useMemo(() => {
    let filtered = [...transactions]

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(search) ||
          tx.fromAddress.toLowerCase().includes(search) ||
          tx.toAddress.toLowerCase().includes(search) ||
          tx.hash?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter((tx) => new Date(tx.timestamp) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((tx) => new Date(tx.timestamp) <= toDate)
    }

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "date":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case "amount":
          comparison = parseFloat(a.amount) - parseFloat(b.amount)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [transactions, debouncedSearch, statusFilter, dateFrom, dateTo, sortField, sortOrder])

  const totalPages = Math.ceil(transactionsResult.length / PAGINATION_ITEMS_PER_PAGE)

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGINATION_ITEMS_PER_PAGE
    return transactionsResult.slice(startIndex, startIndex + PAGINATION_ITEMS_PER_PAGE)
  }, [transactionsResult, currentPage])

  
  const fetchTransactions = async () =>{
    setIsLoading(true)
    setError(null)
    try {
      const response = await transactionsAPI.getAll()
      setTransactions(response.data.data)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load transactions")
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }


  const removeFilter = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }


  if (error && !isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Error Loading Transactions</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchTransactions}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
        </div>
        <Button onClick={() => router.push("/transactions/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <Filters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        removeFilter={removeFilter}
        hasFilters={hasFilters}
      />

      <Card>
        <CardHeader>
          <CardDescription>
            {isLoading ? (
              "Loading..."
            ) : transactionsResult.length === 0 ? (
              "No transactions found"
            ) : (
              `Showing ${(currentPage - 1) * PAGINATION_ITEMS_PER_PAGE + 1}-${Math.min(
                currentPage * PAGINATION_ITEMS_PER_PAGE,
                transactionsResult.length
              )} of ${transactionsResult.length} transactions`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactionsResult.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground">
                  {hasFilters
                    ? "Try adjusting your filters"
                    : "Create your first transaction to get started"}
                </p>
              </div>
              {!hasFilters && (
                <Button onClick={() => router.push("/transactions/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Transaction
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
              <TransactionTable 
                transactions={paginatedTransactions}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={(field, order) => {
                  setSortField(field)
                  setSortOrder(order)
                }}
              />
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page}>...</span>
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

