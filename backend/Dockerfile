FROM golang:1.22-alpine AS builder

RUN apk add --no-cache gcc musl-dev sqlite-libs

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 go build -o /api-server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /app
COPY --from=builder /api-server /app/api-server

EXPOSE 8080

CMD ["/app/api-server"]
