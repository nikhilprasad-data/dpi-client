import { ToolNode } from "@/types";
import { ToolIcon } from "../icons/Icons";
import styles from "./ToolPopup.module.css";

interface ToolPopupProps {
  nodes: ToolNode[];
  onSelect: (node: ToolNode) => void;
}

export default function ToolPopup({ nodes, onSelect }: ToolPopupProps) {
  return (
    <div className={styles.popup} role="menu">
      <ul className={styles.list}>
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => onSelect(node)}
            >
              <span className={styles.iconWrap}>
                <ToolIcon icon={node.icon} className={styles.icon} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{node.label}</span>
                <span className={styles.description}>{node.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
