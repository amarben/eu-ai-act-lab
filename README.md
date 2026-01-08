# EU AI Act Implementation Lab

A comprehensive web-based tool for understanding and implementing EU AI Act compliance requirements. This application provides practical, step-by-step guidance for organizations to assess, document, and manage their AI systems in accordance with EU regulations.

## Features

- **Organization & Profile Management**: Set up organization details and manage team members
- **AI System Inventory**: Track and catalog all AI systems across your organization
- **Risk Classification**: Classify AI systems according to EU AI Act risk categories
- **Gap Assessment**: Identify compliance gaps and get actionable recommendations
- **AI Governance**: Establish governance frameworks and policies
- **Risk Management**: Comprehensive risk assessment and mitigation planning
- **Technical Documentation**: AI-powered generation of compliance documentation
- **Training Tracking**: Monitor compliance training completion
- **Incident Logging**: Track and manage AI system incidents
- **Compliance Dashboard**: Real-time overview of your compliance status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **AI Integration**: Google Gemini Flash 2.0 API
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Package Manager**: pnpm

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or higher
- pnpm 8.x or higher
- PostgreSQL 14.x or higher
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "EU AI Act Lab"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/euaiact"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Set Up the Database

Create a PostgreSQL database:

```bash
createdb euaiact
```

Run Prisma migrations:

```bash
pnpm db:migrate
```

Seed the database with demo data (optional):

```bash
pnpm db:seed
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

If you seeded the database, you can use these credentials:

- **Admin**: `admin@demo.com` / `demo-password-2025`
- **Compliance Officer**: `compliance@demo.com` / `demo-password-2025`

## Project Structure

```
EU AI Act Lab/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Context providers
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── utils.ts          # Utility functions
│   ├── constants.ts      # App constants
│   ├── errors.ts         # Custom error classes
│   └── validations/      # Zod schemas
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeder
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests
├── types/                # TypeScript type definitions
├── docs/                 # Documentation
│   ├── PRD.md                      # Product Requirements
│   ├── TECHNICAL_SPEC.md           # Technical Specifications
│   ├── API_DOCUMENTATION.md        # API Reference
│   ├── DEPLOYMENT_GUIDE.md         # Deployment Instructions
│   └── TESTING_GUIDE.md            # Testing Strategies
└── public/               # Static assets
```

## Available Scripts

### Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

### Database

```bash
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database with demo data
pnpm db:studio    # Open Prisma Studio (database GUI)
pnpm db:push      # Push schema changes without migrations
pnpm db:reset     # Reset database (WARNING: deletes all data)
```

### Testing

```bash
pnpm test         # Run unit tests
pnpm test:watch   # Run tests in watch mode
pnpm test:ui      # Open Vitest UI
pnpm test:e2e     # Run E2E tests
pnpm test:e2e:ui  # Run E2E tests with UI
```

## Configuration

### Database

The application uses PostgreSQL. Configure your database connection in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

For production, consider using a managed PostgreSQL service like:
- Neon
- Supabase
- AWS RDS
- Google Cloud SQL

### Authentication

NextAuth.js is configured for:
- Email/password authentication
- Session management with JWT

To enable OAuth providers (Google, GitHub, etc.), add them to `lib/auth.ts`.

### Gemini AI Integration

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to `.env.local`:

```env
GEMINI_API_KEY="your-api-key-here"
```

Free tier limits:
- 15 requests per minute
- 1,500 requests per day

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

### Docker

```bash
docker-compose up -d
```

### AWS

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for AWS deployment with ECS.

## Testing

### Unit Tests

```bash
pnpm test
```

Tests are written using Vitest and React Testing Library.

### E2E Tests

```bash
pnpm test:e2e
```

E2E tests are written using Playwright and cover critical user journeys.

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Specifications](docs/TECHNICAL_SPEC.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [UI Wireframes](docs/UI_WIREFRAMES.md)
- [Gemini Integration Guide](docs/GEMINI_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Testing Guide](docs/TESTING_GUIDE.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or support:
- Create an issue in the repository
- Refer to the [documentation](docs/)
- Contact the development team

## Roadmap

- [ ] Module 1: Organization & Profile Setup
- [ ] Module 2: AI System Inventory
- [ ] Module 3: Risk Classification Tool
- [ ] Module 4: Gap Assessment
- [ ] Module 5: AI Governance Framework
- [ ] Module 6: Risk Management Module
- [ ] Module 7: Technical Documentation Generator
- [ ] Module 8: Training Tracking
- [ ] Module 9: Incident Logging
- [ ] Module 10: Compliance Dashboard

## Acknowledgments

- [EU AI Act](https://artificialintelligenceact.eu/) official documentation
- [Next.js](https://nextjs.org/) framework
- [shadcn/ui](https://ui.shadcn.com/) component library
- [Prisma](https://www.prisma.io/) ORM
- [Google Gemini](https://ai.google.dev/) AI integration

---

**Built with ❤️ for EU AI Act Compliance**
