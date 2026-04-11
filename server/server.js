const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

const TASK_STATUS = {
    DONE: 'done',
    UNDONE: 'undone',
};

const USER_ROLE = {
    ADMIN: 'admin',
    USER: 'user',
};

const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};

const todayString = () => new Date().toISOString().split('T')[0];
const addDaysString = (dateString, days) => {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

app.use(cors());
app.use(express.json());

function normalizeInput(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validatePasswordPolicy(password) {
    if (!password) {
        return 'Password is required.';
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters.';
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Password must include at least one letter and one number.';
    }

    return null;
}

const db = new sqlite3.Database('./todo.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        return;
    }

    console.log('Connected to the SQLite database.');

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        createdAt TEXT,
        lastLoginAt TEXT
    )`, ensureUserSchema);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        title TEXT,
        createdAt TEXT,
        startDate TEXT,
        dueDate TEXT,
        status TEXT NOT NULL DEFAULT 'undone',
        selectedDate TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`, ensureTaskSchema);
});

function ensureUserSchema() {
    db.all('PRAGMA table_info(users)', (err, columns) => {
        if (err) {
            console.error('Error reading user schema', err.message);
            return;
        }

        const columnNames = columns.map((column) => column.name);
        const migrations = [];

        if (!columnNames.includes('role')) {
            migrations.push(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT '${USER_ROLE.USER}'`);
        }
        if (!columnNames.includes('status')) {
            migrations.push(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT '${USER_STATUS.ACTIVE}'`);
        }
        if (!columnNames.includes('createdAt')) {
            migrations.push('ALTER TABLE users ADD COLUMN createdAt TEXT');
        }
        if (!columnNames.includes('lastLoginAt')) {
            migrations.push('ALTER TABLE users ADD COLUMN lastLoginAt TEXT');
        }

        const runBackfill = () => {
            db.run(
                `UPDATE users
                 SET role = COALESCE(role, '${USER_ROLE.USER}'),
                     status = COALESCE(status, '${USER_STATUS.ACTIVE}'),
                     createdAt = COALESCE(createdAt, date('now'))
                 WHERE role IS NULL OR status IS NULL OR createdAt IS NULL`,
                (backfillErr) => {
                    if (backfillErr) {
                        console.error('Error backfilling user schema', backfillErr.message);
                    }
                },
            );
        };

        const runMigration = (index) => {
            if (index >= migrations.length) {
                runBackfill();
                return;
            }

            db.run(migrations[index], (migrationErr) => {
                if (migrationErr) {
                    console.error('Error updating user schema', migrationErr.message);
                }

                runMigration(index + 1);
            });
        };

        runMigration(0);
    });
}

function ensureTaskSchema() {
    db.all('PRAGMA table_info(tasks)', (err, columns) => {
        if (err) {
            console.error('Error reading task schema', err.message);
            return;
        }

        const columnNames = columns.map((column) => column.name);
        const migrations = [];

        if (!columnNames.includes('status')) {
            migrations.push(`ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT '${TASK_STATUS.UNDONE}'`);
        }
        if (!columnNames.includes('createdAt')) {
            migrations.push('ALTER TABLE tasks ADD COLUMN createdAt TEXT');
        }
        if (!columnNames.includes('selectedDate')) {
            migrations.push('ALTER TABLE tasks ADD COLUMN selectedDate TEXT');
        }

        const runBackfill = () => {
            db.run(
                `UPDATE tasks
                 SET createdAt = COALESCE(createdAt, startDate, dueDate, date('now')),
                     selectedDate = COALESCE(selectedDate, startDate, dueDate),
                     status = COALESCE(status, '${TASK_STATUS.UNDONE}')
                 WHERE createdAt IS NULL OR selectedDate IS NULL OR status IS NULL`,
                (backfillErr) => {
                    if (backfillErr) {
                        console.error('Error backfilling task schema', backfillErr.message);
                    }
                },
            );
        };

        const runMigration = (index) => {
            if (index >= migrations.length) {
                runBackfill();
                return;
            }

            db.run(migrations[index], (migrationErr) => {
                if (migrationErr) {
                    console.error('Error updating task schema', migrationErr.message);
                }

                runMigration(index + 1);
            });
        };

        runMigration(0);
    });
}

