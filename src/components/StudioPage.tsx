import type { ReactNode } from "react";
import styles from "./Studio.module.css";

type StudioPageProps = {
  title: string;
  context?: ReactNode;
  summary?: ReactNode;
  footnote: string;
  children: ReactNode;
};

export function StudioPage({
  title,
  context,
  summary,
  footnote,
  children,
}: StudioPageProps) {
  return (
    <main className={styles.page} id="main-content">
      <div className={styles.pageHeading}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {context && <div className={styles.pageContext}>{context}</div>}
      </div>
      {summary && <div className={styles.pageSummary}>{summary}</div>}
      {children}
      <p className={styles.pageFootnote}>{footnote}</p>
    </main>
  );
}
