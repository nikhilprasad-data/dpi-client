import { ActionCardData, ToolNode } from "@/types";
import { ACTION_CARDS } from "@/lib/actionCards";
import { TOOL_NODES } from "@/lib/toolNodes";
import ActionCard from "./ActionCard";
import styles from "./ActionCards.module.css";

interface ActionCardsProps {
  /** The tool currently active in SearchBar — same state, read here to highlight the matching card. */
  selectedTool: ToolNode | null;
  /** Updates the SHARED tool state (also used by SearchBar's Tools dropdown). */
  onSelectTool: (tool: ToolNode) => void;
  /** "Upload" is a one-off action (opens a file picker), not a persisted tool selection. */
  onUploadClick: () => void;
}

export default function ActionCards({
  selectedTool,
  onSelectTool,
  onUploadClick,
}: ActionCardsProps) {
  function handleCardClick(card: ActionCardData) {
    if (card.id === "upload") {
      onUploadClick();
      return;
    }

    // "Deep Research" / "Writer" cards share their `id` with the matching
    // entry in TOOL_NODES, so we look the ToolNode up rather than
    // duplicating route/label data on ActionCardData.
    const tool = TOOL_NODES.find((node) => node.id === card.id);
    if (tool) onSelectTool(tool);
  }

  return (
    <div className={styles.row}>
      {ACTION_CARDS.map((card) => (
        <ActionCard
          key={card.id}
          card={card}
          isActive={selectedTool?.id === card.id}
          onClick={handleCardClick}
        />
      ))}
    </div>
  );
}
