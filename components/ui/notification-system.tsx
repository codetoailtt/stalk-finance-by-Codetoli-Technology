'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Eye, X, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react'
import { isEMIDueThisMonth, getServiceFeeWithGST } from '@/lib/utils'

interface NotificationSystemProps {
  queries: any[]
}

export function NotificationSystem({ queries }: NotificationSystemProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!Array.isArray(queries)) return

    const notifs: any[] = []

    queries.forEach((query: any) => {
      // Service fee payment notifications
      if (query.status === 'approved' && !query.service_fee_paid) {
        const serviceFee = getServiceFeeWithGST()
        notifs.push({
          id: `service-fee-${query.id}`,
          queryId: query.id,
          type: 'warning',
          title: 'Service Fee Payment Required',
          message: `Pay ₹${serviceFee.total} service fee for query ${query.reference_id}`,
          createdAt: query.approved_at || query.updated_at,
          icon: AlertCircle,
          color: 'text-orange-600'
        })
      }

      // EMI payment notifications
      if (query.emi_started && query.emi_date && isEMIDueThisMonth(query.emi_date, query.emi_payments)) {
        notifs.push({
          id: `emi-due-${query.id}`,
          queryId: query.id,
          type: 'error',
          title: 'EMI Payment Due',
          message: `EMI payment due for query ${query.reference_id}. Due date: ${query.emi_date} of this month`,
          createdAt: new Date().toISOString(),
          icon: AlertCircle,
          color: 'text-red-600'
        })
      }

      // Status change notifications
      if (query.status === 'approved' && query.approved_at) {
        const approvedDate = new Date(query.approved_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 7) { // Show for 7 days
          notifs.push({
            id: `approved-${query.id}`,
            queryId: query.id,
            type: 'success',
            title: 'Query Approved',
            message: `Your query ${query.reference_id} has been approved!`,
            createdAt: query.approved_at,
            icon: CheckCircle,
            color: 'text-green-600'
          })
        }
      }

      if (query.status === 'rejected') {
        notifs.push({
          id: `rejected-${query.id}`,
          queryId: query.id,
          type: 'error',
          title: 'Query Rejected',
          message: `Your query ${query.reference_id} has been rejected. Check details for more information.`,
          createdAt: query.updated_at,
          icon: X,
          color: 'text-red-600'
        })
      }

      if (query.status === 'under_review') {
        notifs.push({
          id: `review-${query.id}`,
          queryId: query.id,
          type: 'info',
          title: 'Query Under Review',
          message: `Your query ${query.reference_id} is being reviewed by our team.`,
          createdAt: query.updated_at,
          icon: Clock,
          color: 'text-blue-600'
        })
      }

      // Penalty notifications
      if (query.penalty_amount > 0 && !query.penalty_waived) {
        notifs.push({
          id: `penalty-${query.id}`,
          queryId: query.id,
          type: 'error',
          title: 'Penalty Applied',
          message: `Penalty of ₹${query.penalty_amount} applied to query ${query.reference_id} for late EMI payment`,
          createdAt: query.penalty_started_at || query.updated_at,
          icon: AlertCircle,
          color: 'text-red-600'
        })
      }
    })

    // Sort by creation date (newest first)
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setNotifications(notifs)
    setUnreadCount(notifs.length)
  }, [queries])

  const handleNotificationClick = (notification: any) => {
    // Navigate to the specific query
    router.push(`/dashboard/queries/${notification.queryId}`)
    setOpen(false)
  }

  const clearNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

 return (
  <div className="relative ml-auto w-full max-w-xs sm:max-w-sm">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={16} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full max-w-xs sm:max-w-sm p-0" align="end">
        {/* header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* scrollable list */}
        <ScrollArea className="max-h-96 w-full">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`p-1 rounded-full ${
                      notification.type === 'success'
                        ? 'bg-green-100'
                        : notification.type === 'warning'
                        ? 'bg-orange-100'
                        : notification.type === 'error'
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <notification.icon size={14} className={notification.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => clearNotification(notification.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push('/dashboard/queries')
                setOpen(false)
              }}
              className="w-full"
            >
              <FileText size={14} className="mr-2" />
              View All Enquiries
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  </div>
)
}