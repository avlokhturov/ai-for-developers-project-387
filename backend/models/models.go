package models

type EventType struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Duration    int    `json:"duration"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type EventTypeCreate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Duration    int    `json:"duration"`
}

type Booking struct {
	ID          string `json:"id"`
	EventTypeID string `json:"eventTypeId"`
	GuestName   string `json:"guestName"`
	GuestEmail  string `json:"guestEmail"`
	StartTime   string `json:"startTime"`
	EndTime     string `json:"endTime"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type BookingCreate struct {
	EventTypeID string `json:"eventTypeId"`
	GuestName   string `json:"guestName"`
	GuestEmail  string `json:"guestEmail"`
	StartTime   string `json:"startTime"`
}

type Slot struct {
	Start     string `json:"start"`
	End       string `json:"end"`
	Available bool   `json:"available"`
}

type SlotsResponse struct {
	Date        string `json:"date"`
	EventTypeID string `json:"eventTypeId"`
	Slots       []Slot `json:"slots"`
}

type SlotsRangeResponse struct {
	EventTypeID string                 `json:"eventTypeId"`
	Dates       map[string][]Slot      `json:"dates"`
}

type EventTypesListResponse struct {
	EventTypes []EventType `json:"event_types"`
}

type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
