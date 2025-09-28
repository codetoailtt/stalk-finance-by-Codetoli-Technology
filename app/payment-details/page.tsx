'use client'

import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, CreditCard, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function PaymentDetailsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const bankDetails = {
    accountName: 'Stalk Finance Private Limited',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branchName: 'Gadchiroli Main Branch',
    branchAddress: 'Main Road, Gadchiroli, Maharashtra - 441207',
  }

  const upiIds = [
    {
      id: 'primary',
      upiId: 'stalkfinance@paytm',
      provider: 'Paytm',
      type: 'Primary',
    },
    {
      id: 'secondary',
      upiId: 'stalkfinance@okaxis',
      provider: 'Google Pay',
      type: 'Secondary',
    },
  ]

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Metadata via Head */}
      <Head>
        <title>Payment Details - Stalk Finance</title>
        <meta
          name="description"
          content="Bank account details and UPI IDs for payments to Stalk Finance"
        />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <img
                src="/assets/logo.png"
                alt="Stalk Finance logo"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Payment Details
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Use the following payment methods to complete your transactions with
            Stalk Finance Private Limited.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard size={20} className="text-blue-600" />
                <span>Bank Account Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Account Holder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Account Holder Name
                    </label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm sm:text-base font-medium text-gray-900">
                        {bankDetails.accountName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(bankDetails.accountName, 'accountName')
                        }
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === 'accountName' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Account Number
                    </label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm sm:text-base font-mono text-gray-900">
                        {bankDetails.accountNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            bankDetails.accountNumber,
                            'accountNumber',
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === 'accountNumber' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      IFSC Code
                    </label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm sm:text-base font-mono text-gray-900">
                        {bankDetails.ifscCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(bankDetails.ifscCode, 'ifscCode')
                        }
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === 'ifscCode' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Bank Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm sm:text-base text-gray-900">
                        {bankDetails.bankName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Branch Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm sm:text-base text-gray-900">
                        {bankDetails.branchName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Branch Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span className="text-xs sm:text-sm text-gray-900 leading-relaxed">
                        {bankDetails.branchAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UPI IDs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone size={20} className="text-green-600" />
                <span>UPI Payment IDs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {upiIds.map((upi) => (
                  <div key={upi.id} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {upi.type} UPI ID
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {upi.provider}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm sm:text-base font-mono text-gray-900">
                        {upi.upiId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(upi.upiId, upi.id)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === upi.id ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                Important Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-yellow-800">
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Always include your query reference ID in the payment
                    description/remarks
                  </span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Keep the payment receipt/screenshot for your records
                  </span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Payments are typically processed within 2-4 hours during
                    business hours
                  </span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    For any payment issues, contact our support team immediately
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  Need Help with Payments?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Our customer support team is available to assist you with any
                  payment-related queries.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    asChild
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
