"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const isActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-indigo-100 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-2 p-3">
        <Link
          href="/"
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
            isActive(pathname, "/")
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-800"
          }`}
        >
          Sales
        </Link>
        <Link
          href="/items"
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
            isActive(pathname, "/items")
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-800"
          }`}
        >
          Items
        </Link>
        <Link
          href="/expenses"
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
            isActive(pathname, "/expenses")
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-800"
          }`}
        >
          Expenses
        </Link>
      </div>
    </nav>
  );
}
