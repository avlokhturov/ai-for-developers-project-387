import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function BookingSuccess() {
  const { t } = useI18n()

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.success.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">{t.success.message}</p>
          <p className="text-sm text-muted-foreground mb-6">
            {t.success.emailNote}
          </p>
          <Link to="/">
            <Button>{t.success.backToBooking}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