function normalizeTask(row) {
    return {
        id: row.id,
        userId: row.userId,
        taskName: row.title,
        title: row.title,
        createdAt: row.createdAt,
        startDate: row.startDate,
        dueDate: row.dueDate,
        status: row.status || TASK_STATUS.UNDONE,
        selectedDate: row.selectedDate,
    };
}

function isValidStatus(status) {
    return status === TASK_STATUS.DONE || status === TASK_STATUS.UNDONE;
}

function isValidRole(role) {
    return role === USER_ROLE.ADMIN || role === USER_ROLE.USER;
}

function isValidUserStatus(status) {
    return status === USER_STATUS.ACTIVE || status === USER_STATUS.INACTIVE;
}

function requireAdmin(req, res, next) {
    const adminUserId = req.get('x-admin-user-id');

    if (!adminUserId) {
        return res.status(401).json({ error: 'Admin user id is required.' });
    }

    db.get('SELECT id, role, status FROM users WHERE id = ?', [adminUserId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row || row.role !== USER_ROLE.ADMIN || row.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        req.adminUser = row;
        next();
    });
}

app.post('/register', (req, res) => {
    const username = normalizeInput(req.body.username);
    const password = normalizeInput(req.body.password);
    const passwordError = validatePasswordPolicy(password);

    if (!username) {
        return res.status(400).json({ error: 'ID is required.' });
    }

    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }

    db.run(
        'INSERT INTO users (username, password, role, status, createdAt) VALUES (?, ?, ?, ?, ?)',
        [username, password, USER_ROLE.USER, USER_STATUS.ACTIVE, todayString()],
        function insertUser(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'ID already exists.' });
                }

                return res.status(400).json({ error: err.message });
            }

            res.status(201).json({
                message: 'User registered successfully',
                userId: this.lastID,
                username,
                role: USER_ROLE.USER,
                status: USER_STATUS.ACTIVE,
            });
        },
    );
});

app.post('/login', (req, res) => {
    const username = normalizeInput(req.body.username);
    const password = normalizeInput(req.body.password);

    if (!username || !password) {
        return res.status(400).json({ message: 'ID and password are required.' });
    }

    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (row.status === USER_STATUS.INACTIVE) {
                return res.status(403).json({ message: 'Account is inactive' });
            }

            db.run('UPDATE users SET lastLoginAt = ? WHERE id = ?', [todayString(), row.id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ error: updateErr.message });
                }

                res.status(200).json({
                    message: 'Login successful',
                    userId: row.id,
                    username: row.username,
                    role: row.role || USER_ROLE.USER,
                    status: row.status || USER_STATUS.ACTIVE,
                });
            });
        },
    );
});

app.get('/admin/summary', requireAdmin, (req, res) => {
    const today = todayString();
    const month = today.slice(0, 7);

    const summary = {};

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS totalUsers FROM users', [], (userErr, userRow) => {
            if (userErr) {
                return res.status(500).json({ error: userErr.message });
            }

            summary.totalUsers = userRow.totalUsers;
        });

        db.get('SELECT COUNT(*) AS dau FROM users WHERE lastLoginAt = ?', [today], (dauErr, dauRow) => {
            if (dauErr) {
                return res.status(500).json({ error: dauErr.message });
            }

            summary.dau = dauRow.dau;
        });

        db.get('SELECT COUNT(*) AS mau FROM users WHERE lastLoginAt LIKE ?', [`${month}%`], (mauErr, mauRow) => {
            if (mauErr) {
                return res.status(500).json({ error: mauErr.message });
            }

            summary.mau = mauRow.mau;
        });

        db.get(
            `SELECT
                COUNT(*) AS totalTasks,
                SUM(CASE WHEN createdAt = ? THEN 1 ELSE 0 END) AS tasksCreatedToday,
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS doneTasks,
                SUM(CASE WHEN status = 'undone' THEN 1 ELSE 0 END) AS undoneTasks,
                SUM(CASE WHEN dueDate = ? THEN 1 ELSE 0 END) AS tasksDueToday,
                SUM(CASE WHEN dueDate < ? AND status = 'undone' THEN 1 ELSE 0 END) AS overdueTasks
             FROM tasks`,
            [today, today, today],
            (taskErr, taskRow) => {
                if (taskErr) {
                    return res.status(500).json({ error: taskErr.message });
                }

                const totalTasks = taskRow.totalTasks || 0;
                const doneTasks = taskRow.doneTasks || 0;

                res.status(200).json({
                    ...summary,
                    totalTasks,
                    tasksCreatedToday: taskRow.tasksCreatedToday || 0,
                    doneTasks,
                    undoneTasks: taskRow.undoneTasks || 0,
                    tasksDueToday: taskRow.tasksDueToday || 0,
                    overdueTasks: taskRow.overdueTasks || 0,
                    completionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
                });
            },
        );
    });
});

