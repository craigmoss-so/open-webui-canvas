# Open WebUI - AI Assistant Developer Guide

This document provides a comprehensive overview of the Open WebUI codebase for AI assistants working on this project.

## Project Overview

**Open WebUI** is an extensible, feature-rich, self-hosted AI platform that operates entirely offline. It supports various LLM runners (Ollama, OpenAI-compatible APIs) with a built-in inference engine for RAG (Retrieval-Augmented Generation).

- **Version**: 0.6.36
- **License**: Open WebUI License (see LICENSE and LICENSE_HISTORY)
- **Python**: 3.11-3.12 (3.13 not supported)
- **Node.js**: 18.13.0 to 22.x.x
- **Main Repository**: https://github.com/open-webui/open-webui

## Tech Stack

### Frontend
- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4.x with custom plugins
- **Build Tool**: Vite 5.x
- **Package Manager**: npm
- **UI Components**: bits-ui, paneforge, Tiptap editor
- **State Management**: Svelte stores (see `src/lib/stores/`)
- **Internationalization**: i18next
- **Testing**: Vitest, Cypress (E2E)

### Backend
- **Framework**: FastAPI 0.118.0
- **Language**: Python 3.11+
- **Server**: Uvicorn with ASGI
- **Database**:
  - Primary: SQLAlchemy 2.0.38 + Alembic (migrations)
  - Legacy: Peewee 3.18.1 (being migrated away from)
  - Supported DBs: SQLite (default), PostgreSQL, MySQL
- **Vector Databases**: ChromaDB, Qdrant, Milvus, Pinecone, PGVector, OpenSearch, Elasticsearch
- **Authentication**: JWT, OAuth (OIDC), LDAP, SCIM 2.0
- **Real-time**: Socket.IO (WebSocket)
- **Caching**: Redis, aiocache
- **AI/ML**:
  - Transformers, sentence-transformers
  - OpenAI, Anthropic, Google GenAI clients
  - LangChain, LangChain Community
  - faster-whisper (audio transcription)
  - Pyodide (in-browser Python execution)

### Infrastructure
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes (kubectl, kustomize, helm)
- **CI/CD**: GitHub Actions

## Repository Structure

