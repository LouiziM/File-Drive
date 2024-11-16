import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-server-utils';

export const config = {
  matcher: ["/Dashboard", "/"], // Include `/` in matcher as well to check for redirects
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if the user is authenticated
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return (
          session.tokens?.accessToken !== undefined &&
          session.tokens?.idToken !== undefined
        );
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  // If the user is authenticated and at the root '/', redirect to '/Dashboard'
  if (authenticated && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/Dashboard', request.url));
  }

  // If the user is authenticated, allow access to other protected routes
  if (authenticated) {
    return response;
  }

  // If the user is not authenticated and trying to access protected routes, redirect to '/'
  if (!authenticated && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response; // Default response
}
