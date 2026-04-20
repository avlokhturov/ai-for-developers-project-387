import { Link } from 'react-router-dom'
import { useEventTypes } from '@/hooks/useEventTypes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const { data: eventTypes, isLoading, error } = useEventTypes()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t.home.heading}</h1>
      <p className="text-muted-foreground mb-8">{t.home.subheading}</p>

      {error && <p className="text-destructive mb-4">{error.message}</p>}

      {!eventTypes || eventTypes.length === 0 ? (
        <p className="text-muted-foreground">{t.home.noEvents}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map((et) => (
            <Link key={et.id} to={`/booking/${et.id}`}>
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardHeader>
                  <CardTitle>{et.name}</CardTitle>
                  <CardDescription>{et.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t.home.duration}:</strong> {et.duration} {t.home.minutes}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Link to="/admin">
          <Button variant="outline">{t.home.adminDashboard}</Button>
        </Link>
      </div>
    </div>
  )
}
