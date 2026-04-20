package main

import (
	"log"
	"net/http"
	"os"

	"calendar-booking/handlers"
	"calendar-booking/internal/middleware"
	"calendar-booking/internal/repository"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "/data/calendar.db"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	repo, err := repository.New(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer repo.Close()

	h := handlers.New(repo)

	r := chi.NewRouter()
	r.Use(chiMiddleware.Logger)
	r.Use(middleware.Recovery)
	r.Use(middleware.CORS)

	r.Route("/api", func(r chi.Router) {
		r.Route("/event-types", func(r chi.Router) {
			r.Get("/", h.ListEventTypes)
			r.Post("/", h.CreateEventType)
			r.Get("/{id}", h.GetEventType)
			r.Put("/{id}", h.UpdateEventType)
			r.Delete("/{id}", h.DeleteEventType)
		})

		r.Get("/slots", h.GetSlots)

		r.Route("/bookings", func(r chi.Router) {
			r.Get("/", h.ListBookings)
			r.Get("/range", h.ListBookingsRange)
			r.Post("/", h.CreateBooking)
			r.Get("/{id}", h.GetBooking)
			r.Delete("/{id}", h.CancelBooking)
		})
	})

	staticDir := "/app/dist"
	fs := http.FileServer(http.Dir(staticDir))
	r.Handle("/assets/*", fs)
	r.NotFound(func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, staticDir+"/index.html")
	})

	log.Printf("Server starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}