```
open-webui/
├── backend/
│   └── open_webui/          # Python backend package
│       ├── main.py          # FastAPI application entry point
│       ├── config.py        # Application configuration
│       ├── env.py           # Environment variables and setup
│       ├── constants.py     # Global constants
│       ├── routers/         # API route handlers
│       │   ├── auths.py     # Authentication endpoints
│       │   ├── chats.py     # Chat management
│       │   ├── users.py     # User management
│       │   ├── models.py    # LLM model management
│       │   ├── files.py     # File handling
│       │   ├── functions.py # Custom functions/tools
│       │   ├── knowledge.py # Knowledge base (RAG)
│       │   ├── ollama.py    # Ollama integration
│       │   ├── openai.py    # OpenAI API compatibility
│       │   ├── pipelines.py # Pipeline integrations
│       │   └── ...
│       ├── models/          # Database models (SQLAlchemy)
│       ├── internal/        # Internal utilities
│       │   ├── db.py        # Database initialization
│       │   ├── migrations/  # Peewee migrations (legacy)
│       │   └── wrappers.py  # Utility wrappers
│       ├── migrations/      # Alembic migrations (current)
│       ├── retrieval/       # RAG implementation
│       │   ├── loaders/     # Document loaders
│       │   ├── vector/      # Vector database abstractions
│       │   │   └── dbs/     # Vector DB implementations
│       │   └── web/         # Web search integrations
│       ├── socket/          # WebSocket/Socket.IO handlers
│       ├── storage/         # File storage backends
│       ├── utils/           # Utility functions
│       └── test/            # Backend tests
├── src/
│   ├── lib/
│   │   ├── apis/            # Frontend API clients
│   │   │   ├── auths/
│   │   │   ├── chats/
│   │   │   ├── users/
│   │   │   ├── models/
│   │   │   └── ...
│   │   ├── components/      # Svelte components
│   │   │   ├── chat/        # Chat UI components
│   │   │   ├── layout/      # Layout components
│   │   │   └── workspace/   # Workspace components
│   │   ├── stores/          # Svelte stores (state management)
│   │   ├── i18n/            # Internationalization
│   │   │   └── locales/     # Translation files
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Frontend utilities
│   │   ├── workers/         # Web Workers
│   │   └── pyodide/         # Pyodide integration
│   ├── routes/              # SvelteKit routes (file-based routing)
│   │   ├── (app)/           # Main app routes (authenticated)
│   │   │   ├── c/           # Chat routes
│   │   │   ├── admin/       # Admin panel
│   │   │   ├── workspace/   # Workspace
│   │   │   ├── channels/    # Channels
│   │   │   ├── notes/       # Notes
│   │   │   └── ...
│   │   ├── auth/            # Authentication routes
│   │   ├── s/               # Shared chat routes
│   │   └── watch/           # Watch mode routes
│   ├── app.html             # HTML template
│   ├── app.css              # Global styles
│   └── tailwind.css         # Tailwind base styles
├── static/                  # Static assets
│   ├── pyodide/             # Pyodide files
│   ├── audio/               # Audio assets
│   ├── themes/              # Theme files
│   └── assets/              # General assets
├── scripts/                 # Build and utility scripts
├── cypress/                 # E2E tests
├── kubernetes/              # K8s deployment configs
│   ├── manifest/
│   └── helm/
├── docs/                    # Documentation
├── package.json             # Frontend dependencies and scripts
├── pyproject.toml           # Python project configuration
├── svelte.config.js         # SvelteKit configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration (v4)
└── .eslintrc.cjs            # ESLint configuration
```

## Development Setup

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18.13.0 to 22.x.x
- npm 6.0.0+

### Local Development

#### Backend
```bash
# From project root
cd backend
pip install -e .

# Or using the development script
./backend/dev.sh
```

#### Frontend
```bash
# From project root
npm install
npm run dev        # Dev server on localhost:5173
npm run dev:5050   # Dev server on localhost:5050
```

### Environment Variables

Key environment variables are loaded from `.env` file in project root:

- **Database**: `DATABASE_URL` (default: SQLite in `backend/data/`)
- **Redis**: `REDIS_URL` (for caching and sessions)
- **Device**: `USE_CUDA_DOCKER` (true/false for GPU support)
- **Logging**: `GLOBAL_LOG_LEVEL` (DEBUG, INFO, WARNING, ERROR)
- **Storage**: Various storage backend configs
- **Authentication**: OAuth, LDAP, SCIM configurations

See `backend/open_webui/env.py` and `backend/open_webui/config.py` for full list.

## Code Organization

### Backend Architecture

