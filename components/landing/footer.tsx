"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleNavigation = async (href: string, type: string) => {
    setLoading(type)
    router.prefetch(href) // Prefetch the route
    await router.push(href)
    setLoading(null)
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <img 
                src="/assets/logo.png"  
                alt="Stalk Finance logo"  
                className="w-32 h-32 object-contain"
              />
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your emerging partner for quick and easy financing solutions. From mobile phones 
              to furniture, we make your purchases affordable with flexible loan options.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-400" />
                <span className="text-gray-300">stalkfinancepvtltd@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-blue-400" />
                <span className="text-gray-300">+91 80107 79828</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-gray-300">H. No-488 Lakhandur Road, Kasturba Ward, Desaiganj, Desaiganj, Gadchiroli- 441207, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Loans - static text only */}
          <div>
            <h3 className="font-semibold text-white mb-4">Loans</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-300 text-sm">Mobile Phones</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Furniture</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Electronics</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Appliances</span>
              </li>
            </ul>
          </div>

          {/* Company - only keep existing pages */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">About Us</Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-300 hover:text-white transition-colors text-sm">Our Shop Partners</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Careers</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Blog</span>
              </li>
            </ul>
          </div>

          {/* Support - static text only */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <span className="text-gray-300 text-sm">Help Center</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">FAQ</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Customer Support</span>
              </li>
                    <li>
                <Link href="/emi-calculator" className="text-gray-300 hover:text-white transition-colors text-sm">EMI Calculator</Link>
              </li>
            </ul>

            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">Terms of Service</Link>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Cookie Policy</span>
              </li>
              <li>
                <Link href="/payment-details" className="text-gray-300 hover:text-white transition-colors text-sm">Payment Details</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © 2025 Stalk Finance Private Limited. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              <Link href="/signin" className="text-gray-300 hover:text-white transition-colors text-sm">
                Sign In
              </Link>
              <Button 
                size="sm"
                onClick={() => handleNavigation('/signup', 'signup')}
                disabled={loading === 'signup'}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading === 'signup' ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}