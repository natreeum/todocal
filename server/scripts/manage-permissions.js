const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const USER_ROLE = new Set(['user', 'admin']);
const USER_STATUS = new Set(['active', 'inactive']);
const dbPath = process.env.TODOCAL_DB_PATH || path.join(__dirname, '..', 'todo.db');

function parseArgs(argv) {
    const args = {};

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) continue;

        const key = token.slice(2);
        const nextToken = argv[index + 1];
        if (!nextToken || nextToken.startsWith('--')) {
            args[key] = true;
            continue;
        }

        args[key] = nextToken;
        index += 1;
    }

    return args;
}

function printUsage() {
    console.log(`
Usage:
  npm run permissions -- --list
  npm run permissions -- --username <id> [--role user|admin] [--status active|inactive]
  npm run permissions -- --id <userId> [--role user|admin] [--status active|inactive]

Examples:
  npm run permissions -- --username minseob --role admin --status active
  npm run permissions -- --id 1 --status inactive

Environment:
  TODOCAL_DB_PATH=/absolute/path/to/todo.db
`);
}

function closeDb(db, exitCode = 0) {
    db.close((err) => {
        if (err) {
            console.error(`Failed to close database: ${err.message}`);
            process.exit(1);
        }
        process.exit(exitCode);
    });
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
    printUsage();
    process.exit(0);
}

if (!args.list && !args.id && !args.username) {
    printUsage();
    process.exit(1);
}

if (args.role && !USER_ROLE.has(args.role)) {
    console.error('Invalid role. Use one of: user, admin');
    process.exit(1);
}

if (args.status && !USER_STATUS.has(args.status)) {
    console.error('Invalid status. Use one of: active, inactive');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(`Failed to open database: ${err.message}`);
        process.exit(1);
    }
});

if (args.list) {
    db.all(
        'SELECT id, username, role, status, createdAt, lastLoginAt FROM users ORDER BY id ASC',
        (err, rows) => {
            if (err) {
                console.error(`Failed to list users: ${err.message}`);
                return closeDb(db, 1);
            }

            console.table(rows);
            return closeDb(db);
        },
    );
} else {
    const identifierColumn = args.id ? 'id' : 'username';
    const identifierValue = args.id || args.username;
    const updates = [];
    const values = [];

    if (args.role) {
        updates.push('role = ?');
        values.push(args.role);
    }

    if (args.status) {
        updates.push('status = ?');
        values.push(args.status);
    }

    if (updates.length === 0) {
        db.get(
            `SELECT id, username, role, status, createdAt, lastLoginAt FROM users WHERE ${identifierColumn} = ?`,
            [identifierValue],
            (err, row) => {
                if (err) {
                    console.error(`Failed to read user: ${err.message}`);
                    return closeDb(db, 1);
                }

                if (!row) {
                    console.error('User not found.');
                    return closeDb(db, 1);
                }

                console.table([row]);
                return closeDb(db);
            },
        );
    } else {
        values.push(identifierValue);

        db.run(
            `UPDATE users SET ${updates.join(', ')} WHERE ${identifierColumn} = ?`,
            values,
            function updateUser(err) {
                if (err) {
                    console.error(`Failed to update user: ${err.message}`);
                    return closeDb(db, 1);
                }

                if (this.changes === 0) {
                    console.error('User not found.');
                    return closeDb(db, 1);
                }

                db.get(
                    `SELECT id, username, role, status, createdAt, lastLoginAt FROM users WHERE ${identifierColumn} = ?`,
                    [identifierValue],
                    (selectErr, row) => {
                        if (selectErr) {
                            console.error(`User updated, but failed to read result: ${selectErr.message}`);
                            return closeDb(db, 1);
                        }

                        console.table([row]);
                        return closeDb(db);
                    },
                );
            },
        );
    }
}
