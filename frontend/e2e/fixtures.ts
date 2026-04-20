import { Page, Route } from '@playwright/test'
import { format, addDays } from 'date-fns'

export const MOCK_EVENT_TYPES = [
  {
    id: 'et-1',
    name: 'Consultation',
    description: '30-minute consultation call',
    duration: 30,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'et-2',
    name: 'Interview',
    description: '60-minute technical interview',
    duration: 60,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

export const MOCK_EVENT_TYPE = MOCK_EVENT_TYPES[0]

function buildSlotsForDate(date: string, eventTypeId: string) {
  const slots = []
  for (let h = 9; h < 17; h++) {
    slots.push({ start: `${String(h).padStart(2, '0')}:00`, end: `${String(h).padStart(2, '0')}:30`, available: true })
    slots.push({ start: `${String(h).padStart(2, '0')}:30`, end: `${String(h + 1).padStart(2, '0')}:00`, available: h < 16 })
  }
  return { date, eventTypeId, slots }
}

export const MOCK_BOOKINGS = [
  {
    id: 'b-1',
    eventTypeId: 'et-1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    startTime: '2026-04-21T10:00:00Z',
    endTime: '2026-04-21T10:30:00Z',
    status: 'confirmed',
    createdAt: '2026-04-20T08:00:00Z',
  },
  {
    id: 'b-2',
    eventTypeId: 'et-2',
    guestName: 'Jane Smith',
    guestEmail: 'jane@example.com',
    startTime: '2026-04-22T14:00:00Z',
    endTime: '2026-04-22T15:00:00Z',
    status: 'confirmed',
    createdAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 'b-3',
    eventTypeId: 'et-1',
    guestName: 'Bob Wilson',
    guestEmail: 'bob@example.com',
    startTime: '2026-04-19T09:00:00Z',
    endTime: '2026-04-19T09:30:00Z',
    status: 'cancelled',
    createdAt: '2026-04-18T12:00:00Z',
  },
]

export async function mockApi(page: Page) {
  await page.route('**/api/event-types', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: MOCK_EVENT_TYPES })
    } else if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        json: { id: 'et-new', ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      })
    }
  })

  await page.route('**/api/event-types/*', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const id = url.split('/').pop()

    if (method === 'GET') {
      const et = MOCK_EVENT_TYPES.find(e => e.id === id) || MOCK_EVENT_TYPE
      await route.fulfill({ json: et })
    } else if (method === 'PUT') {
      const body = route.request().postDataJSON()
      await route.fulfill({ json: { id, ...body, createdAt: '2026-01-01T00:00:00Z', updatedAt: new Date().toISOString() } })
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 })
    }
  })

  await page.route('**/api/slots**', async (route: Route) => {
    const url = new URL(route.request().url())
    const eventTypeId = url.searchParams.get('event_type_id') || 'et-1'
    const date = url.searchParams.get('date')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    if (date) {
      await route.fulfill({ json: buildSlotsForDate(date, eventTypeId) })
    } else if (from && to) {
      const dates: Record<string, ReturnType<typeof buildSlotsForDate>['slots']> = {}
      const start = new Date(from + 'T00:00:00')
      const end = new Date(to + 'T00:00:00')
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const key = format(d, 'yyyy-MM-dd')
        const slotData = buildSlotsForDate(key, eventTypeId)
        dates[key] = slotData.slots
      }
      await route.fulfill({ json: { eventTypeId, dates } })
    }
  })

  await page.route('**/api/bookings', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: MOCK_BOOKINGS })
    } else if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        json: {
          id: 'b-new',
          ...body,
          endTime: body.startTime.replace('T', 'T').replace(/:(\d{2})Z$/, (m: string, p1: string) => `:${String(parseInt(p1) + 30).padStart(2, '0')}Z`),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      })
    }
  })

  await page.route('**/api/bookings/**', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const id = url.split('/').pop()

    if (method === 'GET') {
      const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0]
      await route.fulfill({ json: booking })
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 })
    }
  })

  await page.route('**/api/bookings/range**', async (route: Route) => {
    await route.fulfill({ json: MOCK_BOOKINGS })
  })
}

export async function mockEmptyEventTypes(page: Page) {
  await page.route('**/api/event-types', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [] })
    }
  })
}

export async function mockEmptyBookings(page: Page) {
  await page.route('**/api/bookings**', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [] })
    }
  })
}
