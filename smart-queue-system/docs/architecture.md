# System Architecture

This document provides an overview of the Smart Queue Management System's architecture.

## High-Level Architecture

The system is designed as a modern web application with a decoupled frontend and backend, running in a containerized environment using Docker.

```
+-------------------------------------------------+
|                   User Devices                  |
| (Browser: Student, Staff, Admin)                |
+----------------------+--------------------------+
                       |
                       | HTTP/S (REST API, Web)
                       | WebSocket (Real-time)
                       |
+----------------------v--------------------------+
|                 NGINX Web Server                |
|           (Serves Frontend, Proxies API)        |
+----------------------+--------------------------+
                       |
                       |
+----------------------v--------------------------+
|                                                 |
|              Application Backend                |
|             (Django + Channels)                 |
|                                                 |
| +------------------+   +----------------------+ |
| |   RESTful API    |   |  WebSocket Handler   | |
| | (Django REST FW) |   |    (Channels)        | |
| +------------------+   +----------------------+ |
|                                                 |
+----------------------+--------------------------+
                       |
                       |
+----------------------v--------------------------+
|                                                 |
|           Task Queue & Caching Layer            |
|                                                 |
|   +-----------------+     +-----------------+   |
|   |   Celery        |     |   Redis         |   |
|   | (Async Tasks)   |     | (Cache/Broker)  |   |
|   +-----------------+     +-----------------+   |
|                                                 |
+----------------------+--------------------------+
                       |
                       |
+----------------------v--------------------------+
|                                                 |
|                 Database Layer                  |
|              (PostgreSQL)                       |
|                                                 |
+-------------------------------------------------+

```

## Backend - Django App Architecture

The backend is built using Django and follows a modular, app-based architecture.

```
+--------------------------------------------------+
|                   core (Project)                 |
| - settings.py (Configurations)                   |
| - urls.py (Root URLConf)                         |
| - asgi.py (ASGI entrypoint for Channels)         |
| - wsgi.py (WSGI entrypoint)                      |
+------------------------+-------------------------+
                         |
                         | Includes URLs from Apps
                         |
+------------------------v-------------------------+
|                                                  |
|   +-----------+   +----------+   +-------------+ |
|   |   users   |   | services |   |    queue    | |
|   | (Auth)    |   | (Manage  |   |  (Core Logic) | |
|   | - User    |   | Services)|   |  - QueueEntry | |
|   | - JWT     |   | - Service|   |  - Join/Call  | |
|   +-----------+   +----------+   +-------------+ |
|                                                  |
|   +-----------+   +----------+                   |
|   |notific..ns|   | analytics|                   |
|   | (Sockets) |   | (Logging)|                   |
|   | - Consumer|   | - ActLog |                   |
|   | - Tasks   |   | - Reports|                   |
|   +-----------+   +----------+                   |
|                                                  |
+--------------------------------------------------+

```

## Frontend - React Component Architecture

The frontend is a React single-page application (SPA) with a component-based structure.

```
+--------------------------------------------------+
|                   App.tsx (Router)               |
+------------------------+-------------------------+
                         |
+------------------------v-------------------------+
|    /login, /register   |     (Private Routes)    |
|   +---------------+    |    +-----------------+  |
|   |  Login Page   |    |    | StudentDashboard|  |
|   | Register Page |    |    +-----------------+  |
|   +---------------+    |    +-----------------+  |
|                        |    | StaffDashboard  |  |
|                        |    +-----------------+  |
|                        |    +-----------------+  |
|                        |    | AdminDashboard  |  |
|                        |    +-----------------+  |
+------------------------+-------------------------+
                         |
+------------------------v-------------------------+
|                  Shared Components               |
|      +--------+      +-----------+     + ... +   |
|      | Header |      | ServiceList|     |     |   |
|      +--------+      +-----------+     + ... +   |
+--------------------------------------------------+
```
