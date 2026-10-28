# 311 Smart Dispatcher MVP

An intelligent dispatching system for Chicago 311 service requests with real-time processing, priority scoring, and equity monitoring.

## Features

- **Real-time Processing**: Live updates via WebSocket connections
- **Priority Scoring**: Intelligent scoring based on urgency, location, and other factors
- **Smart Routing**: Optimal crew assignment with distance and workload considerations
- **Duplicate Detection**: Automatic detection and grouping of similar requests
- **Equity Monitoring**: Track response time disparities across neighborhoods

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### Installation

1. Clone and setup:
```bash
git clone <repo-url>
cd 311-smart-dispatcher
pnpm install
```

2. Start infrastructure:
```bash
docker-compose up -d
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start development servers:
```bash
pnpm dev
```

This will start:
- API server: http://localhost:3001
- Web dashboard: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### API Endpoints

- `GET /health` - Health check
- `GET /api/requests` - List 311 requests
- `GET /api/crews` - List available crews

### Architecture

```
packages/
├── api/          # Express.js backend with TypeScript
├── web/          # Next.js frontend with React
└── shared/       # Shared types and utilities
```

## Development

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Run linting

## Next Steps

1. Set up PostgreSQL migrations
2. Integrate LiquidMetal Raindrop MCP
3. Implement priority calculation algorithms
4. Add background job processing
5. Deploy to production environment