# Wireframe Specification

## 1. Login Screen

### Purpose
Authenticate existing users and provide entry to the sign-up flow.

### Layout
- Centered card layout
- Left area for credential input
- Right area for primary sign-in action
- Secondary sign-up action placed below the primary button

### UI Elements
- Title: `Login`
- Input: `ID`
- Input: `PW`
- Button: `Sign In`
- Button: `Sign Up`

### User Actions
- Enter ID and password
- Click `Sign In` to authenticate
- Click `Sign Up` to move to registration flow
- Sign-up must fail when ID or password is empty

### ASCII Wireframe
```text
+-----------------------------------------------------------+
| Login                                                     |
|                                                           |
|        ID   [____________________]   [   Sign In   ]      |
|        PW   [____________________]                        |
|                                         [   Sign Up ]     |
|                                                           |
+-----------------------------------------------------------+
```


## 2. Sign-Up Validation Notes

### Purpose
Prevent invalid account creation from the sign-up flow.

### Validation Rules
- ID is required
- Password is required
- Whitespace-only values are invalid
- Duplicate ID is invalid
- Password must satisfy the configured password policy

### ASCII Wireframe
```text
+-----------------------------------------------------------+
| Sign Up                                                   |
|                                                           |
|        ID   [____________________]                        |
|             ID is required                                |
|        PW   [____________________]                        |
|             Password is required                          |
|                                                           |
|                              [ Sign Up disabled ]         |
|                                                           |
+-----------------------------------------------------------+
```

## 3. Main Split Screen

### Purpose
Provide the TodoCal main workspace with a due-date calendar on the left and an active task list on the right.

### Layout
- Left 2/3: monthly calendar view
- Right 1/3: active task list panel
- Shared page-level layout, always visible after login

