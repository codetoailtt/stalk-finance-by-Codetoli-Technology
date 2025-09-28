'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Percent, Calendar, Clock } from 'lucide-react'
import { calculateMonthlyEMI } from '@/lib/utils'

interface EMIManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (emiDate: number, emiPercent: number, tenureMonths: number) => Promise<void>
  loading: boolean
  mode: 'start' | 'edit'
  currentEmiDate?: number
  currentEmiPercent?: number
  currentTenureMonths?: number
  principalAmount?: number
}

export function EMIManagementModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  mode,
  currentEmiDate,
  currentEmiPercent,
  currentTenureMonths,
  principalAmount = 50000
}: EMIManagementModalProps) {
  const [emiDate, setEmiDate] = useState('') // string for Select
  const [emiPercent, setEmiPercent] = useState<number>(currentEmiPercent ?? 18) // always number
  const [tenureMonths, setTenureMonths] = useState('') // string for Select
  const [error, setError] = useState('')
  const [calculatedEMI, setCalculatedEMI] = useState(0)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmiDate(currentEmiDate ? currentEmiDate.toString() : '')
      setEmiPercent(currentEmiPercent ?? 18)
      setTenureMonths(currentTenureMonths ? currentTenureMonths.toString() : '12')
      setError('')
    }
  }, [open, currentEmiDate, currentEmiPercent, currentTenureMonths])

  // Calculate EMI preview
  useEffect(() => {
    if (emiPercent && tenureMonths && principalAmount) {
      const emi = calculateMonthlyEMI(
        principalAmount,
        emiPercent,
        parseInt(tenureMonths)
      )
      setCalculatedEMI(emi)
    }
  }, [emiPercent, tenureMonths, principalAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!emiDate || !emiPercent || !tenureMonths) {
      setError('All fields are required')
      return
    }

    const dateNum = parseInt(emiDate)
    const percentNum = emiPercent
    const tenureNum = parseInt(tenureMonths)

    if (dateNum < 1 || dateNum > 31) {
      setError('EMI date must be between 1 and 31')
      return
    }

    if (percentNum < 0 || percentNum > 100) {
      setError('Interest rate must be between 0 and 100')
      return
    }

    if (tenureNum < 1 || tenureNum > 60) {
      setError('Tenure must be between 1 and 60 months')
      return
    }

    try {
      await onSubmit(dateNum, percentNum, tenureNum)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Percent size={20} className="text-blue-600" />
            <span>{mode === 'start' ? 'Start EMI' : 'Edit EMI Settings'}</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EMI Date */}
            <div>
              <Label htmlFor="emi_date" className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>EMI Date *</span>
              </Label>
              <Select value={emiDate} onValueChange={setEmiDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select EMI date" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <SelectItem key={date} value={date.toString()}>
                      {date} of every month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Day of the month when EMI is due
              </p>
            </div>

            {/* Interest Rate */}
            <div>
              <Label htmlFor="emi_percent" className="flex items-center space-x-2">
                <Percent size={16} />
                <span>Interest Rate (% p.a.) *</span>
              </Label>
              <Input
                id="emi_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={emiPercent}
                onChange={(e) => setEmiPercent(Number(e.target.value))}
                placeholder="18"
              />
              <Label className="text-xs text-muted-foreground">
                Annual interest rate percentage
              </Label>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <Label htmlFor="tenure_months" className="flex items-center space-x-2">
              <Clock size={16} />
              <span>Tenure (Months) *</span>
            </Label>
            <Select value={tenureMonths} onValueChange={setTenureMonths}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {[3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60].map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m} Months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Loan repayment period in months
            </p>
          </div>

          {/* EMI Calculation Preview */}
          {emiPercent && tenureMonths && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">EMI Calculation Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Principal Amount:</span>
                  <span className="font-medium text-blue-900">
                    ₹{principalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Interest Rate:</span>
                  <span className="font-medium text-blue-900">{emiPercent}% per annum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Tenure:</span>
                  <span className="font-medium text-blue-900">{tenureMonths} months</span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2">
                  <span className="text-blue-700 font-medium">Monthly EMI:</span>
                  <span className="font-bold text-blue-900 text-lg">
                    ₹{calculatedEMI.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="font-medium text-blue-900">
                    ₹{(calculatedEMI * parseInt(tenureMonths || '12')).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {mode === 'start' ? 'Starting EMI...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Percent size={16} className="mr-2" />
                  {mode === 'start' ? 'Start EMI' : 'Update Settings'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
