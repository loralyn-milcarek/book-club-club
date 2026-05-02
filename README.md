# Book Club Club

A book club management application for organizing clubs, tracking reads, and keeping members in sync.

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **Deployment**: Vercel

## Development

### Environment Setup

First, create a `.env.local` file in the project root with the following environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/bookclubclub"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/bookclubclub_shadow"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: OAuth Providers (GitHub, Google, etc.)
# GITHUB_ID="your-github-app-id"
# GITHUB_SECRET="your-github-app-secret"
# GOOGLE_ID="your-google-app-id"
# GOOGLE_SECRET="your-google-app-secret"
```

> For Neon PostgreSQL, get your connection string from the Neon dashboard. Use the "Pooling" connection string for `DATABASE_URL`. The `SHADOW_DATABASE_URL` is used by Prisma for migrations—create a separate database in Neon for this if using `prisma migrate dev`.

### Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
   This applies all pending migrations and seeds the database if a seed script is defined.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
