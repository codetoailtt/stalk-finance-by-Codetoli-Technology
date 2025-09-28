'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Download, Shield } from 'lucide-react'

import { CheckedState } from '@radix-ui/react-checkbox'

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  loading?: boolean
}

export function TermsModal({ open, onOpenChange, onAccept, loading = false }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      // Download the static Terms.pdf from public/assets
      const response = await fetch('/assets/Terms.pdf')
      if (!response.ok) throw new Error('Failed to fetch Terms.pdf')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Terms.pdf'
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download Terms.pdf:', error)
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleAccept = () => {
    if (accepted) {
      onAccept()
      setAccepted(false) // Reset for next time
    }
  }

  const handleClose = () => {
    setAccepted(false)
    onOpenChange(false)
  }

  // Fix: Accept only boolean for setAccepted
  const handleCheckedChange = (checked: CheckedState) => {
    setAccepted(checked === true)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Shield size={20} className="text-primary" />
            <span>Terms and Conditions</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 space-y-4">
          <ScrollArea className="h-[50vh] w-full border rounded-lg p-4">
            <div className="space-y-4 text-sm">
              <h1 className="text-lg font-bold mb-2 text-foreground">Terms and Conditions</h1>
              <h2 className="text-base font-semibold mb-1 text-foreground">Stalk Finance Private Limited</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <b>A)</b> I/We do hereby certify that the information provided by me/us in this application form is true and correct in all respects and The Stalk Finance Private Limited is entitled to verify this directly or through any third party agent.
                </p>
                <p className="text-muted-foreground">
                  <b>B)</b> I/We further acknowledge the Stalk Finance Private Limited right to seek any information from any other source in this regard.
                </p>
                <p className="text-muted-foreground">
                  <b>C)</b> I/We do understand that all the above mentioned information will form the basis of any facility that the Stalk Finance Private Limited may decide to grant me/us at its sole discretion.
                </p>
                <p className="text-muted-foreground">
                  <b>D)</b> I/We do further agree that any facility that may be provided to me/us shall be governed by the rules of the Stalk Finance Private Limited that may be in force from time to time.
                </p>
                <p className="text-muted-foreground">
                  <b>E)</b> I/We will be bound by the terms and conditions of the facility that may be granted to me/us.
                </p>
                <p className="text-muted-foreground">
                  <b>F)</b> I/We do authorise the Stalk Finance Private Limited to debit my/our any other account with the Bank for any fees, charges, interest, and default of my repayment by using my pledged singed blank cheque.
                </p>
                <p className="text-muted-foreground">
                  <b>G)</b> I/We undertake to intimate the Stalk Finance Private Limited in the event of any change in my/our mobile phone number.
                </p>
                <p className="text-muted-foreground">
                  <b>H)</b> I/We hereby declare that I/we shall notify the Stalk Finance Private Limited, in writing or on phone, of any changes in my/our employment and/or residential address and telephone numbers.
                </p>
                <p className="text-muted-foreground">
                  <b>I)</b> Applicant must provided 6 singed blank check with one minimum guarantor.
                </p>
                <p className="text-muted-foreground">
                  <b>J)</b> Preliminary charges of Finance will be paid First.
                </p>
                <p className="text-muted-foreground">
                  <b>K)</b> Default in payment fo of 2 instalment will be recovered with fine & charges and the guarantor will liable for the same.
                </p>
                <p className="text-muted-foreground">
                  <b>L)</b> In Case of Cheque Bounce penalty of Rs. 5000 +GST will be penalize & duely Received From Applicant.
                </p>
                <p className="text-muted-foreground">
                  <b>M)</b> Product will Not Be sale Until the Total Finance Amuont Will Be Paid.
                </p>
                <p className="text-muted-foreground">
                  <b>N)</b> The Above arrangement is in the nature of hire purchase and mere payment of down payment does not make the buyer owner of said goods. The ownership in goods will be transferred only after the payment of last installment. Stalk Finance Private Limited will have complete rights to forfeit the goods in case non payment of principal as well as interest amount.
                </p>
                <p className="text-muted-foreground">
                  <b>O)</b> In any case of default or non repayment of more than 2 EMI, then the borrower as well as his guarantors will be liable to pay the same and all the payment for recovery including legal, court stamp duty and Advocacy fees will be recovered separately.
                </p>
                <p className="text-muted-foreground font-semibold mt-4">
                  Hence,
                </p>
                <p className="text-muted-foreground">
                  I Undertake to Provide any further information as Stalk Finance Private Limited may ask from time to time. I hear by declare that all the information provide by me is true and corrrect and I accept all the terms
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={handleCheckedChange}
                disabled={loading} 
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the Terms and Conditions
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex-1 sm:flex-none"
              >
                {downloadingPDF ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleAccept}
                  disabled={!accepted || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Accept & Continue'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}