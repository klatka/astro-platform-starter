# Astro on Netlify Platform Starter

[Live Demo](https://astro-platform-starter.netlify.app/)

A modern starter based on Astro.js, Tailwind, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blobs).

## Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Deploying to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/astro-platform-starter)

## Developing Locally

| Prerequisites                                                                |
| :--------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v18.20.8+.                                    |
| (optional) [nvm](https://github.com/nvm-sh/nvm) for Node version management. |

1. Clone this repository, then run `npm install` in its root directory.

2. Copy `.env.example` to `.env` and fill in the values (see the sections below for Supabase and Resend setup).

```
cp .env.example .env
```

3. Recommended: link your local repository to a Netlify project. This will ensure you're using the same runtime version for both local development and your deployed project.

```
netlify link
```

4. Run the Astro.js development server:

```
npm run dev
```

## Setting up Supabase

Each form submission is persisted to a `leads` table in [Supabase](https://supabase.com).

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → **New project**, choose an organisation and a region, then wait for the project to be provisioned.

### 2. Create the `leads` table

Open the **SQL Editor** in your Supabase dashboard and run the migration file:

```
supabase/migrations/20260322000000_create_leads_table.sql
```

You can also paste its contents directly into the SQL Editor and click **Run**.

The migration creates the table and enables Row-Level Security (RLS) so that the public anon key cannot read rows, while the server-side service-role key can still insert them.

### 3. Copy your API credentials

In your Supabase project go to **Settings → API** and copy:

| Value | Environment variable |
| :---- | :------------------- |
| Project URL | `SUPABASE_URL` |
| `anon` / `public` key | `SUPABASE_ANON_KEY` |
| `service_role` key *(secret)* | `SUPABASE_SERVICE_ROLE_KEY` |

Add them to your `.env` file for local development. For Netlify deployments, add them in **Site configuration → Environment variables**.

> **Important:** The `service_role` key bypasses Row-Level Security. Never expose it in client-side code or public repositories.

The server uses `SUPABASE_SERVICE_ROLE_KEY` when present and falls back to `SUPABASE_ANON_KEY`. Omitting both keys causes the insert step to be skipped (a message is logged to the console).

## Setting up Resend (email)

Confirmation emails are sent via [Resend](https://resend.com) using Nodemailer's SMTP transport. When no API key is configured the app automatically uses an [Ethereal](https://ethereal.email) throwaway account and logs a preview URL to the console – no setup needed for local development.

### 1. Create a Resend account and verify a domain

Sign up at [resend.com](https://resend.com) and follow the **Domains** guide to verify the domain you want to send from.

### 2. Create an API key

In Resend go to **API Keys → Create API Key**. Copy the key – it starts with `re_`.

### 3. Set the environment variables

| Variable | Example value | Purpose |
| :------- | :------------ | :------ |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | Authenticates with `smtp.resend.com` |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` | "From" address (must be on your verified domain) |

Add them to `.env` locally and to your Netlify site's environment variables for production.
