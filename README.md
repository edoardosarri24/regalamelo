# Gift List
A modern, self-hosted web application to manage and share gift wish lists. Designed to keep the surprise alive for the celebrant while ensuring guests don't buy duplicate gifts.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Detailed technical documentation (LaTeX) is available in the `documentation/` directory, covering backend design, frontend architecture, and deployment strategies.


## Overview
The **Gift List** application allows:
- **Celebrants**: Create personalized wish lists, add items with descriptions and links, and share a unique link with friends. Claims are hidden from the celebrant to preserve the surprise.
- **Guests**: View shared lists, claim items to help others avoid duplicates, and unclaim if necessary. Guests access lists via an email-based session for notifications.

## Features
- **Gift Lists Management**: Create, edit, and organize lists for any occasion (birthdays, weddings, etc.).
- **Guest Interaction**: Guests can view public lists just by providing an email, avoiding complex sign-ups. They can confidentially claim gifts.
- **Advanced Image Uploading**: Support for uploading device images (JPG, PNG) and seamless automatic conversion of **HEIC** formats. Includes an interactive visual cropper and zoom tool. Added URL parsing that loads an external image directly into the cropper.
- **Drag & Drop**: Native drag & drop file uploader.
- **Italian Localization**: The entire web application UI has been fully translated and localized into Italian natively.
- **Surprise Preservation**: The celebrant cannot see which items have been claimed to keep the surprise alive.

## Architecture
The project is structured as a **PNPM Monorepo**:
- **`apps/backend`**: Node.js & Express API using Prisma ORM with PostgreSQL (includes Dockerfile). Configured for large payload processing (50MB) for base64 image strings.
- **`apps/frontend`**: React SPA built with Vite and TypeScript (includes Dockerfile & nginx.conf). Nginx acts as a proxy configured to accept larger user uploads.
- **`packages/shared`**: Shared Zod schemas and TypeScript types used by both frontend and backend.

## Tech Stack
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT (Authentication), Nodemailer.
- **Frontend**: React, Vite, TypeScript, TanStack Query, Axios, React Hook Form, CSS Modules, **react-easy-crop** (Image Cropping), **heic2any** (HEIC conversion).
- **Infrastructure**: Docker, Docker Compose, Nginx, Cloudflare Tunnels (for secure remote access).

## Prerequisites
- [Docker](https://www.docker.com/) (for containerized deployment)

## Deployment with Docker
The application is designed to be deployed exclusively using Docker and Docker Compose. This ensures a consistent environment across all platforms.
1. **Build and start the stack**:
   ```bash
   docker compose up -d --build
   ```
2. **Access the app**:
   - **Main UI**: `http://localhost` (mapped to port 80)
   - **Backend API**: `http://localhost/api/v1` (proxied via Nginx)

### Included Services:
- **`frontend`**: Nginx serving the React build.
- **`api`**: Node.js backend.
- **`db`**: PostgreSQL 17 database.
- **`db-backup`**: Automated daily database backups.
- **`tunnel`**: Cloudflare Tunnel for secure external access without port forwarding.