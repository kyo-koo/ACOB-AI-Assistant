"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "./components/chat";
import FileViewer from "./components/file-viewer";
import CodeInterpreter from "./components/codeInterpreter";
import ThreadViewer from "./components/thread-viewer";

// app/page.tsx or wherever you're using the Chat component
const FunctionCalling = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <FileViewer />
          <CodeInterpreter />
          <ThreadViewer onSelectThread={setSelectedThreadId} />

        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat threadId={selectedThreadId ?? ""} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
