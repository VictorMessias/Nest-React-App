import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TransactionStatus } from "./types"
import { Badge } from "@/components/ui/badge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = async (text: string, id: string, setCopiedId: React.Dispatch<React.SetStateAction<string | null>>, toast: any) => {
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

export const truncateAddress = (address: string) => {
      if (!address) return ""
      return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

export const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    return `${num.toFixed(4)} ETH`
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export const getStatusBadge = (status: TransactionStatus) => {
    const variants = {
    pending: "pending" as const,
    confirmed: "success" as const,
    failed: "destructive" as const,
    }

    return variants[status]
}

