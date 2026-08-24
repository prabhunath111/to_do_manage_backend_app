# Family To-Do — Backend (Node.js + TypeScript + MongoDB)

Role-based task management API for a family To-Do app.

## Roles
- **admin** — view all tasks, create & assign tasks to anyone, update/reassign any task, delete tasks.
- **worker** — create tasks for themself, view only their own tasks, update status of their own tasks.
- **manager** — read-only access to all tasks (no create/update/delete).

## Setup
```bash
cp .env.example .env
npm install
npm run dev      # development (ts-node + nodemon)
npm run build && npm start   # production
```

Requires a running MongoDB instance (local or Atlas) — set `MONGODB_URI` in `.env`.

## API

### Auth
| Method | Route             | Access | Description |
|--------|-------------------|--------|--------------|
| POST   | /api/auth/register| Public | `{ name, email, password, role }` role: admin/worker/manager (defaults to worker) |
| POST   | /api/auth/login   | Public | `{ email, password }` -> `{ token, user }` |
| GET    | /api/auth/me      | Auth   | Current user profile |

### Users
| Method | Route       | Access | Description |
|--------|-------------|--------|--------------|
| GET    | /api/users  | Auth   | List all family members (for assignment dropdowns) |

### Tasks
| Method | Route           | Access                  | Description |
|--------|-----------------|--------------------------|--------------|
| GET    | /api/tasks      | Auth (filtered per role) | List tasks. Query filters: `status`, `priority`, `assignedTo`, `from`, `to`, `search` |
| GET    | /api/tasks/:id  | Auth                     | Get single task |
| POST   | /api/tasks      | admin, worker            | Create task (worker auto-assigns to self) |
| PATCH  | /api/tasks/:id  | admin, worker (own task) | Update task / status |
| DELETE | /api/tasks/:id  | admin                    | Delete task |

All authenticated routes require header: `Authorization: Bearer <token>`

## Task fields
`title, description, status (pending|in_progress|completed|cancelled), priority (low|medium|high), dueDate, assignedTo, assignedBy, createdBy, completedAt`
# to_do_manage_backend_app
