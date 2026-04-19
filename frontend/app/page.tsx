import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface EventType {
  id: string
  name: string
  description: string
  duration: number
}

async function getEventTypes(): Promise<EventType[]> {
  const res = await fetch(`${process.env.API_URL || 'http://localhost:8080'}/api/event-types`)
  if (!res.ok) return []
  return res.json()
}

export default async function BookingPage() {
  const eventTypes = await getEventTypes()

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Booking</h1>
      <p>Select an event type to book a meeting</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {eventTypes.length === 0 ? (
          <p>No event types available yet.</p>
        ) : (
          eventTypes.map((et) => (
            <Link key={et.id} href={`/booking/${et.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer' }}>
                <h2>{et.name}</h2>
                <p>{et.description}</p>
                <p><strong>Duration:</strong> {et.duration} minutes</p>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
        <Link href="/admin">Admin Dashboard</Link>
      </div>
    </main>
  )
}
