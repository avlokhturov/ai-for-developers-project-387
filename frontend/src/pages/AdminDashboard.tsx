import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBookings, useCancelBooking } from '@/hooks/useBookings'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminCalendarGrid from '@/components/calendar/AdminCalendarGrid'
import { startOfMonth } from 'date-fns'

export default function AdminDashboard() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const { data: bookings, isLoading, error, refetch } = useBookings()
  const cancelMutation = useCancelBooking()
  const { t } = useI18n()

  const handleCancel = async (id: string) => {
    if (!confirm(t.admin.cancelConfirm)) return
    await cancelMutation.mutateAsync(id)
    refetch()
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">{t.common.loading}</div>

  const confirmedCount = bookings?.filter(b => b.status === 'confirmed').length || 0
  const cancelledCount = bookings?.filter(b => b.status === 'cancelled').length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t.admin.dashboard}</h1>

      {error && <p className="text-destructive mb-4">{error.message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.cancelled}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.admin.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t.admin.calendar}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCalendarGrid
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            bookings={bookings || []}
            onCancelBooking={handleCancel}
            cancellingId={cancelMutation.isPending ? cancelMutation.variables : null}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link to="/admin/events">
          <Button variant="outline">{t.admin.manageEvents}</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">{t.admin.backToBooking}</Button>
        </Link>
      </div>
    </div>
  )
}
