import React from 'react';

function TaskList({ today, tasks, onSelectTask }) {
  return (
    <aside className="task-panel">
      <div className="task-panel-header">
        <div>
          <h2>Active Tasks</h2>
          <p className="modal-subtitle">Today in Range: {today}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">No active tasks match today&apos;s range.</div>
      ) : (
        <div className="task-popup-list">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={`task-panel-item ${task.status}`}
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
    </aside>
  );
}

export default TaskList;
