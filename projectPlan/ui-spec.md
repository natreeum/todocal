# UI Specification

## 1. Document Purpose
This document defines the concrete UI behavior and visual interaction rules for the TodoCal application.
It is intended to bridge the gap between product planning and implementation.


## 2. Product Header Spec
- Product name is `TodoCal`
- Main header must display `TodoCal`
- Generic labels such as `Main Calendar` should not be used as the product title
- The product name communicates the Todo + Calendar concept

## 3. Global Layout Spec

### 3.1. Main Application Layout
- The main screen uses a two-column layout.
- Left area occupies approximately 2/3 width of the content area.
- Right area occupies approximately 1/3 width of the content area.
- Left area contains the monthly calendar view.
- Right area contains the active task list for today.

### 3.2. Layout Priorities
- The calendar is the primary visual focus on desktop.
- The right task list is a supporting but always-visible panel on desktop.
- Both areas must remain visible on desktop layout.

### 3.3. Responsive Layout Rules
- Desktop layout uses a two-column structure.
- Desktop ratio is calendar 2/3 and active task list 1/3.
- Mobile layout stacks sections vertically.
- Mobile order must be:
  - Active task section
  - Calendar view

### 3.4. Layering Rules
- Main screen is the base layer.
- Date active task popup appears above the main screen.
- Add task popup appears above the date popup or above the main screen depending on entry context.
- Task detail popup appears above the current interaction layer.


## 3. Sign-Up Validation Spec

### 3.1. Required Fields
- `ID` is required.
- `Password` is required.
- Empty string must be invalid.
- Whitespace-only input must be trimmed and treated as empty.

### 3.2. ID Rules
- ID must be unique.
- Duplicate ID must show a validation error.
- ID validation must run before account creation.

### 3.3. Password Rules
- Password must not be empty.
- Password must have a minimum length of 4 characters.
- Any character type is allowed.
- No letter, number, or special character composition rule is required.

### 3.4. Submit Rules
- Sign-up submit must be disabled or blocked while required fields are invalid.
- The server must validate the same rules even if frontend validation is bypassed.
- Account creation must not happen until all required validation passes.

### 3.5. Error Message Rules
- Missing ID: show `ID is required` or equivalent localized message.
- Missing password: show `Password is required` or equivalent localized message.
- Duplicate ID: show `ID already exists` or equivalent localized message.
- Invalid password policy: show that password must be at least 4 characters long.

## 4. Calendar View Spec