#### FastAPI Application Structure
- **main.py**: Application lifecycle, middleware setup, router registration
- **routers/**: Modular API endpoints (each file = one API domain)
- **models/**: SQLAlchemy ORM models (one file per database table)
- **socket/**: Real-time WebSocket handlers
- **retrieval/**: RAG pipeline (document loading, embedding, vector search)

#### Database
- **Primary**: SQLAlchemy with Alembic migrations (`backend/open_webui/migrations/`)
- **Legacy**: Peewee with custom migrations (`backend/open_webui/internal/migrations/`)
- **Models**: Located in `backend/open_webui/models/`

Important models:
- `users.py`: User accounts
- `auths.py`: Authentication records
- `chats.py`: Chat sessions
- `messages.py`: Chat messages
- `models.py`: LLM model configurations
- `functions.py`: Custom functions/tools
- `knowledge.py`: Knowledge bases
- `files.py`: File metadata

#### API Router Pattern
Each router file follows this pattern:
```python
from fastapi import APIRouter, Depends, HTTPException
from open_webui.models.users import Users
from open_webui.utils.utils import get_current_user

router = APIRouter()

@router.get("/api/endpoint")
async def endpoint(user=Depends(get_current_user)):
    # Implementation
    pass
```

### Frontend Architecture

#### SvelteKit File-Based Routing
- Routes defined by directory structure in `src/routes/`
- `+page.svelte`: Page component
- `+page.ts` / `+page.server.ts`: Page data loading
- `+layout.svelte`: Layout component
- `+layout.ts` / `+layout.server.ts`: Layout data loading
- `(app)/`: Route group for authenticated pages

#### State Management
- **Stores**: Located in `src/lib/stores/`
- Use Svelte's built-in writable/readable stores
- Persistent stores for user settings, chat history, etc.

#### API Client Pattern
Frontend API clients in `src/lib/apis/` mirror backend routers:
```typescript
// src/lib/apis/users/index.ts
export const getUsers = async (token: string) => {
  const res = await fetch('/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};
```

#### Component Organization
- **Reusable Components**: `src/lib/components/`
- **Chat Components**: `src/lib/components/chat/`
- **Layout Components**: `src/lib/components/layout/`
- **Workspace Components**: `src/lib/components/workspace/`

## Coding Standards and Conventions

### Python (Backend)

#### Style
- **Formatter**: Black (line length: 100)
- **Linter**: Pylint
- **Format**: `npm run format:backend` or `black . --exclude ".venv/|/venv/"`
- **Lint**: `npm run lint:backend` or `pylint backend/`

#### Conventions
- Use async/await for I/O operations
- Type hints are encouraged but not strictly enforced
- Follow PEP 8 naming conventions
- Use Pydantic models for request/response validation
- Exceptions: Raise HTTPException with appropriate status codes

#### Error Handling
```python
from fastapi import HTTPException
from open_webui.constants import ERROR_MESSAGES

raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail=ERROR_MESSAGES.NOT_FOUND
)
```

### TypeScript/Svelte (Frontend)

#### Style
- **Formatter**: Prettier
- **Linter**: ESLint with TypeScript and Svelte plugins
- **Format**: `npm run format`
- **Lint**: `npm run lint:frontend`
- **Type Check**: `npm run check`

#### Conventions
- Use TypeScript strict mode
- Define types in `src/lib/types/` or co-located with components
- Use `$lib/` path alias for imports (e.g., `import { foo } from '$lib/utils'`)
- Component file naming: PascalCase.svelte
- Utility file naming: camelCase.ts

#### Svelte 5 Runes
This project uses Svelte 5 with runes:
- `$state()`: Reactive state
- `$derived()`: Derived values
- `$effect()`: Side effects
- `$props()`: Component props

Example:
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Database Migrations

#### Adding a Migration (Alembic - Preferred)
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

#### Migration File Location
- Alembic: `backend/open_webui/migrations/versions/`
- Legacy Peewee: `backend/open_webui/internal/migrations/`

### Internationalization (i18n)

Translation files: `src/lib/i18n/locales/`

To extract new translation keys:
```bash
npm run i18n:parse
```

Use translations in components:
```svelte
<script>
  import { t } from '$lib/i18n';
</script>

<h1>{$t('common.welcome')}</h1>
```

## Testing

### Frontend Testing

#### Unit Tests (Vitest)
```bash
npm run test:frontend
```

#### E2E Tests (Cypress)
```bash
npm run cy:open
```

Test files: `cypress/e2e/`

### Backend Testing

Backend tests located in `backend/open_webui/test/`

Run with pytest:
```bash
cd backend
pytest
```

## Build and Deployment

### Frontend Build
```bash
npm run build          # Production build
npm run build:watch    # Watch mode
npm run preview        # Preview production build
```

Build output: `build/` (static files)

### Backend Build
```bash
pip install build
python -m build
```

Generates wheel in `dist/`

### Docker

Main Dockerfile: `Dockerfile`

Build images:
```bash
# CPU-only
docker build -t open-webui:latest .

# With CUDA
docker build -t open-webui:cuda --build-arg USE_CUDA=true .

# With Ollama bundled
docker build -t open-webui:ollama --target ollama .
```

### Kubernetes

Deployment configs in `kubernetes/`:
- `manifest/`: Raw Kubernetes YAML
- `helm/`: Helm charts

## Common Tasks

### Adding a New API Endpoint

1. **Backend** (`backend/open_webui/routers/your_router.py`):
```python
@router.post("/api/your-endpoint")
async def your_endpoint(
    request: YourRequestModel,
    user=Depends(get_current_user)
):
    # Implementation
    return {"result": "success"}
```

2. **Frontend** (`src/lib/apis/your-api/index.ts`):
```typescript
export const callYourEndpoint = async (token: string, data: any) => {
  const res = await fetch('/api/your-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};
```

### Adding a New Database Model

1. Create model in `backend/open_webui/models/your_model.py`
2. Import in `backend/open_webui/internal/db.py`
3. Generate migration: `alembic revision --autogenerate -m "Add YourModel"`
4. Review and apply: `alembic upgrade head`

### Adding a New UI Component

1. Create component: `src/lib/components/YourComponent.svelte`
2. Import and use in routes or other components
3. Follow existing component patterns for props, events, and styling

### Adding a New Route

1. Create directory in `src/routes/` following naming convention
2. Add `+page.svelte` for the page component
3. Add `+page.ts` for data loading if needed
4. Update navigation components if needed

## Important File Locations

### Configuration
- Backend config: `backend/open_webui/config.py`
- Environment setup: `backend/open_webui/env.py`
- Constants: `backend/open_webui/constants.py`
- Frontend config: `svelte.config.js`, `vite.config.ts`

### Entry Points
- Backend main: `backend/open_webui/main.py`
- Frontend main: `src/routes/+layout.svelte`, `src/app.html`

### Authentication
- Backend: `backend/open_webui/routers/auths.py`
- Models: `backend/open_webui/models/auths.py`, `backend/open_webui/models/users.py`
- Frontend: `src/lib/apis/auths/`, `src/routes/auth/`

### RAG (Retrieval-Augmented Generation)
- Main: `backend/open_webui/retrieval/`
- Vector DBs: `backend/open_webui/retrieval/vector/dbs/`
- Document loaders: `backend/open_webui/retrieval/loaders/`
- Web search: `backend/open_webui/retrieval/web/`

### Real-time (WebSocket)
- Backend: `backend/open_webui/socket/main.py`
- Frontend: Socket.IO client in various components

## Git Workflow

### Branch Strategy
- **main**: Stable production branch
- **dev**: Development branch (target for PRs)
- Feature branches: Create from `dev`, merge back to `dev`

### Pull Request Requirements

**IMPORTANT**: All PRs must target the `dev` branch, not `main`.

Before submitting a PR:

1. **Target Branch**: Verify PR targets `dev` branch
2. **Description**: Provide concise description of changes
3. **Changelog**: Follow [Keep a Changelog](https://keepachangelog.com/) format
4. **Testing**: Perform manual testing, include screenshots
5. **Code Review**: Self-review for coding standards
6. **Title Prefix**: Use one of:
   - `BREAKING CHANGE`, `build`, `ci`, `chore`, `docs`, `feat`, `fix`, `i18n`, `perf`, `refactor`, `style`, `test`, `WIP`
7. **NO AI-Generated Code**: Code must be human-reviewed and tested
8. **CLA**: Must agree to Contributor License Agreement

See `.github/pull_request_template.md` for full checklist.

### Commit Message Convention

Follow conventional commits:
```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify chat message component
```

## Key Concepts and Patterns

### RAG (Retrieval-Augmented Generation)
- Documents stored in vector databases
- Embeddings generated using sentence-transformers
- Query -> embedding -> vector search -> context injection
- Supports multiple vector DB backends (ChromaDB, Qdrant, etc.)

### Function/Tool System
- Custom Python functions can be added via UI
- Executed in restricted environment (RestrictedPython)
- Functions can be called by LLMs
- Located in `backend/open_webui/models/functions.py`

### Pipeline Integration
- External processing pipelines via HTTP
- Supports custom logic, rate limiting, monitoring
- See `backend/open_webui/routers/pipelines.py`

### Model Management
- Supports multiple LLM providers
- Model configurations stored in database
- Proxy to Ollama, OpenAI-compatible APIs
- See `backend/open_webui/routers/models.py`, `backend/open_webui/routers/ollama.py`, `backend/open_webui/routers/openai.py`

### Channels
- Collaborative spaces for team communication
- Real-time updates via WebSocket
- See `backend/open_webui/routers/channels.py`, `backend/open_webui/socket/`

### Knowledge Bases
- Collections of documents for RAG
- File upload, processing, chunking, embedding
- See `backend/open_webui/routers/knowledge.py`

## Security Considerations

### Authentication
- JWT-based authentication
- OAuth/OIDC support (Google, Microsoft, etc.)
- LDAP integration
- SCIM 2.0 for enterprise provisioning

### Authorization
- Role-Based Access Control (RBAC)
- User groups with permissions
- Admin panel for user management

### Input Validation
- All API inputs validated with Pydantic models
- Frontend validation before API calls
- SQL injection protection via ORM

### Content Security
- CORS middleware configured
- File upload restrictions
- RestrictedPython for user-defined functions

## Performance Optimization

### Backend
- Async/await for I/O operations
- Redis caching for frequently accessed data
- Connection pooling for database
- Compression middleware (starlette-compress)

### Frontend
- Code splitting via SvelteKit
- Lazy loading for large components
- Service workers for offline support (PWA)
- Static asset optimization via Vite

### Database
- Indexes on frequently queried columns
- Connection pooling
- Pagination for large result sets

## Troubleshooting Common Issues

### Frontend build fails
- Check Node.js version (18.13.0 to 22.x.x)
- Clear `node_modules/` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run check`

### Backend fails to start
- Check Python version (3.11 or 3.12, not 3.13+)
- Verify database migrations: `alembic current`, `alembic upgrade head`
- Check environment variables in `.env`

### Database migration conflicts
- Review migration files in `backend/open_webui/migrations/versions/`
- Resolve conflicts manually or create new migration
- Use `alembic downgrade` to rollback if needed

### WebSocket connection issues
- Check CORS configuration in `backend/open_webui/main.py`
- Verify Socket.IO client version matches server
- Check network/firewall settings

## Resources

- **Documentation**: https://docs.openwebui.com/
- **Discord**: https://discord.gg/5rJgQTnV4s
- **GitHub Issues**: https://github.com/open-webui/open-webui/issues
- **Discussions**: https://github.com/open-webui/open-webui/discussions
- **Pipelines**: https://github.com/open-webui/pipelines

## Development Tips for AI Assistants

1. **Always target `dev` branch** for PRs, never `main`
2. **Check existing code** before implementing new features to avoid duplication
3. **Follow the established patterns** in routers, models, and components
4. **Use type hints** in Python and TypeScript for better code clarity
5. **Test manually** - automated tests don't cover everything
6. **Update i18n** files if adding user-facing text
7. **Consider backward compatibility** - many users run self-hosted instances
8. **Document breaking changes** clearly in PR descriptions
9. **Review security implications** of any authentication/authorization changes
10. **Be mindful of performance** - this runs on various hardware from RPi to servers

## Version Information

- **Current Version**: 0.6.36
- **Python Support**: 3.11, 3.12
- **Node.js Support**: 18.13.0 to 22.x.x
- **Database**: SQLAlchemy 2.0.38
- **Frontend**: Svelte 5, SvelteKit 2.x
- **Build System**: Vite 5.x

---

**Last Updated**: 2025-11-17

This guide is maintained for AI assistants working on Open WebUI. For user-facing documentation, see https://docs.openwebui.com/.
