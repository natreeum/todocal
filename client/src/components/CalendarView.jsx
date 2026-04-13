import React from 'react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const visibleWeekCount = 4;

const formatStorageDate = (value) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CalendarView({ currentMonth, selectedDate, tasks, onMonthChange, onDateSelect, onTaskSelect }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentMonth);
  const calendarTitle = `${monthLabel} ${year}`;
  const todayDate = new Date();
  const today = formatStorageDate(todayDate);
  const isCurrentCalendarMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;
  const firstVisibleDate = isCurrentCalendarMonth
    ? new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay())
    : new Date(year, month, 1 - firstWeekday);
  const visibleDayCount = visibleWeekCount * weekdays.length;

  const cells = [];

  for (let index = 0; index < visibleDayCount; index += 1) {
    const cellDate = new Date(firstVisibleDate);
    cellDate.setDate(firstVisibleDate.getDate() + index);
    const storageDate = formatStorageDate(cellDate);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isPastDate = storageDate < today;
    const dayTasks = tasks.filter((task) => task.dueDate === storageDate);

    cells.push({
      label: cellDate.getDate(),
      storageDate,
      isCurrentMonth,
      isPastDate,
      dayTasks,
    });
  }

  return (
    <section className="calendar-card">
      <div className="calendar-toolbar">
        <h2>{calendarTitle}</h2>
        <div className="calendar-nav">
          <button className="ghost-button" onClick={() => onMonthChange(-1)}>Prev</button>
          <button className="ghost-button" onClick={() => onMonthChange(1)}>Next</button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {cells.map((cell) => (
          <div
            key={cell.storageDate}
            className={[
              'calendar-day',
              cell.isCurrentMonth ? '' : 'is-outside',
              cell.isPastDate ? 'is-disabled' : '',
              cell.storageDate === today ? 'is-today' : '',
              selectedDate === cell.storageDate ? 'is-context' : '',
            ].join(' ').trim()}
            onClick={cell.isPastDate ? undefined : () => onDateSelect(cell.storageDate)}
            role={cell.isPastDate ? undefined : 'button'}
            tabIndex={cell.isPastDate ? undefined : 0}
            onKeyDown={cell.isPastDate ? undefined : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onDateSelect(cell.storageDate);
              }
            }}
          >
            <span className="day-number">{cell.label}</span>
            <div className="day-task-stack">
              {cell.dayTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  className={`day-pill ${task.status}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onTaskSelect(task);
                  }}
                >
                  {task.taskName}
                </button>
              ))}
              {cell.dayTasks.length > 3 && (
                <span className="day-more day-more-desktop">+{cell.dayTasks.length - 3} more</span>
              )}
              {cell.dayTasks.length > 2 && (
                <span className="day-more day-more-mobile">+{cell.dayTasks.length - 2} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CalendarView;
