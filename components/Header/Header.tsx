"use client";

import { useEffect, useState } from "react";
import { MoonIcon, PanelIcon, SunIcon } from "../icons/Icons";
import styles from "./Header.module.css";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  // SSR-safe default (light/false) so the server-rendered and first
  // client-rendered markup match. The real preference (localStorage, or
  // the OS setting as a fallback) is only read inside useEffect, i.e.
  // strictly after hydration — same pattern as Hero's dynamic greeting.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDark = stored ? stored === "dark" : prefersDark;

    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  function handleToggleTheme() {
    setIsDark((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  function handleSignUpClick() {
    // TODO: wire this up to your backend auth endpoint, e.g.:
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`);
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelIcon className={styles.toggleIcon} />
        </button>

        <span className={styles.logo}>
          dpi<span className={styles.logoAccentChar}>_</span>AI
        </span>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={`${styles.themeToggle} ${
            isDark ? styles.themeToggleDark : ""
          }`}
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={handleToggleTheme}
        >
          <SunIcon className={styles.themeIconSun} />
          <MoonIcon className={styles.themeIconMoon} />
          <span className={styles.themeToggleThumb} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.signUpButton}
          onClick={handleSignUpClick}
        >
          Sign Up
        </button>
      </div>
    </header>
  );
}