FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o relay main.go

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/relay ./relay
CMD ["./relay"] 