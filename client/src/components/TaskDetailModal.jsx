import React from 'react';

function TaskDetailModal({ task, onClose, onToggleStatus, onDelete }) {
  return (
    <div className="backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Task Detail</h2>
            <p className="modal-subtitle">{task.taskName}</p>
          </div>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>

        <div className="detail-grid">
          <div className="detail-row">
            <span>Created</span>
            <strong>{task.createdAt}</strong>
          </div>
          <div className="detail-row">
            <span>Start Date</span>
            <strong>{task.startDate}</strong>
          </div>
          <div className="detail-row">
            <span>Due Date</span>
            <strong>{task.dueDate}</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <strong>{task.status}</strong>
          </div>
          <div className="detail-row">
            <span>Selected Date</span>
            <strong>{task.selectedDate}</strong>
          </div>
        </div>

        <div className="stack-actions">
          <div className="status-toggle" aria-label="Task status toggle">
            {['undone', 'done'].map((status) => (
              <button
                key={status}
                className={`${task.status === status ? 'is-active' : ''} is-${status}`.trim()}
                disabled={task.status === status}
                onClick={onToggleStatus}
              >
                {status}
              </button>
            ))}
          </div>
          <button className="danger-button" onClick={onDelete}>Delete Task</button>
        </div>
      </section>
    </div>
  );
}

export default TaskDetailModal;
