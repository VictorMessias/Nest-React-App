export type TransactionStatus = "pending" | "confirmed" | "failed"


export interface Transaction {
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


export type SortField = "date" | "amount" | "status"
export type SortOrder = "asc" | "desc"