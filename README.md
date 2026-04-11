# TodoCal

Calendar-based todo manager with a React/Vite client, Express API server, and local SQLite storage.

## Overview

The app is built around a split dashboard:

- Left: monthly calendar for due-date visualization
- Right: active task list for tasks where `startDate <= today <= dueDate`
- Date popup: shows tasks due on a selected date
- Task detail popup: shared entry point from calendar, active list, and date popup
- Admin page: internal account/statistics management at `/adminpage`

## Features

- Login and sign-up with ID/password validation
- Password policy enforcement on both client and server
- Calendar task display by `dueDate` only
- Past dates disabled in calendar and due-date input
- Date-context-aware Add Task flow
- Task status toggle with `undone` and `done`
- Completed task strikethrough styling
- Delete task confirmation step
- Admin dashboard with summary metrics, trend charts, and account actions

## Tech Stack

- Client: React 19, Vite, ESLint
- Server: Express, SQLite3, CORS
- Database: local SQLite file at `server/todo.db`

## Project Structure

```text
.
├── client/        # React/Vite frontend
├── server/        # Express API server and SQLite DB runtime location
├── projectPlan/   # Product planning, UI spec, wireframe, admin plan
└── README.md
```

## Setup

Install dependencies separately for the client and server:

```bash
cd server
npm install

cd ../client
npm install
```

## Run Locally

Start the API server:

```bash
cd server
npm start
```

The server runs at:

```text
http://localhost:3001
```

Start the client dev server in another terminal:

```bash
cd client
npm run dev
```

Then open the Vite URL shown in the terminal.

## Admin Page

Open:

```text
/adminpage
```

Admin APIs require an admin user. The current backend uses the `x-admin-user-id` request header to authorize admin endpoints, and the user must have `role = admin` and `status = active`.

## Useful Commands

Client:

```bash
cd client
npm run lint
npm run build
npm run preview
```

Server:

```bash
cd server
npm start
```

## Data Notes

- `server/todo.db` is local runtime data and is intentionally ignored by git.
- SQLite sidecar files such as `*.db-wal` and `*.db-shm` are also ignored.
- Do not commit local environment files such as `.env`.

## Planning Docs

Product and UI references live in `projectPlan/`:

- `project-plan.md`
- `ui-spec.md`
- `wire-frame.md`
- `admin-page.md`
- `deployment-plan.md`
