# Corgi Chat

Free and secure video hangouts for everyone.

This repo is migrating from the legacy CRA + mesh WebRTC stack to a modern Turborepo monorepo.

## Monorepo layout

```
apps/web/          Next.js 15 app (new)
legacy/client/     Legacy CRA frontend (frozen)
legacy/server/     Legacy Socket.IO server (frozen)
packages/ui/       Shared UI components
packages/core/     Shared hooks and utilities
packages/db/       Drizzle schema + Postgres client
docs/migration/    Step-by-step agent migration prompts
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- Supabase project (Postgres `DATABASE_URL`)
- Clerk application

## Quick start

```bash
pnpm install
cp .env.example apps/web/.env.local
# Fill in Clerk + DATABASE_URL in apps/web/.env.local
pnpm db:push
pnpm dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js web app |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests |
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm legacy:start` | Start legacy CRA + Socket.IO (deprecated) |

## Migration status

| Phase | Status |
|-------|--------|
| 0 Foundation | Complete |
| 1 Auth & Rooms | Complete |
| 2 LiveKit video | Complete |
| 3 Persistent chat | Pending |
| 4 Activities | Pending |
| 5 Cutover | Pending |
| 6 Desktop (Tauri) | Pending |

See `docs/migration/` for agent prompts to continue the migration.

## License

MIT — original corgi video chat by [getcorgi/corgi](https://github.com/getcorgi/corgi).
# corgi-chat

Free and secure video hangouts for everyone.

Migrated from [getcorgi/corgi](https://github.com/getcorgi/corgi) (MIT License).

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)
- [Firebase account](https://firebase.google.com/)

## Installation

### Clone repository:

```sh
$ git clone https://github.com/escache/corgi-chat.git
```

### Install dependencies:

```sh
$ yarn
```

### Setup Firebase

This app uses [Firebase](https://firebase.google.com/) as a database to persist some basic user and group information. Create an account and setup the following database rules:

```
{
  "rules": {
    "peers": {
      "$uid": {
        "$id": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid",
          "$otherUid": {
            "$otherId": {
              ".read": "auth != null && auth.uid == $otherUid",
              ".write": "auth != null && auth.uid == $otherUid",
              "sdp": {
                ".validate": "newData.isString() && newData.val().length < 4000"
              },
              "type": {
                ".validate": "newData.val() == 'offer' || newData.val() == 'answer' || newData.val() == 'error'"
              },
              "$other": { ".validate": false }
            }
          }
        }
      }
    }
  }
}
```

### Setup environment variables

In the root directory create a `.env.local` file with the following variables:
These can be found settings -> general in the firebase console.

```
REACT_APP_API_KEY=<firebaseApiKey>
REACT_APP_AUTH_DOMAIN=<firebaseAuthDomain>
REACT_APP_DATABASE_URL=<firebaseDatabaseUrl>
REACT_APP_PROJECT_ID=<firebaseProjectId>
REACT_APP_STORAGE_BUCKET=<firebaseStorageBucket>
REACT_APP_MESSAGING_SENDER_ID=<firebaseMessagingSenderId>
REACT_APP_ID=<firebaseAppId>
REACT_APP_MEASUREMENT_ID=<firebaseMeasurementId>
REACT_APP_SOCKET_SERVER="http://localhost:8080"
REACT_APP_GIPHY_API_KEY=<giphyAPIKey>
```

## Available Scripts

### `yarn start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn lint`

Lints the files.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn storybook`

Runs storybook on [http://localhost:9009](http://localhost:9009).

## License

MIT — see [getcorgi/corgi](https://github.com/getcorgi/corgi) for original authorship.
