# 1-PDF-vector-read

Complete introductory pipeline for Retrieval-Augmented Generation (RAG):
**PDF Upload → Text Extraction → Semantic Chunking → Gemini Embedding → pgvector Storage → Cosine Similarity Search**.

---

## 🏗 Architecture (DDD & Layered Structure)

```
backend/src/
├── domain/document/
│   ├── entity/
│   │   ├── document.entity.ts               # Document metadata entity
│   │   └── document-chunk.entity.ts         # Document chunks entity
│   ├── repository/
│   │   └── document.repository.interface.ts # Domain repository contract
│   └── enum/
│       └── document-status.enum.ts          # PENDING | PROCESSING | COMPLETED | FAILED
│
├── infrastructure/
│   ├── database/
│   │   ├── config/orm-config.ts             # TypeORM Postgres DataSource
│   │   └── migrations/
│   │       └── 1777275300000-CreatePgVectorAndDocumentTables.ts # Enables pgvector & creates HNSW index
│   ├── repository/document-repository/
│   │   └── document.repository.ts           # pgvector TypeORM implementation (cosine distance <=> )
│   └── service/
│       ├── cloudinary/                      # Direct signed PDF upload service
│       ├── pdf-parser/                      # PDF text extraction
│       ├── text-chunker/                    # Recursive character chunking with overlap
│       └── gemini-embedding/                # Google Gemini text-embedding-004 (768-dim)
│
└── feature/
    ├── upload/                              # POST /upload/signed-url (Cloudinary signature)
    └── document/
        ├── process-document/                # POST /document/process (Parse -> Chunk -> Embed -> Save)
        └── search-document/                 # POST /document/search (Embed Query -> pgvector search)
```

---

## 🚀 Quick Start

### 1. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Ensure the following variables are configured in `backend/.env`:
```env
PORT=8090
BACKEND_URL=http://localhost:8090
FRONTEND_URL=http://localhost:3000

# PostgreSQL with pgvector
DB_POSTGRES_HOST=database   # use "localhost" if running postgres locally without docker
DB_POSTGRES_PORT=5432
DB_POSTGRES_USERNAME=postgres
DB_POSTGRES_PASSWORD=123
DB_POSTGRES_DATABASE=rag_db

# Cloudinary (PDF file hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=RAG_Learning

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8090
```

---

### 2. Run Database & Migrations

If using Docker Compose:
```bash
cd backend
docker compose up -d database
npm run migration:run
```

---

### 3. Start Development Servers

**Backend:**
```bash
cd backend
npm run start:dev
```
Runs at `http://localhost:8090`.

**Frontend:**
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Running Tests

```bash
cd backend
npm test
```
Vitest unit tests will execute, including chunking logic and controller specs.