### 3.1. Calendar Structure
- Display the current month label at the top-left.
- Display weekday headers in this order: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`.
- Render dates in a monthly grid.
- Calendar tasks are rendered only on the `dueDate` cell.
- Tasks must not be rendered across the full duration from `startDate` to `dueDate`.

### 3.2. Date Cell States
- `today`
  - Must be visually highlighted.
  - Highlight should rely on background, fill, or badge treatment.
  - Highlight should not depend on border color change.
- `past date`
  - Must be non-selectable.
  - Must appear visually disabled.
  - Disabled state can use lower opacity, muted text, or disabled cursor.
- `future or today`
  - Must be selectable.
  - Click opens the date due task list popup.
- `clicked date`
  - Must not change border color.
  - Selection feedback should be minimal or handled by popup context rather than persistent cell outline.

### 3.3. Task Chip Rules In Calendar
- A task chip appears only on its `dueDate`.
- Multiple task chips may appear inside one date cell.
- Task chips must be clickable.
- Clicking a task chip opens the task detail popup.
- Task chip styling should prioritize readability inside narrow calendar cells.

### 3.4. Calendar Interaction Rules
- Clicking a selectable date opens a popup for that selected date.
- Clicking a task chip opens task detail directly.
- Date click and task click are separate actions.
- Past dates ignore click actions.

## 5. Right Task List Spec

### 4.1. Purpose
- This panel shows tasks active as of today.
- Header must display `Today : YYYY-MM-DD`.
- The `YYYY-MM-DD` value must be bold.

### 4.2. Filtering Rule
- Include tasks where `startDate <= today <= dueDate`.

### 4.3. Task Row Rules
- Each row displays task title, created date, due date, and status.
- Do not render task title, created date, and due date as a single inline sentence.
- Use a compact card or row-block layout.
- Task title must be bold or visually strongest.
- Created and Due dates must be secondary metadata.
- Status should be displayed as a right-aligned badge or compact status element.
- Each row must be clickable.
- Clicking a task row opens the task detail popup.


### 4.3.1. Sorting Rule
- Active task list should group tasks by status.
- `undone` tasks appear before `done` tasks.
- Within each status group, tasks are sorted by `dueDate` ascending.
- This keeps urgent incomplete work visible while preserving due-date ordering.

### 4.4. Active Task Item Layout
- Recommended structure:

```text
Task Title                    status
Created: YYYY-MM-DD
Due:     YYYY-MM-DD
```

- This structure is preferred over `Task Title Created YYYY-MM-DD / Due YYYY-MM-DD` in one line.
- It improves scanability on both desktop and mobile.

### 4.5. Completion Styling
- `undone`
  - Normal text color
  - No strikethrough
- `done`
  - Strikethrough required
  - Lighter text color required
  - Visual hierarchy must clearly indicate completion without hiding readability

### 4.6. Empty State
- If there are no active tasks for today, show an explicit empty-state message.
- Example intent: `No active tasks for today`.

## 6. Date Due Task List Popup Spec

### 5.1. Purpose
- This popup shows tasks whose due date matches the date selected from the calendar.

### 5.2. Open Condition
- Opens when the user clicks a selectable date cell in the calendar.

### 5.3. Filtering Rule
- Include tasks where `dueDate = selectedDate`.

### 5.4. UI Elements
- Selected date label
- Tasks due on selected date
- `Add Task` button
- Close action

### 5.5. Task Row Rules
- Rows in this popup follow the same completion styling rule as the right task list.
- Clicking a task row opens the shared task detail popup.

### 5.6. Add Task Button Rule
- Clicking `Add Task` opens the add task popup.
- The selected date must be passed as the `dueDate` context.

### 5.7. Empty State
- If no tasks are due on the selected date, show an empty-state message and still keep the `Add Task` action visible.


### 6.8. Popup Title Rule
- Selected date is the only title/context label required.
- Do not display a redundant subtitle such as `Tasks Due On Selected Date`.
- Do not render an extra divider line solely for the removed subtitle.
- Task list or empty state should appear directly below the title/action row.

## 7. Add Task Popup Spec

### 6.1. Purpose
- Create a new task with minimal required input.

### 6.2. Inputs
- `Task Name`
- `Due Date`

### 6.3. Date Rules
- Dates before today must not be selectable in the due date input.
- When this popup is opened from the date due task list popup, the selected date must be pre-filled as `dueDate`.
- The user may keep the pre-filled due date or change it to another selectable date unless product rules later restrict it.

### 6.4. Save Rules
- `Start Date` is not user-editable.
- `Start Date` is automatically set at save time.
- Saving creates a task with the chosen `dueDate`.

### 6.5. Validation Rules
- `Task Name` is required.
- `Due Date` is required.
- Invalid save action must be blocked until required inputs are valid.

## 8. Delete Confirmation Spec

### 8.1. Purpose
- Prevent accidental task deletion.

### 8.2. Open Condition
- Opens when the user clicks `Delete Task` from the task detail popup.

### 8.3. Display Content
- Confirmation message
- Cancel action
- Final delete action

### 8.4. Rules
- Deletion must never happen on the first click alone.
- The user must explicitly confirm deletion in a secondary confirmation UI.

## 9. Task Detail Popup Spec

### 9.1. Purpose
- Show a unified detail view for a task regardless of entry point.

### 9.2. Entry Points
- Calendar task chip click
- Right task list row click
- Date due task list popup row click

### 9.3. Display Fields
- `Task Name`
- `Created`
- `Due Date`
- `Status`
- Do not display `selectedDate` in the task detail popup
- Do not display `startDate` in the task detail popup because it duplicates `Created`

### 9.4. Actions
- `Status Toggle`
- `Delete Task`

### 9.5. Shared Behavior Rule
- Task title must have higher visual emphasis than metadata fields.
- Task title must be easy to read at a glance.
- All task entry points must open the same task detail popup UI.
- The displayed task data and available actions must be identical regardless of entry point.

## 10. State And Interaction Spec

### 10.1. Supported UI States
- `default`
- `hover`
- `disabled`
- `today`
- `done`
- `undone`
- `popup open`
- `validation error`

### 10.2. Hover Rules
- Selectable calendar dates may show hover feedback.
- Disabled past dates must not show active hover feedback.
- Task chips and task rows may show hover feedback to indicate clickability.

### 10.3. Disabled Rules
- Past calendar dates are disabled.
- Past dates in the due date input are disabled.
- Disabled elements must look inactive and must not trigger primary actions.

### 10.4. Popup Rules
- Only one primary context popup should be active in front at a time.
- Task detail popup is reusable from multiple entry points.
- Delete confirmation popup is a secondary blocking layer above task detail.
- Popup close behavior should return the user to the previous visible context.


### 9.6. Status Toggle Rule
- Task status must be controlled by a toggle-style UI
- Toggle states are `undone` and `done`
- `undone` and `done` must use visually distinct colors
- Current state must be visually active in the toggle
- Toggling status updates the task status
- After status changes, task list completion styling must update accordingly
- `undone` toggle color should communicate active/incomplete state
- `done` toggle color should communicate success/completed state

## 11. Visual Style Rules

### 11.1. Date Highlighting
- Current date must stand out clearly.
- Do not use border-color change as the main selected-date feedback.

### 11.2. Completed Task Styling
- Completed tasks must use both:
  - strikethrough
  - lighter text color
- This rule applies to the right task list and the date due task list popup.

### 11.3. Click Feedback
- Interactive elements may use hover, subtle fill, shadow, or opacity transitions.
- Date-cell click feedback must avoid persistent border-color emphasis.


### 11.4. Status Toggle Colors
- `undone` and `done` toggle states must use different colors.
- `undone` should use an active/incomplete color, such as amber, orange, or neutral emphasis.
- `done` should use a success/completed color, such as green.
- The selected toggle state must have stronger visual emphasis than the unselected state.
- Color must not be the only indicator; label text must remain visible.

## 12. Responsive Rules

### 12.1. Desktop
- Maintain 2/3 calendar and 1/3 task list layout.

### 12.2. Tablet And Small Widths
- The layout may reduce spacing while preserving both regions if possible.

### 12.3. Mobile
- Use a stacked layout when horizontal space is limited.
- Section order must be:
  - Active task section
  - Calendar view
- Popup interactions must remain usable on small screens.

## 13. Implementation Notes
- Calendar date click and calendar task click must be handled as separate click targets.
- Date popup list filtering uses `selectedDate`.
- Right panel filtering uses `today`.
- Calendar rendering uses `dueDate` only.
- Task detail popup component should be shared, not duplicated.
- Delete confirmation should be implemented as a separate confirmation layer or modal, not as immediate deletion.
- Sign-up validation must be implemented on both frontend and backend.


## 14. Browser Metadata Spec
- Document title must be `TodoCal`
- Favicon must be `📆`
- Default Vite favicon must be removed or replaced
- Default title such as `client` must be replaced with `TodoCal`


## 15. Header Section Spec
- Header title must display `TodoCal`
- Header description format must be `Welcome {username}, {randMessage}`
- Username must be rendered with stronger visual emphasis than the rest of the description
- Username emphasis can use bold font weight or equivalent styling
- `randMessage` must be selected randomly from the predefined encouraging message list
- If username is unavailable, omit the username segment and use `Welcome, {randMessage}`
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

## 16. Login Copy Spec
- Login screen title must display `TodoCal`
- Sign-up screen title must display `TodoCal : SignUp`
- Do not use `Login` as the main screen title
- Remove helper text such as `enter your id`
- Login screen should keep only essential form labels and actions


## 17. Mobile Calendar Display Spec
- Calendar task chips must never wrap into vertical per-character text.
- Task chip text must use single-line truncation with ellipsis on mobile.
- Recommended CSS intent:
  - `white-space: nowrap`
  - `overflow: hidden`
  - `text-overflow: ellipsis`
- On mobile, show at most 1-2 task chips per date cell.
- If the date has more tasks than the visible limit, show `+N more`.
- Persistent selected-date border styling must not be applied.
- Today highlight can use a filled badge or background treatment, but it must not conflict with selected-date interaction.
- Mobile layout order remains Active Tasks first, then Calendar View.
- If the calendar cell becomes too narrow, prefer compact summary such as `3 tasks` or `+N more` over full task titles.

