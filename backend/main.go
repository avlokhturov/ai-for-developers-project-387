package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

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

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "/data/calendar.db")
	if err != nil {
		log.Fatal(err)
	}

	createTables := `
	CREATE TABLE IF NOT EXISTS event_types (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		description TEXT,
		duration INTEGER DEFAULT 30,
		created_at TEXT,
		updated_at TEXT
	);
	CREATE TABLE IF NOT EXISTS bookings (
		id TEXT PRIMARY KEY,
		event_type_id TEXT NOT NULL,
		guest_name TEXT NOT NULL,
		guest_email TEXT NOT NULL,
		start_time TEXT NOT NULL,
		end_time TEXT NOT NULL,
		status TEXT DEFAULT 'confirmed',
		created_at TEXT,
		FOREIGN KEY (event_type_id) REFERENCES event_types(id)
	);
	CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
	`
	_, err = db.Exec(createTables)
	if err != nil {
		log.Fatal(err)
	}
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, Error{Code: status, Message: message})
}

func listEventTypes(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, description, duration, created_at, updated_at FROM event_types ORDER BY created_at DESC")
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var eventTypes []EventType
	for rows.Next() {
		var et EventType
		if err := rows.Scan(&et.ID, &et.Name, &et.Description, &et.Duration, &et.CreatedAt, &et.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		eventTypes = append(eventTypes, et)
	}
	if eventTypes == nil {
		eventTypes = []EventType{}
	}
	respondJSON(w, http.StatusOK, eventTypes)
}

func createEventType(w http.ResponseWriter, r *http.Request) {
	var input EventTypeCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if input.Duration == 0 {
		input.Duration = 30
	}

	now := time.Now().UTC().Format(time.RFC3339)
	et := EventType{
		ID:          uuid.New().String(),
		Name:        input.Name,
		Description: input.Description,
		Duration:    input.Duration,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	_, err := db.Exec(
		"INSERT INTO event_types (id, name, description, duration, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		et.ID, et.Name, et.Description, et.Duration, et.CreatedAt, et.UpdatedAt,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, et)
}

func getEventType(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/event-types/")
	var et EventType
	err := db.QueryRow("SELECT id, name, description, duration, created_at, updated_at FROM event_types WHERE id = ?", id).
		Scan(&et.ID, &et.Name, &et.Description, &et.Duration, &et.CreatedAt, &et.UpdatedAt)
	if err == sql.ErrNoRows {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, et)
}

func updateEventType(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/event-types/")
	var input EventTypeCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.Exec(
		"UPDATE event_types SET name = ?, description = ?, duration = ?, updated_at = ? WHERE id = ?",
		input.Name, input.Description, input.Duration, now, id,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}

	getEventType(w, r)
}

func deleteEventType(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/event-types/")
	result, err := db.Exec("DELETE FROM event_types WHERE id = ?", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func getSlots(w http.ResponseWriter, r *http.Request) {
	eventTypeID := r.URL.Query().Get("event_type_id")
	dateStr := r.URL.Query().Get("date")

	if dateStr == "" {
		respondError(w, http.StatusBadRequest, "date is required")
		return
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD")
		return
	}

	today := time.Now().UTC().Format("2006-01-02")
	maxDate := time.Now().UTC().AddDate(0, 0, 14).Format("2006-01-02")

	if dateStr < today || dateStr > maxDate {
		respondError(w, http.StatusBadRequest, "date must be within 14 days from today")
		return
	}

	var duration int
	if eventTypeID != "" {
		err := db.QueryRow("SELECT duration FROM event_types WHERE id = ?", eventTypeID).Scan(&duration)
		if err == sql.ErrNoRows {
			respondError(w, http.StatusNotFound, "event type not found")
			return
		}
		if err != nil {
			duration = 30
		}
	} else {
		duration = 30
	}

	var slots []Slot
	startHour := 9
	endHour := 17

	for hour := startHour; hour < endHour; hour++ {
		for min := 0; min < 60; min += duration {
			slotStart := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), hour, min, 0, 0, time.UTC)
			slotEnd := slotStart.Add(time.Duration(duration) * time.Minute)

			startStr := slotStart.Format("15:04")
			endStr := slotEnd.Format("15:04")

			if slotEnd.Minute() != 0 && duration > 1 {
				continue
			}

			var count int
			err := db.QueryRow(
				"SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND start_time < ? AND start_time >= ?",
				slotEnd.Format(time.RFC3339), slotStart.Format(time.RFC3339),
			).Scan(&count)
			if err != nil {
				continue
			}

			available := count == 0
			slots = append(slots, Slot{Start: startStr, End: endStr, Available: available})
		}
	}

	if slots == nil {
		slots = []Slot{}
	}

	respondJSON(w, http.StatusOK, SlotsResponse{
		Date:        dateStr,
		EventTypeID: eventTypeID,
		Slots:       slots,
	})
}

func listBookings(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	query := "SELECT id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at FROM bookings WHERE 1=1"
	args := []interface{}{}

	if from != "" {
		query += " AND start_time >= ?"
		args = append(args, from)
	}
	if to != "" {
		query += " AND start_time <= ?"
		args = append(args, to)
	}

	query += " ORDER BY start_time ASC"

	rows, err := db.Query(query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var bookings []Booking
	for rows.Next() {
		var b Booking
		if err := rows.Scan(&b.ID, &b.EventTypeID, &b.GuestName, &b.GuestEmail, &b.StartTime, &b.EndTime, &b.Status, &b.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		bookings = append(bookings, b)
	}
	if bookings == nil {
		bookings = []Booking{}
	}
	respondJSON(w, http.StatusOK, bookings)
}

func createBooking(w http.ResponseWriter, r *http.Request) {
	var input BookingCreate
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

	var duration int
	err = db.QueryRow("SELECT duration FROM event_types WHERE id = ?", input.EventTypeID).Scan(&duration)
	if err == sql.ErrNoRows {
		respondError(w, http.StatusNotFound, "event type not found")
		return
	}
	if err != nil {
		duration = 30
	}

	endTime := startTime.Add(time.Duration(duration) * time.Minute)

	var count int
	err = db.QueryRow(
		"SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND start_time < ? AND start_time >= ?",
		endTime.Format(time.RFC3339), startTime.Format(time.RFC3339),
	).Scan(&count)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if count > 0 {
		respondError(w, http.StatusBadRequest, "slot already taken")
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	booking := Booking{
		ID:          uuid.New().String(),
		EventTypeID: input.EventTypeID,
		GuestName:   input.GuestName,
		GuestEmail:  input.GuestEmail,
		StartTime:   startTime.Format(time.RFC3339),
		EndTime:     endTime.Format(time.RFC3339),
		Status:      "confirmed",
		CreatedAt:   now,
	}

	_, err = db.Exec(
		"INSERT INTO bookings (id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		booking.ID, booking.EventTypeID, booking.GuestName, booking.GuestEmail, booking.StartTime, booking.EndTime, booking.Status, booking.CreatedAt,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, booking)
}

func getBooking(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/bookings/")
	var b Booking
	err := db.QueryRow("SELECT id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at FROM bookings WHERE id = ?", id).
		Scan(&b.ID, &b.EventTypeID, &b.GuestName, &b.GuestEmail, &b.StartTime, &b.EndTime, &b.Status, &b.CreatedAt)
	if err == sql.ErrNoRows {
		respondError(w, http.StatusNotFound, "booking not found")
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, b)
}

func cancelBooking(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/bookings/")
	result, err := db.Exec("UPDATE bookings SET status = 'cancelled' WHERE id = ?", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		respondError(w, http.StatusNotFound, "booking not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func main() {
	initDB()
	defer db.Close()

	http.HandleFunc("/api/event-types", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			if r.URL.Path == "/api/event-types" {
				listEventTypes(w, r)
			} else {
				getEventType(w, r)
			}
		case http.MethodPost:
			createEventType(w, r)
		}
	})

	http.HandleFunc("/api/event-types/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getEventType(w, r)
		case http.MethodPut:
			updateEventType(w, r)
		case http.MethodDelete:
			deleteEventType(w, r)
		}
	})

	http.HandleFunc("/api/slots", getSlots)

	http.HandleFunc("/api/bookings", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			listBookings(w, r)
		case http.MethodPost:
			createBooking(w, r)
		}
	})

	http.HandleFunc("/api/bookings/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getBooking(w, r)
		case http.MethodDelete:
			cancelBooking(w, r)
		}
	})

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
