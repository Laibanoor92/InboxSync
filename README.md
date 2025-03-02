# Email PDF Manager

A Next.js application for managing email configurations and downloading PDF attachments.

## Setup

1. Install dependencies:
   ```bash
   npm install

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Development

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+
- Gmail API credentials (for Gmail integration)

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

### Database Management
- Generate Prisma client: `npx prisma generate`
- Reset database: `npx prisma db reset`
- Open Prisma Studio: `npx prisma studio`

### Testing
```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e
 ```

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
