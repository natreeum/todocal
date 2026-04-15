# TodoCal

TodoCal is a calendar-based task manager for tracking due dates and active tasks.

Product URL:

```text
https://todo-cal.sitey.my/
```

## Overview

TodoCal uses a split dashboard layout.

- Desktop: left 2/3 calendar view, right 1/3 active task list
- Mobile: active task section first, calendar view second
- Calendar view: shows tasks only on their `dueDate`
- Active Tasks: shows tasks where `startDate <= today <= dueDate`
- Date popup: shows tasks whose `dueDate` is the selected date
- Task detail popup: shared detail view from calendar, active task list, and date popup
- Admin page: internal account/statistics management at `/adminpage`

## Product UI Notes

- Product name: `TodoCal`
- Browser title: `TodoCal`
- Favicon: `📆`
- Main header copy format: `Welcome {username}, {randMessage}`
- Login title: `TodoCal`
- Sign-up title: `TodoCal : SignUp`
- Remove helper copy such as `enter your id`

Random header messages:

- `Have a good day.`
- `Let's make today productive.`
- `Small steps count.`
- `You've got this.`
- `Stay focused and keep going.`
- `One task at a time.`
- `Make today count.`
- `Keep your momentum.`
- `Ready to plan your day?`
- `Let's get things done.`

## Features

- Login and sign-up with ID/password validation
- Password validation: at least 4 characters, any character type allowed
- Calendar due-date visualization
- Past dates disabled in calendar and due-date input
- Date popup Add Task flow with selected date as prefilled `dueDate`
- Task detail popup with emphasized title, `Created`, `Due Date`, status toggle, and delete action
- `startDate` is not shown in task detail because it duplicates `Created`
- Task deletion confirmation step
- Status toggle with distinct `undone` and `done` colors
- Completed tasks use strikethrough and lighter text
- Admin dashboard with account management and statistics charts

## Active Tasks Rules

Active Tasks header:

```text
Today : **YYYY-MM-DD**
```

Sorting:

- Group by status first
- `undone` tasks first
- `done` tasks second
- Within each status group, sort by `dueDate` ascending

Recommended task item layout:

```text
Task Title                    status
Due:     YYYY-MM-DD
```

Avoid rendering task title and due date as one inline sentence.

## Calendar Rules

- Weekday order: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`
- Current date must be visually highlighted
- Clicking a date must not apply persistent border styling
- Calendar tasks are rendered only on `dueDate`
- Calendar tasks are not rendered across the full `startDate ~ dueDate` range
- Clicking a task opens the shared task detail popup
- Clicking a selectable date opens the Date Due Task List popup
- Date popup must not show redundant subtitles such as `Tasks Due On Selected Date`

Mobile calendar rules:

- Task chips must not wrap vertically
- Long task titles must use single-line ellipsis
- Show at most 1-2 task chips per date cell
- If more tasks exist, show `+N more`
- If the cell is too narrow, prefer compact summary such as `3 tasks`

## Admin Page

Open:

```text
/adminpage
```

Admin features:

- Account management
- Account activation/deactivation
- Account deletion with confirmation
- Admin self-delete prevention
- DAU by date chart
- MAU by date chart using rolling 30 days
- Task creation and completion charts
- Chart hover tooltip with date and metric value

Admin APIs require an admin user. The backend uses the `x-admin-user-id` request header to authorize admin endpoints, and the user must have `role = admin` and `status = active`.

## Tech Stack

- Client: React 19, Vite, ESLint
- Server: Express, SQLite3, CORS
- Database: local SQLite file at `server/todo.db`
- Production process manager: `forever`
- Reverse proxy: Nginx

## Project Structure

```text
.
├── client/        # React/Vite frontend
├── server/        # Express API server and SQLite DB runtime location
├── projectPlan/   # Product planning, UI spec, wireframe, admin plan, deployment plan
└── README.md
```

## Setup

Install dependencies separately for the server and client.

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

## API Configuration

Client API requests should use the configured API base URL.

Default API base URLs:

```text
development -> http://localhost:3001
production  -> https://todo-cal.sitey.my/api
```

Override per environment with Vite:

```bash
VITE_API_BASE_URL=https://todo-cal.sitey.my/api npm run build
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

## Production Deployment Summary

Production target:

```text
https://todo-cal.sitey.my/
```

Deployment model:

```text
User Browser
  -> Nginx
      -> /      : client/dist
      -> /api/* : 127.0.0.1:3001
  -> forever
      -> server/server.js
```

Basic production commands:

```bash
cd /var/www/todocal

git pull

cd client
npm ci
npm run build

cd ../server
npm ci
forever restart todocal-server || NODE_ENV=production forever start -a --uid todocal-server server.js

sudo nginx -t
sudo systemctl reload nginx
```

Backend port `3001` should not be publicly exposed. Public access should go through Nginx using `/api` proxying.

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
npm run permissions -- --list
npm run permissions -- --username minseob --role admin --status active
```

Forever:

```bash
forever list
forever logs todocal-server
forever restart todocal-server
forever stop todocal-server
```

Health check:

```text
GET /health
```

## Data Notes

- `server/todo.db` is local runtime data and is intentionally ignored by git
- SQLite sidecar files such as `*.db-wal` and `*.db-shm` are ignored
- Do not commit local environment files such as `.env`

## Planning Docs

Product and UI references live in `projectPlan/`:

- `project-plan.md`
- `ui-spec.md`
- `wire-frame.md`
- `admin-page.md`
- `deployment-plan.md`
