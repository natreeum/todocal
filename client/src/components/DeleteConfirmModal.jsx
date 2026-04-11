import React from 'react';

function DeleteConfirmModal({ taskName, onCancel, onConfirm }) {
  return (
    <div className="backdrop">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Delete Task?</h2>
            <p className="modal-subtitle">This action cannot be undone.</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-row">
            <span>Task</span>
            <strong>{taskName}</strong>
          </div>
        </div>

        <div className="calendar-nav">
          <button className="ghost-button" onClick={onCancel}>Cancel</button>
          <button className="danger-button" onClick={onConfirm}>Delete</button>
        </div>
      </section>
    </div>
  );
}

export default DeleteConfirmModal;
