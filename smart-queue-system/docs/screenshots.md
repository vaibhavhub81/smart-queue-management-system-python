# Mock Screenshot Descriptions

This document describes the key user interfaces of the Smart Queue Management System.

## 1. Login Page

- **Description:** A clean, centered login form.
- **Elements:**
  - "Smart Queue" logo at the top.
  - Input fields for "Username" and "Password".
  - A prominent "Log In" button.
  - A link below the form: "Don't have an account? Sign up".
- **Aesthetic:** Minimalist, with a blue and gray color scheme.

## 2. Student Dashboard

- **Description:** The main view for students after logging in.
- **Layout:** A two-column layout. The left (main) column shows available services, and the right column shows the student's current queue status.
- **Elements:**
  - **Header:** Shows the app name, links to other dashboards (if applicable), and a "Logout" button.
  - **Available Services (Left):** A grid of cards, where each card represents a service (e.g., "Canteen", "Library"). Each card has the service name, a brief description, and a "Join Queue" button.
  - **My Queues (Right):** A list of queues the student is currently in. Each list item shows the Service Name, the student's Token Number, and a colored status badge (e.g., "Waiting", "In Progress").
  - **Notifications:** A small panel at the bottom of the "My Queues" section showing real-time updates.

## 3. Staff Dashboard

- **Description:** The interface for service staff to manage a queue.
- **Layout:** A single-column layout focused on queue management.
- **Elements:**
  - **Header:** Same as the student dashboard.
  - **Service Selector:** A dropdown menu at the top for staff to select the service they are managing.
  - **Queue Control Panel:**
    - A "Call Next" button to call the next user in the queue.
    - A section displaying the "Now Serving" token number.
    - A list of users currently in the queue, with the user "In Progress" highlighted.
    - For the user currently being served, "Complete" and "Skip" buttons are visible.

## 4. Admin Dashboard

- **Description:** The analytics view for administrators.
- **Layout:** A dashboard with several charts.
- **Elements:**
  - **Header:** Same as other dashboards.
  - **Analytics Charts:**
    - **User Volume Chart:** A bar chart comparing the total number of users, completed services, and skipped users for each service.
    - **Average Wait Time Chart:** A bar chart showing the average wait time in minutes for each service.
    - Other potential charts could include peak hours, staff performance, etc.
- **Aesthetic:** Data-focused, using clear charts and graphs with a professional color palette.
