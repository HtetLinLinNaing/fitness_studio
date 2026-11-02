"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Studio.module.css";

export function StudioHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <span className={styles.logo}>HL</span>
          <span className={styles.brandName}>Fitness Studio</span>
        </div>
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link
            href="/classTimetable"
            className={styles.navigationLink}
            aria-current={pathname === "/classTimetable" ? "page" : undefined}
          >
            Class timetable
          </Link>
          <Link
            href="/inventory"
            className={styles.navigationLink}
            aria-current={pathname === "/inventory" ? "page" : undefined}
          >
            Inventory
          </Link>
        </nav>
      </div>
    </header>
  );
}
