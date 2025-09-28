import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Contact Us - Stalk Finance',
  description: 'Get in touch with Stalk Finance for loan inquiries and customer support',
  keywords: 'contact Stalk Finance, customer support, loan inquiry, quick loan, EMI, mobile phone loan, furniture loan, electronics loan, India, support email, support phone, office address, business hours',
  openGraph: {
    title: 'Contact Us - Stalk Finance',
    description: 'Get in touch with Stalk Finance for loan inquiries and customer support',
    url: 'https://stalkfinance.com/contact',
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Stalk Finance',
    description: 'Get in touch with Stalk Finance for loan inquiries and customer support',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to get the financing you need? Contact us today to check your 
            eligibility or to discuss your loan requirements with our experts.
          </p>
        </div>
      </section>

      {/* Contact Information - centered and visually balanced */}
  <section className="py-16">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Reach Out to Us
      </h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        We're here to help you get the financing you need. Reach out through 
        any of these channels and we'll get back to you within 2 hours.
      </p>

      <div className="flex flex-col items-center gap-8">
        {/* Email */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <Mail size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Email</h3>
          <p className="text-gray-600">stalkfinancepvtltd@gmail.com</p>
          <p className="text-sm text-gray-500">We'll respond within 2 hours</p>
        </div>

        {/* Phone */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <Phone size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Phone</h3>
          <p className="text-gray-600">+91 80107 79828</p>
          <p className="text-sm text-gray-500">Mon-Sat, 9AM-8PM IST</p>
        </div>

        {/* Office */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <MapPin size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Office</h3>
          <p className="text-gray-600">
            Stalk Finance Private Limited<br />
            H. No-488 Lakhandur Road, Kasturba Ward, Desaiganj, Gadchiroli-441207, Maharashtra
          </p>
        </div>

        {/* Business Hours */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <Clock size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Business Hours</h3>
          <p className="text-gray-600">
            Monday - Saturday: 9:00 AM - 8:00 PM<br />
            Sunday: Closed
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mt-8 text-center">
        <h3 className="font-semibold text-gray-900 mb-3">
          Need Quick Financing?
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Join thousands of satisfied customers who have chosen Stalk Finance 
          for their financing needs.
        </p>
        <div className="flex justify-center">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/signup">Apply Now</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
\


      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mb-8">
            Find quick answers to common questions about our loan services.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How quickly can I get approved?</h3>
              <p className="text-gray-600 text-sm">
                Our advanced algorithm provides instant loan approval within 10 minutes for most applications.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What documents do I need?</h3>
              <p className="text-gray-600 text-sm">
                Basic documents like Aadhaar, PAN, salary slips, and bank statements. Minimal paperwork required.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What are the interest rates?</h3>
              <p className="text-gray-600 text-sm">
                Interest rates start from 12% to 18% per annum and vary based on your credit profile and loan amount.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I prepay without penalties?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can prepay your loan anytime without any prepayment penalties for complete flexibility.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
              <span>View All FAQs</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}