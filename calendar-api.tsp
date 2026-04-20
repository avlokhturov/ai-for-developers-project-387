import "@typespec/http";
import "@typespec/rest";

using Http;
using Rest;

@service
@server("http://localhost:8080", "Go backend server")
namespace CalendarBooking;

model EventType {
  id: string;
  name: string;
  description: string;
  duration: int32;
  createdAt: string;
  updatedAt: string;
}

model EventTypeCreate {
  name: string;
  description: string;
  duration?: int32 = 30;
}

model Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

model BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
}

model Slot {
  start: string;
  end: string;
  available: boolean;
}

model SlotsResponse {
  date: string;
  eventTypeId: string;
  slots: Slot[];
}

@route("/api/event-types")
interface EventTypes {
  @get list(): EventType[] | Error;
  @post create(@body eventType: EventTypeCreate): EventType | Error;
  @get get(@path id: string): EventType | Error;
  @put update(@path id: string, @body eventType: EventTypeCreate): EventType | Error;
  @delete delete(@path id: string): void | Error;
}

@route("/api/slots")
interface Slots {
  @get getAvailable(
    @query eventTypeId: string,
    @query date: string
  ): SlotsResponse | Error;
}

@route("/api/bookings")
interface Bookings {
  @get list(@query from?: string, @query to?: string): Booking[] | Error;
  @post create(@body booking: BookingCreate): Booking | Error;
  @get get(@path id: string): Booking | Error;
  @delete cancel(@path id: string): void | Error;
}

model Error {
  code: int32;
  message: string;
}
