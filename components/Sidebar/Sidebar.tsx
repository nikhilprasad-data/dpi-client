"use client";

import { PanelIcon, PlusIcon, UserIcon } from "../icons/Icons";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

export default function Sidebar({ isOpen, onToggle, onNewChat }: SidebarProps) {
  function handleSignUpClick() {
    // TODO: wire this up to your backend auth endpoint, e.g.:
    // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
    //   method: "POST",
    // });
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close sidebar"
          onClick={onToggle}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
        aria-hidden={!isOpen}
      >
        <div className={styles.top}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={onToggle}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelIcon className={styles.collapseIcon} />
          </button>

          <button
            type="button"
            className={styles.newChatButton}
            onClick={onNewChat}
          >
            <PlusIcon className={styles.newChatIcon} />
            <span>New chat</span>
          </button>
        </div>

        <div className={styles.spacer} />

        <div className={styles.profile}>
          <span className={styles.profileAvatar} aria-hidden="true">
            <UserIcon className={styles.profileAvatarIcon} />
          </span>

          <button
            type="button"
            className={styles.signUpButton}
            onClick={handleSignUpClick}
          >
            Sign up for free
          </button>
        </div>
      </aside>
    </>
  );
}