# Development Environment Setup

## Prerequisites

- Infomaniak account
- Node.js 20.x
- pnpm
- Docker
- mkcert

## Steps

1. Copy /.env.example to /.env and /apps/builder/.env.example to /apps/builder/.env
2. Go to the [Infomaniak Manager Application API panel](https://manager.infomaniak.com/v3/845081/ng/profile/user/applications/list), create a new application with the following settings:
   - Application type: Web Front-End
   - Scopes:
     - openid
     - profile
     - email
     - phone
   - Redirect URL:
     - https://builder.sociarena.com/auth/infomaniak/callback
     - https://vite.wstd.dev:5173/auth/infomaniak/callback
3. Fill in environment variables in both /.env and /apps/builder/.env
4. Run database migrations:
   ```
   npm run migrations migrate
   ```
5. Generate web developer certificates:

   ```bash
   # Install mkcert if needed
   brew install mkcert  # macOS
   # or: sudo apt install mkcert  # Ubuntu/Debian

   # Install local CA (only once)
   mkcert -install

   # Generate certificates in the https/ folder
   cd https/
   mkcert -key-file privkey.pem -cert-file fullchain.pem "wstd.dev" "*.wstd.dev" "vite.wstd.dev" "*.vite.wstd.dev"

   # Create combined certificate for HAProxy
   cat fullchain.pem privkey.pem > haproxy.pem

   cd ..
   ```

6. Run the Docker Compose dev stack:
   ```
   docker-compose -f docker-compose.dev.yml up -d
   ```
7. Run the app:
   ```
   npm run dev
   ```
8. Access the app at https://vite.wstd.dev:5173
