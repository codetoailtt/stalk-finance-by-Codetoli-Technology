import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { PageLoading } from '@/components/ui/loading'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'Stalk Finance - Quick Loans for Mobile Phones & Furniture',
  description: 'Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options. Quick approval in 10 minutes.',
  keywords: 'personal loans, mobile phone loans, furniture financing, electronics loans, instant approval, EMI, consumer finance',
     icons: {
            icon: 'public/assets/favicon.ico', // Path relative to the public directory
          },
  authors: [{ name: 'Stalk Finance' }],
  openGraph: {
    title: 'Stalk Finance - Quick Loans for Mobile Phones & Furniture',
    description: 'Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options. Quick approval in 10 minutes.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stalk Finance - Quick Loans for Mobile Phones & Furniture',
    description: 'Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon */}
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
        {/* SEO Meta Tags */}
        <meta name="description" content="Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options. Quick approval in 10 minutes." />
        <meta name="keywords" content="personal loans, mobile phone loans, furniture financing, electronics loans, instant approval, EMI, consumer finance, quick loan, online loan, easy EMI, Stalk Finance, India, loan eligibility, loan application, loan disbursement, competitive rates, flexible repayment, secure finance, partner stores, retail finance, customer support" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href= "https://stalkfinance.com" />
        {/* Open Graph */}
        <meta property="og:title" content="Stalk Finance - Quick Loans for Mobile Phones & Furniture" />
        <meta property="og:description" content="Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options. Quick approval in 10 minutes." />
        <meta property="og:url" content="https://stalkfinance.com" />
        <meta property="og:site_name" content="Stalk Finance" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stalk Finance - Quick Loans for Mobile Phones & Furniture" />
        <meta name="twitter:description" content="Get instant loans for mobile phones, furniture, and electronics with competitive rates and flexible EMI options." />
        {/* Author */}
        <meta name="author" content="Stalk Finance Private Limited" />
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`font-inter antialiased bg-background text-foreground`}>
        <Suspense fallback={<PageLoading />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}