app.get('/admin/users', requireAdmin, (req, res) => {
    const { search = '', status = 'all' } = req.query;
    const params = [];
    let query = `
        SELECT
            users.id,
            users.username,
            users.role,
            users.status,
            users.createdAt,
            users.lastLoginAt,
            COUNT(tasks.id) AS totalTaskCount,
            SUM(CASE WHEN tasks.status = 'done' THEN 1 ELSE 0 END) AS doneTaskCount,
            SUM(CASE WHEN tasks.status = 'undone' THEN 1 ELSE 0 END) AS undoneTaskCount
        FROM users
        LEFT JOIN tasks ON tasks.userId = users.id
        WHERE 1 = 1
    `;

    if (search) {
        query += ' AND (users.username LIKE ? OR CAST(users.id AS TEXT) LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
        query += ' AND users.status = ?';
        params.push(status);
    }

    query += ' GROUP BY users.id ORDER BY users.id ASC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows.map((row) => ({
            ...row,
            totalTaskCount: row.totalTaskCount || 0,
            doneTaskCount: row.doneTaskCount || 0,
            undoneTaskCount: row.undoneTaskCount || 0,
        })));
    });
});

app.get('/admin/trends', requireAdmin, (req, res) => {
    const today = todayString();
    const days = Array.from({ length: 14 }, (_, index) => addDaysString(today, index - 13));
    const results = [];

    const loadDay = (index) => {
        if (index >= days.length) {
            return res.status(200).json(results);
        }

        const day = days[index];
        const mauStart = addDaysString(day, -29);
        const point = { date: day };

        db.get('SELECT COUNT(*) AS dau FROM users WHERE lastLoginAt = ?', [day], (dauErr, dauRow) => {
            if (dauErr) {
                return res.status(500).json({ error: dauErr.message });
            }

            point.dau = dauRow.dau || 0;

            db.get(
                'SELECT COUNT(*) AS mau FROM users WHERE lastLoginAt BETWEEN ? AND ?',
                [mauStart, day],
                (mauErr, mauRow) => {
                    if (mauErr) {
                        return res.status(500).json({ error: mauErr.message });
                    }

                    point.mau = mauRow.mau || 0;

                    db.get(
                        `SELECT
                            COUNT(*) AS tasksCreated,
                            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS tasksCompleted
                         FROM tasks
                         WHERE createdAt = ?`,
                        [day],
                        (taskErr, taskRow) => {
                            if (taskErr) {
                                return res.status(500).json({ error: taskErr.message });
                            }

                            point.tasksCreated = taskRow.tasksCreated || 0;
                            point.tasksCompleted = taskRow.tasksCompleted || 0;
                            results.push(point);
                            loadDay(index + 1);
                        },
                    );
                },
            );
        });
    };

    loadDay(0);
});

