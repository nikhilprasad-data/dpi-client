"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatRoute, ToolNode } from "@/types";
import { TOOL_NODES } from "@/lib/toolNodes";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  ChevronDownIcon,
  MicIcon,
  SendIcon,
  SparkIcon,
  WaveformIcon,
} from "../icons/Icons";
import ToolPopup from "../ToolPopup/ToolPopup";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  /** Called with the trimmed prompt and the selected tool's route. */
  onSubmit: (prompt: string, route: ChatRoute) => void;
  /** Disables input/actions while a request is in flight. */
  isLoading?: boolean;
  /** Lifted to page.tsx so ActionCards can drive the same selection. */
  selectedTool: ToolNode | null;
  onSelectTool: (tool: ToolNode) => void;
  /** Same trigger the "Upload" quick-action card uses — opens the hidden file input in page.tsx. */
  onTriggerUpload: () => void;
}

export default function SearchBar({
  onSubmit,
  isLoading = false,
  selectedTool,
  onSelectTool,
  onTriggerUpload,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasValue = value.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectTool(node: ToolNode) {
    onSelectTool(node);
    setIsToolsOpen(false);

    // "Upload" in the dropdown should behave identically to the Upload
    // quick-action card — same trigger, same file input, same uploadPDF
    // call — not just update the badge text.
    if (node.triggersUpload) {
      onTriggerUpload();
    }
  }

  // Append (rather than overwrite) so a user can mic-in a phrase, keep
  // typing, and mic-in again without losing what's already there.
  const handleTranscript = useCallback((transcript: string) => {
    setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleTranscript });

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function handleSubmit() {
    const query = value.trim();
    if (!query || isLoading) return;

    onSubmit(query, selectedTool?.route ?? "normal_chat");
    setValue("");
  }

  // Enter sends the message; Shift+Enter inserts a newline (default
  // textarea behavior, so we simply don't intercept that combination).
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (hasValue) handleSubmit();
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.bar} ref={containerRef}>
        <div className={styles.toolsSlot}>
          <button
            type="button"
            className={`${styles.toolsBadge} ${
              selectedTool ? styles.toolsBadgeActive : ""
            }`}
            aria-haspopup="menu"
            aria-expanded={isToolsOpen}
            disabled={isLoading}
            onClick={() => setIsToolsOpen((open) => !open)}
          >
            {/*
              A dedicated icon glyph, always rendered regardless of
              viewport. Previously the badge only had the text label +
              chevron, and the mobile media query hid BOTH — leaving an
              empty, invisible-looking button. This icon is what stays
              visible once the label text is hidden on small screens.
            */}
            <SparkIcon className={styles.toolsIcon} />
            <span className={styles.toolsLabel}>
              {selectedTool ? selectedTool.label : "Tools"}
            </span>
            <ChevronDownIcon
              className={`${styles.chevron} ${
                isToolsOpen ? styles.chevronOpen : ""
              }`}
            />
          </button>

          {isToolsOpen && (
            <ToolPopup nodes={TOOL_NODES} onSelect={handleSelectTool} />
          )}
        </div>

        {/*
          Auto-growing textarea via the "invisible twin" CSS technique:
          this wrapper and the textarea share a single CSS Grid cell.
          The wrapper's ::after pseudo-element renders the same text
          (hidden) via `data-replicated-value`, which forces the grid
          row — and therefore the textarea, which stretches to fill it —
          to grow with content. Capped/scrollable past 4 lines entirely
          through `max-height` + `overflow-y` in SearchBar.module.css;
          no JS height calculation, no inline styles.
        */}
        <div className={styles.growWrap} data-replicated-value={value}>
          <textarea
            className={styles.input}
            placeholder={isListening ? "Listening..." : "Ask anything"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Ask anything"
            disabled={isLoading}
            rows={1}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Voice waveform"
            disabled={isLoading}
          >
            <WaveformIcon className={styles.actionIcon} />
          </button>

          {hasValue ? (
            <button
              type="button"
              className={styles.sendButton}
              aria-label="Send message"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <SendIcon className={styles.sendIcon} />
              )}
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.micButton} ${
                isListening ? styles.micButtonListening : ""
              }`}
              aria-label={
                isSupported
                  ? "Start voice input"
                  : "Voice input not supported in this browser"
              }
              aria-pressed={isListening}
              disabled={!isSupported || isLoading}
              title={
                isSupported
                  ? undefined
                  : "Voice input isn't supported in this browser"
              }
              onClick={handleMicClick}
            >
              <MicIcon className={styles.micIcon} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
