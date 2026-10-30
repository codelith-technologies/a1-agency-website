# A-One Foreign Employment Agency — Monorepo

Enterprise-grade monorepo for A-One Agency, separating the public recruitment portal from the internal administration dashboard while sharing canonical data models, UI design tokens, validation schemas, and database clients.

---

## 🌐 Live GitHub Pages Links

* 🌍 **Public Website:** [https://dananjarukshan.github.io/a1-agency-website/](https://dananjarukshan.github.io/a1-agency-website/)
* 🛡️ **Admin Portal / Login:** [https://dananjarukshan.github.io/a1-agency-website/admin/](https://dananjarukshan.github.io/a1-agency-website/admin/)
* 📊 **Admin Dashboard:** [https://dananjarukshan.github.io/a1-agency-website/admin/dashboard](https://dananjarukshan.github.io/a1-agency-website/admin/dashboard)

### 🔐 Demo Admin Credentials
* **Email:** `admin@a-oneagency.lk` (or `admin@a-oneagency.com`)
* **Password:** `admin123456`
* *(A one-click **"Auto-fill"** button is also available directly on the login screen)*

---

## 🏗️ Architecture Overview

Managed via **NPM Workspaces** and orchestrated with **Turborepo**:

```
a1-agency-monorepo/
├── apps/
│   ├── web/                    # Public Portal (Next.js 16)
│   │   └── src/app/            # /, /about, /jobs, /countries, /employers, etc.
│   │
│   └── admin/                  # Agency Management Dashboard (Next.js 16)
│       └── src/app/            # /dashboard, /jobs, /applicants, /reviews, etc.
│
├── packages/
│   ├── types/                  # @a1/types — Canonical TypeScript data models & DTOs
│   ├── ui/                     # @a1/ui — Shared UI primitives, breadcrumbs, cn()
│   ├── config/                 # @a1/config — Tailwind CSS v4 design tokens & theme
│   └── database/               # @a1/database — Supabase clients & Zod validation schemas
│
├── .github/workflows/          # GitHub Pages CI/CD automated deployment workflow
├── scripts/build-gh-pages.mjs  # Unified builder for GitHub Pages
├── turbo.json                  # Turborepo task pipeline
└── package.json                # Root workspaces definition
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Workspace Dependencies
From the repository root:
```bash
npm install
```

### 2. Run Both Applications Concurrently
```bash
npm run dev
```
Turborepo will concurrently launch:
* 🌐 **Public Website:** [http://localhost:3000](http://localhost:3000)
* 🛡️ **Admin Dashboard:** [http://localhost:3001](http://localhost:3001) (redirects to `/dashboard`)
* 🔐 **Admin Login:** [http://localhost:3001/login](http://localhost:3001/login)

### 3. Build for GitHub Pages
```bash
npm run build:pages
```
Outputs the complete unified static build for both website and dashboard into `dist/`.
