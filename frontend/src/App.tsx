import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import BookingCalendar from '@/pages/BookingCalendar'
import ConfirmBooking from '@/pages/ConfirmBooking'
import BookingSuccess from '@/pages/BookingSuccess'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminEventsPage from '@/pages/AdminEventsPage'
import NewEventTypePage from '@/pages/NewEventTypePage'
import EditEventTypePage from '@/pages/EditEventTypePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="booking/:eventTypeId" element={<BookingCalendar />} />
        <Route path="booking/:eventTypeId/confirm" element={<ConfirmBooking />} />
        <Route path="booking/success" element={<BookingSuccess />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/events" element={<AdminEventsPage />} />
        <Route path="admin/events/new" element={<NewEventTypePage />} />
        <Route path="admin/events/:id/edit" element={<EditEventTypePage />} />
      </Route>
    </Routes>
  )
}

export default App
