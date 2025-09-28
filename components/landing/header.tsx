'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, Loader2 } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '#features' },
    { name: 'Shop Partners', href: '/partners' },
    { name: 'Products', href: '#services' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleNavigation = async (href: string, type: string) => {
    setLoading(type)
    router.prefetch(href) // Prefetch the route
    await router.push(href)
    setLoading(null)
  }

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-border z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/assets/logo.png" 
                alt="Stalk Finance logo" 
                className="w-32 h-32 object-contain"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-4"
          >
            <Button variant="ghost" asChild>
              <button 
                onClick={() => handleNavigation('/signin', 'signin')}
                disabled={loading === 'signin'}
                className="text-gray-600 hover:text-blue-600"
              >
                {loading === 'signin' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
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
                  'Get Started'
                )}
              </button>
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full" asChild>
                  <button 
                    onClick={() => handleNavigation('/signin', 'signin')}
                    disabled={loading === 'signin'}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {loading === 'signin' ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
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
                      'Get Started'
                    )}
                  </button>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  )
}