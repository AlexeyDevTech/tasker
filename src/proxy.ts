import { withAuth } from 'next-auth/middleware';

// Server-side route protection. Client-side `useSession({ required: true })`
// is bypassable; this enforces auth before the page renders and redirects
// unauthenticated users to /login.
export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  // Protect dashboard pages only. Auth pages (/login, /register), API routes
  // (which guard themselves) and static assets are intentionally excluded.
  matcher: [
    '/',
    '/calendar/:path*',
    '/inbox/:path*',
    '/settings/:path*',
    '/projects/:path*',
  ],
};
