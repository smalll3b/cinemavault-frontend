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
- This project uses a simple localStorage-based mock API (src/api/mockApi.ts). It's intended for UI/UX prototyping only.
- To reset data, clear localStorage keys starting with `cv_`.

