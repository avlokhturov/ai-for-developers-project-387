import Link from 'next/link'

export default function BookingSuccess() {
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Booking Confirmed!</h1>
      <p style={{ marginTop: '1rem' }}>Your meeting has been successfully booked.</p>
      <p style={{ marginTop: '1rem' }}>You will receive a confirmation email shortly.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/booking">
          <button style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Back to Booking
          </button>
        </Link>
      </div>
    </main>
  )
}
