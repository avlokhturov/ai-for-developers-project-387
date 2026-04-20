package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"calendar-booking/internal/repository"
	"calendar-booking/models"

	"github.com/go-chi/chi/v5"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

type Handlers struct {
	repo repository.Repository
}

func New(repo repository.Repository) *Handlers {
	return &Handlers{repo: repo}
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, models.APIError{Code: status, Message: message})
}

func (h *Handlers) ListEventTypes(w http.ResponseWriter, r *http.Request) {
	eventTypes, err := h.repo.ListEventTypes()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, models.EventTypesListResponse{EventTypes: eventTypes})
}

func (h *Handlers) CreateEventType(w http.ResponseWriter, r *http.Request) {
	var input models.EventTypeCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if input.Duration == 0 {
		input.Duration = 30
	}
	if strings.TrimSpace(input.Name) == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if input.Duration < 5 || input.Duration > 480 {
		respondError(w, http.StatusBadRequest, "duration must be between 5 and 480 minutes")
		return
	}

	et, err := h.repo.CreateEventType(input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, et)
}

func (h *Handlers) GetEventType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	et, err := h.repo.GetEventType(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if et == nil {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}
	respondJSON(w, http.StatusOK, et)
}

func (h *Handlers) UpdateEventType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input models.EventTypeCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(input.Name) == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if input.Duration < 5 || input.Duration > 480 {
		respondError(w, http.StatusBadRequest, "duration must be between 5 and 480 minutes")
		return
	}

	et, err := h.repo.UpdateEventType(id, input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if et == nil {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}
	respondJSON(w, http.StatusOK, et)
}

func (h *Handlers) DeleteEventType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	deleted, err := h.repo.DeleteEventType(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !deleted {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handlers) GetSlots(w http.ResponseWriter, r *http.Request) {
	eventTypeID := r.URL.Query().Get("event_type_id")
	dateStr := r.URL.Query().Get("date")
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	if dateStr == "" && fromStr == "" {
		respondError(w, http.StatusBadRequest, "date or from/to is required")
		return
	}

	today := time.Now().UTC().Format("2006-01-02")
	maxDate := time.Now().UTC().AddDate(0, 0, 14).Format("2006-01-02")
	now := time.Now().UTC()

	if dateStr != "" {
		parsedDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD")
			return
		}
		if dateStr < today || dateStr > maxDate {
			respondError(w, http.StatusBadRequest, "date must be within 14 days from today")
			return
		}
		slots := h.generateSlotsForDate(eventTypeID, parsedDate, now)
		respondJSON(w, http.StatusOK, models.SlotsResponse{
			Date:        dateStr,
			EventTypeID: eventTypeID,
			Slots:       slots,
		})
		return
	}

	if fromStr != "" && toStr != "" {
		fromDate, err := time.Parse("2006-01-02", fromStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid from format, use YYYY-MM-DD")
			return
		}
		toDate, err := time.Parse("2006-01-02", toStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid to format, use YYYY-MM-DD")
			return
		}

		dates := make(map[string][]models.Slot)
		for d := fromDate; !d.After(toDate); d = d.AddDate(0, 0, 1) {
			ds := d.Format("2006-01-02")
			if ds < today || ds > maxDate {
				continue
			}
			dates[ds] = h.generateSlotsForDate(eventTypeID, d, now)
		}

		respondJSON(w, http.StatusOK, models.SlotsRangeResponse{
			EventTypeID: eventTypeID,
			Dates:       dates,
		})
		return
	}

	respondError(w, http.StatusBadRequest, "provide date or from+to parameters")
}

func (h *Handlers) generateSlotsForDate(eventTypeID string, parsedDate time.Time, now time.Time) []models.Slot {
	duration := 30
	if eventTypeID != "" {
		d, err := h.repo.GetEventTypeDuration(eventTypeID)
		if err != nil {
			duration = 30
		} else {
			duration = d
		}
	}

	var slots []models.Slot
	startHour := 9
	endHour := 17

	for hour := startHour; hour < endHour; hour++ {
		for min := 0; min < 60; min += duration {
			slotStart := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), hour, min, 0, 0, time.UTC)
			slotEnd := slotStart.Add(time.Duration(duration) * time.Minute)

			if slotEnd.Hour() > endHour || (slotEnd.Hour() == endHour && slotEnd.Minute() > 0) {
				continue
			}

			if slotStart.Before(now) {
				continue
			}

			startStr := slotStart.Format("15:04")
			endStr := slotEnd.Format("15:04")

			available, err := h.repo.IsSlotAvailable(slotStart.Format(time.RFC3339), slotEnd.Format(time.RFC3339))
			if err != nil {
				available = false
			}

			slots = append(slots, models.Slot{Start: startStr, End: endStr, Available: available})
		}
	}

	if slots == nil {
		slots = []models.Slot{}
	}
	return slots
}

func (h *Handlers) ListBookings(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	bookings, err := h.repo.ListBookings(from, to)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, bookings)
}

func (h *Handlers) ListBookingsRange(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	if from == "" || to == "" {
		respondError(w, http.StatusBadRequest, "from and to are required")
		return
	}

	bookings, err := h.repo.ListBookingsInRange(from, to)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, bookings)
}

func (h *Handlers) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var input models.BookingCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	startTime, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid start_time format, use RFC3339")
		return
	}

	today := time.Now().UTC().Format("2006-01-02")
	maxDate := time.Now().UTC().AddDate(0, 0, 14).Format("2006-01-02")
	bookingDate := startTime.Format("2006-01-02")

	if bookingDate < today || bookingDate > maxDate {
		respondError(w, http.StatusBadRequest, "booking date must be within 14 days from today")
		return
	}

	if strings.TrimSpace(input.GuestName) == "" {
		respondError(w, http.StatusBadRequest, "guest_name is required")
		return
	}
	if !emailRegex.MatchString(input.GuestEmail) {
		respondError(w, http.StatusBadRequest, "valid guest_email is required")
		return
	}

	duration, err := h.repo.GetEventTypeDuration(input.EventTypeID)
	if err != nil {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}

	booking, err := h.repo.CreateBooking(input, duration)
	if err != nil {
		if err.Error() == "slot already taken" {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, booking)
}

func (h *Handlers) GetBooking(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	b, err := h.repo.GetBooking(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if b == nil {
		respondError(w, http.StatusNotFound, "booking not found")
		return
	}
	respondJSON(w, http.StatusOK, b)
}

func (h *Handlers) CancelBooking(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	cancelled, err := h.repo.CancelBooking(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !cancelled {
		respondError(w, http.StatusNotFound, "booking not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
