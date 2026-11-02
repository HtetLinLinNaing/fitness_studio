import type { ReactNode } from "react";
import styles from "./Studio.module.css";

type SectionCardProps = {
  titleId: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function SectionCard({
  titleId,
  title,
  description,
  actions,
  children,
}: SectionCardProps) {
  return (
    <section className={styles.sectionCard} aria-labelledby={titleId}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeading}>
          <h2 id={titleId} className={styles.sectionTitle}>
            {title}
          </h2>
          <span className={styles.sectionDescription}>{description}</span>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
