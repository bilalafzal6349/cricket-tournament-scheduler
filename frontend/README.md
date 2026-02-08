# Cricket Tournament Scheduler Frontend

A professional, AI-powered cricket tournament scheduling system built with React, TypeScript, and Vite.

## 🚀 Features

- **Tournament Management**: Create and manage multiple tournaments with support for various formats (Round Robin, Knockout, etc.)
- **Team & Venue Management**: Easily add teams and venues to your tournaments.
- **🤖 AI Schedule Generation**: Automatically generate conflict-free schedules in seconds using our advanced AI engine.
- **Interactive Calendar**: View matches in a responsive calendar view with detailed match information.
- **Modern UI**: Polished, professional interface built with Tailwind CSS.

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Setup & Installation

1.  **Install Dependencies**
    ```bash
    pnpm install
    ```

2.  **Start Development Server**
    ```bash
    pnpm dev
    ```
    The app will specific running at `http://localhost:5173` (or similar).

3.  **Build for Production**
    ```bash
    pnpm build
    ```

## 🏗 Project Structure

```
src/
├── components/         # Reusable UI components and feature-specific components
│   ├── layout/         # Header, Sidebar, Layout
│   ├── tournaments/    # Tournament-related components
│   ├── teams/          # Team-related components
│   ├── venues/         # Venue-related components
│   ├── schedule/       # Schedule generation and calendar view
│   └── ui/             # Basic UI primitives (Button, Input, etc.)
├── pages/              # Page components (routes)
├── hooks/              # Custom React Query hooks
├── services/           # API integration
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## 🔌 API Integration

The frontend expects a backend running at `http://localhost:8000/api/v1`.
Ensure the backend is running before using the scheduled generation features.

## 📝 License

MIT
