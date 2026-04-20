package repository

import "calendar-booking/models"

type EventTypeRepository interface {
	ListEventTypes() ([]models.EventType, error)
	GetEventType(id string) (*models.EventType, error)
	CreateEventType(input models.EventTypeCreate) (*models.EventType, error)
	UpdateEventType(id string, input models.EventTypeCreate) (*models.EventType, error)
	DeleteEventType(id string) (bool, error)
	GetEventTypeDuration(id string) (int, error)
}

type BookingRepository interface {
	IsSlotAvailable(startTime, endTime string) (bool, error)
	CreateBooking(input models.BookingCreate, duration int) (*models.Booking, error)
	ListBookings(from, to string) ([]models.Booking, error)
	GetBooking(id string) (*models.Booking, error)
	CancelBooking(id string) (bool, error)
	ListBookingsInRange(from, to string) ([]models.Booking, error)
}

type Repository interface {
	EventTypeRepository
	BookingRepository
	Close() error
}