# G-Scores - Student Management System

A web application for managing and analyzing student scores, built with Next.js, TypeScript, and SQLite.

## Features

- Score checking by registration number
- Score reporting with 4 levels:
  - >= 8 points
  - 8 points > && >= 6 points
  - 6 points > && >= 4 points
  - < 4 points
- Statistics of student scores by subjects (with charts)
- Top 10 students in group A (math, physics, chemistry)
- Responsive design for all devices

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: SQLite with Prisma ORM
- Charts: Chart.js
- UI Components: Headless UI, Heroicons

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vhakHCMUS/student-manage-ts
cd student-management-react
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js 13+ app directory
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
├── prisma/             # Database schema and migrations
└── types/              # TypeScript type definitions
```

## Deployment

This project is configured for easy deployment on Vercel. Simply push your code to GitHub and connect your repository to Vercel.

## License

This project is licensed under the MIT License.
