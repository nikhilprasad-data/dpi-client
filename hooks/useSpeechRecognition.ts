"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  /** Called with the transcribed text once a phrase is recognized. */
  onResult: (transcript: string) => void;
  lang?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  /** False on the server and on browsers without SpeechRecognition support. */
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * The Web Speech API isn't part of TypeScript's default DOM lib, and it's
 * only available under a vendor prefix in some browsers (Safari, older
 * Chrome). We type just the surface this hook actually touches rather than
 * pulling in a third-party lib.d.ts for the whole spec.
 */
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition({
  onResult,
  lang = "en-US",
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  // Assume unsupported until we can check on the client — avoids an
  // SSR/client markup mismatch and fails safely by default.
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setIsSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) onResultRef.current(transcript);
    };

    // Any failure (permission denied, no mic, network hiccup, etc.) just
    // falls back to the idle mic state rather than throwing.
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [lang]);

  // Stop an in-flight session if the component unmounts mid-listen.
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
