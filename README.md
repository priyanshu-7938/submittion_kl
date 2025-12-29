# GreenRoot Botanicals – Take-Home Assignment

This repository contains a **full-stack AI-powered customer support agent** built for the **Spur Founding Engineer assignment**.

The application simulates a customer service chat widget for a fictional company, **GreenRoot Botanicals**. It uses a **Retrieval-Augmented Generation (RAG)** architecture to ground LLM responses in verified business knowledge (shipping policies, operating hours, etc.) provided via raw text files.

---

## Tech Stack

**Backend**
- Node.js + TypeScript (Express)

**Database**
- PostgreSQL (with `pgvector` extension)

**ORM**
- Prisma

**Caching**
- Redis

**LLM Integration**
- Google Gemini (Google Generative AI SDK)

**Frontend**
- React + Tailwind CSS

---

## Architecture Overview

The backend follows a **modular separation-of-concerns design**, ensuring that business logic, safety, and data persistence are cleanly decoupled.

### Core Components

- **Knowledge Engine (RAG)**
  - Ingests domain knowledge
  - Performs semantic search using PostgreSQL `pgvector`

- **Guards Module (Trust & Safety)**
  - Input validation using heuristics and regex filters
  - GenAI-based audits before requests reach the LLM

- **Data Layer**
  - Centralized persistence interface
  - Redis for chat context & history caching
  - PostgreSQL for durable async writes

- **LLM Service**
  - Wraps the Google Gemini API
  - Assembles context and generates grounded responses

---

## Database Schema (Prisma)

The project uses Prisma with PostgreSQL and the `pgvector` extension to store embeddings with **dimension 768**.

```prisma
model KnowledgeBase {
  id        Int      @id @default(autoincrement())
  content   String
  embedding Unsupported("vector(768)")?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("knowledge_base")
}

model Session {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  messages  ChatMessage[]
}

model ChatMessage {
  id        Int      @id @default(autoincrement())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id])
  role      Role
  content   String
  createdAt DateTime @default(now())
}

enum Role {
  USER
  BOT
}
```

## Setup & Run Instructions

### Prerequisites

- Node.js **v18+**
- Docker (for PostgreSQL & Redis)
- Google Gemini API Key

---

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Backend
DATABASE_URL="postgresql://user:password@localhost:5432/greenroot?schema=public"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="AIzaSy..."
COMPANY_NAME="GreenRoot Botanicals"
PORT=3000

# Frontend
VITE_API_URL="http://localhost:3000"

```
### 2. Start Infrastructure

Start the required backend services:

- **PostgreSQL** (ensure the `pgvector` extension is enabled)
- **Redis** server

These can be run locally or via Docker.

---

### 3. Install Dependencies & Migrate Database

Install project dependencies and apply database migrations:

```bash
npm install
npx prisma migrate dev --name "initial migrate"
```

### 4. Seed Knowledge Base (RAG Hydration)

Run the hydration process to parse `business-info/data.txt` and populate the vector store.

Temporarily enable the hydration endpoint in the backend:

```ts
app.post("/hydrate", hydrateController);
```

### 5. Run Development Servers

**Backend**
```bash
npm run dev
```

**Frontend**
```bash
npm run dev
```

## Design Decisions & Trade-offs

### Embedding Alignment
Uses `vector(768)` to align with Google’s `text-embedding-004` model output.

### Caching vs. Consistency
Chat history is aggressively cached in Redis to achieve low-latency responses.

### Frontend State Management
Session history is managed using `sessionStorage` and local component state to keep the frontend lightweight.

### Guards Latency
GenAI-based safety checks introduce minor latency while preventing prompt injection and misuse.

---

## Project Structure

```bash
/prisma
/business-info        # Raw text data for RAG
/src
  /modules
    /knowledge        # Vector search & hydration logic (Gemini embeddings)
    /guards           # Validation & safety checks
    /data             # DB & Redis abstraction layer
    /llm              # Google Gemini integration
    /server
```
