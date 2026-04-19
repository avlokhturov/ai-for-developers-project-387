'use client'

import Link from 'next/link'
import { useState } from 'react'

interface EventType {
  id: string
  name: string
  description: string
  duration: number
}

export default function EventTypesList({ eventTypes }: { eventTypes: EventType[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    setDeletingId(id)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/event-types/${id}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      window.location.reload()
    } else {
      alert('Failed to delete event type')
    }
    setDeletingId(null)
  }

  if (eventTypes.length === 0) {
    return <p>No event types created yet.</p>
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
          <th>Name</th>
          <th>Description</th>
          <th>Duration</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {eventTypes.map((et) => (
          <tr key={et.id} style={{ borderBottom: '1px solid #eee' }}>
            <td>{et.name}</td>
            <td>{et.description}</td>
            <td>{et.duration} min</td>
            <td>
              <Link href={`/admin/events/${et.id}/edit`}>
                <button style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}>Edit</button>
              </Link>
              <button
                onClick={() => handleDelete(et.id)}
                disabled={deletingId === et.id}
                style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {deletingId === et.id ? 'Deleting...' : 'Delete'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
