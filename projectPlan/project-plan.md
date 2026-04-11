# TodoCal Project Plan

## 1. Project Overview
TodoCal is a calendar-based To-Do Manager web application for managing personal tasks by date.
The primary UX is centered around a split main screen: a calendar view on the left and an active task list on the right. Users can inspect tasks by due date on the calendar, monitor currently active tasks from the side panel, click a date to inspect tasks due on that date, and open the same task detail popup from either entry point.

## 2. Core Screen Structure

### 2.1. Login And Sign-Up Screen
The login screen is the entry point for authentication and provides access to the sign-up flow.
The login screen title must display `TodoCal` instead of `Login`.
The sign-up screen title must display `TodoCal : SignUp`.
Helper copy such as `enter your id` must be removed.

- Layout
  - Center-aligned card UI
  - Two input fields on the left side
  - Primary action button on the right side
  - Secondary sign-up button below the sign-in button
- Inputs
  - ID
  - PW
- Actions
  - Sign In
  - Sign Up
- Notes
  - The login and sign-up entry actions are exposed on the same screen
  - The structure should be simple and immediately recognizable
  - Sign-up must validate ID and password before account creation
  - Empty ID or empty password must never be accepted

### 2.2. Main Screen
The main screen is a split dashboard composed of a calendar view and a task list.

- Layout
  - Left 2/3: monthly calendar view
  - Right 1/3: task list panel
- Calendar Area
  - Product name `TodoCal` displayed as the main header
  - Current month label displayed near the calendar area
  - Weekday header row displayed above the calendar body
  - Weekday order: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  - Date cells arranged in a monthly grid
  - The current date must be visually highlighted in the calendar view
  - Dates before today must not be selectable
  - Clicking a date must not change the border color of that date cell
- Task List Area
  - Displays tasks that are currently active based on today's date
  - A task is included when `startDate <= today <= dueDate`
  - Completed tasks must be rendered with strikethrough and lighter text color
- Interaction
  - Clicking a task in the calendar opens the task detail popup
  - Clicking a task in the task list opens the same task detail popup
  - Clicking a date opens that date's active task list popup

### 2.3. Calendar Task Display Rule
The calendar view is used to show tasks based on due date only.

- Display Rule
  - A task is rendered only on its `dueDate` cell
  - A task is not rendered across the entire period from `startDate` to `dueDate`
- Date Selection Rule
  - Only today and future dates are selectable in the calendar
  - Past dates are visually disabled or non-interactive
  - Selecting a date must not apply a border color change to the cell
- Purpose
  - The calendar acts as a due date visualization layer
  - Duration tracking is handled logically by task data, not by multi-day rendering in the calendar

### 2.4. Right Task List Panel
The right panel is a continuously visible task list for currently active tasks.

- Displayed Information
  - Header text uses `Today : YYYY-MM-DD`
  - The `YYYY-MM-DD` date value must be bold
  - Tasks whose date range contains today
  - Task title
  - Created date
  - Due date
  - Completion state styling
- Filtering Rule
  - Include tasks where `startDate <= today <= dueDate`
- Sorting Rule
  - Active tasks should be grouped by status: `undone` first, then `done`
  - Within each status group, tasks should be sorted by `dueDate` ascending
- Visual Rule
  - Task items should use a card or row-block layout, not a single title-created-due inline sentence
  - Task title must be visually stronger than metadata
  - Created and Due dates should appear as secondary metadata
  - `undone` tasks use normal emphasis
  - `done` tasks use strikethrough and lighter text color
- Interaction
  - Clicking a task opens the task detail popup

### 2.5. Date Due Task List Popup
When the user clicks a selectable date in the calendar, a popup appears with the tasks due on that date.

- Displayed Information
  - Selected date
  - Active task list for that date
- Filtering Rule
  - Include tasks where `dueDate = selectedDate`
- Actions
  - Add Task button
  - Task item click opens task detail popup
- Notes
  - This popup is date-context-aware
  - Do not show a redundant subtitle such as `Tasks Due On Selected Date` under the title
  - Do not show an extra divider under the title solely for that subtitle
  - The popup is the entry point for adding a task whose `dueDate` is the selected date

### 2.6. Add Task Popup
When the user adds a new task, a task creation popup is opened.

- Inputs
  - Task Name
  - Due Date
- Actions
  - ADD
- Rules
  - Start Date is not directly entered by the user
  - Start Date is automatically set at the moment the user saves the task
  - Dates before today must not be selectable as due date
  - When opened from the date due task list popup, the selected date is pre-filled as `dueDate`

### 2.7. Task Detail Popup
When the user selects a task from either the calendar view, the right task list, or the date due task list popup, the application shows a task detail popup.

- Displayed Information
  - Task Name
  - Created
  - Due Date
  - Status
- Actions
  - Status toggle
  - Delete Task button
- Status Values
  - done
  - undone
- Notes
  - Task title must have strong visual emphasis and must be easy to read
  - Selected date is not displayed in the task detail popup
  - Start Date is not displayed in the task detail popup because it has the same value as Created
  - All task entry points must trigger the same popup behavior
  - Status must be clearly visible to the user
  - The detail popup must provide a toggle for changing the task status
  - Deleting a task must require an additional confirmation step

## 3. Functional Requirements

