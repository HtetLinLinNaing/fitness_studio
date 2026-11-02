import { Button } from "@heroui/react";
import styles from "./DataTable.module.css";

type TableMessageProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

/** Empty and error rows share presentation; only errors announce an alert. */
export function TableMessage({ title, message, onRetry }: TableMessageProps) {
  return (
    <div className={styles.message} role={onRetry ? "alert" : undefined}>
      <strong className={styles.messageTitle}>{title}</strong>
      <p className={styles.messageDescription}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
