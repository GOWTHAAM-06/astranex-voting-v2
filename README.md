# ASTRANEX '26 - Digital Voting System

*A secure, real-time voting platform for SRG Engineering College.*

## Overview

ASTRANEX '26 is a modern, high-performance web application designed to facilitate secure and transparent student elections. Built specifically for SRG Engineering College, the platform empowers students to cast their votes seamlessly while providing Heads of Departments (HOD) and administrators with a comprehensive command center for real-time election monitoring and turnout analysis.

## Key Features

- **Dynamic Student Authentication & Voting Gateway:** Secure login and session management ensuring strict voter verification.
- **Real-time Election Countdown & Turnout Monitoring:** Live metrics and time tracking to keep participants and admins informed.
- **HOD / Admin Command Center:** Rich data visualizations and live analytics powered by Recharts.
- **Dynamic Ballot System:** Comprehensive voting interface covering 8 distinct candidate positions (President, Vice President, etc.).
- **PostgREST & Supabase Row-Level Data Handling:** Secure, scalable backend infrastructure with robust row-level security (RLS) and access controls.

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL & Authentication)
- **Data Visualization:** Recharts
- **Icons:** Lucide Icons

## Setup & Environment Variables

To run this project locally, you need to configure your environment variables. Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Production Architecture & Optimization

This application is optimized for production performance using Vite and Rollup. It features intelligent code-splitting, dynamic routing via `React.lazy()`, and modular Suspense boundaries. This granular bundle architecture (splitting out chunks for `charts`, `supabase`, and specific vendor files) ensures that users only download the exact Javascript required for their current view, drastically improving initial load times and delivering a premium user experience.
