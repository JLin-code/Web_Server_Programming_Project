# Web Server Programming Project

## Project Setup

This project uses pnpm as the package manager. Before working on the project, make sure you have pnpm installed.

### Installing pnpm

If you don't have pnpm installed, you can install it with npm:

```bash
npm install -g pnpm
```

### Installing Dependencies

To install project dependencies:

```bash
pnpm install
```

### Running the Development Server

To run the development server:

```bash
pnpm dev
```

If you want to run only the server or client separately:

```bash
# Run only the backend server
pnpm server

# Run only the frontend client
pnpm client
```

### Troubleshooting

If you're experiencing issues:

1. Run the diagnostic tool to check connectivity:
   ```bash
   pnpm diagnose
   ```

2. Check dependencies:
   ```bash
   pnpm check-deps
   ```

### Common Issues

If you see errors like "npm error enoent Could not read package.json", you might be using npm instead of pnpm. Always use pnpm commands for this project:

- Instead of `npm install`, use `pnpm install`
- Instead of `npm run dev`, use `pnpm dev`
- Instead of `npm start`, use `pnpm start`

## Project Structure

- `/client`: Contains the Vue.js frontend code
- `/server`: Contains backend server code
- `/tools`: Contains utility scripts for diagnostics and checks
- Root files:
  - `index.js`: Entry point that loads the server code
  - `package.json`: Project configuration and dependencies
  - `.env`: Environment variables (create this file based on `.env.example`)
