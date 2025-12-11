import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check, X, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function Filters({searchQuery, setSearchQuery, statusFilter, setStatusFilter, dateFrom, setDateFrom,  dateTo, setDateTo, removeFilter, hasFilters}: {searchQuery: string, setSearchQuery: (value: string) => void, statusFilter: string, setStatusFilter: (value: string) => void, dateFrom: string, setDateFrom: (value: string) => void, dateTo: string, setDateTo: (value: string) => void, removeFilter: () => void, hasFilters: boolean,
}) {
    return (
        <Card>
            <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        placeholder="Hash or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                    {searchQuery && (
                        <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-2.5"
                        >
                        <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                    </div>
                </div>
        
                <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
                </div>
    
                <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                />
                </div>
    
                <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                />
                </div>
            </div>
    
            {hasFilters && (
                <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={removeFilter}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
                </div>
            )}
            </CardContent>
        </Card>
    )
}