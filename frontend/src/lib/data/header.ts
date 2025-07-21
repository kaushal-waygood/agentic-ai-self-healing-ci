
export interface HeaderNavItem {
  id: string;
  title: string;
  href?: string; // Optional if it's a dropdown trigger
  children?: HeaderNavItem[];
}

const initialHeaderData: HeaderNavItem[] = [
  {
    id: "search-jobs",
    title: "Search Jobs",
    href: "/search-jobs",
  },
  {
    id: "my-applications",
    title: "My Applications",
    href: "/applications",
  },
  {
    id: "ai-auto-apply",
    title: "AI Auto Apply",
    href: "/ai-auto-apply",
  },
  {
    id: "pricing",
    title: "Pricing",
    href: "/subscriptions",
  },
  {
    id: "contact",
    title: "Contact",
    href: "/support",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __mockHeaderData: HeaderNavItem[] | undefined;
}

export let mockHeaderData: HeaderNavItem[];

if (process.env.NODE_ENV === "production") {
  mockHeaderData = initialHeaderData;
} else {
  if (!globalThis.__mockHeaderData) {
    globalThis.__mockHeaderData = initialHeaderData;
  }
  mockHeaderData = globalThis.__mockHeaderData;
}
