.PHONY: setup start test lint

setup:
	cd frontend && npm ci
	cd backend && go mod download

start:
	docker compose up --build

test:
	cd frontend && npm run test:e2e

lint:
	cd frontend && npm run lint
