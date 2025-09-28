'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QrCode, ExternalLink, Copy, Check } from 'lucide-react'
import { generateUPIPaymentURL } from '@/lib/utils'

interface UPIQRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  upiId: string
  amount: number
  note: string
}

export function UPIQRModal({ open, onOpenChange, upiId, amount, note }: UPIQRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const paymentURL = generateUPIPaymentURL(upiId, amount, note)

  useEffect(() => {
    if (open && upiId) {
      // Generate QR code URL using a free QR code API
      const qrData = encodeURIComponent(paymentURL)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`)
    }
  }, [open, upiId, paymentURL])

  const copyUPILink = async () => {
    try {
      await navigator.clipboard.writeText(paymentURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePayWithUPI = () => {
    window.open(paymentURL, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode size={20} className="text-green-600" />
            <span>UPI QR Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Payment Details */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">UPI ID:</span>
                  <span className="font-mono text-green-900">{upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Amount:</span>
                  <span className="font-bold text-green-900">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Reference:</span>
                  <span className="font-mono text-green-900 text-xs">{note}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="UPI Payment QR Code"
                  className="w-64 h-64 mx-auto"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <QrCode size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Scan this QR code with any UPI app to make payment
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePayWithUPI}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <ExternalLink size={16} className="mr-2" />
              Pay with UPI App
            </Button>

            <Button
              onClick={copyUPILink}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              size="lg"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy UPI Link
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Payment Instructions</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>• Or click "Pay with UPI App" to open your default UPI app</li>
                <li>• Verify the amount and UPI ID before confirming payment</li>
                <li>• Keep the transaction screenshot for your records</li>
                <li>• Payment will be processed within 2-4 hours</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}