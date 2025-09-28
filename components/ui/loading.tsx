import { Loader2 } from 'lucide-react'

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function ComponentLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 size={16} className="animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}