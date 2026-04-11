import React from 'react';

function DateTaskPopup({ selectedDate, formattedDate, tasks, onClose, onAddTask, onSelectTask }) {
  return (
    <div className="backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <h2>{formattedDate}</h2>
            <p className="modal-subtitle">Active Tasks On Selected Date: {selectedDate}</p>
          </div>
          <div className="calendar-nav">
            <button className="primary-button" onClick={onAddTask}>Add Task</button>
            <button className="ghost-button" onClick={onClose}>Close</button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">No active tasks match this selected date.</div>
        ) : (
          <div className="task-popup-list">
            {tasks.map((task) => (
              <button
                key={task.id}
                className={`task-popup-item ${task.status}`}
                onClick={() => onSelectTask(task)}
              >
                <div>
                  <strong>{task.taskName}</strong>
                  <small>
                    Created {task.createdAt} / Due {task.dueDate}
                  </small>
                </div>
                <span className={`status-chip ${task.status}`}>{task.status}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DateTaskPopup;
