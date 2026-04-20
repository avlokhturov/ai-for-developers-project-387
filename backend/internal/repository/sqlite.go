package repository

import (
	"database/sql"
	"fmt"
	"time"

	"calendar-booking/models"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type sqliteRepository struct {
	db *sql.DB
}

func New(dbPath string) (Repository, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_pragma=foreign_keys(1)")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}
	return &sqliteRepository{db: db}, nil
}

func migrate(db *sql.DB) error {
	schema := `
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
	_, err := db.Exec(schema)
	return err
}

func (r *sqliteRepository) Close() error {
	return r.db.Close()
}

func (r *sqliteRepository) ListEventTypes() ([]models.EventType, error) {
	rows, err := r.db.Query("SELECT id, name, description, duration, created_at, updated_at FROM event_types ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.EventType
	for rows.Next() {
		var et models.EventType
		if err := rows.Scan(&et.ID, &et.Name, &et.Description, &et.Duration, &et.CreatedAt, &et.UpdatedAt); err != nil {
			return nil, err
		}
		result = append(result, et)
	}
	if result == nil {
		result = []models.EventType{}
	}
	return result, nil
}

func (r *sqliteRepository) GetEventType(id string) (*models.EventType, error) {
	var et models.EventType
	err := r.db.QueryRow("SELECT id, name, description, duration, created_at, updated_at FROM event_types WHERE id = ?", id).
		Scan(&et.ID, &et.Name, &et.Description, &et.Duration, &et.CreatedAt, &et.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &et, nil
}

func (r *sqliteRepository) CreateEventType(input models.EventTypeCreate) (*models.EventType, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	et := models.EventType{
		ID:          uuid.New().String(),
		Name:        input.Name,
		Description: input.Description,
		Duration:    input.Duration,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	_, err := r.db.Exec(
		"INSERT INTO event_types (id, name, description, duration, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		et.ID, et.Name, et.Description, et.Duration, et.CreatedAt, et.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &et, nil
}

func (r *sqliteRepository) UpdateEventType(id string, input models.EventTypeCreate) (*models.EventType, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := r.db.Exec(
		"UPDATE event_types SET name = ?, description = ?, duration = ?, updated_at = ? WHERE id = ?",
		input.Name, input.Description, input.Duration, now, id,
	)
	if err != nil {
		return nil, err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, nil
	}
	return r.GetEventType(id)
}

func (r *sqliteRepository) DeleteEventType(id string) (bool, error) {
	result, err := r.db.Exec("DELETE FROM event_types WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	rowsAffected, _ := result.RowsAffected()
	return rowsAffected > 0, nil
}

func (r *sqliteRepository) GetEventTypeDuration(eventTypeID string) (int, error) {
	var duration int
	err := r.db.QueryRow("SELECT duration FROM event_types WHERE id = ?", eventTypeID).Scan(&duration)
	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("not found")
	}
	return duration, err
}

func (r *sqliteRepository) IsSlotAvailable(startTime, endTime string) (bool, error) {
	var count int
	err := r.db.QueryRow(
		"SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND start_time < ? AND end_time > ?",
		endTime, startTime,
	).Scan(&count)
	return count == 0, err
}

func (r *sqliteRepository) CreateBooking(input models.BookingCreate, duration int) (*models.Booking, error) {
	startTime, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		return nil, err
	}
	endTime := startTime.Add(time.Duration(duration) * time.Minute)

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var count int
	err = tx.QueryRow(
		"SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND start_time < ? AND end_time > ?",
		endTime.Format(time.RFC3339), startTime.Format(time.RFC3339),
	).Scan(&count)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, fmt.Errorf("slot already taken")
	}

	now := time.Now().UTC().Format(time.RFC3339)
	booking := models.Booking{
		ID:          uuid.New().String(),
		EventTypeID: input.EventTypeID,
		GuestName:   input.GuestName,
		GuestEmail:  input.GuestEmail,
		StartTime:   startTime.Format(time.RFC3339),
		EndTime:     endTime.Format(time.RFC3339),
		Status:      "confirmed",
		CreatedAt:   now,
	}

	_, err = tx.Exec(
		"INSERT INTO bookings (id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		booking.ID, booking.EventTypeID, booking.GuestName, booking.GuestEmail, booking.StartTime, booking.EndTime, booking.Status, booking.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *sqliteRepository) ListBookings(from, to string) ([]models.Booking, error) {
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

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Booking
	for rows.Next() {
		var b models.Booking
		if err := rows.Scan(&b.ID, &b.EventTypeID, &b.GuestName, &b.GuestEmail, &b.StartTime, &b.EndTime, &b.Status, &b.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, b)
	}
	if result == nil {
		result = []models.Booking{}
	}
	return result, nil
}

func (r *sqliteRepository) GetBooking(id string) (*models.Booking, error) {
	var b models.Booking
	err := r.db.QueryRow("SELECT id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at FROM bookings WHERE id = ?", id).
		Scan(&b.ID, &b.EventTypeID, &b.GuestName, &b.GuestEmail, &b.StartTime, &b.EndTime, &b.Status, &b.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *sqliteRepository) CancelBooking(id string) (bool, error) {
	result, err := r.db.Exec("UPDATE bookings SET status = 'cancelled' WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	rowsAffected, _ := result.RowsAffected()
	return rowsAffected > 0, nil
}

func (r *sqliteRepository) ListBookingsInRange(from, to string) ([]models.Booking, error) {
	query := "SELECT id, event_type_id, guest_name, guest_email, start_time, end_time, status, created_at FROM bookings WHERE status = 'confirmed'"
	args := []interface{}{}
	if from != "" {
		query += " AND start_time >= ?"
		args = append(args, from)
	}
	if to != "" {
		query += " AND end_time <= ?"
		args = append(args, to)
	}
	query += " ORDER BY start_time ASC"
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.Booking
	for rows.Next() {
		var b models.Booking
		if err := rows.Scan(&b.ID, &b.EventTypeID, &b.GuestName, &b.GuestEmail, &b.StartTime, &b.EndTime, &b.Status, &b.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, b)
	}
	if result == nil {
		result = []models.Booking{}
	}
	return result, nil
}