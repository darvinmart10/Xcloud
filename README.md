# CloudBrowser — Hyperbeam Web SDK + Next.js + Vercel

A mobile-first fullscreen cloud browser shell. Hyperbeam runs the remote browser; Next.js provides the UI and securely creates sessions server-side.

## Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- A Hyperbeam API key
- GitHub account (for source hosting) and Vercel account (for deployment)

## Run locally

```bash
npm install
cp .env.example .env.local
```

Put your real Hyperbeam key in `.env.local`:

```dotenv
HB_API_KEY=your_real_key_here
```

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

**Never put the key in a `NEXT_PUBLIC_` variable or commit `.env.local`.** The API route uses the key on the server only.

## Deploy with GitHub + Vercel

1. Create a new GitHub repository.
2. Unzip this project and push its files to the repository root.
3. In Vercel, choose **Add New → Project**, then import the GitHub repository.
4. In Project Settings → Environment Variables, add `HB_API_KEY` with your Hyperbeam API key for Preview and Production.
5. Deploy. Every push to the configured production branch triggers a deployment.
6. Test the deployed URL on desktop and on an actual phone.

Official guides:
- Hyperbeam session API: https://next.hyperbeam.com/docs/rest-api/dispatch/starting-a-session/
- Hyperbeam Web SDK: https://www.npmjs.com/package/@hyperbeam/web
- Vercel Git deployment: https://vercel.com/docs/deployments/overview
- Vercel environment variables: https://vercel.com/docs/environment-variables

## Keyboard behavior

The address field is focused when you tap the address bar or the Keyboard button. Mobile operating systems control when the native keyboard is displayed, so browsers may not allow the app to force it open automatically on page load. For typing inside the remote browser, tap the relevant field inside the Hyperbeam viewport; the remote session's input handling may vary by mobile browser.

## Notes / production hardening

- This starter creates a new Hyperbeam session per page load. Review your Hyperbeam plan and session quotas before sharing publicly.
- Add authentication and rate limiting to `/api/session` before making the app public, otherwise visitors may be able to create sessions using your account.
- Consider adding a server-side session lifecycle / cleanup strategy and usage monitoring.
- Back/forward controls use the Hyperbeam client `tabs.goBack()` and `tabs.goForward()` methods.
- This project uses `@hyperbeam/web`, the successor to the deprecated `@hyperbeam/iframe` package. Verify the current SDK version and API against Hyperbeam's official docs before production use.
