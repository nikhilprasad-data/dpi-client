"use client";

import { ActionCardData } from "@/types";
import { ToolIcon } from "../icons/Icons";
import styles from "./ActionCards.module.css";

interface ActionCardProps {
  card: ActionCardData;
  isActive?: boolean;
  onClick?: (card: ActionCardData) => void;
}

export default function ActionCard({
  card,
  isActive = false,
  onClick,
}: ActionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      aria-pressed={isActive}
      onClick={() => onClick?.(card)}
    >
      <span className={styles.cardIconWrap}>
        <ToolIcon icon={card.icon} className={styles.cardIcon} />
      </span>
      <span className={styles.cardTitle}>{card.title}</span>
    </button>
  );
}
