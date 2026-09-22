# TrackThat

Cross-platform fitness tracking application for managing workouts, exercises, body weight, supplements and overall training progress.

The application uses the [TrackThat API](https://github.com/svenson95/trackthat-api) for authentication and application data.

## Tech Stack

- Angular
- Ionic
- Capacitor
- TypeScript
- Google Authentication
- ngx-translate
- Progressive Web App (PWA)

## Requirements

- Node.js
- npm
- Ionic CLI

Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

Install project dependencies:

```bash
npm install
```

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

The application is available at:

```text
http://localhost:8100
```

## Build

Create a production build:

```bash
npm run build
```

Start a development build in watch mode:

```bash
npm run watch
```

## Testing

Run unit and component tests:

```bash
npm test
```

Run tests in CI mode:

```bash
npm run test:ci
```

Run tests with verbose output for debugging:

```bash
npm run test:debug
```

Run end-to-end tests using the Cypress UI:

```bash
npm run e2e
```

Run end-to-end tests headlessly:

```bash
npm run e2e:run
```

## Code Quality

Run ESLint:

```bash
npm run lint
```

## iOS

Build the application, synchronize the Capacitor project and open it in Xcode:

```bash
npm run start-ios
```

## Environment Variables

The application requires a Google OAuth client ID:

```text
GOOGLE_CLIENT_ID=your-google-client-id
```

## Hosting

The web application is deployed on Vercel as a static production build.

The application can also be built as a native iOS application using Capacitor.

## Versions

as of September 22, 2026:

| Technology | Version |
| ---------- | ------- |
| Angular    | 22      |
| Ionic      | 9       |
| Capacitor  | 7       |
| Node.js    | 24      |
| TypeScript | 6       |

Check installed versions locally:

```bash
ng version
ionic info
node --version
```
