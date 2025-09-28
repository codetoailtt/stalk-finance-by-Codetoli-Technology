import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cookie Policy - Stalk Finance',
  description: 'Cookie policy for Stalk Finance website and services',
  keywords: 'cookie policy, cookies, website cookies, Stalk Finance, privacy, data collection, user preferences, analytics, advertising, India',
  openGraph: {
    title: 'Cookie Policy - Stalk Finance',
    description: 'Cookie policy for Stalk Finance website and services',
    url: 'https://stalkfinance.com/cookies',
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy - Stalk Finance',
    description: 'Cookie policy for Stalk Finance website and services',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiesPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 15, 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you 
              visit our website. They help us provide you with a better experience by remembering your preferences 
              and understanding how you use our services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stalk Finance Private Limited uses cookies for various purposes to enhance your experience on our 
              website and mobile applications. We use cookies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Remember your login information and preferences</li>
              <li>Analyze website traffic and user behavior</li>
              <li>Provide personalized content and recommendations</li>
              <li>Ensure website security and prevent fraud</li>
              <li>Improve our services and user experience</li>
              <li>Display relevant advertisements</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.1 Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are necessary for the website to function properly. They enable basic functions like 
              page navigation, access to secure areas, and loan application processing. The website cannot function 
              properly without these cookies.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.2 Performance Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies collect information about how visitors use our website, such as which pages are visited 
              most often and if users get error messages. This helps us improve the performance and functionality 
              of our website.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.3 Functionality Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies allow the website to remember choices you make (such as your language preference or 
              loan calculator settings) and provide enhanced, more personal features.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">3.4 Targeting/Advertising Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are used to deliver advertisements that are relevant to you and your interests. They 
              also help us measure the effectiveness of our advertising campaigns.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may allow third-party service providers to place cookies on your device through our website. 
              These include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
              <li><strong>Facebook Pixel:</strong> For advertising and remarketing purposes</li>
              <li><strong>Payment Gateways:</strong> To process loan payments securely</li>
              <li><strong>Customer Support Tools:</strong> To provide chat and support services</li>
              <li><strong>Credit Bureau APIs:</strong> For credit score verification</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookie Duration</h2>
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">5.1 Session Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are temporary and are deleted when you close your browser. They help maintain your 
              session while you navigate through our website.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">5.2 Persistent Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies remain on your device for a set period (usually 1-2 years) or until you delete them. 
              They help us remember your preferences for future visits.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Managing Your Cookie Preferences</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have several options to manage cookies:
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">6.1 Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Block all cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Set up notifications when cookies are being sent</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">6.2 Browser-Specific Instructions</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Impact of Disabling Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please note that disabling cookies may affect your experience on our website:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You may need to re-enter information repeatedly</li>
              <li>Some features may not work properly</li>
              <li>Loan application process may be interrupted</li>
              <li>Personalized content may not be available</li>
              <li>Website performance may be slower</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Mobile App Data Collection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our mobile application may collect similar information through app-specific technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Device identifiers and app usage analytics</li>
              <li>Location data (with your permission)</li>
              <li>Push notification preferences</li>
              <li>App performance and crash reports</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Updates to Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              legal and regulatory reasons. We will notify you of any significant changes by posting the 
              updated policy on our website.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Cookie Policy Inquiries</h3>
              <p className="text-blue-800 mb-2">
                <strong>Stalk Finance Private Limited</strong>
              </p>
              <p className="text-blue-700 text-sm">
                Email: privacy@stalkfinance.com<br />
                Phone: +91 80107 79828<br />
                Address: H. No-488 Lakhandur Road, Kasturba Ward, Desaiganj, Desaiganj, Gadchiroli- 441207, Maharashtra
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Consent</h3>
              <p className="text-green-800 text-sm">
                By continuing to use our website and services, you consent to our use of cookies as described 
                in this Cookie Policy. You can withdraw your consent at any time by adjusting your browser 
                settings or contacting us directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}