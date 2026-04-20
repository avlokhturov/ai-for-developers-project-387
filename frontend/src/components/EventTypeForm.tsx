import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventType, EventTypeCreate } from '@/lib/types'

interface EventTypeFormProps {
  eventType?: EventType
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onSuccessPath?: string
  isSubmitting?: boolean
  error?: string
  onSubmit?: (data: EventTypeCreate) => Promise<void>
}

export default function EventTypeForm({
  eventType,
  mode,
  onSuccess,
  onSuccessPath,
  isSubmitting = false,
  error,
  onSubmit,
}: EventTypeFormProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [name, setName] = useState(eventType?.name || '')
  const [description, setDescription] = useState(eventType?.description || '')
  const [duration, setDuration] = useState(eventType?.duration || 30)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    const data: EventTypeCreate = {
      name: name.trim(),
      description: description.trim(),
      duration: isNaN(duration) ? 30 : duration,
    }

    try {
      if (onSubmit) {
        await onSubmit(data)
        if (onSuccess) onSuccess()
        if (onSuccessPath) navigate(onSuccessPath)
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err))
    }
  }

  const displayError = error || localError

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? t.events.createTitle : t.events.editTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t.events.name}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">{t.events.description}</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <Label htmlFor="duration">{t.events.durationMinutes}</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              min={5}
              max={480}
              step={15}
              required
              className="mt-1"
            />
          </div>

          {displayError && <p className="text-sm text-destructive">{displayError}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create' ? t.events.creating : t.events.updating
                : mode === 'create' ? t.events.createBtn : t.events.updateBtn}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t.events.cancelBtn}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
