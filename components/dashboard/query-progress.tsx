'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface QueryProgressProps {
  completionStatus: {
    isComplete: boolean
    completionPercentage: number
    totalPaid: number
    totalExpected: number
    remainingAmount: number
  } | null
}

export function QueryProgress({ completionStatus }: QueryProgressProps) {
  if (!completionStatus) return null

  return (
    <Card className={completionStatus.isComplete ? "border-green-200 bg-green-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle size={20} className={completionStatus.isComplete ? "text-green-600" : "text-blue-600"} />
          <span>EMI Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Completion Status</span>
            <span className={`font-semibold ${completionStatus.isComplete ? 'text-green-600' : 'text-blue-600'}`}>
              {completionStatus.completionPercentage.toFixed(1)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                completionStatus.isComplete ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, completionStatus.completionPercentage)}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">₹{completionStatus.totalPaid.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Paid</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">₹{completionStatus.totalExpected.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Expected</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">₹{completionStatus.remainingAmount.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>

          {completionStatus.isComplete && (
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-green-800 font-semibold">🎉 EMI Completed Successfully!</p>
              <p className="text-green-700 text-sm">All payments have been received.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
