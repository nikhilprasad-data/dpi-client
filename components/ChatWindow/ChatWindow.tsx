"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/types";
import ReviewActions from "../ReviewActions/ReviewActions";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onApproveReview: (messageId: string) => void;
  onSubmitReviewFeedback: (messageId: string, feedback: string) => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  onApproveReview,
  onSubmitReviewFeedback,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div className={styles.window}>
      <ul className={styles.list}>
        {messages.map((message) => (
          <li
            key={message.id}
            className={`${styles.row} ${
              message.role === "user" ? styles.rowUser : styles.rowAssistant
            }`}
          >
            <div
              className={`${styles.bubble} ${
                message.role === "user"
                  ? styles.bubbleUser
                  : styles.bubbleAssistant
              } ${message.isError ? styles.bubbleError : ""}`}
            >
              {message.route && !message.isError && (
                <span className={styles.routeTag}>
                  {formatRoute(message.route)}
                </span>
              )}

              {message.role === "assistant" ? (
                <div className={styles.markdown}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className={styles.text}>{message.content}</p>
              )}

              {message.imgUrl && (
                <img
                  src={message.imgUrl}
                  alt="Generated result"
                  className={styles.image}
                  loading="lazy"
                />
              )}

              {/*
                A paused LangGraph run renders its draft above via the
                normal markdown branch, then this action area below it —
                same bubble, same message. ChatWindow only decides WHEN
                to show it; approve/feedback/resolved-state logic lives
                in ReviewActions itself.
              */}
              {message.isAwaitingReview && (
                <ReviewActions
                  isResolved={Boolean(message.reviewResolved)}
                  isLoading={isLoading}
                  onApprove={() => onApproveReview(message.id)}
                  onSubmitFeedback={(feedback) =>
                    onSubmitReviewFeedback(message.id, feedback)
                  }
                />
              )}
            </div>
          </li>
        ))}

        {isLoading && (
          <li className={`${styles.row} ${styles.rowAssistant}`}>
            <div
              className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.bubbleLoading}`}
              aria-label="Assistant is typing"
            >
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </li>
        )}

        <div ref={bottomRef} />
      </ul>
    </div>
  );
}

function formatRoute(route: string): string {
  return route
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}