import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Privacy Policy - Stalk Finance',
  description: 'Privacy policy for Stalk Finance loan services',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: October 1, 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stalk Finance Private Limited ("we," "our," or "us") is committed to protecting your privacy 
              and personal information. This Privacy Policy explains how we collect, use, disclose, and 
              safeguard your information when you use our loan services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-2">We collect the following personal information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Full name, date of birth, and gender</li>
              <li>Contact information (phone number, email address, residential address)</li>
              <li>Identity documents (Aadhaar, PAN, Passport, etc.)</li>
              <li>Employment details and income information</li>
              <li>Bank account details and financial information</li>
              <li>Credit history and CIBIL score</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.2 Technical Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Device information (mobile device ID, operating system)</li>
              <li>IP address and location data</li>
              <li>Website usage data and cookies</li>
              <li>Application logs and error reports</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Processing loan applications and credit assessment</li>
              <li>Verifying your identity and preventing fraud</li>
              <li>Communicating about your loan status and account</li>
              <li>Providing customer support and resolving queries</li>
              <li>Complying with legal and regulatory requirements</li>
              <li>Improving our services and user experience</li>
              <li>Marketing relevant financial products (with your consent)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">4.1 Third-Party Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information with trusted third-party service providers who assist us in:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Credit bureau reporting and credit score verification</li>
              <li>Payment processing and collection services</li>
              <li>Identity verification and KYC compliance</li>
              <li>SMS and email communication services</li>
              <li>Data analytics and fraud prevention</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">4.2 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may disclose your information when required by law, court orders, or regulatory authorities, 
              including but not limited to RBI, SEBI, and other financial regulators.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>256-bit SSL encryption for data transmission</li>
              <li>Secure data storage with access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection and confidentiality</li>
              <li>Multi-factor authentication for system access</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Prevent fraud and maintain security</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Generally, we retain loan-related data for 7 years after loan closure as per RBI guidelines.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-2">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Grievance:</strong> File complaints about data processing practices</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our website and mobile app. 
              Cookies help us remember your preferences, analyze website traffic, and provide personalized content. 
              You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review their privacy policies before 
              providing any personal information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our services are not intended for individuals under 18 years of age. We do not knowingly 
              collect personal information from children. If we become aware of such collection, we will 
              delete the information immediately.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              through email, SMS, or prominent notices on our website. Your continued use of our services 
              constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any questions, concerns, or requests regarding this Privacy Policy or your personal information, 
              please contact us:
            </p>

      

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Note</h3>
              <p className="text-yellow-800 text-sm">
                By using our services, you acknowledge that you have read, understood, and agree to the 
                collection, use, and disclosure of your personal information as described in this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}