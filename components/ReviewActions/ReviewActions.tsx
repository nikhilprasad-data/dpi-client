"use client";

import { useState } from "react";
import styles from "./ReviewActions.module.css";

interface ReviewActionsProps {
  isResolved: boolean;
  isLoading: boolean;
  onApprove: () => void;
  onSubmitFeedback: (feedback: string) => void;
}

export default function ReviewActions({
  isResolved,
  isLoading,
  onApprove,
  onSubmitFeedback,
}: ReviewActionsProps) {
  const [feedback, setFeedback] = useState("");

  if (isResolved) {
    return (
      <div className={styles.resolved}>
        <span className={styles.resolvedDot} aria-hidden="true" />
        Response sent — resuming the run.
      </div>
    );
  }

  function handleSubmitFeedback() {
    const trimmed = feedback.trim();
    if (!trimmed || isLoading) return;
    onSubmitFeedback(trimmed);
    setFeedback("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmitFeedback();
    }
  }

  return (
    <div className={styles.reviewArea}>
      <p className={styles.reviewLabel}>Awaiting your review</p>

      <button
        type="button"
        className={styles.approveButton}
        disabled={isLoading}
        onClick={onApprove}
      >
        Approve Draft
      </button>

      <div className={styles.feedbackRow}>
        <input
          type="text"
          className={styles.feedbackInput}
          placeholder="Or type feedback, e.g. “Make it shorter”"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Feedback for this draft"
        />
        <button
          type="button"
          className={styles.submitFeedbackButton}
          disabled={isLoading || feedback.trim().length === 0}
          onClick={handleSubmitFeedback}
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}