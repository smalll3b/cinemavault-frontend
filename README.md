# CinemaVault - Frontend (React + TypeScript + Ant Design)

Minimal frontend scaffold that demonstrates:
- React + TypeScript
- Ant Design UI
- Search & filter UI for movies
- Authentication (register/login) with Context API
- Favorites list per-user
- Admin CRUD for movies (mocked via localStorage)

Quick start

```bash
cd /Users/itst/Downloads/cinemavault-frontend
npm install
npm run dev
```

Default seeded accounts (in localStorage):
- Admin: admin@cv.test / admin123
- User: alice@cv.test / password

Notes
- This project defaults to a localStorage-based mock API (`src/api/mockApi.ts`) for UI/UX prototyping.
- To connect a real backend, set `VITE_API_URL` in `.env.local` (for example: `http://localhost:3000/api`).
- You can force mock mode with `VITE_USE_MOCK_API=true`.
- OMDB lookup in the movie form can use a backend proxy via `VITE_OMDB_PROXY_URL`; if that is not set, it falls back to `VITE_OMDB_API_KEY` + `VITE_OMDB_BASE_URL` (default: `https://www.omdbapi.com/`).
- The shared API wrapper lives in `src/api/apiClient.ts`, so UI components do not need to change when you switch backends.
- To reset data, clear localStorage keys starting with `cv_`.




