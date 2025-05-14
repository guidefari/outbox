package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type Order struct {
	ID         int    `json:"id"`
	CustomerId string `json:"customerId"`
	Status     string `json:"status"`
	Total      int    `json:"total"`
}

type OutboxPayload struct {
	Type string `json:"type"`
	Data Order  `json:"data"`
}

type OutboxEvent struct {
	ID      int           `json:"id"`
	Payload OutboxPayload `json:"payload"`
}

type Email struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL env var required")
	}
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	for {
		rows, err := db.Query(`SELECT id, payload FROM outbox WHERE processed = false ORDER BY id LIMIT 10`)
		if err != nil {
			log.Println("query error:", err)
			time.Sleep(2 * time.Second)
			continue
		}
		var events []OutboxEvent
		for rows.Next() {
			var id int
			var payloadRaw []byte
			if err := rows.Scan(&id, &payloadRaw); err != nil {
				log.Println("scan error:", err)
				continue
			}
			var payload OutboxPayload
			if err := json.Unmarshal(payloadRaw, &payload); err != nil {
				log.Println("json error:", err)
				continue
			}
			events = append(events, OutboxEvent{ID: id, Payload: payload})
		}
		rows.Close()

		for _, event := range events {
			if event.Payload.Type != "ORDER_CREATED" {
				continue
			}
			order := event.Payload.Data
			email := Email{
				To:      fmt.Sprintf("customer-%s@example.com", order.CustomerId),
				Subject: fmt.Sprintf("Order Confirmation #%d", order.ID),
				Body:    fmt.Sprintf("Thank you for your order! Order ID: %d, Total: $%d", order.ID, order.Total),
			}
			payload, _ := json.Marshal(email)
			resp, err := http.Post("http://email-service:4321/send", "application/json", bytes.NewBuffer(payload))
			if err != nil {
				log.Printf("Failed to send email for order %d: %v", order.ID, err)
				continue
			}
			resp.Body.Close()
			_, err = db.Exec(`UPDATE outbox SET processed = true WHERE id = $1`, event.ID)
			if err != nil {
				log.Printf("Failed to mark outbox event %d as processed: %v", event.ID, err)
				continue
			}
			log.Printf("Processed outbox event %d, sent email to %s", event.ID, email.To)
		}

		if len(events) == 0 {
			log.Println("😴")
			time.Sleep(2 * time.Second)
		}
	}
}
