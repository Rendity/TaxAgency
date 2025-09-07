import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/i18nNavigation';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
]);

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
]);

// ✅ Setup password-protected routes
const isSetupRoute = createRouteMatcher([
  '/setup', // exact /setup
  '/setup/(.*)', // /setup/something
  '/:locale/setup',
  '/:locale/setup/(.*)',
]);

const isRootRoute = createRouteMatcher([
  '/',
  '/en',
  '/de',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
  }),
);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // ✅ Arcjet bot protection
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new Error('No bots allowed');
      }
      throw new Error('Access denied');
    }
  }

  // ✅ Skip i18n for API & static routes
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/api')
    || path.startsWith('/trpc')
    || path === '/sitemap.xml'
    || path === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  if (isRootRoute(request)) {
    const url = request.nextUrl.clone();
    const locale = url.pathname.split('/')[1] || 'de';
    const companyHash = url.searchParams.get('company');
    const company = request.nextUrl.searchParams.get('company');
    console.warn(`difference between direct catch and clone `, companyHash, company);

    if (!companyHash) {
      url.pathname = `/${locale}/setup`;
      url.search = ''; // clear query params
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ✅ Handle setup password protection first
  if (isSetupRoute(request)) {
    const isAuthenticated = request.cookies.get('setup_auth')?.value === 'true';

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      // loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ✅ Run Clerk auth middleware when needed
  if (isAuthPage(request) || isProtectedRoute(request)) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }
      return intlMiddleware(req);
    })(request, event);
  }

  // ✅ Default: next-intl for everything else
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)',
    '/(api|trpc)(.*)',
  ],
};
