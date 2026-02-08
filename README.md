# Mission Control

A local AI agent coordination system built with Next.js and SQLite. This application provides a dashboard for managing tasks, monitoring agent activities, and coordinating work between multiple AI agents.

## Features

- **Task Board** - Kanban-style task management with drag-and-drop
- **Agent Cards** - Monitor agent status and current tasks
- **Activity Feed** - Real-time stream of agent activities
- **Comment Threads** - Discuss tasks with @mentions
- **Document Storage** - Store and manage deliverables

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Real-time**: Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:openclaw9925-design/mission-control.git
cd mission-control

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed initial data (agents + sample task)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Initial Agents

| Agent | Role | Session Key |
|-------|------|-------------|
| Clawdbot | Coordinator | `agent:main:main` |
| Friday | Backend Developer | `agent:backend:main` |
| Pixel | Frontend Developer | `agent:frontend:main` |

## Project Structure

```
mission-control/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script
│   └── dev.db             # SQLite database
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── tasks/         # Tasks pages
│   │   ├── agents/        # Agents pages
│   │   └── ...
│   ├── components/        # React components
│   ├── lib/               # Utilities (Prisma, OpenClaw, Events)
│   └── types/             # TypeScript types
└── ...
```

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `PATCH /api/agents` - Update agent status

### Messages
- `GET /api/messages?taskId=...` - Get task messages
- `POST /api/messages` - Create message

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity

### Events
- `GET /api/events` - SSE endpoint for real-time updates

## OpenClaw Integration

Mission Control integrates with OpenClaw for agent communication. Configure the following environment variables:

```env
OPENCLAW_URL=http://127.0.0.1:3765
OPENCLAW_TOKEN=your-token-here
```

## Task Status Flow

```
Inbox → Assigned → In Progress → Review → Done
                     ↓
                  Blocked
```

## License

MIT
