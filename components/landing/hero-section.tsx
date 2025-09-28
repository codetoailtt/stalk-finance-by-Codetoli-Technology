'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleNavigation = async (href: string, type: string) => {
    setLoading(type)
    router.prefetch(href) // Prefetch the route
    await router.push(href)
    setLoading(null)
  }

  const features = [
    'Instant loan approvals',
    'Competitive interest rates',
    'Flexible repayment options',
    'Quick disbursement'
  ]

  return (
    <section className="pt-16 bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your One-Stop
                <span className="block text-blue-600">Stalk Finance Private Limited</span>
                <span className="block">for Everything</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                Get instant loans for mobile phones, furniture, and more. Quick approvals, 
                competitive rates, and hassle-free processing. Your financial needs, 
                our expertise - all in one platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Button size="lg" className="group bg-blue-600 hover:bg-blue-700" asChild>
                <button 
                  onClick={() => handleNavigation('/signup', 'signup')}
                  disabled={loading === 'signup'}
                >
                  {loading === 'signup' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Apply for Loan
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </Button>
              
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                <button 
                  onClick={() => handleNavigation('/signin', 'signin')}
                  disabled={loading === 'signin'}
                >
                  {loading === 'signin' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Check Eligibility'
                  )}
                </button>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center space-x-4 text-sm text-muted-foreground"
            >
              <span>Trusted by 500+ customers</span>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span>Quick approvals</span>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span>Competitive rates</span>
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-96 lg:h-[500px] w-full">
              {/* Dashboard Preview */}
              <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-primary rounded"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="h-4 w-16 bg-blue-200 rounded mb-2"></div>
                      <div className="h-8 w-12 bg-blue-400 rounded"></div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="h-4 w-16 bg-green-200 rounded mb-2"></div>
                      <div className="h-8 w-12 bg-green-400 rounded"></div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="h-4 w-16 bg-orange-200 rounded mb-2"></div>
                      <div className="h-8 w-12 bg-orange-400 rounded"></div>
                    </div>
                  </div>
                  
                  {/* List Items */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-300 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-gray-300 rounded"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-primary rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-medium">Query Approved</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}