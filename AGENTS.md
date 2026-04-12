# AGENTS.md

## Cursor Cloud specific instructions

This is a Vue 3 + Vite single-page application (`demo-app`).

### Services

| Service | Command | Default URL |
|---|---|---|
| Vite Dev Server | `npm run dev` | http://localhost:5173 |

### Key commands

- **Dev server**: `npm run dev` (add `-- --host 0.0.0.0` to expose on all interfaces)
- **Production build**: `npm run build` (outputs to `dist/`)
- **Preview prod build**: `npm run preview`

### Notes

- Node.js `^20.19.0 || >=22.12.0` is required (see `engines` in `package.json`).
- There is no linter or test runner configured in this project; only build and dev commands are available.
- The `vite-plugin-vue-devtools` has peer dependency warnings with Vite 8 but works correctly at runtime.
