import React, { useState } from 'react';
import { apiUrl } from '../config';

const EMPTY_SUMMARY = {
  dau: 0,
  mau: 0,
  totalUsers: 0,
  totalTasks: 0,
  tasksCreatedToday: 0,
  completionRate: 0,
  doneTasks: 0,
  undoneTasks: 0,
  tasksDueToday: 0,
  overdueTasks: 0,
};

const EMPTY_MONITORING = {
  bucketSizeMinutes: 5,
  windowMinutes: 60,
  apiResponseTime: [],
  statusCodes: [],
  sqlQueryDuration: [],
};

function TrendChart({ title, points, series }) {
  const [tooltip, setTooltip] = useState(null);
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => series.map((item) => point[item.key] || 0)),
  );

  return (
    <article className="admin-chart-card">
      <div>
        <h3>{title}</h3>
        <p className="modal-subtitle">Last 14 days</p>
      </div>
      <div className="admin-chart">
        {points.map((point) => (
          <div className="admin-chart-day" key={point.date}>
            <div className="admin-chart-bars">
              {series.map((item) => (
                <span
                  key={item.key}
                  className={`admin-chart-bar ${item.key}`}
                  style={{ height: `${Math.max(8, ((point[item.key] || 0) / maxValue) * 100)}%` }}
                  onMouseEnter={() => setTooltip({
                    date: point.date,
                    label: item.label,
                    value: point[item.key] || 0,
                  })}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={() => setTooltip({
                    date: point.date,
                    label: item.label,
                    value: point[item.key] || 0,
                  })}
                  onBlur={() => setTooltip(null)}
                  tabIndex={0}
                />
              ))}
            </div>
            <small>{point.date.slice(5)}</small>
          </div>
        ))}
        {tooltip && (
          <div className="admin-chart-tooltip">
            <strong>{tooltip.date}</strong>
            <span>{tooltip.label}: {tooltip.value}</span>
          </div>
        )}
      </div>
      <div className="admin-chart-legend">
        {series.map((item) => (
          <span key={item.key}>
            <i className={`admin-legend-dot ${item.key}`} />
            {item.label}
          </span>
        ))}
      </div>
    </article>
  );
}

