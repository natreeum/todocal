# Admin Page Plan

## 1. Purpose
The admin page is an internal management interface for monitoring service usage and managing user accounts.
It should provide operational visibility without exposing end-user task details more than necessary.

## 2. Access Control

### 2.1. Admin Access
- Only authorized admin users can access the admin page.
- Admin access must be separated from normal user access.
- Non-admin users must not be able to open admin routes or call admin APIs.

### 2.2. Permission Model
- Initial version can use a simple `role` field.
- Required roles:
  - `user`
  - `admin`
- Admin-only actions must be guarded on both frontend and backend.

## 3. Core Features

### 3.1. Account Management
Admins can inspect and manage user accounts.

- User list
  - Display registered users
  - Search by user ID or username
  - Filter by account status
- User detail
  - User ID
  - Created date
  - Last login date
  - Account status
  - Task count summary
- Account actions
  - Activate account
  - Deactivate account
  - Reset password or trigger password reset flow
  - Change role if role management is enabled
  - Delete account

### 3.2. Statistics Dashboard
Admins can monitor product usage and task activity.

- User activity metrics
  - DAU: daily active users
  - MAU: monthly active users
  - New users per day
  - Total registered users
- Task metrics
  - Total created task count
  - Created task count by day
  - Completed task count
  - Undone task count
  - Completion rate
- Calendar/task behavior metrics
  - Tasks due today
  - Overdue tasks
  - Tasks created today
  - Average tasks per active user

## 4. Screen Structure

### 4.1. Admin Dashboard
Main landing screen for the admin page.

- Summary cards
  - DAU
  - MAU
  - Total users
  - Total tasks
  - Tasks created today
  - Completion rate
- Charts
  - DAU by date chart
  - MAU by date chart
  - Task creation trend
  - Task completion trend
- Quick links
  - Account management
  - Task statistics

### 4.2. Account Management Screen
Screen for managing user accounts.

- Table columns
  - User ID
  - Role
  - Status
  - Created date
  - Last login date
  - Total task count
  - Actions
- Actions
  - View detail
  - Activate / deactivate
  - Reset password
  - Change role
  - Delete account

### 4.3. User Detail Screen
Screen for inspecting one user account.

- User profile summary
  - User ID
  - Role
  - Status
  - Created date
  - Last login date
- Task summary
  - Total tasks
  - Done tasks
  - Undone tasks
  - Tasks due today
  - Overdue tasks
- Admin actions
  - Activate / deactivate
  - Reset password
  - Change role
  - Delete account

### 4.4. Statistics Screen
Screen for detailed usage statistics.

- Date range selector
- User activity section
  - DAU
  - MAU
  - New users
- Task activity section
  - Created task count
  - Done task count
  - Undone task count
  - Completion rate
- Trend charts
  - DAU by date chart
  - MAU by date chart
  - Daily task creation trend
  - Daily task completion trend


### 4.5. Chart Interaction Rules
- Statistics charts must show a tooltip on mouse hover.
- Tooltip must display the hovered date and metric value.
- This applies to DAU, MAU, task creation, and task completion charts.
- Tooltip values must be easy to read and must not obscure the chart point being inspected.

## 5. Metric Definitions

### 5.1. DAU
- Count of unique users who performed at least one meaningful action on a given day.
- Meaningful actions can include login, task creation, task status change, or task detail view.
- DAU should be visualized as a date-based chart.

### 5.2. MAU
- Count of unique users who performed at least one meaningful action within a given month.
- MAU should be visualized as a date-based chart.
- MAU by date chart uses rolling 30 days.
- Each chart point counts unique users active within the last 30 days including that date.

### 5.3. Created Task Count
- Count of tasks created during a selected period.

### 5.4. Completed Task Count
- Count of tasks whose status changed to `done` during a selected period.

### 5.5. Completion Rate
- `completed task count / total task count` for the selected period.
- Exact denominator can be revisited during implementation.

### 5.6. Overdue Task Count
- Count of tasks where `dueDate < today` and `status = undone`.

## 6. Data Requirements

### 6.1. User Data
- `id`
- `role`
- `status`
- `createdAt`
- `lastLoginAt`

### 6.2. Task Data
- `id`
- `userId`
- `taskName`
- `createdAt`
- `startDate`
- `dueDate`
- `status`

### 6.3. Activity Log Data
Activity logs are recommended for accurate DAU and MAU calculation.

- `id`
- `userId`
- `eventType`
- `createdAt`
- `metadata`

## 7. Admin UX Rules

### 7.1. Safety Rules
- Destructive account actions must require confirmation.
- Account deletion must require an explicit confirmation step.
- Role changes must require confirmation.
- Admin should not accidentally deactivate their own account.
- Admin should not be able to delete their own account from the admin UI.

### 7.2. Privacy Rules
- Admin screens should avoid showing full task content unless necessary.
- Aggregated statistics should be preferred over raw user data.
- User-specific task inspection should be limited or explicitly justified.

### 7.3. Empty And Loading States
- Tables must show loading states during fetch.
- Empty results must show explicit empty-state messages.
- Metric cards must show fallback states when data is unavailable.

## 8. Open Decisions
- Whether account deletion should be hard delete or soft delete.
- Whether deleted accounts can be restored.
- Whether admins can inspect individual task details.
- Whether password reset is handled directly by admin or through reset email flow.
- Whether role management supports only `user/admin` or more granular roles later.
- Whether activity tracking should be event-based from the start.
- Which metric should be treated as the primary north-star metric.
