<p align="center">
  <img src="frontend/public/assets/logo.jpg" alt="PostPilot logo" width="160" />
</p>


<p align="center">Create, schedule, and publish content across your social accounts from one place</p>

## Core Features

- Write a post once and publish it to multiple platforms
- Schedule posts to go out at a set time using a background job queue
- Track engagement and reach in an analytics dashboard
- Connect and manage your social accounts in one view

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-EF4444?style=for-the-badge&logo=bull&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)

## Run with Docker

Runs the full stack locally: frontend, backend, Postgres, and Redis.

1. Fill in `backend/.env` and `frontend/.env` (see the matching `.env.example` files).
2. Copy `.env.example` to `.env` in the project root and set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (the frontend build needs it).
3. Start everything:

   ```
   docker compose up --build
   ```

The frontend is at http://localhost:3000 and the backend at http://localhost:5000. The backend applies database migrations on start and runs the background job worker in the same container. Postgres and Redis data persist in named volumes.
