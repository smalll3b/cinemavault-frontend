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
- The shared API wrapper lives in `src/api/apiClient.ts`, so UI components do not need to change when you switch backends.
- To reset data, clear localStorage keys starting with `cv_`.


