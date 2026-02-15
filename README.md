# TJ Bus Monitoring - Frontend

This is the frontend application for the TJ Bus Monitoring system.

## Prerequisites

- Node.js (v18 or higher recommended)
- [Bun](https://bun.sh/) (recommended) or npm

## Automated Setup (Linux/macOS)

We provide a script to automatically verify prerequisites, install dependencies, and start the development server.

1.  Open your terminal.
2.  Navigate to the project directory.
3.  Make the script executable (only needed once):
    ```bash
    chmod +x setup.sh
    ```
4.  Run the script:
    ```bash
    ./setup.sh
    ```

## Manual Setup (Linux)

If you prefer to set up the project manually or cannot use the script, follow these steps:

### 1. Install Dependencies

Using **Bun** (recommended if `bun.lock` is present):
```bash
bun install
```

Using **npm**:
```bash
npm install
```

### 2. Run Development Server

Using **Bun**:
```bash
bun run dev
```

Using **npm**:
```bash
npm run dev
```

The application will typically start at `http://localhost:5173`.

### 3. Build for Production

To create a production build:

Using **Bun**:
```bash
bun run build
```

Using **npm**:
```bash
npm run build
```
