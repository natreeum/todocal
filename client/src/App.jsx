import React, { useState } from 'react';
import Auth from './components/Auth';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskDetailModal from './components/TaskDetailModal';
import DateTaskPopup from './components/DateTaskPopup';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import AdminPage from './components/AdminPage';
import { apiUrl } from './config';

const formatDisplayDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const todayString = () => new Date().toISOString().split('T')[0];
const headerMessages = [
  'Have a good day.',
  "Let's make today productive.",
  'Small steps count.',
  "You've got this.",
  'Stay focused and keep going.',
  'One task at a time.',
  'Make today count.',
  'Keep your momentum.',
  'Ready to plan your day?',
  "Let's get things done.",
];
const statusRank = {
  undone: 0,
  done: 1,
};

const sortByStatusThenDueDate = (left, right) => {
  const statusDiff = (statusRank[left.status] ?? 99) - (statusRank[right.status] ?? 99);
  if (statusDiff !== 0) return statusDiff;

  const dueDateDiff = left.dueDate.localeCompare(right.dueDate);
  if (dueDateDiff !== 0) return dueDateDiff;

  return left.taskName.localeCompare(right.taskName);
};

function MainApp() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState(todayString());
  const [headerMessage, setHeaderMessage] = useState(
    () => headerMessages[Math.floor(Math.random() * headerMessages.length)],
  );

  const fetchTasks = async (nextUserId = user?.id) => {
    if (!nextUserId) return;

    try {
      const response = await fetch(apiUrl(`/tasks/${nextUserId}`));
      if (!response.ok) {
        console.error('Failed to fetch tasks');
        return;
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleAuthSuccess = async (nextUser) => {
    setHeaderMessage(headerMessages[Math.floor(Math.random() * headerMessages.length)]);
    setUser(nextUser);
    await fetchTasks(nextUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setSelectedDate(null);
    setIsDatePopupOpen(false);
    setIsAddModalOpen(false);
    setActiveTask(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDraftDueDate(date);
    setIsDatePopupOpen(true);
  };

  const handleMonthChange = (offset) => {
    setCurrentMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1));
  };

  const handleCreateTask = async ({ taskName, dueDate }) => {
    try {
      const response = await fetch(apiUrl('/tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          taskName,
          dueDate,
        }),
      });

      if (!response.ok) {
        console.error('Failed to create task');
        return false;
      }

      await fetchTasks();
      setIsAddModalOpen(false);
      setIsDatePopupOpen(false);
      return true;
    } catch (error) {
      console.error('Network error:', error);
      return false;
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'undone' : 'done';

    try {
      const response = await fetch(apiUrl(`/tasks/${task.id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        console.error('Failed to update task status');
        return;
      }

      await fetchTasks();
      setActiveTask((prevTask) => (prevTask ? { ...prevTask, status: nextStatus } : prevTask));
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(apiUrl(`/tasks/${taskId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to delete task');
        return;
      }

      await fetchTasks();
      setIsDeleteConfirmOpen(false);
      setActiveTask(null);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const today = todayString();
  const activeTasks = tasks
    .filter((task) => task.startDate <= today && today <= task.dueDate)
    .sort(sortByStatusThenDueDate);
  const selectedDateTasks = selectedDate
    ? tasks
        .filter((task) => task.dueDate === selectedDate)
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    : [];

  return (
    <div className="app-shell">
      {!user ? (
        <Auth onAuthenticated={handleAuthSuccess} />
      ) : (
        <div className="dashboard">
          <header className="dashboard-header">
            <div>
              <h1>TodoCal</h1>
              <p className="dashboard-subtitle">
                {user.username ? (
                  <>
                    Welcome <strong>{user.username}</strong>, {headerMessage}
                  </>
                ) : (
                  <>Welcome, {headerMessage}</>
                )}
              </p>
            </div>
            <div className="calendar-nav">
              <button className="primary-button" onClick={() => setIsAddModalOpen(true)}>Add Task</button>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          <div className="split-layout">
            <CalendarView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              tasks={tasks}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
              onTaskSelect={setActiveTask}
            />

            <TaskList
              today={today}
              tasks={activeTasks}
              onSelectTask={setActiveTask}
            />
          </div>

          {isAddModalOpen && (
            <TaskForm
              formattedDate={formatDisplayDate(draftDueDate)}
              defaultDueDate={draftDueDate}
              minDueDate={today}
              onCancel={() => setIsAddModalOpen(false)}
              onSave={handleCreateTask}
            />
          )}

          {isDatePopupOpen && selectedDate && (
            <DateTaskPopup
              formattedDate={formatDisplayDate(selectedDate)}
              tasks={selectedDateTasks}
              onClose={() => setIsDatePopupOpen(false)}
              onAddTask={() => {
                setDraftDueDate(selectedDate);
                setIsDatePopupOpen(false);
                setIsAddModalOpen(true);
              }}
              onSelectTask={setActiveTask}
            />
          )}

          {activeTask && (
            <TaskDetailModal
              task={activeTask}
              onClose={() => setActiveTask(null)}
              onToggleStatus={() => handleToggleStatus(activeTask)}
              onDelete={() => setIsDeleteConfirmOpen(true)}
            />
          )}

          {isDeleteConfirmOpen && activeTask && (
            <DeleteConfirmModal
              taskName={activeTask.taskName}
              onCancel={() => setIsDeleteConfirmOpen(false)}
              onConfirm={() => handleDeleteTask(activeTask.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return window.location.pathname === '/adminpage' ? <AdminPage /> : <MainApp />;
}

export default App;
