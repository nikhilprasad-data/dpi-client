"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import Hero from "@/components/Hero/Hero";
import SearchBar from "@/components/SearchBar/SearchBar";
import ActionCards from "@/components/ActionCards/ActionCards";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { ApiError, uploadPDF } from "@/lib/api";
import { ToolNode } from "@/types";
import styles from "./page.module.css";

export default function Home() {
  const {
    messages,
    isLoading,
    sendMessage,
    addMessage,
    resetChat,
    approveReview,
    submitReviewFeedback,
  } = useChat();
  const hasConversation = messages.length > 0;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedTool, setSelectedTool] = useState<ToolNode | null>(null);

  useEffect(() => {
    if (window.innerWidth < 880) {
      setIsSidebarOpen(false);
    }
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen((open) => !open);
  }

  function handleNewChat() {
    resetChat();
    setSelectedTool(null);
    if (window.innerWidth < 880) setIsSidebarOpen(false);
  }

  // Shared by both the "Upload" quick-action card and the "Upload" entry
  // in SearchBar's Tools dropdown — one trigger, one file input, one
  // upload flow, regardless of which UI element started it.
  function handleTriggerUpload() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadPDF(file);
      addMessage({
        role: "assistant",
        content: `**${result.filename}** uploaded successfully. ${result.message}`,
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        content:
          error instanceof ApiError
            ? error.message
            : "The upload failed. Please try again.",
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={styles.appShell}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
      />

      <main className={styles.mainColumn}>
        <Header onToggleSidebar={toggleSidebar} />

        <div
          className={
            hasConversation ? styles.stageChat : styles.stageCenter
          }
        >
          {hasConversation ? (
        <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onApproveReview={approveReview}                   // Add this
            onSubmitReviewFeedback={submitReviewFeedback}     // Add this
          />
          ) : (
            <Hero />
          )}

          <div
            className={
              hasConversation ? styles.searchDock : styles.searchCentered
            }
          >
            <SearchBar
              onSubmit={sendMessage}
              isLoading={isLoading || isUploading}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              onTriggerUpload={handleTriggerUpload}
            />

            {hasConversation && (
              <p className={styles.disclaimer}>
                dpi_AI generated responses may contain mistakes. Check
                important info.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Hidden input backing both Upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className={styles.hiddenFileInput}
        onChange={handleFileChange}
      />
    </div>
  );
}