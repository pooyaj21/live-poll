import { ConvexError } from 'convex/values';

/** Turn anything thrown by a Convex call into text we can show the user. */
export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    return typeof error.data === 'string' ? error.data : 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
