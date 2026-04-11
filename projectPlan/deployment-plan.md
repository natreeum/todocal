# Deployment Plan

## 1. Deployment Goal
Deploy the frontend and backend server on the same instance.

External users access the frontend through HTTPS, and the frontend communicates with the backend through the same instance using local internal communication.
The backend should not be directly exposed to the public network.

## 2. Deployment Architecture

```text
[User Browser]
      |
      | HTTPS
      v
[Single Instance]
      |
      | public
      v
[Nginx / Reverse Proxy]
      |
      +--> Frontend Static Files
      |
      +--> /api/* -> Backend Server
                    |
                    | localhost only
                    v
              Backend App
```

## 3. Runtime Components

### 3.1. Frontend
- Build the frontend as static production assets.
- Serve the built files from the same instance.
- Example output directories:
  - `client/dist`
  - `client/build`
- External users access the frontend through Nginx or another reverse proxy.

### 3.2. Backend Server
- Run the backend server on the same instance.
- Bind the backend server to `127.0.0.1` or `localhost` only.
- Do not expose the backend port directly to the public network.
- Example local ports:
  - `127.0.0.1:3000`
  - `127.0.0.1:8080`

### 3.3. Reverse Proxy
- Use Nginx or an equivalent reverse proxy.
- `/` serves the frontend application.
- `/api/*` proxies requests to the local backend server.

## 4. Network Policy

### 4.1. Public Access
Only the following ports should be publicly accessible:
- `80`
- `443`

### 4.2. Internal Only
The following ports must not be publicly accessible:
- backend server port
- database port
- internal admin/debug ports

### 4.3. Frontend To Backend Communication
From the browser's perspective, API calls use the same origin:

```text
GET https://example.com/api/tasks
POST https://example.com/api/tasks
```

Inside the instance, the reverse proxy forwards those requests to the local backend server:

```text
http://127.0.0.1:3000/api/tasks
```

## 5. API Routing Rules

### 5.1. Frontend Routes
```text
/ -> frontend app
/assets/* -> frontend static assets
```

### 5.2. Backend Routes
```text
/api/* -> backend server
```

### 5.3. SPA Fallback
If the frontend is a single-page application, unknown frontend routes should fall back to `index.html`.

Examples:
```text
/admin
/login
/calendar
```

These routes should be handled by the frontend router.

## 6. Environment Variables

### 6.1. Frontend
The frontend should use a same-origin API base path.

```text
VITE_API_BASE_URL=/api
```

Or use relative API paths directly:

```text
/api
```

### 6.2. Backend
The backend should bind to localhost only.

```text
HOST=127.0.0.1
PORT=3000
NODE_ENV=production
```

## 7. Nginx Example

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/todoManager/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 8. Process Management

The backend server should be managed by a process manager.

Recommended options:
- `systemd`
- `pm2`
- `docker compose`

For an initial single-instance deployment, `systemd` or `docker compose` is recommended.

## 9. Security Rules

- Backend server must not bind to a public IP.
- Backend port must not be opened in the security group or firewall.
- External traffic must enter through Nginx or the chosen reverse proxy.
- HTTPS should be enabled for production.
- Admin page must enforce admin role validation.
- Backend APIs must enforce authentication and authorization.
- CORS should not be required if frontend and backend use the same origin through `/api` proxying.

## 10. Pros

- Simple deployment structure.
- Minimal CORS complexity.
- Frontend and backend behave as same-origin from the browser perspective.
- Backend is not directly exposed to the public network.
- Easy to operate for the initial version.

## 11. Cons

- Single instance failure takes down the whole service.
- Frontend and backend cannot scale independently.
- Future traffic growth may require separate hosting or horizontal scaling.

## 12. Future Scaling Plan

If traffic increases, migrate toward a separated architecture.

```text
[Load Balancer]
      |
      +--> Frontend Hosting / CDN
      |
      +--> Backend Instance Group
              |
              +--> Database
```

Initial deployment should use the single-instance structure, then separate frontend hosting and backend server infrastructure when scaling becomes necessary.

## 13. Deployment Checklist

- Create frontend production build.
- Prepare backend production runtime.
- Bind backend to `127.0.0.1`.
- Configure Nginx reverse proxy.
- Verify `/api/*` proxy behavior.
- Verify SPA fallback behavior.
- Enable HTTPS.
- Confirm backend port is blocked from public access.
- Confirm admin route authorization.
- Confirm backend API authentication and authorization.
- Add or verify health check endpoint.
