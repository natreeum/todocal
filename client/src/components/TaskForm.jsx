import React, { useState } from 'react';

function TaskForm({ formattedDate, defaultDueDate, minDueDate, onSave, onCancel }) {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSaved = await onSave({ taskName, dueDate });

    if (isSaved) {
      setTaskName('');
      setDueDate(defaultDueDate);
    }
  };

  return (
    <div className="backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Add Task</h2>
            <p className="modal-subtitle">Add Task Popup</p>
          </div>
          <button className="ghost-button" onClick={onCancel}>Close</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Task Name</span>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={minDueDate}
              required
            />
          </label>

          <p className="modal-subtitle">
            Due Date defaults to {formattedDate}. Start Date is set automatically when the task is saved.
          </p>

          <div className="stack-actions">
            <button className="primary-button" type="submit">ADD</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskForm;
