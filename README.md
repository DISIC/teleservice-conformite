# Téléservice Conformité

Téléservice Conformité is a web application built with [Next.js](https://nextjs.org/), [Payload CMS](https://payloadcms.com/), and [tRPC](https://trpc.io/). It provides a robust platform for managing and ensuring compliance in digital services.

## Features

- Modern frontend with Next.js
- Flexible content management via Payload CMS
- Type-safe API communication using tRPC

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Yarn](https://yarnpkg.com/)

### Installation

1. **Install dependencies:**

```bash
yarn install
```

2. **Configure environment variables:**

Copy the example environment file and update it as needed:

```bash
cp .env.example .env
```

3. **Start the database:**

```bash
docker compose up -d
```

4. **Start the development server:**

```bash
yarn dev
```

5. Visit [http://localhost:3000](http://localhost:3000) to view the app.
