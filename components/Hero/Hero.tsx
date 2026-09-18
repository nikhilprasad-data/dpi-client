"use client";

import { useEffect, useState } from "react";
import { HERO_GREETINGS } from "@/lib/greetings";
import styles from "./Hero.module.css";

export default function Hero() {
  // The server render and the FIRST client render must produce identical
  // markup, or React throws a hydration mismatch — so this starts at a
  // fixed, deterministic value (index 0) rather than a random pick.
  const [greeting, setGreeting] = useState(HERO_GREETINGS[0]);

  // Math.random() is non-deterministic and can only run client-side, so
  // the actual random greeting is chosen here, strictly after mount —
  // this swaps the text in on the client without ever touching what the
  // server rendered.
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * HERO_GREETINGS.length);
    setGreeting(HERO_GREETINGS[randomIndex]);
  }, []);

  return (
    <div className={styles.hero}>
      <h1 className={styles.headline}>{greeting}</h1>
    </div>
  );
}