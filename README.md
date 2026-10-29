# Lakhi

Monorepo foundation for a Next.js frontend and a FastAPI backend.

## Repository layout

```text
.
├── api/                 # Vercel Python entrypoint
├── backend/
│   ├── app/             # FastAPI application package
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/            # Next.js application
├── .env.example
├── package.json         # Root workspace scripts
└── vercel.json          # Backend Vercel routing
```

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+

### Backend

Create and activate the virtual environment from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

Copy `.env.example` to `.env` and adjust values as needed. Start FastAPI:

```powershell
python -m uvicorn backend.app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`; OpenAPI documentation is at
`http://localhost:8000/docs`.

### Video validation

The `POST /api/v1/videos/validate` endpoint accepts one `multipart/form-data`
field named `file`. It requires an FFmpeg installation that includes the
`ffprobe` executable. On Windows, install FFmpeg from a trusted distribution,
add its `bin` directory to `PATH`, or set `FFPROBE_PATH` to the full executable
path. A Python package alone does not install FFprobe.

Uploads are limited to 500 MiB and videos to 180 seconds by default. These
limits, the FFprobe timeout, concurrency limit, and executable path can be
changed with the `VIDEO_MAX_UPLOAD_SIZE_BYTES`,
`VIDEO_MAX_DURATION_SECONDS`, `VIDEO_PROBE_TIMEOUT_SECONDS`,
`VIDEO_UPLOAD_CONCURRENCY`, and `FFPROBE_PATH` settings.

### Frontend

```powershell
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`.

## Vercel deployment

Vercel projects are normally configured separately for each app in a monorepo:

1. Create a Vercel project with the repository root directory set to `frontend`.
   Vercel will detect and build Next.js automatically.
2. Create a second Vercel project with the repository root directory set to the
   repository root. The root `vercel.json` deploys the FastAPI app through
   `api/index.py`.
3. Set `NEXT_PUBLIC_API_URL` in the frontend project to the backend deployment
   URL.

The backend entrypoint is deliberately thin so backend code remains organized
under `backend/app` while Vercel can discover the Python function.
