This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Styling System

This app uses Tailwind CSS v4 with CSS variable tokens and shadcn/ui primitives.

- Theme tokens (light/dark) are defined in `app/globals.css` under `:root` and `.dark` using HSL vars (e.g., `--background`, `--foreground`, `--primary`).
- Utility helpers:
	- `container-app` – responsive centered container with horizontal padding.
	- `card-surface` – unified card surface using `bg-card`, `text-card-foreground`, `border`, and rounded corners.
	- `elevated` – subtle shadow for elevation.
	- `tabs-pills` – pill-style tabs container that highlights the active tab via `data-[state=active]`.

Usage examples:

- Wrap page sections in `container-app` rather than bespoke `max-w-*` classes.
- Prefer semantic tokens and shadcn variants over hard-coded colors:
	- Use `text-muted-foreground` instead of `text-gray-500`.
	- Use `bg-secondary` for soft panels instead of light grays.
- Cards and panels: `<Card className="card-surface elevated">…</Card>`.

Dark mode is class-based (`.dark` on `<html>`). Avoid introducing custom colors; use the tokens and utilities above for consistency.
