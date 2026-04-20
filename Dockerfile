FROM golang:1.22-alpine AS backend-builder

RUN apk add --no-cache gcc musl-dev sqlite-libs

WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=1 go build -o /api-server

FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM alpine:3.19

RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /app

COPY --from=backend-builder /api-server /app/api-server
COPY --from=frontend-builder /app/frontend/dist /app/dist

ENV PORT=8080
EXPOSE ${PORT}

CMD ["/app/api-server"]
