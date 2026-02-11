# Makefile for Smart Queue Management System

.PHONY: help install setup clean

# --- Variables ---
PYTHON = python3
PIP = venv/bin/pip
NPM = npm
DOCKER_COMPOSE = docker-compose

# Default command
all: help

help:
	@echo "Makefile for Smart Queue Management System"
	@echo ""
	@echo "Usage:"
	@echo "  make install        - Installs all dependencies for backend and frontend."
	@echo "  make setup          - Runs the interactive setup script."
	@echo "  make up             - Starts the application using Docker Compose."
	@echo "  make down           - Stops the application."
	@echo "  make build          - Builds the Docker containers."
	@echo "  make clean          - Removes virtual environment and node_modules."
	@echo ""

install: setup
	@echo "Dependencies are installed via the setup script."

setup:
	@echo "Running environment setup..."
	@bash setup.sh

up:
	@echo "Starting application..."
	$(DOCKER_COMPOSE) up

build:
	@echo "Building Docker containers..."
	$(DOCKER_COMPOSE) build

down:
	@echo "Stopping application..."
	$(DOCKER_COMPOSE) down

clean:
	@echo "Cleaning up project..."
	rm -rf venv
	rm -rf frontend/node_modules
	@echo "Cleanup complete."

