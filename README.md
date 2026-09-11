# 🔁 CampusLoop

**Report campus issues. Give useful things a second life.**

CampusLoop is a responsive React application that brings campus maintenance reports and reusable-item listings into one shared board — so students can report problems, offer items they no longer need, and track each post's progress in one place.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-1AD1A5?style=flat)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## Table of Contents

- [Problem](#problem)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Stretch Features](#stretch-features)
- [Interface & UX](#interface-and-user-experience)
- [Tech Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Project Structure](#main-files)
- [Getting Started](#getting-started)
- [Demo Limitations](#demo-limitations)
- [Team Collaboration](#team-collaboration)
- [AI Assistance](#ai-assistance)

---

## Problem

Campus maintenance reports and reusable-item offers often get scattered across conversations and group chats, making them difficult to find and track.

## Target Users

College students reporting campus issues or sharing reusable items with other students.

## Core Features

### 📝 Create Campus Posts
Create a **Fix** report or a **ReUse** listing with a title, description, location, and category.

### 🔍 Browse, Search, and Filter
Browse the campus board, search by title, description, or location, and filter posts by type and category.

### 📄 View and Manage Posts
Open individual post details, edit information, and delete posts with confirmation.

### 📊 Track Progress
Update posts through their relevant statuses:

| Fix reports | ReUse listings |
|---|---|
| Reported | Available |
| In progress | Reserved |
| Resolved | Collected |

## Stretch Features

- **Photo attachments** — Upload an optional image through Supabase Storage and display it on cards and detail pages.
- **Status summary** — View counts of open issues, resolved issues, available items, and collected items.

## Interface and User Experience

- Responsive layouts for mobile and desktop
- Light and dark themes with a saved preference
- Saved board filters and create-post drafts using `localStorage`
- Loading indicators, request error messages, and retry controls
- Form validation and feedback for invalid inputs
- Separate messages for an empty board and searches with no matches
- Disabled controls while saving, to help prevent repeated submissions
- Image fallback when an attachment cannot load
- Hover, keyboard-focus, and touch feedback

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Components, state, and user interactions |
| Vite | Development and production builds |
| React Router | Navigation between board, creation, and detail views |
| Tailwind CSS & DaisyUI | Styling and interface components |
| MockAPI | Store, retrieve, update, and delete posts |
| Supabase Storage | Store uploaded images |
| localStorage | Preserve drafts, filters, and theme preferences |
| GitHub | Version control and pull requests |
| Vercel | Frontend hosting |

## Data Flow

- `App.jsx` owns the shared posts state and loads board data from MockAPI.
- Components receive data and callbacks through props. After a successful create, update, or delete request, callbacks update the shared state so the interface reflects the change.
- Search and filtering operate on the loaded posts without making additional API requests.
- Images are uploaded to Supabase Storage, and their URLs are saved with the corresponding MockAPI posts.

## Main Files

| File | Responsibility |
|---|---|
| `src/App.jsx` | Shared posts state, initial fetching, routes, and loading/error handling |
| `src/Header.jsx` | Branding and navigation |
| `src/Posts.jsx` | Board, search, filtering, and results |
| `src/PostCard.jsx` | Individual post preview |
| `src/CreatePost.jsx` | Post creation, validation, and draft persistence |
| `src/PostDetails.jsx` | Full post information and management controls |
| `src/EditPost.jsx` | Editing existing post information |
| `src/StatusEditor.jsx` | Status updates |
| `src/StatusSummary.jsx` | Summary counts derived from posts |
| `src/ImagePicker.jsx` | Image selection, validation, and upload |
| `src/PostImage.jsx` | Image display and failure fallback |
| `src/ThemeToggle.jsx` | Light/dark theme control |
| `src/supabaseClient.js` | Supabase client configuration |
| `src/index.css` | Shared styling and theme rules |

## Getting Started

> The steps below follow the standard setup for a Vite + React project. Adjust environment variable names to match your MockAPI and Supabase configuration.

```bash
# Clone the repository
git clone https://github.com/<your-org>/campusloop.git
cd campusloop

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# then fill in your MockAPI endpoint and Supabase project keys

# Start the development server
npm run dev
```

Build for production:

```bash
npm run build
```

## Demo Limitations

- Authentication is not implemented. Edit, delete, and status controls are shared demo controls, not restricted to a post's creator.
- Loading and saving remote data require an internet connection.
- `localStorage` preferences and drafts belong to the current browser.
- Uploaded images use a public storage bucket and should not contain private information.
- Removing an attachment from a draft does not automatically delete its uploaded storage file.
- Status changes are entered manually; they do not represent verified action by campus authorities.

## Team Collaboration

The project was assembled through individual Git branches, commits, and pull requests, with responsibilities divided across core functionality, board components, and styling.

## AI Assistance

ChatGPT/Codex was used throughout development to help refine the project idea, plan the interface, generate and improve React code and styling, and troubleshoot errors — as well as provide guidance on MockAPI, Supabase Storage, GitHub, and Vercel. The team integrated and adapted the suggested code, configured the services, tested the application, and managed commits and deployment.