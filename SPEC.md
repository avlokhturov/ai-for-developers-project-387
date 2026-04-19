# TypeSpec Specification — Calendar Booking System

## Overview

REST API + Next.js frontend for meeting booking. Two roles: calendar owner (single预设profile) and guests (no registration).

## Stack

- **Frontend**: Next.js (App Router), TypeScript
- **Backend**: Go, Standard REST API
- **Database**: SQLite

---

## Data Models

### EventType

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | string | Event type name (e.g., "Consultation") |
| description | string | Description of the event |
| duration | int | Duration in minutes (default: 30) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

### Booking

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| event_type_id | uuid | Foreign key to EventType |
| guest_name | string | Guest's name |
| guest_email | string | Guest's email |
| start_time | datetime | Booking start time (UTC) |
| end_time | datetime | Booking end time (UTC) |
| status | enum | `confirmed`, `cancelled` |
| created_at | datetime | Creation timestamp |

---

## API Endpoints

### Event Types

```
GET    /api/event-types
POST   /api/event-types
GET    /api/event-types/:id
PUT    /api/event-types/:id
DELETE /api/event-types/:id
```

#### GET /api/event-types
Response: `200 OK`
```json
{
  "event_types": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "duration": 30
    }
  ]
}
```

#### POST /api/event-types
Request:
```json
{
  "name": "string",
  "description": "string",
  "duration": 30
}
```
Response: `201 Created`

### Slots

```
GET /api/slots?event_type_id={id}&date={YYYY-MM-DD}
```

Returns available 30-minute slots for given event type and date.

Response: `200 OK`
```json
{
  "date": "2026-04-20",
  "event_type_id": "uuid",
  "slots": [
    { "start": "09:00", "end": "09:30", "available": true },
    { "start": "09:30", "end": "10:00", "available": false }
  ]
}
```

**Availability rules:**
- Slot is unavailable if any booking exists (any event type) for that time
- Only slots within 14-day window from today are returned

### Bookings

```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
DELETE /api/bookings/:id  (admin only, soft delete)
```

#### POST /api/bookings
Request:
```json
{
  "event_type_id": "uuid",
  "guest_name": "string",
  "guest_email": "string",
  "start_time": "2026-04-20T10:00:00Z"
}
```
Response: `201 Created`
```json
{
  "id": "uuid",
  "event_type_id": "uuid",
  "guest_name": "string",
  "guest_email": "string",
  "start_time": "2026-04-20T10:00:00Z",
  "end_time": "2026-04-20T10:30:00Z",
  "status": "confirmed",
  "created_at": "datetime"
}
```
Errors:
- `400` — Slot already taken
- `400` — Date outside 14-day window
- `404` — Event type not found

#### GET /api/bookings
Query params: `?from={date}&to={date}`
Response: List of all bookings (admin)

---

## Frontend Pages

### Public

| Route | Description |
|-------|-------------|
| `/booking` | Cards with event types (name, description, duration) |
| `/booking/[eventTypeId]` | Calendar view (switchable: week/month/list), slot selection |
| `/booking/[eventTypeId]/confirm` | Booking confirmation form (name, email) |

### Admin

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard: upcoming bookings list |
| `/admin/events` | Event types list with CRUD actions |
| `/admin/events/new` | Create event type form |
| `/admin/events/[id]/edit` | Edit event type form |

---

## Acceptance Criteria

1. **Slot locking**: Two bookings cannot occupy same time slot (哪怕不同 event types)
2. **14-day window**: Guests can only book within 14 days from today
3. **30-min slots**: All slots are exactly 30 minutes
4. **No auth for guests**: Guests book without registration
5. **Admin at /admin**: Calendar owner uses `/admin` routes
6. **Calendar views**: Week, Month, List views — user can switch between them
7. **Soft delete**: Cancelled bookings remain in DB with `status: cancelled`

---

## Project Structure

```
/
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── booking/
│   │   │   └── [eventTypeId]/
│   │   ├── admin/
│   │   └── api/           # API routes (proxy to Go backend)
│   └── components/
├── backend/               # Go REST API
│   ├── handlers/
│   ├── models/
│   ├── repository/
│   └── main.go
├── SPEC.md
└── plan.md
```
