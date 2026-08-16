# WOT (Work-Out Tracker) Makefile
# Default docker compose command (can be overridden with DOCKER_COMPOSE="sudo docker compose")
DOCKER_COMPOSE ?= docker compose

.PHONY: help dev up down db-up db-down db-migrate db-generate db-studio db-erd api mobile mobile-ios mobile-android mobile-web test test-unit test-int typecheck lint check clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Full Stack Development ---

dev: ## Start PostgreSQL, apply migrations, and launch API & mobile client concurrently
	@echo "Starting local database..."
	@$(DOCKER_COMPOSE) -f api/docker-compose.yml up -d || true
	@echo "Applying database migrations..."
	@cd api && npm run db:migrate || true
	@echo "Launching API and Expo mobile client..."
	@npx --yes concurrently --kill-others \
		-n "api,mobile" \
		-c "blue,magenta" \
		"cd api && npm run dev" \
		"cd mobile-client && npm run start"

# --- Database Commands ---

db-up: ## Start PostgreSQL docker container
	$(DOCKER_COMPOSE) -f api/docker-compose.yml up -d

db-down: ## Stop PostgreSQL docker container
	$(DOCKER_COMPOSE) -f api/docker-compose.yml down

db-migrate: ## Apply database migrations
	cd api && npm run db:migrate

db-generate: ## Generate database migrations from Drizzle schema
	cd api && npm run db:generate

db-studio: ## Launch Drizzle Studio database browser
	cd api && npm run db:studio

db-erd: ## Regenerate ERD SVG diagram
	cd api && npm run db:erd

# --- Service Commands ---

api: ## Start Fastify API server in development mode
	cd api && npm run dev

mobile: ## Start Expo mobile dev server (interactive)
	cd mobile-client && npm run start

mobile-ios: ## Start Expo with iOS simulator
	cd mobile-client && npm run ios

mobile-android: ## Start Expo with Android emulator
	cd mobile-client && npm run android

mobile-web: ## Start Expo in web browser
	cd mobile-client && npm run web

# --- Quality & Testing ---

test: test-unit test-int ## Run both unit and integration tests

test-unit: ## Run backend unit tests
	cd api && npm test

test-int: ## Run backend integration tests
	cd api && npm run test:integration

typecheck: ## Run type checking across api and mobile-client
	cd api && npm run typecheck
	cd mobile-client && npx tsc --noEmit

lint: ## Run linter on mobile client
	cd mobile-client && npm run lint

check: typecheck lint test ## Run typecheck, lint, and all tests
