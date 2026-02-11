# Smart Queue Management System

A digital queue platform to reduce physical waiting time in college campus services.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)

## Features

- **Digital Queues:** Students can join service queues digitally from anywhere.
- **Real-time Updates:** Live tracking of queue status via WebSockets.
- **Staff Dashboard:** Service staff can manage queues, call next tokens, and mark services as complete.
- **Admin Analytics:** Administrators can view analytics on service performance and wait times.
- **JWT Authentication:** Secure, role-based access control.

## Tech Stack

- **Backend:** Python, Django, Django REST Framework, Django Channels
- **Frontend:** React, TypeScript, Tailwind CSS, React Query
- **Database:** PostgreSQL
- **Caching/Messaging:** Redis
- **Async Tasks:** Celery
- **Containerization:** Docker, Docker Compose

## Project Structure

```
/smart-queue-system
├── backend/         # Django project
├── frontend/        # React project
├── docs/            # Documentation
├── setup.py         # Main setup script
├── setup.sh         # Linux/macOS setup script
├── setup.bat        # Windows setup script
├── Makefile         # Command shortcuts
├── docker-compose.yml # Docker services definition
└── README.md
```

## Prerequisites

Ensure you have the following installed on your system:
- Python 3.11+
- Node.js 18+
- Docker
- Docker Compose

## Installation and Setup

This project includes automated setup scripts to configure your environment.

**1. Clone the repository:**
```bash
git clone <repository-url>
cd smart-queue-system
```

**2. Create a `.env` file:**

Create a `.env` file in the `backend` directory with the following content:

```
DJANGO_SECRET_KEY=your-super-secret-key-that-is-long-and-random
DEBUG=1
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres
REDIS_URL=redis://redis:6379/0
```

**3. Run the setup script:**

- **Windows:**
  ```bash
  setup.bat
  ```
- **Linux/macOS:**
  ```bash
  bash setup.sh
  ```
  *(You might need to make it executable first: `chmod +x setup.sh`)*

This script will:
- Check for all system requirements.
- Create a Python virtual environment (`.venv`).
- Install all backend dependencies from `requirements.txt`.
- Install all frontend dependencies from `package.json`.

## Running the Application

The application is containerized using Docker.

**To start the application:**

```bash
docker-compose up --build
```
This command will build the Docker images and start all the services.

- **Frontend** will be available at [http://localhost:3000](http://localhost:3000)
- **Backend API** will be available at [http://localhost:8000](http://localhost:8000)

**To stop the application:**

```bash
docker-compose down
```

## Seeding the Database



To populate the database with some initial data (services, counters, and users), you can use the `seed_data` management command.



1. **Make sure the application is running:**

   ```bash

   docker-compose up

   ```



2. **Execute the management command in the backend container:**

   ```bash

   docker-compose exec backend python manage.py seed_data

   ```



## API Documentation

Once the backend is running, you can access the OpenAPI (Swagger) documentation at:

[http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)



## Running Tests



Backend and frontend tests are yet to be implemented.
