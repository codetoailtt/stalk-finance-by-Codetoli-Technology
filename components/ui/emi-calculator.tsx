'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calculator, IndianRupee, Calendar, Percent, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function EMICalculator() {
  const [amount, setAmount] = useState<string>('50000')
  const [tenure, setTenure] = useState<string>('12')
  const [customTenure, setCustomTenure] = useState<string>('')
  const [showCustomTenure, setShowCustomTenure] = useState(false)
  const [emiResult, setEMIResult] = useState<any>(null)

  const interestRate = 18 // Fixed 18% per annum

  const calculateEMI = () => {
    const principal = parseFloat(amount)
    const tenureMonths = showCustomTenure ? parseInt(customTenure) : parseInt(tenure)
    
    if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) {
      setEMIResult(null)
      return
    }

    // Simple interest calculation
    const totalInterest = (principal * interestRate * tenureMonths) / (100 * 12)
    const totalAmount = principal + totalInterest
    const monthlyEMI = totalAmount / tenureMonths

    setEMIResult({
      principal,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      monthlyEMI: Math.round(monthlyEMI * 100) / 100,
      tenureMonths,
      interestRate
    })
  }

  useEffect(() => {
    calculateEMI()
  }, [amount, tenure, customTenure, showCustomTenure])

  const handleTenureChange = (value: string) => {
    setTenure(value)
    setShowCustomTenure(value === 'custom')
    if (value !== 'custom') {
      setCustomTenure('')
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator size={20} className="text-blue-600" />
            <span>EMI Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loan Amount */}
          <div>
            <Label htmlFor="amount" className="flex items-center space-x-2 mb-2">
              <IndianRupee size={16} />
              <span>Loan Amount</span>
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter loan amount"
              min="1000"
              max="1000000"
              step="1000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: ₹1,000 | Maximum: ₹10,00,000
            </p>
          </div>

          {/* Interest Rate (Fixed) */}
          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Percent size={16} />
              <span>Interest Rate (Fixed)</span>
            </Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <span className="text-lg font-semibold text-gray-900">{interestRate}% per annum</span>
              <p className="text-xs text-muted-foreground">Fixed rate for all loans</p>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <Label htmlFor="tenure" className="flex items-center space-x-2 mb-2">
              <Calendar size={16} />
              <span>Loan Tenure</span>
            </Label>
            <Select value={tenure} onValueChange={handleTenureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="9">9 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="18">18 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
                <SelectItem value="36">36 Months</SelectItem>
                <SelectItem value="48">48 Months</SelectItem>
                <SelectItem value="60">60 Months</SelectItem>
                <SelectItem value="custom">Custom Tenure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Tenure */}
          {showCustomTenure && (
            <div>
              <Label htmlFor="customTenure">Custom Tenure (Months)</Label>
              <Input
                id="customTenure"
                type="number"
                value={customTenure}
                onChange={(e) => setCustomTenure(e.target.value)}
                placeholder="Enter months (3-60)"
                min="3"
                max="60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter tenure between 3 to 60 months
              </p>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div>
            <Label className="mb-2 block">Quick Amount Selection</Label>
            <div className="grid grid-cols-3 gap-2">
              {['25000', '50000', '100000', '200000', '300000', '500000'].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant={amount === quickAmount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                  className="text-xs"
                >
                  ₹{parseInt(quickAmount).toLocaleString('en-IN')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EMI Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-green-600" />
            <span>EMI Calculation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emiResult ? (
            <div className="space-y-6">
              {/* Monthly EMI Highlight */}
              <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₹{emiResult.monthlyEMI.toLocaleString('en-IN')}
                </div>
                <div className="text-blue-800 font-medium">Monthly EMI</div>
                <div className="text-sm text-blue-600 mt-1">
                  for {emiResult.tenureMonths} months
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Payment Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Principal Amount</span>
                    <span className="font-semibold">₹{emiResult.principal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Interest ({interestRate}% p.a.)</span>
                    <span className="font-semibold">₹{emiResult.totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-semibold text-blue-800">Total Amount Payable</span>
                    <span className="font-bold text-blue-900">₹{emiResult.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Amount Distribution</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Principal</span>
                    <span>{((emiResult.principal / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(emiResult.principal / emiResult.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interest</span>
                    <span>{((emiResult.totalInterest / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(emiResult.totalInterest / emiResult.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/signup">
                    Apply for This Loan
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Enter loan amount and tenure to calculate EMI</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}