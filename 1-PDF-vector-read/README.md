# 1-PDF-vector-read

Step 1 of the RAG (Retrieval-Augmented Generation) pipeline: **Clean PDF Upload Interface & Backend Signed URL Service**.

This repository provides a clean, minimal foundation specifically built for learning RAG. All unrelated boilerplate (authentication, user login/signup, Firebase, websockets, bcrypt, cookie sessions) has been removed.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Material UI (MUI), Redux Toolkit.
- **Backend**: NestJS 12, TypeScript, TypeORM, Cloudinary SDK.
- **Database**: PostgreSQL with `pgvector` extension (via `pgvector/pgvector:pg16` Docker image).

---

## 📁 Project Structure

```
1-PDF-vector-read/
├── backend/
│   ├── src/
│   │   ├── feature/
│   │   │   └── upload/                     # Cloudinary signed URL generation
│   │   ├── infrastructure/
│   │   │   ├── database/config/            # TypeORM configuration
│   │   │   ├── exception-filter/           # Global exception handling
│   │   │   └── service/cloudinary/         # Cloudinary signing service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── docker-compose.yml                  # Postgres (pgvector) + pgAdmin + Backend
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Clean PDF upload UI
│   │   │   └── layout.tsx
│   │   ├── component/
│   │   │   ├── file-upload/                # PDF file selector & uploader
│   │   │   └── search-comp/                # Search component for vector query
│   │   └── redux/                          # Redux store & upload action
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Fill in your Cloudinary credentials in `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=pdf_uploads
```

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8090
```

---

### 2. Run Locally

#### Backend:
```bash
cd backend
npm install
npm run start:dev
```
The backend will run at `http://localhost:8090`.

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### 3. Run with Docker Compose

To run PostgreSQL with `pgvector`, pgAdmin, and Backend together:

```bash
cd backend
docker compose up --build
```

- **Backend API**: `http://localhost:8090`
- **pgAdmin**: `http://localhost:5050` (Email: `admin@admin.com`, Password: `admin`)
- **Postgres (pgvector)**: `localhost:5432` (`database: rag_db`, `user: postgres`, `password: 123`)

---

## 🧭 How Upload Works in this Step

1. **User selects a PDF** in the frontend interface.
2. The frontend requests a **signed upload URL** from the backend (`POST /upload/signed-url`).
3. The backend generates a signed signature using your Cloudinary API secret without exposing secret keys to the browser.
4. The frontend directly uploads the PDF file to Cloudinary and receives the secure document URL.
5. In the next stage, this PDF will be downloaded, chunked, embedded, and stored into `pgvector` for semantic search.
