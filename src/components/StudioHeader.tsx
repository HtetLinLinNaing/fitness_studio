"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinkClassName =
  "relative flex min-h-11 items-center whitespace-nowrap text-[#4b6055] no-underline hover:text-studio aria-[current=page]:text-studio after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:content-[''] aria-[current=page]:after:bg-studio";

export function StudioHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="flex min-h-16 items-center justify-between gap-6 px-6 max-[520px]:gap-3 max-[520px]:px-4">
        <div className="group flex items-center gap-2.5 text-xl font-bold tracking-[-0.5px] whitespace-nowrap text-ink max-[520px]:gap-2 max-[520px]:text-[13px]">
          <span className="inline-block pr-[3px] text-[32px] leading-none font-black italic tracking-[-3px] text-studio [font-family:'Arial_Black',Arial,sans-serif] transition-transform duration-180 ease-[ease] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-4 motion-reduce:transition-none motion-reduce:duration-0 max-[520px]:text-[28px]">
            HL
          </span>
          <span className="text-studio max-[520px]:max-w-15 max-[520px]:leading-[1.15] max-[520px]:whitespace-normal">
            Fitness Studio
          </span>
        </div>
        <nav
          className="ml-auto flex items-stretch justify-end gap-6 self-stretch text-sm font-semibold max-[520px]:gap-4 max-[520px]:text-xs"
          aria-label="Main navigation"
        >
          <Link
            href="/classTimetable"
            className={navigationLinkClassName}
            aria-current={pathname === "/classTimetable" ? "page" : undefined}
          >
            Class timetable
          </Link>
          <Link
            href="/inventory"
            className={navigationLinkClassName}
            aria-current={pathname === "/inventory" ? "page" : undefined}
          >
            Inventory
          </Link>
        </nav>
      </div>
    </header>
  );
}
