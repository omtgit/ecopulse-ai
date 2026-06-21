# EcoPulse AI 🌍

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black)

EcoPulse AI is a production-ready full-stack web application that helps users understand, track, and reduce their carbon footprint through simple actions and personalized AI insights.

## Features
- 📊 **Smart Carbon Calculator**: Track emissions across transport, electricity, food, shopping, and waste.
- 🤖 **AI Sustainability Coach**: Get personalized reduction suggestions and behavioral nudges using Gemini API.
- 📈 **Carbon Dashboard**: Visualize footprint trends, category breakdowns, and reduction streaks.
- ✅ **Habit Tracker**: Daily check-ins to track eco-friendly habits.
- 🏆 **Eco Challenges**: Participate in weekly challenges to earn points and badges.
- 🔮 **Forecast Engine**: Predict next 30 days footprint based on current behavior.
- 🏅 **Leaderboard**: Compare progress with friends.
- 📄 **Weekly Reports**: Generate downloadable PDF sustainability reports.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js (Auth.js)
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Testing**: Jest, React Testing Library
- **State Management**: Zustand
- **Validation**: Zod

## Quick Start
1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Start PostgreSQL (e.g. using docker-compose: `docker-compose up -d`)
5. Run migrations: `npx prisma db push`
6. Seed the database: `npx prisma db seed`
7. Start the dev server: `npm run dev`
8. Open [http://localhost:3000](http://localhost:3000)

## API Documentation
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/carbon` | Submit carbon entries | Yes |
| GET | `/api/carbon/summary` | Get monthly footprint summary | Yes |
| GET | `/api/habits` | Get habit logs | Yes |
| POST | `/api/ai/recommendations`| Generate AI recommendations | Yes |
| POST | `/api/reports` | Generate weekly PDF report | Yes |

*(Many more endpoints available in the source code)*

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `NEXT_PUBLIC_APP_URL`: App URL
- `GEMINI_API_KEY`: API key for Google Gemini

## Testing
Run unit and component tests:
`npm run test`

## Deployment
Recommended: Deploy on **Vercel** and use a managed Postgres provider like **Neon** or **Supabase**.

## License
MIT License.
