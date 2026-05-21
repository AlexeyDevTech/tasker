import 'next-auth';
import 'next-auth/jwt';

// The app stores the user id on the session/JWT (see callbacks in src/lib/auth.ts),
// but next-auth's default types don't include it. Augment them so `session.user.id`
// and `token.id` are typed across the codebase.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
