import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateBooking } from '@/hooks/useBookings'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmBooking() {
  const params = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const slot = searchParams.get('slot') || ''
  const eventTypeId = params.eventTypeId!
  const { t, locale } = useI18n()

  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const createMutation = useCreateBooking()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        eventTypeId,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        startTime: slot,
      })
      navigate('/booking/success')
    } catch {
      // error handled by mutation
    }
  }

  const formattedTime = slot
    ? new Date(slot).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : ''

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>{t.confirm.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {formattedTime && (
            <p className="mb-6">
              <strong>{t.confirm.selectedTime}:</strong> {formattedTime}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">{t.confirm.yourName}</Label>
              <Input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="guestEmail">{t.confirm.email}</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {createMutation.error && (
              <p className="text-sm text-destructive">{createMutation.error.message}</p>
            )}

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? t.confirm.booking : t.confirm.bookMeeting}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
