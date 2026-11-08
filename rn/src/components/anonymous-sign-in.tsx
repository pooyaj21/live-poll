import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { useEffect, useRef } from 'react';

/** Signs the user in anonymously on first launch. The session is persisted by the auth provider. */
export function AnonymousSignIn() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const attempted = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      attempted.current = false;
      return;
    }
    if (attempted.current) return;
    attempted.current = true;
    signIn('anonymous').catch(() => {
      // Allow a retry the next time auth state changes.
      attempted.current = false;
    });
  }, [isLoading, isAuthenticated, signIn]);

  return null;
}
