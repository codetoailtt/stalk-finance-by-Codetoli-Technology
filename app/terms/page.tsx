import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service - Stalk Finance',
  description: 'Terms and conditions for Stalk Finance loan services',
  keywords: 'terms of service, loan terms, Stalk Finance, EMI, interest rates, repayment, loan eligibility, India, consumer finance, privacy, legal, customer support',
  openGraph: {
    title: 'Terms of Service - Stalk Finance',
    description: 'Terms and conditions for Stalk Finance loan services',
    url: 'https://stalkfinance.com/terms',
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - Stalk Finance',
    description: 'Terms and conditions for Stalk Finance loan services',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: January 15, 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Stalk Finance Private Limited ("we," "our," or "us"). These Terms of Service ("Terms") 
              govern your use of our loan services for mobile phones, furniture, electronics, and other consumer 
              goods. By applying for a loan or using our services, you agree to these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Eligibility Criteria</h2>
            <p className="text-gray-700 leading-relaxed mb-2">To be eligible for our loan services, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Be at least 21 years old and not more than 65 years old</li>
              <li>Be an Indian citizen with valid identity documents</li>
              <li>Have a regular source of income (salaried or self-employed)</li>
              <li>Provide accurate and complete information in your application</li>
              <li>Have a satisfactory credit history and CIBIL score</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Loan Terms and Conditions</h2>
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.1 Interest Rates</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Interest rates start from 12% to 18% per annum and may vary based on your credit profile, loan amount, 
              and tenure. The applicable interest rate will be communicated to you before loan approval.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.2 Loan Amount and Tenure</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Mobile Phone Loans: Up to ₹1,50,000 with tenure of 3-24 months</li>
              <li>Furniture Loans: Up to ₹5,00,000 with tenure of 6-36 months</li>
              <li>Electronics Loans: Up to ₹3,00,000 with tenure of 3-24 months</li>
              <li>Home Appliances: Up to ₹2,00,000 with tenure of 6-24 months</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.3 Processing Fee</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A processing fee of 2-3% of the loan amount (minimum ₹500) plus applicable GST will be charged. 
              This fee is non-refundable and will be deducted from the loan amount at the time of disbursal.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Repayment Terms</h2>
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">4.1 EMI Payment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must pay Equated Monthly Installments (EMIs) on the due date each month. EMIs can be paid 
              through auto-debit, online transfer, or at our partner locations.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">4.2 Late Payment Charges</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A late payment charge of 2% per month on the overdue amount will be levied for delayed payments. 
              Consistent delays may affect your credit score and future loan eligibility.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">4.3 Prepayment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can prepay your loan partially or fully at any time without prepayment penalties. 
              Prepayment requests must be made at least 7 days before the next EMI due date.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Documentation Requirements</h2>
            <p className="text-gray-700 leading-relaxed mb-2">You must provide the following documents:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Identity Proof: Aadhaar Card, Passport, or Voter ID</li>
              <li>Address Proof: Utility bills, rental agreement, or Aadhaar Card</li>
              <li>Income Proof: Salary slips, bank statements, or ITR for self-employed</li>
              <li>PAN Card (mandatory for loans above ₹50,000)</li>
              <li>Photographs and any additional documents as requested</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Default and Recovery</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In case of default (non-payment for 90+ days), we reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Report the default to credit bureaus, affecting your credit score</li>
              <li>Initiate legal proceedings for recovery of dues</li>
              <li>Engage authorized collection agencies for recovery</li>
              <li>Exercise our right over any security or guarantee provided</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to protecting your personal information. Your data will be used only for 
              loan processing, credit assessment, and related services. We may share your information 
              with credit bureaus, regulatory authorities, and our service providers as necessary.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Grievance Redressal</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any complaints or grievances, you can contact our customer support at 
              stalkfinancepvtltd@gmail.com or +91 80107 79828. We aim to resolve all complaints 
              within 7 working days.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stalk Finance Private Limited shall not be liable for any indirect, incidental, or 
              consequential damages arising from the use of our services. Our liability is limited 
              to the loan amount disbursed.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. Changes will be communicated 
              through email, SMS, or our website. Continued use of our services constitutes acceptance 
              of the modified Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of India. Any disputes shall be subject to the 
              exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h3>
              <p className="text-blue-800 mb-2">
                <strong>Stalk Finance Private Limited</strong>
              </p>
              <p className="text-blue-700 text-sm">
                Email: stalkfinancepvtltd@gmail.com<br />
                Phone: +91 80107 79828<br />
                Address: H. No-488 Lakhandur Road, Kasturba Ward, Desaiganj, Desaiganj, Gadchiroli- 441207, Maharashtra
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}