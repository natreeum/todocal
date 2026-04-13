import React, { useState } from 'react';

function TaskDetailModal({ task, minDueDate, onClose, onToggleStatus, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTaskName, setDraftTaskName] = useState(task.taskName);
  const [draftDueDate, setDraftDueDate] = useState(task.dueDate);

  const handleCancelEdit = () => {
    setDraftTaskName(task.taskName);
    setDraftDueDate(task.dueDate);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextTask = {
      taskName: draftTaskName.trim(),
      dueDate: draftDueDate,
    };
    const isSaved = await onSave(nextTask);

    if (isSaved) {
      setDraftTaskName(nextTask.taskName);
      setDraftDueDate(nextTask.dueDate);
      setIsEditing(false);
    }
  };

  return (
    <div className="backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <h2>{isEditing ? 'Edit Task' : 'Task Detail'}</h2>
            <p className="task-detail-title">{task.taskName}</p>
          </div>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>

        {isEditing ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Task Name</span>
              <input
                type="text"
                value={draftTaskName}
                onChange={(event) => setDraftTaskName(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Due Date</span>
              <input
                type="date"
                value={draftDueDate}
                onChange={(event) => setDraftDueDate(event.target.value)}
                min={minDueDate}
                required
              />
            </label>

            <div className="stack-actions">
              <button className="ghost-button" type="button" onClick={handleCancelEdit}>Cancel</button>
              <button className="primary-button" type="submit">Save</button>
            </div>
          </form>
        ) : (
          <>
            <div className="detail-grid">
              <div className="detail-row">
                <span>Created</span>
                <strong>{task.createdAt}</strong>
              </div>
              <div className="detail-row">
                <span>Due Date</span>
                <strong>{task.dueDate}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong>{task.status}</strong>
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
              <button className="secondary-button" onClick={() => setIsEditing(true)}>Edit Task</button>
              <button className="danger-button" onClick={onDelete}>Delete Task</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default TaskDetailModal;
