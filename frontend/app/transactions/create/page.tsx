"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { transactionsAPI } from "@/lib/api"

const STORAGE_KEY = "transaction_draft"

const transactionSchema = z.object({
  toAddress: z
    .string()
    .min(1, "Address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
  gasLimit: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), "Gas limit must be a positive number"),
  gasPrice: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), "Gas price must be a positive number"),
})

type TransactionFormData = z.infer<typeof transactionSchema>

export default function TransactionsCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionFee, setTransactionFee] = useState<string>("0")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      toAddress: "",
      amount: "",
      gasLimit: "21000",
      gasPrice: "0.00000002",
    },
    mode: "onChange",
  })

  const gasLimit = watch("gasLimit")
  const gasPrice = watch("gasPrice")

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setValue("toAddress", draft.toAddress || "")
        setValue("amount", draft.amount || "")
        setValue("gasLimit", draft.gasLimit || "21000")
        setValue("gasPrice", draft.gasPrice || "0.00000002")
      } catch (error) {
        console.error("Error loading draft:", error)
      }
    }
  }, [setValue])

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    const limit = parseFloat(gasLimit || "21000")
    const price = parseFloat(gasPrice || "0.00000002")
    
    if (!isNaN(limit) && !isNaN(price)) {
      const fee = limit * price
      setTransactionFee(fee.toFixed(8))
    } else {
      setTransactionFee("0")
    }
  }, [gasLimit, gasPrice])

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      const response = await transactionsAPI.create({
        toAddress: data.toAddress,
        amount: data.amount,
        gasLimit: data.gasLimit || "21000",
        gasPrice: data.gasPrice || "0.00000002",
      })

      localStorage.removeItem(STORAGE_KEY)

      toast({
        title: "Transaction Created Successfully",
        description: `Transaction hash: ${response.data._id}`,
        duration: 5000,
      })

      setTimeout(() => {
        router.push("/transactions")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.response?.data?.message || "Failed to create transaction. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">

      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="toAddress">To Address *</Label>
              <Input
                id="toAddress"
                placeholder="0x..."
                {...register("toAddress")}
                className={errors.toAddress ? "border-red-500" : ""}
              />
              {errors.toAddress && (
                <p className="text-sm text-red-500">{errors.toAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH) *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0.0"
                {...register("amount")}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasLimit">Gas Limit</Label>
                <Input
                  id="gasLimit"
                  type="text"
                  placeholder="21000"
                  {...register("gasLimit")}
                  className={errors.gasLimit ? "border-red-500" : ""}
                />
                {errors.gasLimit && (
                  <p className="text-sm text-red-500">{errors.gasLimit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price (ETH)</Label>
                <Input
                  id="gasPrice"
                  type="text"
                  placeholder="0.00000002"
                  {...register("gasPrice")}
                  className={errors.gasPrice ? "border-red-500" : ""}
                />
                {errors.gasPrice && (
                  <p className="text-sm text-red-500">{errors.gasPrice.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Transaction Fee:</span>
                <span className="text-lg font-bold">{transactionFee} ETH</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gas Limit × Gas Price
              </p>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/transactions")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Transaction"}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

