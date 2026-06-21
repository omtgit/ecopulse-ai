/**
 * Global Jest test setup for EcoPulse AI.
 *
 * - Extends expect with jest-dom matchers (toBeInTheDocument, etc.)
 * - Mocks Next.js navigation hooks
 * - Mocks next-auth/react client helpers
 * - Mocks the Prisma singleton so no real DB is needed
 */

import "@testing-library/jest-dom";

// ─── Mock: next/navigation ──────────────────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ─── Mock: next-auth/react ──────────────────────────────────────────
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
    status: "authenticated",
  })),
  signIn: mockSignIn,
  signOut: mockSignOut,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  getSession: jest.fn(() =>
    Promise.resolve({
      user: { id: "test-user-id", name: "Test User", email: "test@example.com" },
    })
  ),
}));

// ─── Mock: @/lib/prisma ─────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  carbonEntry: {
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  habitLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  challenge: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userChallenge: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  badge: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  userBadge: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  weeklyReport: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  aISuggestion: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  account: {
    findFirst: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(mockPrisma)),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

// ─── Mock: DOMPurify (server-side has no window) ────────────────────
jest.mock("dompurify", () => ({
  sanitize: jest.fn((input: string) => input.replace(/<[^>]*>/g, "")),
}));

// ─── Expose mocks for test files ────────────────────────────────────
export {
  mockPush,
  mockReplace,
  mockBack,
  mockRefresh,
  mockSignIn,
  mockSignOut,
  mockPrisma,
};