### 3.1. User Authentication
- Users can sign in using ID and password
- Users can enter the sign-up flow from the login screen
- Users can sign up only after passing ID and password validation
- Sign-up must reject empty ID and empty password
- Sign-up must trim whitespace-only input and treat it as empty
- Sign-up must reject duplicate IDs
- Password must be at least 4 characters long

### 3.2. Calendar-Based Task Browsing
- Users can browse tasks through the monthly calendar view
- The calendar displays each task only on its due date
- Clicking a task in the calendar opens the task detail popup
- Clicking a date opens that date's active task list popup
- Past dates in the calendar must not be selectable
- Date selection must not change the clicked cell border color

### 3.3. Active Task Lists
- Users can view currently active tasks in the right-side task list
- The right-side task list shows tasks where `startDate <= today <= dueDate`
- Users can view date-specific due-date tasks from the calendar date popup
- The date-specific due task list shows tasks where `dueDate = selectedDate`
- Completed tasks must be visually differentiated by strikethrough and lighter text color
- Clicking a task in any task list opens the task detail popup

### 3.4. Task Creation
- Users can add a new task through the add task popup
- Required input fields are Task Name and Due Date
- Start Date is automatically stored when the task is saved
- Past dates must not be selectable in the due date input
- When opened from the date due task list popup, the due date is set to the selected date context

### 3.5. Task Status Management
- Each task has a status field
- Status must support `done` and `undone`
- Users must be able to recognize whether a task is completed
- The detail popup must provide a status toggle action

### 3.6. Task Deletion
- Users can delete a task from the task detail popup
- Deleting a task must require an explicit confirmation dialog or confirmation step
- A task must not be deleted immediately on first click

### 3.7. Task Detail Inspection
- Users can open a task detail popup from the calendar, the right task list, and the date due task list popup
- The detail popup must show created date, due date, and current status
- The detail popup must provide a status toggle action


### 3.8. Status Toggle Behavior
- Task status should be changed with a toggle-style control instead of a generic button
- The toggle must support `done` and `undone`
- `undone` and `done` must use different toggle colors
- Current task status must be visually clear
- Changing the toggle updates the task status
- Completed task styling must update after the status changes
- Recommended color intent: `undone` uses an attention/active color, and `done` uses a success/completed color

## 4. User Flow
1. The user opens the login screen.
2. The user signs in or moves to sign-up.
3. After authentication, the user enters the split main screen.
4. The user checks due-date-based tasks in the calendar view.
5. The user checks active tasks in the right-side task list.
6. The user clicks a future or current date in the calendar.
7. A date due task list popup opens for the selected date.
8. The user reviews tasks due on that selected date.
9. The user clicks Add Task in the popup.
10. The add task popup opens with the selected date as the due date context.
11. The user saves the task and the application automatically sets Start Date to the save timestamp.
12. The user can click a task from any task entry point and open the same task detail popup.

## 5. Data Definition

### 5.1. Task Entity
- `id`
- `taskName`
- `createdAt`
- `startDate`
- `dueDate`
- `status`
- `userId`

### 5.2. Derived Display Conditions
- Right task list condition: `startDate <= today <= dueDate`
- Date popup task list condition: `dueDate = selectedDate`
- Calendar display condition: render only on `dueDate`

### 5.3. Status Definition
- `done`: completed task
- `undone`: incomplete task


## 6. Sign-Up Validation Rules
- ID is required
- Password is required
- Whitespace-only ID or password must be treated as empty
- Duplicate ID must be rejected
- Password must be at least 4 characters long
- Sign-up submit must be disabled or blocked until required fields are valid
- Validation errors must be visible to the user

## 7. Responsive Layout Rules
- Desktop layout keeps the split structure: left calendar view at 2/3 width and right active task list at 1/3 width
- Mobile layout stacks content vertically
- In mobile layout, the active task section appears before the calendar view
- Popup interactions must remain usable on smaller screens

## 8. UX Design Intent
- The primary interaction model is a split layout of calendar and active task list
- The calendar is for due date recognition, not full duration rendering
- The right-side list is for surfacing tasks currently in progress based on today's date
- The date popup is for surfacing tasks due on a user-selected date
- Task detail access must be consistent regardless of which task entry point is used
- Completed tasks should be visually distinguishable at a glance
- Task creation should remain minimal and fast
- Past dates must be blocked from selection both in the calendar and in due date input

## 9. Open Design Decisions
- Whether the right-side task list and the date popup task list should be sorted by due date, created date, or status priority should be defined during implementation
- Whether the add task action is placed only inside the date popup or also globally on the main screen should be decided during UI implementation
- Whether the status change in the detail popup is implemented as a toggle button or explicit `done / undone` selection can be finalized during implementation


## 10. Product Naming
- Product name: `TodoCal`
- Main header should display `TodoCal` instead of generic labels such as `Main` or `Main Calendar`
- The name is derived from Todo + Calendar


## 11. Browser Metadata
- Browser title must be `TodoCal`
- Favicon must use the calendar emoji: `📆`
- Default Vite favicon must be replaced
- Default title such as `client` must not be used


## 12. Header Section
- Header title must display `TodoCal`
- Header description format: `Welcome {username}, {randMessage}`
- Username must be visually emphasized, for example with bold text
- `randMessage` is selected randomly from predefined encouraging messages
- If username is unavailable, use `Welcome, {randMessage}`
- Random message candidates:
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
