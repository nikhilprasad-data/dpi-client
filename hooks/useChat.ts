"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, resumeChat, sendChatMessage } from "@/lib/api";
import { ChatResponse, ChatRoute, Message } from "@/types";

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  threadId: string;
  sendMessage: (prompt: string, route: ChatRoute) => Promise<void>;
  addMessage: (message: Omit<Message, "id">) => void;
  resetChat: () => void;
  approveReview: (messageId: string) => Promise<void>;
  submitReviewFeedback: (messageId: string, feedback: string) => Promise<void>;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Helper to check if the backend wants a human review
function isReviewResponse(data: ChatResponse): boolean {
  return data.is_awaiting_review === true || data.node === "human_review_node";
}

// Helper to format the incoming API data into a message
function toAssistantMessage(data: ChatResponse): Message {
  return {
    id: createId(),
    role: "assistant",
    content: data.response,
    imgUrl: data.img_url ?? undefined,
    route: data.route_taken ?? undefined,
    isAwaitingReview: isReviewResponse(data),
  };
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const threadIdRef = useRef<string>(createId());

  const sendMessage = useCallback(async (prompt: string, route: ChatRoute) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        prompt: trimmed,
        route_to_take: route,
        thread_id: threadIdRef.current,
      });

      setMessages((prev) => [...prev, toAssistantMessage(data)]);
    } catch (error) {
      const content =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", content, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Shared function to handle both Appoving and sending Feedback
  const resolveReview = useCallback(
    async (messageId: string, feedback: string) => {
      // Optimistically lock the review UI
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, reviewResolved: true }
            : message
        )
      );
      setIsLoading(true);

      try {
        const data = await resumeChat(threadIdRef.current, feedback);
        setMessages((prev) => [...prev, toAssistantMessage(data)]);
      } catch (error) {
        const content =
          error instanceof ApiError
            ? error.message
            : "Something went wrong resuming the run. Please try again.";
        
        // Roll the lock back so the user can retry, and surface the error.
        setMessages((prev) => [
          ...prev.map((message) =>
            message.id === messageId
              ? { ...message, reviewResolved: false }
              : message
          ),
          { id: createId(), role: "assistant", content, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // The actual functions you were missing!
  const approveReview = useCallback(
    (messageId: string) => resolveReview(messageId, "approved"),
    [resolveReview]
  );

  const submitReviewFeedback = useCallback(
    (messageId: string, feedback: string) => resolveReview(messageId, feedback),
    [resolveReview]
  );

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { id: createId(), ...message }]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    threadIdRef.current = createId();
  }, []);

  return {
    messages,
    isLoading,
    threadId: threadIdRef.current,
    sendMessage,
    addMessage,
    resetChat,
    approveReview,
    submitReviewFeedback,
  };
}