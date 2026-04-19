import Link from 'next/link'
import EventTypesList from '@/components/EventTypesList'

export const dynamic = 'force-dynamic'

async function getEventTypes() {
  const res = await fetch(`${process.env.API_URL || 'http://localhost:8080'}/api/event-types`)
  if (!res.ok) return []
  return res.json()
}

export default async function AdminEventsPage() {
  const eventTypes = await getEventTypes()

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Event Types</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/admin/events/new">
          <button style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Create New Event Type
          </button>
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <EventTypesList eventTypes={eventTypes} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/admin">Back to Dashboard</Link>
      </div>
    </main>
  )
}
