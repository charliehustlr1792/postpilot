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

## Architecture

PostPilot is a two-service app: a Next.js frontend and an Express API, backed by
PostgreSQL and Redis. The frontend reverse-proxies `/api/*` to the backend
(`frontend/next.config.ts`) so the browser, the Clerk session, and the OAuth
state cookie are all same-origin. Clerk handles authentication; a **Model B**
schema fans one `Post` out to one `PostTarget` per platform so each platform
publishes and fails independently. Scheduled publishing and periodic analytics
sync run on BullMQ workers hosted in the same backend process.

### System overview

```mermaid
flowchart TB
    B[Browser SPA - Next.js 15 / React 19]

    subgraph fe[Frontend - Next.js on Vercel]
      MW[clerkMiddleware route protection]
      RW[rewrites /api to backend]
    end

    subgraph be[Backend - Express 5 on Render]
      API[REST API /api]
      WRK[BullMQ workers - publish + analytics sync]
    end

    DB[(PostgreSQL - Supabase)]
    REDIS[(Redis - Upstash)]
    CLERK[Clerk - auth + user webhooks]
    CLOUD[Cloudinary - image uploads]
    RESEND[Resend - invite emails]
    SOC[Social APIs - X / LinkedIn / Meta / Reddit]

    B --> MW --> RW --> API
    B -. session token .-> CLERK
    API --> DB
    API --> REDIS
    WRK --> REDIS
    WRK --> DB
    WRK --> SOC
    API --> CLOUD
    API --> RESEND
    CLERK -. user webhooks .-> API
    API -. oauth connect .-> SOC
```

### Scheduled publish flow

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Next.js proxy
    participant API as Express API
    participant DB as PostgreSQL
    participant Q as BullMQ Redis
    participant W as Publish Worker
    participant S as Social API

    U->>FE: POST schedule request
    FE->>API: proxied request plus Bearer token
    API->>DB: load post and targets, owner check
    API->>Q: add delayed job per target
    API->>DB: mark targets SCHEDULED and create ScheduledJob rows
    Note over Q,W: scheduled delay elapses
    Q->>W: deliver job, concurrency 5
    W->>DB: load target and encrypted token
    W->>S: publish with decrypted token
    S-->>W: platform post id or error
    W->>DB: mark PUBLISHED or FAILED
```

### OAuth account-connect flow

```mermaid
sequenceDiagram
    actor U as User
    participant API as Express API
    participant P as OAuth Provider
    participant DB as PostgreSQL

    U->>API: GET account auth, authenticated
    API->>API: build consent URL and sign HttpOnly state cookie
    API-->>U: return consent url
    U->>P: browser redirect to consent screen
    P-->>U: redirect to callback with code and state
    U->>API: GET account callback, state cookie only
    API->>API: verify signed state and PKCE
    API->>P: exchange code for tokens
    API->>P: fetch profile
    API->>DB: upsert SocialAccount, tokens AES-256-GCM encrypted
    API-->>U: redirect to accounts connected success
```

## Run with Docker

Runs the full stack locally: frontend, backend, Postgres, and Redis.

1. Fill in `backend/.env` and `frontend/.env` (see the matching `.env.example` files).
2. Copy `.env.example` to `.env` in the project root and set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (the frontend build needs it).
3. Start everything:

   ```
   docker compose up --build
   ```

The frontend is at http://localhost:3000 and the backend at http://localhost:5000. The backend applies database migrations on start and runs the background job worker in the same container. Postgres and Redis data persist in named volumes.