app.patch('/admin/users/:userId/status', requireAdmin, (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (!isValidUserStatus(status)) {
        return res.status(400).json({ error: 'Invalid user status.' });
    }

    if (Number(userId) === Number(req.adminUser.id) && status === USER_STATUS.INACTIVE) {
        return res.status(400).json({ error: 'Admin cannot deactivate their own account.' });
    }

    db.run('UPDATE users SET status = ? WHERE id = ?', [status, userId], function updateStatus(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json({ message: 'User status updated.', changes: this.changes });
    });
});

app.patch('/admin/users/:userId/role', requireAdmin, (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!isValidRole(role)) {
        return res.status(400).json({ error: 'Invalid role.' });
    }

    db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function updateRole(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json({ message: 'User role updated.', changes: this.changes });
    });
});

app.patch('/admin/users/:userId/password', requireAdmin, (req, res) => {
    const { userId } = req.params;
    const password = normalizeInput(req.body.password);
    const passwordError = validatePasswordPolicy(password);

    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }

    db.run('UPDATE users SET password = ? WHERE id = ?', [password, userId], function resetPassword(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json({ message: 'User password reset.', changes: this.changes });
    });
});

app.delete('/admin/users/:userId', requireAdmin, (req, res) => {
    const { userId } = req.params;

    if (Number(userId) === Number(req.adminUser.id)) {
        return res.status(400).json({ error: 'Admin cannot delete their own account.' });
    }

    db.serialize(() => {
        db.run('DELETE FROM tasks WHERE userId = ?', [userId], (taskErr) => {
            if (taskErr) {
                return res.status(500).json({ error: taskErr.message });
            }
        });

        db.run('DELETE FROM users WHERE id = ?', [userId], function deleteUser(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(200).json({ message: 'User account deleted.', changes: this.changes });
        });
    });
});

app.get('/tasks/:userId', (req, res) => {
    const { userId } = req.params;
    const { date } = req.query;
    const params = [userId];
    let query = 'SELECT * FROM tasks WHERE userId = ?';

    if (date) {
        query += ' AND ? BETWEEN startDate AND dueDate';
        params.push(date);
    }

    query += ' ORDER BY startDate ASC, dueDate ASC, id DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows.map(normalizeTask));
    });
});

app.post('/tasks', (req, res) => {
    const { userId, taskName, title, dueDate, selectedDate } = req.body;
    const normalizedTitle = taskName || title;
    const createdAt = todayString();
    const startDate = createdAt;
    const normalizedSelectedDate = selectedDate || dueDate;

    if (!normalizedTitle || !dueDate) {
        return res.status(400).json({ error: 'Task name and due date are required.' });
    }

    db.run(
        'INSERT INTO tasks (userId, title, createdAt, startDate, dueDate, status, selectedDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, normalizedTitle, createdAt, startDate, dueDate, TASK_STATUS.UNDONE, normalizedSelectedDate],
        function insertTask(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            res.status(201).json({
                message: 'Task created successfully',
                task: normalizeTask({
                    id: this.lastID,
                    userId,
                    title: normalizedTitle,
                    createdAt,
                    startDate,
                    dueDate,
                    status: TASK_STATUS.UNDONE,
                    selectedDate: normalizedSelectedDate,
                }),
            });
        },
    );
});

app.put('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;
    const { taskName, title, dueDate, status, selectedDate } = req.body;
    const normalizedTitle = taskName || title;

    if (!normalizedTitle || !dueDate || !isValidStatus(status)) {
        return res.status(400).json({ error: 'Task name, due date, and valid status are required.' });
    }

    db.run(
        'UPDATE tasks SET title = ?, dueDate = ?, status = ?, selectedDate = COALESCE(?, selectedDate) WHERE id = ?',
        [normalizedTitle, dueDate, status, selectedDate || null, taskId],
        function updateTask(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            res.status(200).json({ message: 'Task updated successfully', changes: this.changes });
        },
    );
});

app.patch('/tasks/:taskId/status', (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!isValidStatus(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }

    db.run(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, taskId],
        function updateTaskStatus(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            res.status(200).json({ message: 'Task status updated successfully', changes: this.changes });
        },
    );
});

app.delete('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;

    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function deleteTask(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.status(200).json({ message: 'Task deleted successfully', changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
