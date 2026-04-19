import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Booking {
  id: string
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
}

async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${process.env.API_URL || 'http://localhost:8080'}/api/bookings`)
  if (!res.ok) return []
  return res.json()
}

export default async function AdminDashboard() {
  const bookings = await getBookings()
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Upcoming Bookings</h2>
        {confirmedBookings.length === 0 ? (
          <p>No upcoming bookings.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th>Date/Time</th>
                <th>Guest</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {confirmedBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{new Date(booking.startTime).toLocaleString()}</td>
                  <td>{booking.guestName}</td>
                  <td>{booking.guestEmail}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
        <h3>Event Types</h3>
        <Link href="/admin/events">Manage Event Types</Link>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link href="/booking">Back to Booking</Link>
      </div>
    </main>
  )
}
