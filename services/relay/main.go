package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

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
		var ids []int
		for rows.Next() {
			var id int
			var payloadRaw []byte
			if err := rows.Scan(&id, &payloadRaw); err != nil {
				log.Println("scan error:", err)
				continue
			}
			var payload interface{}
			if err := json.Unmarshal(payloadRaw, &payload); err != nil {
				log.Println("json error:", err)
				continue
			}
			log.Printf("Processing outbox id=%d payload=%v\n", id, payload)
			ids = append(ids, id)
		}
		rows.Close()

		log.Printf("Processing %d outbox items\n", len(ids))

		if len(ids) > 0 {
			for _, id := range ids {
				_, err := db.Exec(`UPDATE outbox SET processed = true WHERE id = $1`, id)
				if err != nil {
					log.Println("update error:", err)
				}
			}
		} else {
			time.Sleep(2 * time.Second)
		}
	}
}
