import Link from "next/link";
import type { ReactNode } from "react";
import { STUDIO_SETTINGS } from "@/config/studio";
import styles from "./studio-shell.module.css";

export function StudioShell({ active, children }: { active: "timetable" | "inventory"; children: ReactNode }) {
  return <div className={styles.page}>
    <a className={styles.skip} href={`#${active}-main`}>Skip to {active}</a>
    <header className={styles.header}><div className={styles.headerInner}>
      <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">HL</span>
        <span>{STUDIO_SETTINGS.name}</span></div>
      <nav className={styles.navigation} aria-label="Main navigation">
        <Link href="/" aria-current={active === "timetable" ? "page" : undefined}>Class timetable</Link>
        <Link href="/inventory" aria-current={active === "inventory" ? "page" : undefined}>Inventory</Link>
      </nav>
      <span className={styles.location}>Singapore <span>SGT</span></span>
    </div></header>
    {children}
  </div>;
}