function LinearGraph({ title, subtitle, points, series, unit = '' }) {
  const [tooltip, setTooltip] = useState(null);
  const chartWidth = 680;
  const chartHeight = 220;
  const padding = 28;
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => series.map((item) => point[item.key] || 0)),
  );
  const xStep = points.length > 1 ? (chartWidth - (padding * 2)) / (points.length - 1) : 0;
  const getX = (index) => padding + (index * xStep);
  const getY = (value) => chartHeight - padding - (((value || 0) / maxValue) * (chartHeight - (padding * 2)));

  return (
    <article className="admin-chart-card admin-line-card">
      <div>
        <h3>{title}</h3>
        <p className="modal-subtitle">{subtitle}</p>
      </div>

      {points.length === 0 ? (
        <div className="empty-state">No monitoring samples yet.</div>
      ) : (
        <div className="admin-line-chart">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={title}>
            <line className="admin-line-axis" x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} />
            <line className="admin-line-axis" x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} />
            {series.map((item) => {
              const pathPoints = points
                .map((point, index) => `${getX(index)},${getY(point[item.key])}`)
                .join(' ');

              return (
                <polyline
                  key={item.key}
                  className={`admin-line-series ${item.key}`}
                  points={pathPoints}
                  style={{ stroke: item.color }}
                />
              );
            })}
            {points.map((point, index) => series.map((item) => (
              <circle
                key={`${point.bucket}-${item.key}`}
                className="admin-line-point"
                cx={getX(index)}
                cy={getY(point[item.key])}
                r="4"
                style={{ fill: item.color }}
                onMouseEnter={() => setTooltip({
                  label: point.label,
                  series: item.label,
                  value: point[item.key] || 0,
                })}
                onMouseLeave={() => setTooltip(null)}
                onFocus={() => setTooltip({
                  label: point.label,
                  series: item.label,
                  value: point[item.key] || 0,
                })}
                onBlur={() => setTooltip(null)}
                tabIndex={0}
              />
            )))}
          </svg>
          <div className="admin-line-labels">
            <span>{points[0]?.label}</span>
            <span>{points[points.length - 1]?.label}</span>
          </div>
          {tooltip && (
            <div className="admin-chart-tooltip">
              <strong>{tooltip.label}</strong>
              <span>{tooltip.series}: {tooltip.value}{unit}</span>
            </div>
          )}
        </div>
      )}

      <div className="admin-chart-legend">
        {series.map((item) => (
          <span key={item.key}>
            <i className="admin-legend-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </article>
  );
}

function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [trends, setTrends] = useState([]);
  const [monitoring, setMonitoring] = useState(EMPTY_MONITORING);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const adminHeaders = (nextAdmin = admin) => ({
    'Content-Type': 'application/json',
    'x-admin-user-id': `${nextAdmin.id}`,
  });

  const fetchAdminData = async (nextAdmin = admin) => {
    if (!nextAdmin) return;

    setIsLoading(true);
    setMessage('');

    try {
      const searchParams = new URLSearchParams();
      if (search) {
        searchParams.set('search', search);
      }
      if (statusFilter !== 'all') {
        searchParams.set('status', statusFilter);
      }

      const [summaryResponse, usersResponse, trendsResponse, monitoringResponse] = await Promise.all([
        fetch(apiUrl('/admin/summary'), {
          headers: adminHeaders(nextAdmin),
        }),
        fetch(apiUrl(`/admin/users?${searchParams.toString()}`), {
          headers: adminHeaders(nextAdmin),
        }),
        fetch(apiUrl('/admin/trends'), {
          headers: adminHeaders(nextAdmin),
        }),
        fetch(apiUrl('/admin/monitoring'), {
          headers: adminHeaders(nextAdmin),
        }),
      ]);

      if (!summaryResponse.ok || !usersResponse.ok || !trendsResponse.ok || !monitoringResponse.ok) {
        setMessage('Admin data request failed. Check admin access.');
        return;
      }

      setSummary(await summaryResponse.json());
      setUsers(await usersResponse.json());
      setTrends(await trendsResponse.json());
      setMonitoring(await monitoringResponse.json());
    } catch (error) {
      console.error('Admin data error:', error);
      setMessage('Network error while loading admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(apiUrl('/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || 'Admin login failed.');
        return;
      }

      if (data.role !== 'admin') {
        setMessage('Admin role is required for /adminpage.');
        return;
      }

      const nextAdmin = { id: data.userId, username: data.username, role: data.role };
      setAdmin(nextAdmin);
      await fetchAdminData(nextAdmin);
    } catch (error) {
      console.error('Admin login error:', error);
      setMessage('Network error while signing in.');
    }
  };

  const handleStatusChange = async (user, nextStatus) => {
    if (!window.confirm(`Change ${user.username} status to ${nextStatus}?`)) return;

    try {
      const response = await fetch(apiUrl(`/admin/users/${user.id}/status`), {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to update user status.');
        return;
      }

      await fetchAdminData();
    } catch (error) {
      console.error('User status error:', error);
      setMessage('Network error while updating user status.');
    }
  };

  const handleRoleChange = async (user, nextRole) => {
    if (!window.confirm(`Change ${user.username} role to ${nextRole}?`)) return;

    try {
      const response = await fetch(apiUrl(`/admin/users/${user.id}/role`), {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to update user role.');
        return;
      }

      await fetchAdminData();
    } catch (error) {
      console.error('User role error:', error);
      setMessage('Network error while updating user role.');
    }
  };

  const handlePasswordReset = async (user) => {
    const nextPassword = window.prompt(`Enter a temporary password for ${user.username}`);
    if (!nextPassword) return;

    try {
      const response = await fetch(apiUrl(`/admin/users/${user.id}/password`), {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ password: nextPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to reset password.');
        return;
      }

      setMessage(`Password reset for ${user.username}.`);
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage('Network error while resetting password.');
    }
  };

  const handleAccountDelete = async (user) => {
    if (user.id === admin.id) {
      setMessage('Admin cannot delete their own account.');
      return;
    }

    if (!window.confirm(`Delete ${user.username}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(apiUrl(`/admin/users/${user.id}`), {
        method: 'DELETE',
        headers: adminHeaders(),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to delete account.');
        return;
      }

      setMessage(`Deleted account ${user.username}.`);
      await fetchAdminData();
    } catch (error) {
      console.error('Account delete error:', error);
      setMessage('Network error while deleting account.');
    }
  };

  if (!admin) {
    return (
      <div className="app-shell admin-shell">
        <section className="auth-card admin-login-card">
          <div className="auth-copy">
            <h1>Admin Page</h1>
            <p>Sign in with an authorized admin account to access service management.</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="field">
                <span>ID</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>PW</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </form>
            <p className="status-text">{message}</p>
          </div>
          <div className="auth-actions">
            <button className="primary-button" onClick={handleLogin}>Sign In</button>
            <button className="ghost-button" onClick={() => { window.location.href = '/'; }}>Back to App</button>
          </div>
        </section>
      </div>
    );
  }

  const metricCards = [
    ['DAU', summary.dau],
    ['MAU', summary.mau],
    ['Total Users', summary.totalUsers],
    ['Total Tasks', summary.totalTasks],
    ['Tasks Created Today', summary.tasksCreatedToday],
    ['Completion Rate', `${summary.completionRate}%`],
    ['Done Tasks', summary.doneTasks],
    ['Undone Tasks', summary.undoneTasks],
    ['Due Today', summary.tasksDueToday],
    ['Overdue', summary.overdueTasks],
  ];

  return (
    <div className="app-shell admin-shell">
      <section className="admin-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Signed in as {admin.username}. Monitor aggregated usage and manage accounts.
            </p>
          </div>
          <div className="calendar-nav">
            <button className="ghost-button" onClick={() => fetchAdminData()}>Refresh</button>
            <button className="ghost-button" onClick={() => setAdmin(null)}>Logout</button>
          </div>
        </header>

        {message && <div className="admin-alert">{message}</div>}

        <div className="admin-metric-grid">
          {metricCards.map(([label, value]) => (
            <article className="admin-metric-card" key={label}>
              <span>{label}</span>
              <strong>{isLoading ? '...' : value}</strong>
            </article>
          ))}
        </div>

        <section className="admin-chart-grid">
          <TrendChart
            title="User Activity"
            points={trends}
            series={[
              { key: 'dau', label: 'DAU' },
              { key: 'mau', label: 'MAU' },
            ]}
          />
          <TrendChart
            title="Task Activity"
            points={trends}
            series={[
              { key: 'tasksCreated', label: 'Created' },
              { key: 'tasksCompleted', label: 'Completed' },
            ]}
          />
        </section>

        <section className="admin-panel">
          <div>
            <h2>System Monitoring</h2>
            <p className="modal-subtitle">
              Runtime metrics for the recent {monitoring.windowMinutes} minutes, bucketed by {monitoring.bucketSizeMinutes} minutes.
            </p>
          </div>
          <div className="admin-chart-grid">
            <LinearGraph
              title="API Response Time"
              subtitle="Average, p95, and max latency"
              points={monitoring.apiResponseTime}
              unit="ms"
              series={[
                { key: 'avg', label: 'Avg', color: '#0f766e' },
                { key: 'p95', label: 'p95', color: '#f97316' },
                { key: 'max', label: 'Max', color: '#dc2626' },
              ]}
            />
            <LinearGraph
              title="Status Code Distribution"
              subtitle="Response count by status family"
              points={monitoring.statusCodes}
              series={[
                { key: 'success', label: '2xx', color: '#059669' },
                { key: 'clientError', label: '4xx', color: '#f97316' },
                { key: 'serverError', label: '5xx', color: '#dc2626' },
              ]}
            />
            <LinearGraph
              title="SQL Query Duration"
              subtitle="Average, p95, and max query duration"
              points={monitoring.sqlQueryDuration}
              unit="ms"
              series={[
                { key: 'avg', label: 'Avg', color: '#2563eb' },
                { key: 'p95', label: 'p95', color: '#7c3aed' },
                { key: 'max', label: 'Max', color: '#be123c' },
              ]}
            />
          </div>
        </section>

        <section className="admin-panel">
          <div className="modal-header">
            <div>
              <h2>Account Management</h2>
              <p className="modal-subtitle">Search, filter, and manage account-level settings.</p>
            </div>
            <form
              className="admin-filter-bar"
              onSubmit={(e) => {
                e.preventDefault();
                fetchAdminData();
              }}
            >
              <input
                type="search"
                placeholder="Search ID or username"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="primary-button" type="submit">Apply</button>
            </form>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users match the current filter.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th>Tasks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>{user.createdAt || '-'}</td>
                      <td>{user.lastLoginAt || '-'}</td>
                      <td>{user.totalTaskCount}</td>
                      <td>
                        <div className="admin-action-row">
                          <button
                            className="ghost-button"
                            onClick={() => handleStatusChange(user, user.status === 'active' ? 'inactive' : 'active')}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="ghost-button"
                            onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                          >
                            Make {user.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            className="ghost-button"
                            onClick={() => handlePasswordReset(user)}
                          >
                            Reset PW
                          </button>
                          <button
                            className="danger-button"
                            disabled={user.id === admin.id}
                            onClick={() => handleAccountDelete(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default AdminPage;
