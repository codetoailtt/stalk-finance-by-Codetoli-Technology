'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check, QrCode, CreditCard, Smartphone, ExternalLink , Mail ,  Phone} from 'lucide-react'
import { generateUPIPaymentURL } from '@/lib/utils'
import { UPIQRModal } from '@/components/ui/upi-qr-modal'
import { Label } from '@/components/ui/label'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  queryId: string
  type: 'service_fee' | 'emi'
  penaltyAmount?: number
}

export function PaymentModal({ 
  open, 
  onOpenChange, 
  amount, 
  queryId, 
  type,
  penaltyAmount = 0 
}: PaymentModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedUPI, setSelectedUPI] = useState('')

  const bankDetails = {
    accountName: 'Stalk Finance Private Limited',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branchName: 'Gadchiroli Main Branch',
  }

  const upiIds = [
    {
      id: 'primary',
      upiId: process.env.NEXT_PUBLIC_UPI_ID || 'stalkfinance@paytm',
      provider: 'Paytm',
      type: 'Primary',
    },
    {
      id: 'secondary', 
      upiId: process.env.NEXT_PUBLIC_UPI_ID_SECONDARY || 'stalkfinance@okaxis',
      provider: 'Google Pay',
      type: 'Secondary',
    },
  ]

  const totalAmount = amount + penaltyAmount
  const paymentNote = `${type === 'service_fee' ? 'Service Fee' : 'EMI Payment'} - ${queryId}${penaltyAmount > 0 ? ' (incl. penalty)' : ''}`

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleUPIPayment = (upiId: string) => {
    const paymentURL = generateUPIPaymentURL(upiId, totalAmount, paymentNote)
    window.open(paymentURL, '_blank')
  }

  const handleQRPayment = (upiId: string) => {
    setSelectedUPI(upiId)
    setShowQRModal(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard size={20} className="text-blue-600" />
              <span>Payment Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Payment Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Payment Type:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {type === 'service_fee' ? 'Service Fee' : 'EMI Payment'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Query ID:</span>
                    <span className="font-mono text-sm text-blue-900">{queryId}</span>
                  </div>
                  {type === 'emi' && penaltyAmount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">EMI Amount:</span>
                        <span className="font-medium text-blue-900">₹{amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-700">Penalty Amount:</span>
                        <span className="font-medium text-red-800">₹{penaltyAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between border-t border-blue-300 pt-3">
                    <span className="text-base font-semibold text-blue-800">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UPI Payment Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">UPI Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upiIds.map((upi) => (
                  <Card key={upi.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{upi.type}</h4>
                            <p className="text-sm text-muted-foreground">{upi.provider}</p>
                          </div>
                          <Smartphone size={20} className="text-green-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm font-mono text-gray-900 truncate">{upi.upiId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(upi.upiId, upi.id)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            {copiedField === upi.id ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleUPIPayment(upi.upiId)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <ExternalLink size={14} className="mr-2" />
                            Pay with UPI
                          </Button>
                          <Button
                            onClick={() => handleQRPayment(upi.upiId)}
                            variant="outline"
                            className="w-full border-green-600 text-green-600 hover:bg-green-50"
                            size="sm"
                          >
                            <QrCode size={14} className="mr-2" />
                            Scan QR Code
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Bank Transfer</h3>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Name</Label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{bankDetails.accountName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          {copiedField === 'accountName' ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                        <span className="text-sm font-mono text-gray-900">{bankDetails.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          {copiedField === 'accountNumber' ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">IFSC Code</Label>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                        <span className="text-sm font-mono text-gray-900">{bankDetails.ifscCode}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bankDetails.ifscCode, 'ifscCode')}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          {copiedField === 'ifscCode' ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                      <div className="p-2 bg-gray-50 rounded-lg mt-1">
                        <span className="text-sm text-gray-900">{bankDetails.bankName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

             {/* Contact Information */}
          <div className="border-blue-200 bg-blue-50">
          
              <h3 className="text-blue-800">Need Help with Payment?</h3>
           
            <div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Email Support</p>
                    <p className="text-sm text-blue-700">stalkfinancepvtltd@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Phone Support</p>
                    <p className="text-sm text-blue-700">+91 80107 79828</p>
                    <p className="text-xs text-blue-600">Mon-Sat, 9AM-8PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


            {/* Payment Instructions */}
            <Alert>
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Important Payment Instructions:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Include query reference ID "{queryId}" in payment remarks</li>
                    <li>• Keep payment receipt/screenshot for your records</li>
                    <li>• Payments are processed within 2-4 hours during business hours</li>
                    <li>• Contact support immediately for any payment issues</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* UPI QR Modal */}
      <UPIQRModal
        open={showQRModal}
        onOpenChange={setShowQRModal}
        upiId={selectedUPI}
        amount={totalAmount}
        note={paymentNote}
      />
    </>
  )
}