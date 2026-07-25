# Operatime Web App

Operatime is a portfolio movie-ticket booking application built to demonstrate
an end-to-end Angular experience: public movie discovery, secure authentication,
seat selection, a recruiter-friendly demo checkout, booking history, and digital
ticket QR codes.

This repository contains the Angular frontend. The API is maintained in the
sibling `OperatimeServer` repository.

> **Portfolio demo:** Operatime does not sell real cinema tickets. The default
> checkout does not charge money, and generated tickets and QR codes are for
> demonstration only.

## Features

- Public homepage with now-playing, popular, trending, and latest movie rows.
- Movie details, trailers, cast information, ratings, and summaries.
- Search with initial recommendations, pagination, whitespace protection, and
  poster-only result filtering.
- Email/password and verified Google sign-in.
- Authentication through an HttpOnly backend session cookie; tokens are never
  stored in browser storage.
- Protected booking and profile routes.
- Interactive 48-seat layout with occupied-seat and four-seat-limit handling.
- One-click **Complete Demo Booking** flow for portfolio visitors.
- Optional, clearly labelled PayPal Sandbox integration.
- Profile page with booking history and dense demo-ticket QR codes.
- Responsive dark interface with a shared muted wine-red design system.

## Application flow

```text
Public visitor
  -> browses/searches movies
  -> selects Book Tickets
  -> signs in when required
  -> selects seats
  -> completes a demo booking (or optionally tests PayPal Sandbox)
  -> views the saved ticket and QR code in their profile

Angular browser
  -> OperatimeServer /api
  -> MongoDB for users/bookings
  -> TMDB for movie catalog data
```

## Technology

- Angular 18 with standalone components
- Angular Material
- RxJS
- Bootstrap
- Google Identity through `@abacritt/angularx-social-login`
- PayPal Sandbox through `ngx-paypal`
- TMDB images and catalog data, accessed through the backend

## Requirements

- Node.js 18 or newer
- npm
- The sibling `OperatimeServer` running locally on port `3000`

## Local setup

1. Start the backend:

   ```powershell
   cd C:\Projects\OperatimeServer
   npm install
   npm start
   ```

2. Install and start the Angular app:

   ```powershell
   cd C:\Projects\OperatimeApp
   npm install
   npm start
   ```

3. Open `http://localhost:4200`.

## Frontend environments

Angular environments are stored in:

- `src/environments/environment.ts` for local development.
- `src/environments/environment.production.ts` for production builds.

Development currently uses:

```ts
apiBaseUrl: 'http://localhost:3000/api'
```

Production currently uses:

```ts
apiBaseUrl: '/api'
```

Netlify uses `netlify.toml` to proxy `/api/*` to
`https://operatimeserver-2023.onrender.com/api/*`. Keeping API traffic
same-origin makes the Secure, HttpOnly, SameSite session cookie reliable. The
same file also publishes `dist/opera-time/browser` and redirects Angular
client-side routes to `index.html`.

The Google OAuth client ID is a public browser identifier and is also
environment-configured. The matching client ID must be configured in the
backend so it can verify Google ID tokens.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the development server |
| `npm run build` | Create the production build |
| `npm run watch` | Build continuously in development mode |
| `npm test` | Run Angular tests |

Production output is created under `dist/opera-time/browser`.

## Route access

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage and movie discovery |
| `/search` | Public | Search and recommendations |
| `/movie/:id` | Public | Movie details |
| `/login` | Public | Login and combined signup flow |
| `/signup` | Public | Signup-focused authentication view |
| `/booking/:id` | Authenticated | Seat selection and demo checkout |
| `/profile` | Authenticated | User details, tickets, and QR codes |

## Security design

- TMDB credentials live only in the backend environment.
- Angular never talks directly to the TMDB API.
- The login JWT is stored in an HttpOnly cookie, not `localStorage` or
  `sessionStorage`.
- API requests include credentials only for the configured backend URL.
- Google sign-in sends a signed Google ID token for backend verification.
- Google One Tap and automatic account selection are disabled.
- Booking ownership comes from the verified backend session, never a
  browser-submitted email.
- Production API traffic should remain HTTPS and preferably same-origin.

## Demo payment and QR limitations

The default checkout intentionally bypasses real payment so recruiters can
review the entire experience without creating a PayPal Sandbox buyer account.
PayPal Sandbox remains available as an optional integration demonstration.

The QR code contains structured demo ticket data to create a realistic, dense
matrix. It is generated client-side and is not a cryptographically signed
admission credential. A production cinema system would create and validate
signed tickets on the backend and would verify payment before confirming seats.

## Project structure

```text
src/
  app/
    core/          API, auth, guards, and HTTP behavior
    features/      Home, search, login, details, booking, and profile
    layout/        Header and sidebar
    models/        Frontend API models
  environments/    Development and production configuration
  shared/          Shared models and loader
```

## Backend

See `C:\Projects\OperatimeServer\README.md` for API routes, environment
variables, security behavior, and server setup.