### UI Elements
- Product header: `TodoCal`
- Month title: `April`
- Weekday labels: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`
- Calendar grid with task chips rendered only on `dueDate`
- Current date cell visually highlighted
- Past date cells disabled or non-selectable
- Right-side task list titled for active tasks
- Task rows in the right panel

### User Actions
- Click a selectable date cell to open that date's active task list popup
- Click a task chip in the calendar to open task detail popup
- Click a task row in the task list to open the same task detail popup

### ASCII Wireframe
```text
+--------------------------------------------------------------------------------------+
| TodoCal                                                                              |
|                                                                                      |
| +--------------------------------------------------------------+ +-----------------+ |
| | April                                                        | | Active Tasks    | |
| | Sun  Mon  Tue  Wed  Thu  Fri  Sat                            | | Today in Range  | |
| | +----+----+----+----+----+----+----+                         | |                 | |
| | | xx | xx | xx | 1* | 2  | 3  | 4  |                         | | Task A          | |
| | +----+----+----+----+----+----+----+                         | | ~~Task B~~      | |
| | | 5  | 6  | 7  | 8  | 9  | 10 | 11 |                         | | Task C          | |
| | |    |    |    |    |    | [Task]|[Task]|                    | | ~~Task D~~      | |
| | +----+----+----+----+----+----+----+                         | |                 | |
| | | 12 | 13 | 14 | 15 | 16 | 17 | 18 |                         | | done: strike +  | |
| | |[T] |[T] |[T] |[T] |[T] |[T] |    |                         | | light text      | |
| | +----+----+----+----+----+----+----+                         | +-----------------+ |
| | * current date highlight, no selected border change          |                     |
| +--------------------------------------------------------------+                     |
|                                                                                      |
+--------------------------------------------------------------------------------------+
```

## 4. Calendar View Rules

### Purpose
Define how tasks and date selection behave in the calendar area.

### Display Rules
- Tasks are shown only on the `dueDate` cell
- Tasks are not rendered across every date from `startDate` to `dueDate`
- Multiple tasks can appear in the same due date cell
- The current date must be visually highlighted for quick recognition

### Date Selection Rules
- Only today and future dates are selectable
- Past dates are disabled or non-interactive
- Clicking a date opens the date active task list popup
- Clicking a date must not change the border color of the selected cell

### Interaction
- Clicking any task chip opens the task detail popup

## 5. Right Task List Panel

### Purpose
Show tasks that are currently active relative to today.

### Layout
- Fixed right-side panel taking 1/3 of the main screen
- Vertical list of task rows
- Visual distinction between active incomplete and completed tasks

### Filtering Rule
- Show only tasks where `startDate <= today <= dueDate`

### Visual Rules
- `undone`: normal text
- `done`: strikethrough and lighter text color

### User Actions
- Click a task row to open the task detail popup

### ASCII Wireframe
```text
+---------------------------+
| Active Tasks              |
| Today in Range            |
|                           |
| Task A                    |
| ~~Task B~~                |
| Task C                    |
| ~~Task D~~                |
|                           |
| done -> strike + light    |
+---------------------------+
```

## 6. Date Active Task List Popup

### Purpose
Show the tasks active on the date selected from the calendar.

### Layout
- Modal popup displayed above the main split screen
- Selected date shown at the top-left
- Active task list shown in the body
- Add Task button placed at the top-right or lower action area

### Filtering Rule
- Show only tasks where `startDate <= selectedDate <= dueDate`

### UI Elements
- Selected date label
- Active task list
- Button: `Add Task`

### User Actions
- Review tasks active on the selected date
- Click a task row to open the task detail popup
- Click `Add Task` to open the add task popup with the selected date as `dueDate`

### ASCII Wireframe
```text
+-----------------------------------------------------------+
| 10 April                                  [ Add Task ]    |
|                                                           |
| Active Tasks On Selected Date                             |
| - Task 1                                                  |
| - ~~Task 2~~                                              |
| - Task 3                                                  |
|                                                           |
+-----------------------------------------------------------+
```

## 7. Add Task Popup

### Purpose
Allow the user to create a new task.

### Layout
- Modal popup
- Input form stacked vertically
- Confirmation button aligned at the lower-right area

### UI Elements
- Input: `Task Name`
- Input: `Due Date`
- Button: `ADD`

### User Actions
- Enter task name
- Confirm due date
- Click `ADD` to save task

### Rules
- `Start Date` is not shown as an input
- `Start Date` is automatically set when the task is saved
- Dates before today are not selectable in the due date input
- When opened from the date active task list popup, the due date is pre-filled with the selected date

### ASCII Wireframe
```text
+---------------------------------------------------+
| Add Task                                          |
|                                                   |
| Task Name : [______________________________]      |
| Due Date  : [ 10 / April / YYYY ]                 |
|                                                   |
|                                   [    ADD    ]   |
|                                                   |
+---------------------------------------------------+
```

## 8. Delete Confirmation Popup

### Purpose
Prevent accidental task deletion from the task detail popup.

### Open Condition
- Opens when the user clicks `Delete Task` in the task detail popup.

### UI Elements
- Confirmation message
- Button: `Cancel`
- Button: `Delete`

### User Actions
- Click `Cancel` to close without deleting
- Click `Delete` to confirm task deletion

### ASCII Wireframe
```text
+-------------------------------------------+
| Delete Task?                              |
|                                           |
| This action cannot be undone.             |
|                                           |
|              [ Cancel ] [ Delete ]        |
+-------------------------------------------+
```

## 9. Task Detail Popup

### Purpose
Present the full metadata of a selected task from any entry point.

### Layout
- Detail modal layout
- Task title at the top with strong visual emphasis
- Metadata fields listed vertically below
- Selected date is not shown in this popup
- Start Date is not shown because it duplicates Created
- Status change action at the bottom or side area

### UI Elements
- Task title
- Field: `Created`
- Field: `Due Date`
- Field: `Status`
- Toggle: `Undone | Done`
- Toggle colors: `Undone` and `Done` must be visually distinct
- Button: `Delete Task`

### User Actions
- Inspect task information
- Check whether the task is `done` or `undone`
- Toggle between `Undone` and `Done` to update the task state
- Click `Delete Task` to open deletion confirmation

### Entry Points
- Calendar task click
- Right task list click
- Date active task list popup click

### ASCII Wireframe
```text
+---------------------------------------------------+
| Task Detail                                       |
|                                                   |
| TASK 1                                            |
|                                                   |
| Created : YYYY.MM.DD                              |
| Due Date: YYYY.MM.DD                              |
| Status  : undone                                  |
|                                                   |
|             [ Undone | Done ] [ Delete Task ]     |
|             colors: undone != done                 |
|                                                   |
+---------------------------------------------------+
```

## 10. Responsive Layout Notes

### Desktop
- Keep the split layout: left calendar view at 2/3 width and right active task list at 1/3 width.

### Mobile
- Stack sections vertically.
- Order sections as:
  - Active Tasks
  - Calendar View

## 11. Screen Flow Summary

```text
Login
  -> Main Split Screen
  -> Calendar Date Click ----------> Date Active Task List Popup
  -> Calendar Task Click ---------->| 
  -> Right Task List Click -------->|-> Task Detail Popup
  -> Date Popup Task Click -------->| 
  -> Date Popup Add Task ----------> Add Task Popup
  -> Task Detail Delete Click -----> Delete Confirmation Popup
```

## 12. Interaction Notes
- The application uses a split layout: calendar on the left, active task list on the right
- The calendar visualizes due dates only
- The current date should stand out visually in the calendar grid
- Past dates must not be selectable in the calendar or in the add task due date input
- Clicking a date opens a date-specific active task list popup
- Clicking a date must not change the date cell border color
- The right-side list visualizes tasks active on today's date
- The date popup visualizes tasks active on the selected date
- Completed tasks in task lists must be styled with strikethrough and lighter text
- Clicking a task from the calendar, the right task list, or the date popup must open the same task detail popup


## 14. Browser Metadata Notes
- Browser title: `TodoCal`
- Favicon: `📆`
- Do not keep the default Vite favicon or `client` title

